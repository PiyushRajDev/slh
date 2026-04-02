"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { PageShell } from "@/components/app/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/app/auth-context";
import { bulkImportStudents } from "@/lib/api-client";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StudentRow {
  uid: string;
  name: string;
  section: string;
  department: string;
  email: string;
  batch: string;
}

interface StudentImportPayload {
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
  department: string;
  semester: number;
  batch: string;
  section?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract batch year from UID: first two digits → prepend "20". */
function extractBatch(uid: string): string {
  const match = uid.match(/^(\d{2})/);
  return match ? `20${match[1]}` : "NA";
}

/** Normalize a header string for fuzzy matching. */
function norm(h: unknown): string {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Find the column index that best matches one of the candidate keys. */
function findCol(headers: string[], ...candidates: string[]): number {
  const normalizedHeaders = headers.map((h) =>
    String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, "")
  );
  const normalizedCandidates = candidates.map((c) =>
    c.toLowerCase().replace(/[^a-z0-9]/g, "")
  );
  return normalizedHeaders.findIndex((h) => normalizedCandidates.includes(h));
}

/** Safe cell read — returns trimmed string or "NA". */
function cell(row: unknown[], idx: number): string {
  if (idx < 0) return "NA";
  const v = row[idx];
  const s = String(v ?? "").trim();
  return s === "" ? "NA" : s;
}

/** Derive semester from batch year. Current year minus batch year. */
function deriveSemester(batch: string): number {
  const batchNum = parseInt(batch, 10);
  if (isNaN(batchNum)) return 1;
  const yearsSince = new Date().getFullYear() - batchNum;
  const sem = Math.max(1, yearsSince * 2); // rough estimate: 2 semesters per year
  return Math.min(sem, 8); // cap at 8 semesters
}

/** Split full name into firstName and lastName. */
function splitName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return ["Unknown", "Student"];
  if (parts.length === 1) return [parts[0], ""];
  return [parts[0], parts.slice(1).join(" ")];
}

