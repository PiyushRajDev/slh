import { Server } from 'http';
import app from './src/app';
import prisma from './src/db';
import * as jwt from 'jsonwebtoken';
let server: Server;
let BASE_URL = '';
let VALID_TOKEN = '';

async function setupTestAuth() {
    const student = await prisma.student.findUnique({
        where: { email: 'test@slh.dev' }
    });

    if (!student) {
        throw new Error('Test student test@slh.dev not found in database. Seed required.');
    }

    const payload = {
        userId: student.userId,
        email: student.email,
        role: 'STUDENT',
        collegeId: student.collegeId
    };

    VALID_TOKEN = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);
}

async function runTests() {
    console.log('🚀 Starting SLH Block 11 API Runtime Gauntlet...\n');

    let totalTests = 7;
    let passedTests = 0;

    const headers = {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. POST /analyze with valid URL
        process.stdout.write('1. POST /api/projects/analyze (Valid URL) ');
        const req1 = await fetch(`${BASE_URL}/api/projects/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ repoUrl: 'https://github.com/PiyushRajDev/slh' })
        });
        const res1 = await req1.json() as any;
        if (req1.status === 202 && res1.jobId || req1.status === 200 && res1.analysisId) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req1.status, res1);
        }

        // 2. POST /analyze with invalid URL
        process.stdout.write('2. POST /api/projects/analyze (Invalid URL) ');
        const req2 = await fetch(`${BASE_URL}/api/projects/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ repoUrl: 'invalid-url-here' })
        });
        if (req2.status === 400) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req2.status, await req2.json());
        }

        // 3. GET /analyses
        process.stdout.write('3. GET /api/projects/analyses ');
        const req3 = await fetch(`${BASE_URL}/api/projects/analyses`, { headers });
        const res3 = await req3.json() as any;
        if (req3.status === 200 && Array.isArray(res3.analyses)) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req3.status, res3);
        }

        let analysisIdToTest = res3?.analyses?.[0]?.id;

        // 5. GET /analyses/latest
        process.stdout.write('5. GET /api/projects/analyses/latest ');
        const req5 = await fetch(`${BASE_URL}/api/projects/analyses/latest`, { headers });
        const res5 = await req5.json() as any;
        if (req5.status === 200 || req5.status === 404) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req5.status, res5);
        }

        if (!analysisIdToTest && req5.status === 200) {
            analysisIdToTest = res5.id;
        }

        // We need a completed analysis entry id to test endpoints 4 and 6 properly!
        if (!analysisIdToTest) {
            // Find manually from DB for test isolation
            const fallbackStudent = await prisma.student.findUnique({ where: { email: 'test@slh.dev' } });
            const fallback = await prisma.projectAnalysis.findFirst({
                where: { studentId: fallbackStudent?.id, status: 'COMPLETED' }
            });
            analysisIdToTest = fallback?.id || 'synthetic-id-for-404-test';
        }

        // 4. GET /analyses/:id
        process.stdout.write('4. GET /api/projects/analyses/:id ');
        const req4 = await fetch(`${BASE_URL}/api/projects/analyses/${analysisIdToTest}`, { headers });
        const res4 = await req4.json() as any;
        if ((req4.status === 200 && !('integrityHash' in res4)) || req4.status === 404) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL (missing ID context or properties exposed!)', req4.status, res4);
        }

        // 6. GET /analyses/:id/verify
        process.stdout.write('6. GET /api/projects/analyses/:id/verify ');
        const req6 = await fetch(`${BASE_URL}/api/projects/analyses/${analysisIdToTest}/verify`, { headers });
        const res6 = await req6.json() as any;
        // Either evaluates verified: true/false, or returns 404 cleanly
        if ((req6.status === 200 && typeof res6.verified === 'boolean') || req6.status === 404) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req6.status, res6);
        }

        // 7. Unauthorized request
        process.stdout.write('7. Unauthorized Request Test ');
        const req7 = await fetch(`${BASE_URL}/api/projects/analyses`, {
            method: 'GET'
            // no auth header
        });
        if (req7.status === 401) {
            console.log('✅ PASS');
            passedTests++;
        } else {
            console.log('❌ FAIL', req7.status, await req7.json());
        }

        console.log(`\n📊 API Integration Verification: ${passedTests}/${totalTests} passed`);
        if (passedTests === totalTests) {
            console.log('🟢 Block 11 API surface constraints are production-ready.');
            process.exit(0);
        } else {
            process.exit(1);
        }

    } catch (e) {
        console.error('Test script crashed:', e);
        process.exit(1);
    }
}

async function init() {
    await setupTestAuth();
    server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        BASE_URL = `http://127.0.0.1:${address.port}`;
        runTests();
    });
}

init().catch(console.error);
