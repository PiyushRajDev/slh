"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JIFilters } from "@/lib/api-client";

const ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full-Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Developer",
];

const EXPERIENCES = ["0-1 years", "0-2 years", "2-5 years", "5+ years"];
const SALARIES = ["3-6 LPA", "6-8 LPA", "8-12 LPA", "12-20 LPA", "20+ LPA"];

interface FilterBarProps {
  loading: boolean;
  onAnalyze: (filters: JIFilters) => void;
}

export function FilterBar({ loading, onAnalyze }: FilterBarProps) {
  const [role, setRole] = useState(ROLES[0]);
  const [experience, setExperience] = useState(EXPERIENCES[0]);
  const [salary, setSalary] = useState(SALARIES[0]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[180px]">
        <label className="text-xs text-muted-foreground mb-1 block">Role</label>
        <Select value={role} onValueChange={setRole} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-muted-foreground mb-1 block">Experience</label>
        <Select value={experience} onValueChange={setExperience} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-muted-foreground mb-1 block">Salary</label>
        <Select value={salary} onValueChange={setSalary} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SALARIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => onAnalyze({ role, experience, salary })}
        disabled={loading}
        className="h-10 px-6"
      >
        {loading ? "Analyzing..." : "Analyze Market"}
      </Button>
    </div>
  );
}
