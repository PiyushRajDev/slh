"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { Recommendation } from "@/lib/learning-paths";

interface LearningPathProps {
  recommendations: Recommendation[];
}

const priorityStyles = {
  critical: {
    badge: "bg-red-500/15 text-red-400 border-0",
    bar: "bg-red-500/40",
    label: "Critical",
  },
  high: {
    badge: "bg-amber-500/15 text-amber-400 border-0",
    bar: "bg-amber-500/40",
    label: "High",
  },
  medium: {
    badge: "bg-blue-500/15 text-blue-400 border-0",
    bar: "bg-blue-500/40",
    label: "Medium",
  },
};

export function LearningPath({ recommendations }: LearningPathProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-primary" />
            Learning Path
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40">
            <p className="text-sm text-muted-foreground">
              Complete your profile to unlock recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4 text-primary" />
          Your Learning Path
        </CardTitle>
        <CardDescription>
          Actionable steps to boost your JRI — prioritized by impact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => {
          const style = priorityStyles[rec.priority];
          return (
            <div
              key={rec.id}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/50 p-4 transition-all hover:border-primary/30 hover:bg-background/70"
            >
              {/* Priority accent bar */}
              <div className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} />

              <div className="flex items-start gap-3 pl-2">
                <span className="mt-0.5 text-lg leading-none">{rec.icon}</span>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                    <Badge className={`${style.badge} text-[10px] px-2 py-0.5`}>
                      {style.label}
                    </Badge>
                    <span className="ml-auto text-[11px] font-medium text-primary">
                      {rec.estimatedImpact}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-primary/80">
                    <ArrowRight className="size-3" />
                    {rec.action}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
