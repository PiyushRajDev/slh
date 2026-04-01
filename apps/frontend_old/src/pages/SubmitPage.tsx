import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import type { AnalysisReport } from '../types/analysis';

export default function SubmitPage() {
    const { user, logout } = useAuth();
    const [repoUrl, setRepoUrl] = useState('');
    const [statusText, setStatusText] = useState('');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const pollingRef = useRef<number | null>(null);

    const checkLatestReport = async (expectedRepoUrl: string) => {
        try {
            const res = await client.get<AnalysisReport>('/api/projects/analyses/latest');
            if (res.status === 200 && res.data && res.data.repoUrl === expectedRepoUrl) {
                setReport(res.data);
                if (pollingRef.current) {
                    window.clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                setStatusType(null); // Clear loading banner when complete
                return true;
            }
        } catch (e) {
            // Ignore 404s while waiting
        }
        return false;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusType(null);
        setReport(null);

        try {
            const res = await client.post('/api/projects/analyze', { repoUrl });

            if (res.status === 200) {
                setStatusType('info');
                setStatusText('Analysis already completed — see results below');
                const analysisId = res.data?.analysisId;
                if (analysisId) {
                    const detail = await client.get(`/api/projects/analyses/${analysisId}`);
                    if (detail.data) setReport(detail.data);
                } else {
                    await checkLatestReport(repoUrl);
                }
            } else if (res.status === 202) {
                setStatusType('success');
                setStatusText('Analysis queued — results will appear below when complete');

                // Start polling every 5000ms
                if (pollingRef.current) window.clearInterval(pollingRef.current);
                const currentRepoUrl = repoUrl;
                pollingRef.current = window.setInterval(() => {
                    checkLatestReport(currentRepoUrl);
                }, 5000);
            }
        } catch (error: any) {
            setStatusType('error');
            if (error.response?.data?.error) {
                setStatusText(error.response.data.error);
            } else {
                setStatusText('Network error occurred submitting repository for analysis.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
            }
        };
    }, []);

    const handleReanalyze = () => {
        setReport(null);
        setStatusType(null);
        setRepoUrl('');
        if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600 border-green-500';
        if (score >= 50) return 'text-yellow-600 border-yellow-500';
        return 'text-red-600 border-red-500';
    };

    const getProgressBarColor = (score: number, max: number) => {
        const percent = (score / max) * 100;
        if (percent >= 70) return 'bg-green-500';
        if (percent >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex-shrink-0">
                        <span className="text-xl font-bold tracking-tight text-gray-900">SkillLighthouse</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
                {/* Submit Section */}
                <section className="bg-white rounded-lg shadow border border-gray-100 p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Analyze Your Project</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="url"
                            required
                            placeholder="https://github.com/username/repo"
                            disabled={isSubmitting || !!pollingRef.current || !!report}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !!pollingRef.current || !!report || !repoUrl}
                            className="flex-shrink-0 py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition"
                        >
                            {isSubmitting ? 'Queuing...' : 'Submit'}
                        </button>
                    </form>

                    {statusType === 'success' && (
                        <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 mt-4 text-sm font-medium">
                            {statusText}
                        </div>
                    )}
                    {statusType === 'info' && (
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200 mt-4 text-sm font-medium">
                            {statusText}
                        </div>
                    )}
                    {statusType === 'error' && (
                        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200 mt-4 text-sm font-medium">
                            {statusText}
                        </div>
                    )}
                </section>

                {/* Results Section */}
                {report && report.report && (
                    <section className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                        {report.flagCount > 0 && report.report.details.antiGaming?.flags?.length > 0 && (
                            <div className="bg-yellow-50 border-b border-yellow-200 p-4">
                                <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Warning: Potential Anti-Gaming Patterns Detected</h3>
                                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                                    {report.report.details.antiGaming.flags.map((flag, idx) => (
                                        <li key={idx}><strong>{flag.pattern}</strong> — {flag.description}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 pb-8 mb-8">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Assessed Profile</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900">{report.report.summary.displayName}</h3>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-900">Confidence:</span> {report.confidenceLevel}</div>
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-900">Reliability:</span> {report.reliabilityLevel}</div>
                                        <div className="flex items-center gap-1.5"><span className="font-semibold text-gray-900">Flags:</span> {report.flagCount}</div>
                                    </div>
                                </div>

                                <div className={`flex-shrink-0 flex flex-col items-center justify-center p-6 border-4 rounded-full w-40 h-40 shadow-sm bg-gray-50 object-cover
                                 ${getScoreColor(report.report.summary.overallScore)}`} style={{ borderColor: report.report.summary.overallScore >= 70 ? '#22c55e' : report.report.summary.overallScore >= 50 ? '#eab308' : '#ef4444' }}>
                                    <span className={`text-5xl font-black ${getScoreColor(report.report.summary.overallScore).split(' ')[0]}`}>
                                        {report.report.summary.overallScore}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-500 uppercase mt-1 tracking-wider">Overall</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Dimension Breakdown</h4>

                                    {[
                                        { label: 'Code Quality', data: report.report.details.dimensions.dimensions.codeQuality },
                                        { label: 'Architecture', data: report.report.details.dimensions.dimensions.architecture },
                                        { label: 'Testing', data: report.report.details.dimensions.dimensions.testing },
                                        { label: 'Git Hygiene', data: report.report.details.dimensions.dimensions.git },
                                        { label: 'DevOps / Infra', data: report.report.details.dimensions.dimensions.devops }
                                    ].map((dim, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm font-medium text-gray-900 mb-1.5">
                                                <span>{dim.label}</span>
                                                <span>{dim.data.score} / {dim.data.max}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full ${getProgressBarColor(dim.data.score, dim.data.max)}`}
                                                    style={{ width: `${(dim.data.score / dim.data.max) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center text-center border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">Want to analyze a different repository or recalculate scores?</p>
                                    <button
                                        onClick={handleReanalyze}
                                        className="py-2.5 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition"
                                    >
                                        Re-analyze Repository
                                    </button>
                                </div>
                            </div>

                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
