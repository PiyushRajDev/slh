import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, Users, AlertCircle } from "lucide-react"

interface BatchSummaryProps {
  avgJRI: number;
  placementReadyPercent: number;
  totalStudents: number;
}

export function BatchSummaryCards({ avgJRI, placementReadyPercent, totalStudents }: BatchSummaryProps) {
  const benchmark = 72;
  const gap = avgJRI - benchmark;
  const isPositive = gap >= 0;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="h-24 w-24 text-primary" />
        </div>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Batch Readiness Score</span>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black tabular-nums">{avgJRI}</span>
              <div className="flex flex-col">
                <span className={`text-sm font-bold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(gap)} {isPositive ? 'Above' : 'Below'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">vs Industry Benchmark ({benchmark})</span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${avgJRI > 70 ? 'bg-green-500' : avgJRI > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${avgJRI}%` }}
                />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-card transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Placement Readiness</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{placementReadyPercent}%</span>
                <span className="text-sm text-muted-foreground font-medium">Students ready</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            <span className="font-bold text-blue-500">Industry Insight:</span> Only students with 70+ JRI are likely to clear Tier-1 technical rounds without intervention.
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-card transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Users className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Batch Size</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{totalStudents}</span>
                <span className="text-sm text-muted-foreground font-medium">Evaluated</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 p-2 bg-amber-500/5 rounded border border-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 font-medium">
              Action Required: {totalStudents - Math.round(totalStudents * placementReadyPercent / 100)} students are at high risk of losing placement opportunities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
