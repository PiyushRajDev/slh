import prisma from '../../apps/api/src/db.ts';
import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { decryptToken } from '../../apps/api/src/utils/crypto.ts';
import { Octokit } from '@octokit/rest';

async function main() {
    const student = await prisma.student.findUnique({
        where: { email: 'test@slh.dev' },
        select: { githubAccessToken: true, githubUsername: true }
    });

    if (!student || !student.githubAccessToken || !student.githubUsername) {
        console.error('No token or username');
        return;
    }
    const token = decryptToken(student.githubAccessToken);
    console.log("Token length:", token.length);
    // console.log("Token start:", token.substring(0, 4));

    const octokit = new Octokit({
        auth: token,
        request: { timeout: 30000 }
    });
    try {
        const res = await octokit.repos.get({ owner: student.githubUsername, repo: 'slh' });
        console.log("Success:", res.data.full_name);
    } catch (err: any) {
        console.log("Error status:", err.status);
        console.log("Error message:", err.message);
    }
}
main().catch(console.error);
