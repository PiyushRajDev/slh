import { capabilityCatalogService } from "./capabilityCatalog.service";
import { getMarketFitCoreRuntime } from "./runtime";
import { mappingResolverService, type CapabilityContribution } from "./mappingResolver.service";
import { UserCapabilitySummary } from "./types";
import { clamp, stableHash, uniqueStrings } from "./utils";

function extractStrings(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((item) => extractStrings(item));
    }

    if (value && typeof value === "object") {
        return Object.keys(value as Record<string, unknown>);
    }

    if (typeof value === "string") {
        return [value];
    }

    return [];
}

function aggregateContributions(contributions: CapabilityContribution[]): CapabilityContribution[] {
    const aggregated = new Map<string, CapabilityContribution>();

    for (const contribution of contributions) {
        const key = `${contribution.slug}:${contribution.sourceType}`;
        const existing = aggregated.get(key);

        if (!existing) {
            aggregated.set(key, contribution);
            continue;
        }

        aggregated.set(key, {
            ...existing,
            score: Math.max(existing.score, contribution.score),
            confidence: Math.max(existing.confidence, contribution.confidence),
            evidence: uniqueStrings([...existing.evidence, ...contribution.evidence]).slice(0, 4)
        });
    }

    return Array.from(aggregated.values());
}

async function buildSummaries(profileId: string): Promise<UserCapabilitySummary[]> {
    const { prisma } = getMarketFitCoreRuntime();
    const rows = await prisma.userCapabilityEvidence.findMany({
        where: { profileId },
        include: { capability: true }
    });

    const aggregated = new Map<string, UserCapabilitySummary>();

    for (const row of rows) {
        const existing = aggregated.get(row.capabilityId);
        const evidence = Array.isArray(row.evidence) ? (row.evidence as string[]) : [];
        if (!existing) {
            aggregated.set(row.capabilityId, {
                capabilityId: row.capabilityId,
                capabilitySlug: row.capability.slug,
                capabilityName: row.capability.name,
                category: row.capability.category,
                score: row.score,
                confidence: row.confidence,
                evidence,
                sources: [row.sourceType]
            });
            continue;
        }

        existing.score = Math.max(existing.score, row.score);
        existing.confidence = Math.max(existing.confidence, row.confidence);
        existing.evidence = uniqueStrings([...existing.evidence, ...evidence]).slice(0, 5);
        existing.sources = uniqueStrings([...existing.sources, row.sourceType]);
    }

    return Array.from(aggregated.values()).sort((a, b) => b.score - a.score);
}

