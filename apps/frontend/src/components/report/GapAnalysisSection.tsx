import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress, ProgressIndicator } from "@/components/ui/progress"
import { AlertTriangle, Fingerprint } from "lucide-react"

interface GapAnalysisSectionProps {
  risks: any[];
}

export default function GapAnalysisSection({ risks }: GapAnalysisSectionProps) {
  const rootCauses = [
    { title: "Building Incomplete Projects", description: "Most repos lack READMEs, tests, or proper architecture." },
    { title: "Inconsistent DSA Habits", description: "Students solve problems in clumps before exams, not weekly." },
    { title: "No Feedback Loops", description: "Lack of code reviews means bad habits persist in projects." }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-red-500/20 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-xl font-bold">Placement Risks</CardTitle>
          </div>
          <CardDescription>Identifying critical gaps in batch readiness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {risks.map((risk, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground tracking-tight">{risk.label}</span>
                <span className={`text-xs font-black p-1 rounded ${risk.value >= risk.threshold ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {risk.value}% Success
                </span>
              </div>
              <Progress value={risk.value} className="flex-col !gap-0">
                <ProgressIndicator className={risk.value >= risk.threshold ? 'bg-green-500' : 'bg-red-500'} />
              </Progress>
              <p className="text-[11px] text-muted-foreground font-medium flex items-start gap-1.5 pt-1">
                <span className="text-red-500 font-bold shrink-0">🚨 RISK:</span> {risk.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-primary shadow-lg text-primary-foreground border-none">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 opacity-80" />
            <CardTitle className="text-xl font-bold">Why is this happening?</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/70">Underlying root causes (AI Analysis)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {rootCauses.map((cause, i) => (
            <div key={i} className="flex gap-4 items-start group">
                <div className="mt-1 h-2 w-2 rounded-full bg-white/40 shrink-0 group-hover:bg-white transition-colors" />
                <div className="space-y-0.5">
                    <p className="text-[13px] font-bold tracking-tight">{cause.title}</p>
                    <p className="text-[11px] opacity-80 leading-relaxed font-medium">{cause.description}</p>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
