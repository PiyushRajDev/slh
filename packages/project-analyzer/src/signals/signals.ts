import { RawMetrics } from '../metrics/metrics';

export interface StructuralSignals {
    has_frontend: boolean;
    has_backend: boolean;
    has_database: boolean;
    has_tests: boolean;
    has_ci: boolean;
    has_deployment_config: boolean;
    has_docker: boolean;
    is_monorepo: boolean;
    has_documentation: boolean;
    is_short_timeline: boolean;
    has_heavy_framework: boolean;
    has_ml_components: boolean;
    has_notebooks: boolean;
    is_minimal: boolean;
    is_library_package: boolean;
    is_cli_tool: boolean;         // CLI-specific entrypoint/framework detected
    is_cli_entrypoint: boolean;   // positive CLI discriminator: bin field, __main__.py, cli deps + entry
}

export function deriveSignals(metrics: RawMetrics): StructuralSignals {
    const dependencies = metrics?.dependencies || [];
    const languages = metrics?.languages || {};
    const folder_structure = metrics?.folder_structure || [];
    const files = metrics?.files || [];
    const markup = metrics?.markup_loc || { md: 0, html: 0, css: 0 };

    const hasDependency = (deps: string[]) => deps.some(d => dependencies.includes(d));

    // ── has_database (computed early — used by has_backend) ──────
    const sqlLoc = languages['.sql'] || 0;
    const prismaLoc = languages['.prisma'] || 0;
    const has_database = hasDependency([
        'prisma', 'mongoose', 'typeorm', 'pg', 'sequelize', 'knex',
        'sqlalchemy', 'peewee', 'tortoise-orm', 'pymongo', 'redis',
        'psycopg2', 'mysql-connector-python', 'pymysql',
        'hibernate', 'mybatis', 'gorm', 'ent'
    ]) || sqlLoc > 0 || prismaLoc > 0;

    // ── rawIsLibrary (computed early — used to suppress has_frontend for libraries) ──
    const appStructurePaths = ['pages/', 'routes/', 'controllers/', 'app/'];
    const hasIndexEntry = files.some(f =>
        f === 'index.ts' || f === 'index.js' || f === 'src/index.ts' || f === 'src/index.js'
    );
    const hasAppStructure = files.some(f => appStructurePaths.some(p => f.includes(p)));
    const hasPkgJson = files.some(f => f === 'package.json');
    const condC = files.some(f =>
        f === 'setup.py' || f === 'pyproject.toml' || f.endsWith('__init__.py')
    );
    const condD = metrics?.has_main_export === true;
    const rawIsLibrary = (hasIndexEntry && !hasAppStructure) || condC || condD;

    // ── has_frontend ──────────────────────────────────────────────
    const hasFrontendDep = hasDependency([
        'react', 'vue', 'next', 'next.js', 'svelte', 'angular', 'nuxt', 'gatsby', 'vite', 'redux', 'solid-js',
        'react-dom', 'react-router', '@angular/core', 'vue-router', 'svelte-kit'
    ]);
    const strongFrontendFolders = ['components', 'pages', 'views'];
    const hasFrontendStructure = strongFrontendFolders.some(f => folder_structure.includes(f));
    const hasAppEntrypoint = files.some(f =>
        /^src\/(App|app|main)\.(tsx|jsx|ts|js)$/.test(f) ||
        /^src\/app\//.test(f) || /^src\/pages\//.test(f) ||
        /^src\/client\//.test(f) ||
        /^app\/(page|layout)\.(tsx|jsx|ts|js)$/.test(f) ||
        /^(?:public\/|src\/)?index\.html$/.test(f)
    );
    const frontendAppRe = /apps?\/(?:web|frontend|client)\//i;
    const frontendPkgRe = /packages?\/(?:web|frontend|ui)\//i;
    const frontendSvcRe = /services?\/(?:web|frontend|client)\//i;
    const hasDeepFrontend = files.some(f => frontendAppRe.test(f) || frontendPkgRe.test(f) || frontendSvcRe.test(f));
    const significantMarkup = (markup.html + markup.css) > 500;

    // Fix 1 + R2-3: dep + structure, suppressed for libraries unless there's a strong application entrypoint
    const has_frontend = (hasFrontendDep && (hasAppEntrypoint || (hasFrontendStructure && !rawIsLibrary)))
        || hasDeepFrontend || significantMarkup;

    // ── has_backend ───────────────────────────────────────────────
    const backendFolders = ['routes', 'controllers', 'middleware', 'handlers'];
    const hasBackendStructure = backendFolders.some(f => folder_structure.includes(f));
    const backendAppRe = /apps?\/(?:api|server|backend)\//i;
    const backendPkgRe = /packages?\/(?:api|server)\//i;
    const backendSrcRe = /src\/(?:api|server|routes)\//i;
    const backendSvcRe = /services?\/(?:api|server|backend)\//i;
    const hasDeepBackend = files.some(f =>
        backendAppRe.test(f) || backendPkgRe.test(f) || backendSrcRe.test(f) || backendSvcRe.test(f)
    );
    const hasBackendDep = hasDependency([
        'express', 'nestjs', '@nestjs/core', 'fastify', 'koa',
        'django', 'flask', 'fastapi', 'tornado', 'aiohttp', 'bottle',
        'litestar', 'sanic', 'falcon',
        'spring', 'gin', 'echo', 'fiber', 'gorilla',
        'actix-web', 'rocket', 'axum', 'rails', 'sinatra',
        'bun', 'hono', 'elysia', '@hapi/hapi', 'h3', 'nitro'
    ]);
    // Fix 4 + R2-2: dep + structure, or dep + database as proof
    const has_backend = (hasBackendDep && (hasBackendStructure || hasDeepBackend || has_database))
        || hasBackendStructure || hasDeepBackend;

    // ── has_tests ────────────────────────────────────────────────
    const test_file_count = metrics?.test_file_count || 0;
    const has_tests = (test_file_count > 0) || hasDependency([
        'jest', 'mocha', 'vitest', 'cypress', 'playwright', 'puppeteer', 'jasmine', 'ava',
        'pytest', 'unittest', 'nose', 'hypothesis',
        'junit', 'testng', 'mockito',
        'go-test', 'testing'
    ]);

    // ── has_ci ───────────────────────────────────────────────────
    const has_ci = metrics?.ci_config_present === true;

    // ── has_deployment_config ────────────────────────────────────
    const has_deployment_config = metrics?.deploy_config_present === true;

    // ── has_docker ───────────────────────────────────────────────
    const has_docker = files.some(f => {
        const base = f.split('/').pop() || '';
        return base === 'Dockerfile' || base === 'docker-compose.yml' || base === 'docker-compose.yaml';
    });

    // ── is_monorepo ──────────────────────────────────────────────
    const is_monorepo = (folder_structure.includes('apps') && folder_structure.includes('packages')) || hasDependency(['lerna', 'turbo', 'nx', 'rush']);

    // ── has_documentation (Fix 1: uses markup_loc.md instead of broken languages['.md']) ──
    const hasReadme = files.some(f => /^readme/i.test(f.split('/').pop() || ''));
    const hasDocsFolder = folder_structure.includes('docs') || folder_structure.includes('doc');
    const has_documentation = markup.md > 5 || hasReadme || hasDocsFolder;

    // ── is_short_timeline ────────────────────────────────────────
    const commit_span_days = metrics?.commit_span_days || 0;
    const is_short_timeline = commit_span_days < 7;

    // ── has_heavy_framework ──────────────────────────────────────
    const has_heavy_framework = hasDependency(['next', '@nestjs/core', 'angular', 'django', 'spring', 'nuxt', 'gatsby']);

    // ── has_ml_components (Fix 3 + R2-1: split into core ML vs scientific tiers) ──
    // Core ML: training/model frameworks that indicate real ML work
    const coreMLDeps = hasDependency([
        'torch', 'pytorch', 'tensorflow', 'tf', 'keras', 'jax', 'flax',
        'scikit-learn', 'sklearn', 'xgboost', 'lightgbm', 'catboost',
        // Viz & data (only with other signals)
        'matplotlib', 'seaborn', 'plotly', 'bokeh', 'altair',
        // CV
        'cv2', 'opencv-python', 'Pillow', 'albumentations',
        // Data tooling
        'dask', 'polars', 'pyarrow', 'h5py', 'datasets',
        // MLOps
        'mlflow', 'wandb', 'optuna', 'ray',
        // JS ML
        '@tensorflow/tfjs', 'brain.js', 'synaptic', 'ml5',
    ]);

    // R2-1: Scientific deps — used in GIS, engineering, finance too. Require ML file patterns.
    const hasScientificDeps = hasDependency(['scipy', 'statsmodels']);

    // API-client deps — these ALONE don't make something ML
    const mlApiClientDeps = hasDependency([
        'openai', 'langchain', 'langchain-core', 'anthropic',
        'huggingface', 'sentence-transformers',
        'nltk', 'spacy', 'gensim',
    ]);

    // ML file pattern detection
    const mlFilePatterns = ['model.py', 'train.py', 'inference.py', 'predict.py', 'dataset.py', 'trainer.py', 'evaluate.py'];
    const hasMlFilePattern = (metrics?.primary_language === 'py') &&
        files.some(f => mlFilePatterns.some(pat => f.endsWith(pat)));
    const hasNotebookFiles = files.some(f => f.endsWith('.ipynb'));

    // Core ML deps → always ML. Scientific/data deps → only with ML file patterns.
    const hasDataDeps = hasDependency(['numpy', 'pandas']);
    const has_ml_components = coreMLDeps
        || (mlApiClientDeps && (hasMlFilePattern || hasNotebookFiles))
        || ((hasDataDeps || hasScientificDeps) && hasMlFilePattern)
        || hasNotebookFiles;

    // ── has_notebooks ────────────────────────────────────────────
    const notebookLoc = languages['.ipynb'] || 0;
    const has_notebooks = notebookLoc > 0 || hasNotebookFiles ||
        folder_structure.some(f => f === 'notebooks' || f === 'notebook' || f === 'nbs');

    // ── is_minimal ───────────────────────────────────────────────
    const file_count = metrics?.file_count || 0;
    const total_loc = metrics?.total_loc || 0;
    const is_minimal = file_count <= 50 && total_loc <= 5000;

    // ── is_library_package ───────────────────────────────────────
    // R2-3: is_library_package 
    const is_library_package = (!hasAppEntrypoint && rawIsLibrary);
    // ── is_cli_tool (Fix 2: new signal, expanded for Phase 1.5) ──
    // Detect CLI-specific patterns across multiple dimensions
    const cliDeps = hasDependency([
        'argparse', 'click', 'typer', 'fire',            // Python CLI
        'commander', 'yargs', 'inquirer', 'vorpal', 'meow', 'cac',  // Node CLI
    ]);
    const hasBinField = metrics?.has_bin_field === true;
    const hasConsoleScripts = metrics?.has_console_scripts === true;
    const usesArgparse = metrics?.uses_argparse === true;
    // Python CLI entrypoint detection via file patterns
    const hasCliEntrypoint = files.some(f =>
        f === 'cli.py' || f === 'cli.ts' || f === 'cli.js' ||
        f.endsWith('/cli.py') || f.endsWith('/cli.ts') || f.endsWith('/cli.js') ||
        f === '__main__.py' || f.endsWith('/__main__.py') ||
        f === 'main.py' || f === 'app.py'
    );
    const is_cli_tool = cliDeps || hasBinField || hasConsoleScripts || usesArgparse || hasCliEntrypoint;

    // ── is_cli_entrypoint (positive CLI discriminator) ────────────
    const CLI_DEPS_JS  = ['commander', 'yargs', 'meow', 'minimist', 'inquirer', 'oclif', 'caporal', 'vorpal'];
    const CLI_DEPS_PY  = ['click', 'typer', 'fire', 'docopt', 'plumbum', 'cement'];

    const hasCliDepJS = CLI_DEPS_JS.some(d => dependencies.includes(d));
    const hasCliDepPY = CLI_DEPS_PY.some(d => dependencies.includes(d));

    const hasMainPy      = files.some(f => /__main__\.py$/.test(f));
    const hasBinFile     = files.some(f => /^bin\//.test(f) || /\/(bin|cli)\.(js|ts|py)$/.test(f));
    const hasCliEntry    = files.some(f => /^cli\.(js|ts|py)$/.test(f));

    const is_cli_entrypoint = hasMainPy || hasBinFile || hasCliEntry || hasCliDepPY || hasCliDepJS;

    return {
        has_frontend,
        has_backend,
        has_database,
        has_tests,
        has_ci,
        has_deployment_config,
        has_docker,
        is_monorepo,
        has_documentation,
        is_short_timeline,
        has_heavy_framework,
        has_ml_components,
        has_notebooks,
        is_minimal,
        is_library_package,
        is_cli_tool,
        is_cli_entrypoint
    };
}