export const userCapabilityProfileService = {
    async refreshForStudent(studentId: string, forceRefresh = false) {
        const { prisma } = getMarketFitCoreRuntime();

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                githubProfile: {
                    select: {
                        username: true,
                        languagesUsed: true,
                        frameworks: true,
                        repositories: true,
                        updatedAt: true
                    }
                },
                dsaProfiles: {
                    where: { isVerified: true },
                    select: {
                        platform: true,
                        totalSolved: true,
                        hardSolved: true,
                        rating: true,
                        updatedAt: true
                    }
                },
                jriCalculations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        jriScore: true,
                        githubScore: true,
                        dsaScore: true,
                        createdAt: true
                    }
                },
                projectAnalyses: {
                    where: { status: "COMPLETED" },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        repoUrl: true,
                        overallScore: true,
                        profileId: true,
                        report: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const snapshotHash = stableHash(JSON.stringify({
            studentUpdatedAt: student.updatedAt.toISOString(),
            githubUpdatedAt: student.githubProfile?.updatedAt?.toISOString(),
            dsaProfiles: student.dsaProfiles.map((profile) => ({
                platform: profile.platform,
                totalSolved: profile.totalSolved,
                hardSolved: profile.hardSolved,
                rating: profile.rating,
                updatedAt: profile.updatedAt.toISOString()
            })),
            jriCreatedAt: student.jriCalculations[0]?.createdAt?.toISOString(),
            analyses: student.projectAnalyses.map((analysis) => ({
                id: analysis.id,
                updatedAt: analysis.updatedAt.toISOString()
            }))
        }));

        if (!forceRefresh) {
            const existing = await prisma.userCapabilityProfile.findFirst({
                where: { studentId, snapshotHash },
                orderBy: { createdAt: "desc" }
            });

            if (existing) {
                return {
                    profile: existing,
                    capabilities: await buildSummaries(existing.id),
                    reused: true
                };
            }
        }

        const contributions: CapabilityContribution[] = [];

        for (const analysis of student.projectAnalyses.filter((row) => row.report !== null)) {
            const report = analysis.report as Record<string, any>;
            const overall = clamp((analysis.overallScore ?? 0) / 100);
            const signals = report?.details?.signals ?? {};
            const metrics = report?.details?.metrics ?? {};
            const dimensions = report?.details?.dimensions?.dimensions ?? {};
            const metricTerms = [
                ...Object.keys(metrics.languages ?? {}),
                ...(metrics.dependencies ?? []),
                ...(metrics.deploy_config_types ?? []),
                ...(metrics.readme_keywords ?? [])
            ].filter((value): value is string => typeof value === "string");

            contributions.push(
                ...(await mappingResolverService.resolveProjectAnalysisContributions({
                    profileId: analysis.profileId,
                    repoUrl: analysis.repoUrl,
                    overall,
                    signals,
                    dimensions,
                    metricTerms
                }))
            );
        }

        if (student.githubProfile) {
            const githubTerms = [
                student.githubProfile.username,
                ...extractStrings(student.githubProfile.languagesUsed),
                ...extractStrings(student.githubProfile.frameworks),
                ...extractStrings(student.githubProfile.repositories)
            ];

            contributions.push(
                ...(await mappingResolverService.resolveGithubTermContributions({
                    terms: githubTerms,
                    evidence: student.githubProfile.username
                }))
            );
        }

        for (const profile of student.dsaProfiles) {
            const score = profile.platform === "LEETCODE"
                ? clamp(profile.totalSolved / 500 + profile.hardSolved / 120)
                : clamp((profile.totalSolved / 2000) * 0.45 + ((profile.rating ?? 0) / 2000) * 0.55);

            contributions.push(
                ...(await mappingResolverService.resolveDsaContributions({
                    platform: profile.platform,
                    score,
                    evidence: `${profile.platform}:${profile.totalSolved}`
                }))
            );
        }

        const latestJri = student.jriCalculations[0];
        if (latestJri) {
            contributions.push(
                ...(await mappingResolverService.resolveJriContributions({
                    metrics: {
                        dsaScore: clamp((latestJri.dsaScore ?? 0) / 100),
                        githubScore: clamp((latestJri.githubScore ?? 0) / 100)
                    }
                }))
            );
        }

        const aggregatedContributions = aggregateContributions(contributions).filter((item) => item.score >= 0.2);
        const capabilityMap = await capabilityCatalogService.ensureCapabilities(
            aggregatedContributions.map((item) => ({
                slug: item.slug,
                name: item.name,
                category: item.category,
                importance: item.score,
                confidence: item.confidence,
                evidence: item.evidence
            }))
        );

        const profile = await prisma.userCapabilityProfile.create({
            data: {
                studentId,
                snapshotHash,
                sourceSummary: {
                    githubConnected: Boolean(student.githubProfile),
                    dsaProfiles: student.dsaProfiles.length,
                    projectAnalyses: student.projectAnalyses.length,
                    reused: false
                } as any,
                expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
            }
        }) as { id: string };

        await prisma.userCapabilityEvidence.createMany({
            data: aggregatedContributions.map((item) => {
                const capability = capabilityMap.get(item.slug);
                if (!capability) {
                    throw new Error(`Capability not found for slug ${item.slug}`);
                }

                return {
                    profileId: profile.id,
                    capabilityId: capability.id,
                    sourceType: item.sourceType,
                    score: item.score,
                    confidence: item.confidence,
                    evidence: item.evidence as any
                };
            })
        });

        return {
            profile,
            capabilities: await buildSummaries(profile.id),
            reused: false
        };
    }
};
