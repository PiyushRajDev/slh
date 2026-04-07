import { Resend } from 'resend';
import prisma from '../db';
import { EmailType, EmailStatus } from '../../../../packages/database/src/generated/client';

let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) {
            throw new Error('RESEND_API_KEY is not configured — email sending is disabled');
        }
        _resend = new Resend(key);
    }
    return _resend;
}
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'SkilLighthouse <noreply@skilllighthouse.com>';

interface SendResult {
    messageId: string | null;
    status: EmailStatus;
    error?: string;
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
    try {
        const { data, error } = await getResend().emails.send({ from: FROM_ADDRESS, to, subject, html });
        if (error) {
            return { messageId: null, status: EmailStatus.FAILED, error: error.message };
        }
        return { messageId: data?.id ?? null, status: EmailStatus.SENT };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { messageId: null, status: EmailStatus.FAILED, error: message };
    }
}

async function log(opts: {
    type: EmailType;
    recipientEmail: string;
    subject: string;
    result: SendResult;
    studentId?: string;
    collegeId?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    await prisma.emailLog.create({
        data: {
            type: opts.type,
            recipientEmail: opts.recipientEmail,
            subject: opts.subject,
            status: opts.result.status,
            messageId: opts.result.messageId,
            errorMessage: opts.result.error,
            studentId: opts.studentId,
            collegeId: opts.collegeId,
            metadata: opts.metadata as any,
            sentAt: opts.result.status === EmailStatus.SENT ? new Date() : null,
        },
    });
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

// ── Transactional email senders ──────────────────────────────────────────────

export async function sendCollegeWelcomeEmail(opts: {
    collegeId: string;
    collegeName: string;
    adminEmail: string;
    adminName: string;
    loginUrl: string;
}): Promise<void> {
    const safeAdminName = escapeHtml(opts.adminName);
    const safeCollegeName = escapeHtml(opts.collegeName);
    const safeLoginUrl = escapeHtml(opts.loginUrl);
    const subject = `Welcome to SkillLighthouse — ${opts.collegeName} is live!`;
    const html = `
        <h2>Welcome, ${safeAdminName}!</h2>
        <p>Your institution <strong>${safeCollegeName}</strong> has been successfully onboarded to SkillLighthouse.</p>
        <p>You can now manage your students' portfolios and track their placement readiness.</p>
        <p><a href="${safeLoginUrl}">Log in to your dashboard</a></p>
        <p>If you have any questions, reply to this email.</p>
    `;
    const result = await send(opts.adminEmail, subject, html);
    await log({
        type: EmailType.COLLEGE_WELCOME,
        recipientEmail: opts.adminEmail,
        subject,
        result,
        collegeId: opts.collegeId,
        metadata: { collegeName: opts.collegeName },
    });
}

export async function sendStudentWelcomeEmail(opts: {
    studentId: string;
    email: string;
    firstName: string;
    collegeName: string;
    loginUrl: string;
}): Promise<void> {
    const safeFirstName = escapeHtml(opts.firstName);
    const safeCollegeName = escapeHtml(opts.collegeName);
    const safeLoginUrl = escapeHtml(opts.loginUrl);
    const subject = 'Welcome to SkillLighthouse — build your portfolio';
    const html = `
        <h2>Welcome, ${safeFirstName}!</h2>
        <p>Your account at <strong>${safeCollegeName}</strong> is ready on SkillLighthouse.</p>
        <p>Connect your GitHub and DSA profiles to start building your placement portfolio.</p>
        <p><a href="${safeLoginUrl}">Get started</a></p>
    `;
    const result = await send(opts.email, subject, html);
    await log({
        type: EmailType.STUDENT_WELCOME,
        recipientEmail: opts.email,
        subject,
        result,
        studentId: opts.studentId,
        metadata: { collegeName: opts.collegeName },
    });
}

export async function sendWeeklyReportEmail(opts: {
    studentId: string;
    email: string;
    firstName: string;
    jriScore: number;
    githubScore: number;
    dsaScore: number;
    profileUrl: string;
}): Promise<void> {
    const safeFirstName = escapeHtml(opts.firstName);
    const safeProfileUrl = escapeHtml(opts.profileUrl);
    const subject = `Your weekly SkillLighthouse report — JRI ${opts.jriScore.toFixed(1)}`;
    const html = `
        <h2>Hi ${safeFirstName}, here's your weekly snapshot</h2>
        <table>
            <tr><td><strong>JRI Score</strong></td><td>${opts.jriScore.toFixed(1)}</td></tr>
            <tr><td><strong>GitHub Score</strong></td><td>${opts.githubScore.toFixed(1)}</td></tr>
            <tr><td><strong>DSA Score</strong></td><td>${opts.dsaScore.toFixed(1)}</td></tr>
        </table>
        <p><a href="${safeProfileUrl}">View your full profile</a></p>
    `;
    const result = await send(opts.email, subject, html);
    await log({
        type: EmailType.WEEKLY_REPORT,
        recipientEmail: opts.email,
        subject,
        result,
        studentId: opts.studentId,
        metadata: { jriScore: opts.jriScore },
    });
}

export async function sendAnalysisCompleteEmail(opts: {
    studentId: string;
    email: string;
    firstName: string;
    repoUrl: string;
    overallScore: number;
    reportUrl: string;
}): Promise<void> {
    const safeFirstName = escapeHtml(opts.firstName);
    const safeRepoUrl = escapeHtml(opts.repoUrl);
    const safeReportUrl = escapeHtml(opts.reportUrl);
    const subject = `Analysis complete — score ${opts.overallScore}/100`;
    const html = `
        <h2>Hi ${safeFirstName}, your project analysis is ready!</h2>
        <p>Repository: <a href="${safeRepoUrl}">${safeRepoUrl}</a></p>
        <p><strong>Overall Score: ${opts.overallScore}/100</strong></p>
        <p><a href="${safeReportUrl}">View detailed report</a></p>
    `;
    const result = await send(opts.email, subject, html);
    await log({
        type: EmailType.ANALYSIS_COMPLETE,
        recipientEmail: opts.email,
        subject,
        result,
        studentId: opts.studentId,
        metadata: { repoUrl: opts.repoUrl, overallScore: opts.overallScore },
    });
}
