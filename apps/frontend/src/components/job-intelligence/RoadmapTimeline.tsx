import { Badge } from "@/components/ui/badge";
import { Clock, Folder, BookOpen } from "lucide-react";

interface RoadmapProject { name: string; description: string; difficulty: string; }
interface RoadmapResource { title: string; type: string; }
interface RoadmapPhase {
  title: string;
  duration: string;
  skills: string[];
  projects: RoadmapProject[];
  resources: RoadmapResource[];
  outcome: string;
}
interface Roadmap { phases: RoadmapPhase[]; estimatedTotalDuration: string; priorityOrder: string[]; }

const DIFFICULTY_COLORS = { beginner: "text-emerald-400", intermediate: "text-amber-400", advanced: "text-red-400" };

interface RoadmapTimelineProps { roadmap: Roadmap; }

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" />
        Total: <span className="font-medium text-foreground">{roadmap.estimatedTotalDuration}</span>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6 pl-8">
          {roadmap.phases.map((phase, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Phase {i + 1}</span>
                    <h4 className="font-semibold text-sm">{phase.title}</h4>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    <Clock className="size-3 mr-1" />{phase.duration}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {phase.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Folder className="size-3" />Projects
                  </p>
                  {phase.projects.map((p, pi) => (
                    <div key={pi} className="text-xs pl-4">
                      <span className="font-medium">{p.name}</span>
                      <span className={`ml-2 ${DIFFICULTY_COLORS[p.difficulty as keyof typeof DIFFICULTY_COLORS] ?? ''}`}>
                        [{p.difficulty}]
                      </span>
                      <p className="text-muted-foreground mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>

                {phase.resources.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="size-3" />Resources
                    </p>
                    {phase.resources.map((r, ri) => (
                      <p key={ri} className="text-xs pl-4 text-muted-foreground">
                        {r.title} <span className="opacity-60">({r.type})</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="text-xs rounded-md bg-muted/40 px-3 py-1.5 border border-border/50">
                  <span className="text-muted-foreground">Outcome: </span>{phase.outcome}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
