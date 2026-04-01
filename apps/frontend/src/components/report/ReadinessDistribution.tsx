"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ReadinessDistributionProps {
  students: any[];
}

export function ReadinessDistribution({ students }: ReadinessDistributionProps) {
  const buckets = [
    { name: "80+ (Elite)", range: [80, 100], color: "#10b981", description: "Placement-ready for Top Product roles" },
    { name: "60-80 (Rising)", range: [60, 80], color: "#eab308", description: "Needs final polish for Service/Product roles" },
    { name: "<60 (At Risk)", range: [0, 60], color: "#ef4444", description: "Currently below industry hiring bar" }
  ];

  const data = buckets.map(bucket => ({
    name: bucket.name,
    count: students.filter(s => s.jriScore >= bucket.range[0] && s.jriScore < bucket.range[1]).length,
    color: bucket.color,
    description: bucket.description
  }));

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Student Readiness Distribution</CardTitle>
        <CardDescription>Segmenting students by their Job Readiness Index (JRI)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#888888" opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12, fontWeight: 600 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-3 rounded-lg shadow-xl">
                        <p className="font-bold text-sm text-foreground">{data.name}</p>
                        <p className="text-2xl font-black text-primary my-1">{data.count} Students</p>
                        <p className="text-[10px] text-muted-foreground italic">{data.description}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {data.map((bucket, i) => (
            <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-2xl font-black" style={{ color: bucket.color }}>{bucket.count}</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground whitespace-nowrap">{bucket.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
