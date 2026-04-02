"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MARKET_FIT_EXPERIENCE_OPTIONS,
  MARKET_FIT_ROLE_OPTIONS,
  MARKET_FIT_SALARY_OPTIONS,
  type MarketFitRequest,
} from "@/lib/market-fit";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowRight } from "lucide-react";

interface MarketFitFormProps {
  values: MarketFitRequest;
  disabled?: boolean;
  error?: string | null;
  onChange: (next: MarketFitRequest) => void;
  onSubmit: () => void;
}

function ChoiceGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                active
                  ? "border-primary/50 bg-primary/12 text-primary"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MarketFitForm({
  values,
  disabled,
  error,
  onChange,
  onSubmit,
}: MarketFitFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Target market setup</CardTitle>
        <CardDescription>
          Pick the role signal you want SLH to benchmark you against, then let the engine map your current evidence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Role
            </label>
            <Input
              value={values.role}
              onChange={(event) => onChange({ ...values, role: event.target.value })}
              placeholder="Backend Developer"
              className="h-10"
              required
              disabled={disabled}
            />
            <div className="flex flex-wrap gap-2">
              {MARKET_FIT_ROLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...values, role: option })}
                  disabled={disabled}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    values.role === option
                      ? "border-primary/50 bg-primary/12 text-primary"
                      : "border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <ChoiceGroup
            label="Experience level"
            options={MARKET_FIT_EXPERIENCE_OPTIONS}
            value={values.seniority}
            onSelect={(seniority) => onChange({ ...values, seniority })}
          />

          <ChoiceGroup
            label="Salary range"
            options={MARKET_FIT_SALARY_OPTIONS}
            value={values.salaryRange}
            onSelect={(salaryRange) => onChange({ ...values, salaryRange })}
          />

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" className="h-10 w-full" disabled={disabled}>
            {disabled ? "Analyzing market fit..." : "Analyze market fit"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
