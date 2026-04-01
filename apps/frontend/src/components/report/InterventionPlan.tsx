import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, TrendingUp, Zap } from "lucide-react"

export default function InterventionPlan() {
  const recommendations = [
    { 
      title: "Mandatory Project Reviews", 
      impact: "+8 Score", 
      description: "Introduce peer and mentor reviews for each production-grade project." 
    },
    { 
      title: "Weekly DSA Tracking", 
      impact: "+6 Score", 
      description: "Enforce a consistency bar of 3 medium problems solved per week." 
    },
    { 
      title: "Git & Testing Workshops", 
      impact: "+5 Score", 
      description: "Hands-on sessions for repository documentation and unit testing." 
    }
  ];

  return (
    <Card className="border-primary/20 shadow-xl bg-gradient-to-b from-card to-background overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Intervention Plan</CardTitle>
        </div>
        <CardDescription className="font-medium text-muted-foreground/80">Recommended actions to close the gap</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
            <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
               <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                   <p className="text-sm font-extrabold leading-tight">{rec.title}</p>
                   <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                       {rec.impact}
                   </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{rec.description}</p>
            </div>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-2">
               <TrendingUp className="h-4 w-4 text-green-500" />
               <span className="text-sm font-bold">Potential Score Gain</span>
           </div>
           <span className="text-sm font-black text-green-600">+19 Points</span>
        </div>
      </CardContent>
    </Card>
  )
}
