import fs from "fs/promises"
import path from "path"
import { BatchSummaryCards } from "@/components/report/BatchSummaryCards"
import { LeetCodeStatsChart } from "@/components/report/LeetCodeStatsChart"
import { GithubProfilesChart } from "@/components/report/GithubProfilesChart"
import { StudentLeaderboard } from "@/components/report/StudentLeaderboard"
import { ReadinessDistribution } from "@/components/report/ReadinessDistribution"
import GapAnalysisSection from "@/components/report/GapAnalysisSection"
import InterventionPlan from "@/components/report/InterventionPlan"
import { StudentResult } from "@/components/report/types"
import { ThemeToggle } from "@/components/ThemeToggle"

function calculateJRI(student: StudentResult) {
  const leetcode = student.leetcode?.data?.difficultyStats;
  const github = student.github;

  // DSA Score logic matching jriService
  const lcTotal = leetcode?.total || 0;
  const lcHard = leetcode?.hard || 0;
  const lcMedium = leetcode?.medium || 0;
  
  const dsaScore = Math.min(100, (lcTotal / 500) * 70 + (lcHard / 80) * 20 + (lcMedium / 200) * 10);
  const projectScore = github?.avgScore || 0;
  
  // 55% DSA, 45% Projects
  const jriScore = Math.round(dsaScore * 0.55 + projectScore * 0.45);
  
  return {
    ...student,
    jriScore,
    dsaScore: Math.round(dsaScore * 10) / 10,
    projectScore: Math.round(projectScore * 10) / 10
  };
}

export default async function PreviewReportPage() {
  const filePath = path.join(process.cwd(), "../../results/student-results.json");
  
  let rawStudents: StudentResult[] = [];
  try {
    const data = await fs.readFile(filePath, "utf-8");
    rawStudents = JSON.parse(data);
  } catch (error) {
    console.error("Failed to read student results:", error);
  }

  const students = rawStudents.map(calculateJRI);
  
  const totalStudents = students.length;
  const avgJRI = students.reduce((acc, s) => acc + s.jriScore, 0) / Math.max(1, totalStudents);
  const placementReadyCount = students.filter(s => s.jriScore >= 70).length;
  const placementReadyPercent = Math.round((placementReadyCount / Math.max(1, totalStudents)) * 100);

  // Risk detection logic
  const lowProjectScoreCount = students.filter(s => s.student.githubUrl && (s.github?.avgScore || 0) < 30).length;
  const lowDSAConsistencyCount = students.filter(s => s.student.leetcodeUrl && (s.leetcode?.data?.difficultyStats?.total || 0) < 50).length;
  const weakDepthCount = students.filter(s => s.student.leetcodeUrl && (s.leetcode?.data?.difficultyStats?.medium || 0) < 15).length;

  const productionReadyPercent = Math.round((students.filter(s => (s.github?.bestScore || 0) > 45).length / Math.max(1, students.filter(s => s.github).length)) * 100);
  const consistencyPercent = Math.round((students.filter(s => s.leetcode && (s.leetcode?.data?.difficultyStats?.total || 0) > 100).length / Math.max(1, totalStudents)) * 100);
  const qualityPercent = Math.round((students.filter(s => (s.github?.avgScore || 0) > 40).length / Math.max(1, totalStudents)) * 100);

  const risks = [
    { 
      label: "Production-level projects", 
      value: productionReadyPercent,
      threshold: 40,
      description: `${100 - productionReadyPercent}% students lack production-grade project signals`
    },
    {
      label: "DSA Consistency",
      value: consistencyPercent,
      threshold: 60,
      description: `${100 - consistencyPercent}% lack consistent problem-solving behavior`
    },
    {
      label: "Code Quality Signals",
      value: qualityPercent,
      threshold: 70,
      description: `${100 - qualityPercent}% repos lack professional testing/documentation`
    }
  ];

  return (
    <div className="container mx-auto py-10 space-y-10 px-4 md:px-8 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">Batch Evaluation Report</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Strategic analysis of the current batch's placement readiness and technical depth.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 backdrop-blur-sm self-start md:self-auto shadow-sm">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">Benchmark: Industry Standard (72)</span>
          <div className="h-4 w-px bg-primary/20" />
          <ThemeToggle />
        </div>
      </div>

      {/* SECTION 1: THE TRUTH */}
      <BatchSummaryCards 
        avgJRI={Math.round(avgJRI)} 
        placementReadyPercent={placementReadyPercent}
        totalStudents={totalStudents}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 2: DISTRIBUTION */}
          <ReadinessDistribution students={students} />
          
          {/* SECTION 5: DETAILED CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeetCodeStatsChart students={students} />
            <GithubProfilesChart students={students} />
          </div>
        </div>

        <div className="space-y-8">
          {/* SECTION 3 & 4: GAP ANALYSIS & ROOT CAUSES */}
          <GapAnalysisSection risks={risks} />
          
          {/* SECTION 5: RECOMMENDED ACTIONS */}
          <InterventionPlan />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Student Readiness Roster</h2>
        <StudentLeaderboard students={students} />
      </div>
    </div>
  )
}
