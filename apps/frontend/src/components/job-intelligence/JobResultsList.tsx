import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface ExtractedSkill { name: string; category: string; required: boolean; }
interface JobResult {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  salary: string | null;
  source: string;
  extractedSkills?: ExtractedSkill[];
}

const SOURCE_COLORS: Record<string, string> = {
  remotive: "bg-blue-500/20 text-blue-300",
  workingnomads: "bg-purple-500/20 text-purple-300",
  web3career: "bg-emerald-500/20 text-emerald-300",
  adzuna: "bg-orange-500/20 text-orange-300",
};

interface JobResultsListProps { jobs: JobResult[]; }

export function JobResultsList({ jobs }: JobResultsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No job listings found for these filters.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      {jobs.map((job, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">{job.title}</h4>
              <p className="text-xs text-muted-foreground">{job.company ?? 'Unknown Company'} {job.location ? `· ${job.location}` : ''}</p>
            </div>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SOURCE_COLORS[job.source] ?? 'bg-muted/40 text-muted-foreground'}`}>
              {job.source}
            </span>
            {job.salary && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                {job.salary}
              </span>
            )}
            {job.extractedSkills?.slice(0, 5).map(skill => (
              <Badge key={skill.name} variant="outline" className="text-[10px] py-0 h-5">
                {skill.name}
              </Badge>
            ))}
            {(job.extractedSkills?.length ?? 0) > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{(job.extractedSkills?.length ?? 0) - 5} more
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
