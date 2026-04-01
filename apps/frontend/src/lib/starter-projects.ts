export interface StarterProjectIdea {
  title: string;
  description: string;
}

const GENERAL_IDEAS: StarterProjectIdea[] = [
  {
    title: "Campus companion API",
    description:
      "Build a small backend that manages events, notices, and student bookmarks with auth, tests, and CI.",
  },
  {
    title: "Placement prep tracker",
    description:
      "Create a dashboard for tracking solved problems, mock interviews, and weekly goals with clean history views.",
  },
  {
    title: "Department knowledge base",
    description:
      "Organize notes, lab references, and helpful links into a searchable app with roles and structured content.",
  },
];

const DEPARTMENT_IDEAS: Array<{
  matchers: string[];
  ideas: StarterProjectIdea[];
}> = [
  {
    matchers: ["computer", "cse", "it", "software"],
    ideas: [
      {
        title: "Distributed task queue visualizer",
        description:
          "Model queues, retries, and worker throughput in a small web app that proves architecture and observability skills.",
      },
      {
        title: "GitHub repo analysis clone",
        description:
          "Analyze public repositories for tests, CI, and project structure, then surface actionable scoring insights.",
      },
      {
        title: "Interview feedback system",
        description:
          "Build a role-based app for scheduling mock interviews, capturing feedback, and tracking candidate improvement over time.",
      },
    ],
  },
  {
    matchers: ["electronics", "ece", "electrical"],
    ideas: [
      {
        title: "IoT device telemetry dashboard",
        description:
          "Ingest sensor readings, chart anomalies, and expose a clean backend with alerting rules and deployment config.",
      },
      {
        title: "Lab inventory monitor",
        description:
          "Track boards, kits, and components with reservation flows, audit history, and admin tools.",
      },
      {
        title: "Signal processing notebook app",
        description:
          "Let students upload sample signals, run transforms, and compare outputs with reproducible experiment history.",
      },
    ],
  },
  {
    matchers: ["mechanical", "mech"],
    ideas: [
      {
        title: "Maintenance request planner",
        description:
          "Prioritize workshop issues, assign technicians, and summarize downtime trends in a structured operations app.",
      },
      {
        title: "Parts costing estimator",
        description:
          "Model bill-of-material calculations, revisions, and approval flows with tests around the pricing rules.",
      },
      {
        title: "Manufacturing line KPI board",
        description:
          "Track throughput, defects, and stoppages with clear data pipelines and actionable visual summaries.",
      },
    ],
  },
  {
    matchers: ["civil"],
    ideas: [
      {
        title: "Site inspection tracker",
        description:
          "Log visits, issues, and compliance checks, then export concise reports for project stakeholders.",
      },
      {
        title: "Material request workflow",
        description:
          "Manage vendor requests, approvals, and stock movements with a backend that benefits from strong folder structure.",
      },
      {
        title: "Construction progress dashboard",
        description:
          "Compare planned milestones against actual progress and flag slippage using a simple insights engine.",
      },
    ],
  },
];

export function getStarterProjectIdeas(
  department?: string | null
): StarterProjectIdea[] {
  const normalizedDepartment = department?.trim().toLowerCase() ?? "";

  const matched = DEPARTMENT_IDEAS.find(({ matchers }) =>
    matchers.some((matcher) => normalizedDepartment.includes(matcher))
  );

  return matched?.ideas ?? GENERAL_IDEAS;
}