/** Turn raw 2-D sheet data into typed student rows. */
function parseSheetData(data: unknown[][]): StudentRow[] {
  if (data.length < 2) return [];

  const headers = data[0].map(norm);

  const uidIdx = findCol(headers, "uid", "roll", "rollno", "rollnumber");
  const nameIdx = findCol(headers, "name", "studentname", "fullname");
  const secIdx = findCol(headers, "section", "sec");
  const deptIdx = findCol(headers, "department", "dept", "branch");
  const emailIdx = findCol(
    headers,
    "email",
    "collegeemail",
    "collegeemailaddress",
    "mail",
    "emailid",
    "emailaddress"
  );

  return data
    .slice(1)
    .filter((row) =>
      (row as unknown[]).some(
        (c) => c != null && String(c).trim() !== ""
      )
    )
    .map((row) => {
      const r = row as unknown[];
      const uid = cell(r, uidIdx);
      return {
        uid,
        name: cell(r, nameIdx),
        section: cell(r, secIdx),
        department: cell(r, deptIdx),
        email: cell(r, emailIdx),
        batch: extractBatch(uid),
      };
    });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminOnboardPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    ok: boolean;
    message: string;
    created?: number;
    skipped?: number;
  } | null>(null);

  // ---- File handling ----

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setParseError(null);
    setSubmitResult(null);
    setStudents([]);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });
        const parsed = parseSheetData(json);
        if (parsed.length === 0) {
          setParseError(
            "No student rows found. Ensure the file has a header row with columns like UID, Name, Section, Department, and Email."
          );
          return;
        }
        setStudents(parsed);
      } catch {
        setParseError(
          "Failed to read the file. Make sure it is a valid .csv or .xlsx file."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function clearFile() {
    setStudents([]);
    setFileName(null);
    setParseError(null);
    setSubmitResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ---- Submit ----

  async function handleSubmit() {
    const collegeId = (user as any)?.collegeId;
    if (!collegeId) {
      setSubmitResult({
        ok: false,
        message:
          "Your account is not linked to a college. Contact a Super Admin.",
      });
      return;
    }

    // Validate and transform data
    const payload: StudentImportPayload[] = [];
    const errors: string[] = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      // Validate required fields (department is optional — defaults to "N/A")
      if (
        s.uid === "NA" ||
        s.name === "NA" ||
        s.email === "NA" ||
        s.batch === "NA"
      ) {
        errors.push(
          `Row ${i + 1}: Missing required field(s) — UID, Name, Email, or Batch`
        );
        continue;
      }

      const [firstName, lastName] = splitName(s.name);
      payload.push({
        firstName,
        lastName,
        rollNumber: s.uid,
        email: s.email,
        department: s.department !== "NA" ? s.department : "N/A",
        semester: deriveSemester(s.batch),
        batch: s.batch,
        section: s.section !== "NA" ? s.section : undefined,
      });
    }

    if (payload.length === 0) {
      setSubmitResult({
        ok: false,
        message: `No valid students to import. ${errors.length} row(s) had missing required fields (UID, Name, Email, or Batch).`,
      });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await bulkImportStudents(collegeId, payload);
      const apiCreated: number = result?.data?.created ?? result?.created ?? payload.length;
      const apiSkipped: number = (result?.data?.skipped ?? result?.skipped ?? 0) + errors.length;
      setSubmitResult({
        ok: true,
        message: `Successfully created ${apiCreated} student(s).`,
        created: apiCreated,
        skipped: apiSkipped,
      });
      clearFile();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Import failed. Please try again.";
      setSubmitResult({ ok: false, message });
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Render ----

  return (
    <PageShell
      eyebrow="Administration"
      title="Student Onboarding"
      description="Bulk import students from a CSV or Excel file to provision platform accounts."
    >
      {/* Credentials info */}
      <Alert className="border-primary/25 bg-primary/5">
        <Info className="size-4 text-primary" />
        <AlertTitle className="text-sm font-semibold">
          Automatic Credential Assignment
        </AlertTitle>
        <AlertDescription>
          Each imported student will be assigned a temporary password in the
          format{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            SLH@&#123;UID&#125;
          </code>
          . Students can change their password after first login.
        </AlertDescription>
      </Alert>

      {/* Upload card */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader>
          <CardTitle className="text-xl">Upload Student Data</CardTitle>
          <CardDescription>
            Accepted formats: <strong>.csv</strong> and{" "}
            <strong>.xlsx</strong>. The file must contain a header row with
            columns for UID, Name, Section, Department, and College Email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="sr-only"
              />
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted">
                <Upload className="size-4" />
                Choose File
              </span>
            </label>
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4 text-primary" />
                <span className="font-medium text-foreground">{fileName}</span>
                <button
                  onClick={clearFile}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {parseError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/25">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-sm font-semibold">
                Parse Error
              </AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submit result feedback */}
      {submitResult && !submitResult.ok && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/25">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-sm font-semibold">Import Failed</AlertTitle>
          <AlertDescription>{submitResult.message}</AlertDescription>
        </Alert>
      )}

      {submitResult?.ok && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center gap-3 border-b border-emerald-500/15 bg-emerald-500/10 px-5 py-3.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Onboarding Queued
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 divide-x divide-emerald-500/10 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5 px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Submitted
              </span>
              <span className="text-3xl font-bold tabular-nums text-emerald-500">
                {submitResult.created}
              </span>
              <span className="text-xs text-muted-foreground">students queued</span>
            </div>

            <div className="flex flex-col gap-0.5 px-5 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Skipped
              </span>
              <span className={`text-3xl font-bold tabular-nums ${(submitResult.skipped ?? 0) > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                {submitResult.skipped ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">
                {(submitResult.skipped ?? 0) > 0 ? "already exist or missing fields" : "no duplicates"}
              </span>
            </div>

            <div className="col-span-2 flex flex-col gap-1 border-t border-emerald-500/10 px-5 py-4 sm:col-span-1 sm:border-t-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                What's next
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Students can log in immediately using their college email and the temporary
                password{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                  SLH@&#123;UID&#125;
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview table */}
      {students.length > 0 && (
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Preview</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="font-mono text-xs">
                  {students.length}
                </Badge>{" "}
                student(s) parsed from file
              </CardDescription>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {submitting ? "Importing…" : "Submit Import"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      #
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      UID
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Section
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Department
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Email
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Batch
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/30 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2 font-mono font-medium">
                        {s.uid}
                      </td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">
                        {s.section === "NA" ? (
                          <span className="text-muted-foreground">NA</span>
                        ) : (
                          s.section
                        )}
                      </td>
                      <td className="px-4 py-2">{s.department}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {s.email === "NA" ? (
                          <span className="text-muted-foreground">NA</span>
                        ) : (
                          s.email
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {s.batch}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                        SLH@{s.uid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
