import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Normalization map for common import-name → package-name mismatches.
 * Applied after extraction so that "import sklearn" matches dep "scikit-learn".
 */
export const IMPORT_ALIASES: Record<string, string> = {
    'sklearn': 'scikit-learn',
    'cv2': 'opencv-python',
    'bs4': 'beautifulsoup4',
    'yaml': 'pyyaml',
    'PIL': 'Pillow',
    'dotenv': 'python-dotenv',
    'gi': 'pygobject',
    'attr': 'attrs',
    'dateutil': 'python-dateutil',
    'serial': 'pyserial',
    'usb': 'pyusb',
};

// ── Regex patterns ──────────────────────────────────────────────────────

// JS/TS: import ... from 'X'  |  import ... from "X"
const JS_IMPORT_FROM_RE = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)['"]([^'"]+)['"]/g;
// JS/TS: require('X')  |  require("X")
const JS_REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
// JS/TS: import('X')
const JS_DYNAMIC_IMPORT_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
// Python: import X  |  from X import ...
const PY_IMPORT_RE = /^(?:import|from)\s+([a-zA-Z_][\w]*)/gm;
// Go: import "github.com/user/pkg"  |  "github.com/user/pkg"
const GO_IMPORT_RE = /["']([^"']+\.[\w]+\/[^"']+)["']/g;

// ── Skip patterns ───────────────────────────────────────────────────────

const SKIP_DIRS = ['node_modules/', '.git/', 'dist/', 'build/', '__pycache__/', 'vendor/', '.next/'];
const TEST_FILE_RE = /(?:\.(?:test|spec)\.[jt]sx?$|test_[\w]+\.py$|[\w]+_test\.go$|__tests__\/)/;

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.go']);

function shouldSkipFile(filePath: string): boolean {
    if (SKIP_DIRS.some(d => filePath.includes(d))) return true;
    if (TEST_FILE_RE.test(filePath)) return true;
    const ext = path.extname(filePath);
    if (!SOURCE_EXTENSIONS.has(ext)) return true;
    return false;
}

/**
 * Extract the package name from a JS/TS import specifier.
 * - '@nestjs/core' → '@nestjs/core' (keep full scoped name)
 * - 'lodash/get'   → 'lodash' (strip subpath)
 * - './local'      → null (skip relative imports)
 */
function normalizeJsImport(specifier: string): string | null {
    // Skip relative imports
    if (specifier.startsWith('.') || specifier.startsWith('/')) return null;

    // Scoped package: @scope/name or @scope/name/sub
    if (specifier.startsWith('@')) {
        const parts = specifier.split('/');
        if (parts.length >= 2) {
            return `${parts[0]}/${parts[1]}`;
        }
        return specifier;
    }

    // Unscoped: 'lodash/get' → 'lodash'
    const slashIdx = specifier.indexOf('/');
    return slashIdx > 0 ? specifier.substring(0, slashIdx) : specifier;
}

/**
 * Extract the top-level module from a Python import.
 * 'sklearn.metrics' → 'sklearn', 'os' → 'os'
 */
function normalizePyImport(moduleName: string): string {
    const dotIdx = moduleName.indexOf('.');
    return dotIdx > 0 ? moduleName.substring(0, dotIdx) : moduleName;
}

/**
 * Extract package from a Go import path.
 * 'github.com/gin-gonic/gin' → 'gin-gonic/gin'
 * Skips stdlib imports (no dots in path).
 */
function normalizeGoImport(importPath: string): string | null {
    if (!importPath.includes('.')) return null; // stdlib
    const parts = importPath.split('/');
    // Strip the host: github.com/gin-gonic/gin → gin-gonic/gin
    return parts.length >= 3 ? parts.slice(1).join('/') : importPath;
}

/**
 * Apply the alias normalization map.
 */
function applyAlias(name: string): string {
    return IMPORT_ALIASES[name] ?? name;
}

/**
 * Extract all import specifiers from a single file's content.
 */
function extractImportsFromContent(content: string, ext: string): string[] {
    const imports: string[] = [];

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
        for (const re of [JS_IMPORT_FROM_RE, JS_REQUIRE_RE, JS_DYNAMIC_IMPORT_RE]) {
            re.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = re.exec(content)) !== null) {
                const normalized = normalizeJsImport(match[1]);
                if (normalized) imports.push(applyAlias(normalized));
            }
        }
    } else if (ext === '.py') {
        PY_IMPORT_RE.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = PY_IMPORT_RE.exec(content)) !== null) {
            const topLevel = normalizePyImport(match[1]);
            imports.push(applyAlias(topLevel));
        }
    } else if (ext === '.go') {
        GO_IMPORT_RE.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = GO_IMPORT_RE.exec(content)) !== null) {
            const normalized = normalizeGoImport(match[1]);
            if (normalized) imports.push(normalized);
        }
    }

    return imports;
}

/**
 * Scan all source files in a repo and collect the set of imported package names.
 *
 * @param localPath - Absolute path to the cloned repo root
 * @param files     - File paths relative to repo root (from RawMetrics.files)
 * @returns Set of normalized package names found in import statements
 */
export async function scanImports(localPath: string, files: string[]): Promise<Set<string>> {
    const importSet = new Set<string>();

    const sourceFiles = files.filter(f => !shouldSkipFile(f));

    // Process all files in parallel
    const results = await Promise.all(
        sourceFiles.map(async (relPath) => {
            try {
                const content = await fs.readFile(path.join(localPath, relPath), 'utf-8');
                const ext = path.extname(relPath);
                return extractImportsFromContent(content, ext);
            } catch {
                // Binary file or read error — skip silently
                return [];
            }
        })
    );

    for (const fileImports of results) {
        for (const imp of fileImports) {
            importSet.add(imp);
        }
    }

    return importSet;
}

// ── Test cases (inline documentation) ───────────────────────────────────
//
// Test 1: TS file with mixed import styles
//   Input file content:
//     import { Injectable } from '@nestjs/core';
//     import _ from 'lodash';
//     const axios = require('axios');
//     const sub = await import('react-router-dom');
//   Expected output: Set { '@nestjs/core', 'lodash', 'axios', 'react-router-dom' }
//
// Test 2: Python file with aliased imports
//   Input file content:
//     import sklearn.metrics
//     from cv2 import imread
//     import numpy as np
//   Expected output: Set { 'scikit-learn', 'opencv-python', 'numpy' }
//
// Test 3: File path 'node_modules/foo/index.js' → should be skipped by shouldSkipFile
//   Returns empty array, not added to set
