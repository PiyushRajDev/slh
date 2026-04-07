"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  getAdminCompanies,
  getAdminJobs,
  createAdminCompany,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  deleteAdminCompany,
  ApiError,
} from "@/lib/api-client";
import {
  Briefcase,
  Building2,
  Plus,
  Trash2,
  Pencil,
  CalendarClock,
  DollarSign,
  Users,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  _count?: { jobs: number };
}

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  ctc?: string;
  eligibility?: string;
  deadline?: string;
  location?: string;
  jobType?: string;
  company: { id: string; name: string; logoUrl?: string };
  _count?: { applications: number };
  createdAt: string;
}

// ─────────────────────────────────────────────────
// Tab Button
// ─────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="size-4" />
      {label}
      {count !== undefined && (
        <span
          className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────
// Job Skills List Component
// ─────────────────────────────────────────────────
function JobSkills({ skills }: { skills: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const truncatedCount = skills.length - 8;

  if (skills.length === 0) return null;

  if (expanded) {
    return (
      <div className="mt-2.5 flex flex-wrap gap-1">
        {skills.map((skill) => (
          <span key={skill} className="rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary">
            {skill}
          </span>
        ))}
        <button
          onClick={() => setExpanded(false)}
          className="text-[11px] text-muted-foreground self-center hover:text-foreground hover:underline transition-colors px-1"
        >
          show less
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex flex-wrap gap-1">
      {skills.slice(0, 8).map((skill) => (
        <span key={skill} className="rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary">
          {skill}
        </span>
      ))}
      {skills.length > 8 && (
        <Tooltip>
          <TooltipTrigger
            onClick={() => setExpanded(true)}
            className="text-[11px] text-muted-foreground self-center hover:text-foreground hover:underline transition-colors px-1 cursor-pointer"
          >
            +{truncatedCount} more
          </TooltipTrigger>
          <TooltipContent className="max-w-xs flex flex-wrap gap-1 p-2 bg-popover text-popover-foreground border-border shadow-xl">
            <p className="w-full mb-1 text-[10px] text-muted-foreground italic">Click to expand</p>
            {skills.slice(8).map((skill) => (
              <span key={skill} className="rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/10">
                {skill}
              </span>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Company Form Dialog
// ─────────────────────────────────────────────────
function CompanyFormDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (company: Company) => void;
}) {
  const [form, setForm] = useState({ name: "", website: "", industry: "", size: "", location: "", logoUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Company name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const { company } = await createAdminCompany({
        name: form.name,
        website: form.website || undefined,
        industry: form.industry || undefined,
        size: form.size || undefined,
        location: form.location || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      onSaved(company);
      setForm({ name: "", website: "", industry: "", size: "", location: "", logoUrl: "" });
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to create company");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" /> Add Company
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {(
            [
              { key: "name", label: "Company Name *", placeholder: "e.g. Acme Corp" },
              { key: "industry", label: "Industry", placeholder: "e.g. Fintech" },
              { key: "location", label: "Location", placeholder: "e.g. Bangalore, India" },
              { key: "size", label: "Size", placeholder: "e.g. 100-500" },
              { key: "website", label: "Website", placeholder: "https://acme.com" },
              { key: "logoUrl", label: "Logo URL", placeholder: "https://..." },
            ] as { key: keyof typeof form; label: string; placeholder: string }[]
          ).map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating…" : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────
// Job Form Dialog
// ─────────────────────────────────────────────────
function JobFormDialog({
  open,
  onClose,
  onSaved,
  companies,
  editingJob,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (job: Job) => void;
  companies: Company[];
  editingJob?: Job | null;
}) {
  const isEdit = !!editingJob;
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyId: "",
    ctc: "",
    eligibility: "",
    deadline: "",
    location: "",
    jobType: "Full-time",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingJob) {
      setForm({
        title: editingJob.title,
        description: editingJob.description,
        companyId: editingJob.company.id,
        ctc: editingJob.ctc ?? "",
        eligibility: editingJob.eligibility ?? "",
        deadline: editingJob.deadline ? editingJob.deadline.slice(0, 10) : "",
        location: editingJob.location ?? "",
        jobType: editingJob.jobType ?? "Full-time",
      });
    } else {
      setForm({ title: "", description: "", companyId: "", ctc: "", eligibility: "", deadline: "", location: "", jobType: "Full-time" });
    }
  }, [editingJob, open]);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError("Job title is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (!isEdit && !form.companyId) { setError("Please select a company"); return; }
    setSaving(true);
    setError("");
    try {
      let job: Job;
      if (isEdit && editingJob) {
        const res = await updateAdminJob(editingJob.id, {
          title: form.title,
          description: form.description,
          ctc: form.ctc || undefined,
          eligibility: form.eligibility || undefined,
          deadline: form.deadline || undefined,
          location: form.location || undefined,
          jobType: form.jobType || undefined,
        });
        job = res.job;
      } else {
        const res = await createAdminJob({
          title: form.title,
          description: form.description,
          companyId: form.companyId,
          ctc: form.ctc || undefined,
          eligibility: form.eligibility || undefined,
          deadline: form.deadline || undefined,
          location: form.location || undefined,
          jobType: form.jobType || undefined,
        });
        job = res.job;
      }
      onSaved(job);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            {isEdit ? "Edit Job Posting" : "Post a Job"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company *</label>
              <select
                value={form.companyId}
                onChange={(e) => set("companyId", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {(
            [
              { key: "title", label: "Job Title *", placeholder: "e.g. Software Engineer" },
              { key: "ctc", label: "CTC / Stipend", placeholder: "e.g. ₹12 LPA" },
              { key: "location", label: "Location", placeholder: "e.g. Remote / Bangalore" },
              { key: "eligibility", label: "Eligibility", placeholder: "e.g. 7.0+ CGPA, CSE/IT" },
              { key: "deadline", label: "Application Deadline", placeholder: "", type: "date" },
            ] as { key: keyof typeof form; label: string; placeholder: string; type?: string }[]
          ).map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
              <input
                type={type ?? "text"}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Type</label>
            <select
              value={form.jobType}
              onChange={(e) => set("jobType", e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {["Full-time", "Internship", "Contract", "Part-time"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Job Description *
              <span className="ml-2 font-normal text-muted-foreground/70">(skills auto-extracted)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              placeholder="Paste the full job description here. Skills like React, Node.js, AWS, DSA will be auto-extracted…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Post Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────
export default function AdminJobsPage() {
  const [tab, setTab] = useState<"companies" | "jobs">("jobs");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [companiesRes, jobsRes] = await Promise.all([
          getAdminCompanies(),
          getAdminJobs(),
        ]);
        setCompanies(companiesRes.companies);
        setJobs(jobsRes.jobs);
      } catch (err: any) {
        const isAuth = err instanceof ApiError && err.status === 401;
        if (!isAuth) setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDeleteJob(id: string) {
    if (!confirm("Delete this job posting?")) return;
    try {
      await deleteAdminJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      setError(err.message ?? "Failed to delete job");
    }
  }

  async function handleDeleteCompany(id: string) {
    if (!confirm("Delete this company and all its jobs?")) return;
    try {
      await deleteAdminCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setJobs((prev) => prev.filter((j) => j.company.id !== id));
    } catch (err: any) {
      setError(err.message ?? "Failed to delete company");
    }
  }

  const formatDeadline = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isDeadlineSoon = (d?: string) => {
    if (!d) return false;
    return new Date(d).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <PageShell
      eyebrow="Placement Intelligence"
      title="Job Management"
      description="Post job openings and manage company profiles for your placement cell."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCompanyDialogOpen(true)}>
            <Building2 className="size-4 mr-2" /> Add Company
          </Button>
          <Button size="sm" onClick={() => { setEditingJob(null); setJobDialogOpen(true); }}>
            <Plus className="size-4 mr-2" /> Post Job
          </Button>
        </div>
      }
    >
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/25">
          <AlertCircle className="size-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Bar */}
      <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-1 w-fit">
        <TabButton
          active={tab === "jobs"}
          onClick={() => setTab("jobs")}
          icon={Briefcase}
          label="Job Postings"
          count={jobs.length}
        />
        <TabButton
          active={tab === "companies"}
          onClick={() => setTab("companies")}
          icon={Building2}
          label="Companies"
          count={companies.length}
        />
      </div>

      {/* ── JOBS TAB ── */}
      {tab === "jobs" && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : jobs.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-card/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <Briefcase className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No job postings yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Post your first job opening to start matching students.
                </p>
                <Button size="sm" onClick={() => { setEditingJob(null); setJobDialogOpen(true); }}>
                  <Plus className="size-4 mr-2" /> Post a Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="bg-card/60 border-border/40 hover:border-border/70 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Company logo */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50 overflow-hidden">
                        {job.company.logoUrl ? (
                          <img src={job.company.logoUrl} alt={job.company.name} className="size-full object-contain" />
                        ) : (
                          <Building2 className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          {job.jobType && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{job.jobType}</Badge>
                          )}
                          {job.deadline && isDeadlineSoon(job.deadline) && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Closing soon</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{job.company.name}</p>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {job.ctc && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="size-3" /> {job.ctc}
                            </span>
                          )}
                          {job.deadline && (
                            <span className={`flex items-center gap-1 ${isDeadlineSoon(job.deadline) ? "text-destructive font-medium" : ""}`}>
                              <CalendarClock className="size-3" /> {formatDeadline(job.deadline)}
                            </span>
                          )}
                          {job._count && (
                            <span className="flex items-center gap-1">
                              <Users className="size-3" /> {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        <JobSkills skills={job.skills} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditingJob(job); setJobDialogOpen(true); }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── COMPANIES TAB ── */}
      {tab === "companies" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          ) : companies.length === 0 ? (
            <Card className="col-span-full border-dashed border-border/60 bg-card/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <Building2 className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No companies yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Add a company before posting jobs.</p>
                <Button size="sm" onClick={() => setCompanyDialogOpen(true)}>
                  <Plus className="size-4 mr-2" /> Add Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => (
              <Card key={company.id} className="bg-card/60 border-border/40 hover:border-border/70 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted border border-border/50 overflow-hidden">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="size-full object-contain" />
                        ) : (
                          <Building2 className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        {company.industry && (
                          <CardDescription className="text-xs">{company.industry}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {company.location && <span>{company.location}</span>}
                    {company.size && <span>{company.size} employees</span>}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {company._count?.jobs ?? 0} job{(company._count?.jobs ?? 0) !== 1 ? "s" : ""} posted
                    </span>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Website <ChevronRight className="size-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
      <CompanyFormDialog
        open={companyDialogOpen}
        onClose={() => setCompanyDialogOpen(false)}
        onSaved={(company) => {
          setCompanies((prev) => [{ ...company, _count: { jobs: 0 } }, ...prev]);
          setCompanyDialogOpen(false);
        }}
      />
      <JobFormDialog
        open={jobDialogOpen}
        onClose={() => { setJobDialogOpen(false); setEditingJob(null); }}
        onSaved={(job) => {
          if (editingJob) {
            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...job } : j)));
          } else {
            setJobs((prev) => [job, ...prev]);
          }
          setJobDialogOpen(false);
          setEditingJob(null);
        }}
        companies={companies}
        editingJob={editingJob}
      />
    </PageShell>
  );
}
