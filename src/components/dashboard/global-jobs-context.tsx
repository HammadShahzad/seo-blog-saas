"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export interface GlobalJob {
  id: string;
  type: "content" | "keywords" | "clusters" | "links";
  label: string;
  websiteId: string;
  href: string;
  status: "running" | "done" | "failed";
  progress: number;
  currentStep?: string;
  steps?: string[];
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resultData?: Record<string, any>;
  createdAt: number;
}

interface GlobalJobsContextValue {
  jobs: GlobalJob[];
  addJob: (job: Omit<GlobalJob, "createdAt">) => void;
  updateJob: (id: string, patch: Partial<GlobalJob>) => void;
  removeJob: (id: string) => void;
  getJob: (id: string) => GlobalJob | undefined;
  registerCancel: (id: string, fn: () => void) => void;
  unregisterCancel: (id: string) => void;
  cancelJob: (id: string) => void;
}

const GlobalJobsContext = createContext<GlobalJobsContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToJob(row: any): GlobalJob {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    websiteId: row.websiteId,
    href: row.href || "",
    status: row.status as GlobalJob["status"],
    progress: row.progress ?? 0,
    currentStep: row.step ?? undefined,
    steps: row.steps ?? undefined,
    error: row.error ?? undefined,
    resultData: row.data ?? undefined,
    createdAt: new Date(row.createdAt).getTime(),
  };
}

export function GlobalJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<GlobalJob[]>([]);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const fetchingRef = useRef(false);
  const hasRunningRef = useRef(false);

  const fetchJobs = useCallback(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetch("/api/user-jobs")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows)) {
          const mapped = rows.map(dbToJob);
          setJobs(mapped);
          hasRunningRef.current = mapped.some((j) => j.status === "running");
        }
      })
      .catch(() => {})
      .finally(() => { fetchingRef.current = false; });
  }, []);

  // Load jobs from DB on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll every 5s while any job is "running" so the widget stays in sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasRunningRef.current) fetchJobs();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const addJob = useCallback(
    (job: Omit<GlobalJob, "createdAt">) => {
      setJobs((prev) => {
        const existing = prev.find((j) => j.id === job.id);
        if (existing) {
          return prev.map((j) => (j.id === job.id ? { ...j, ...job } : j));
        }
        return [...prev, { ...job, createdAt: Date.now() }];
      });

      fetch("/api/user-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: job.id,
          type: job.type,
          label: job.label,
          status: job.status,
          progress: job.progress,
          step: job.currentStep ?? null,
          steps: job.steps ?? [],
          error: job.error ?? null,
          data: job.resultData ?? null,
          href: job.href,
          websiteId: job.websiteId,
        }),
      }).catch(() => {});
    },
    []
  );

  const updateJob = useCallback(
    (id: string, patch: Partial<GlobalJob>) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
      );

      const dbPatch: Record<string, unknown> = { id };
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.progress !== undefined) dbPatch.progress = patch.progress;
      if (patch.currentStep !== undefined) dbPatch.step = patch.currentStep;
      if (patch.error !== undefined) dbPatch.error = patch.error;
      if (patch.resultData !== undefined) dbPatch.data = patch.resultData;
      if (patch.label !== undefined) dbPatch.label = patch.label;

      fetch("/api/user-jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPatch),
      }).catch(() => {});
    },
    []
  );

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    fetch(`/api/user-jobs?id=${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const getJob = useCallback(
    (id: string) => jobsRef.current.find((j) => j.id === id),
    []
  );

  const cancelFnsRef = useRef<Map<string, () => void>>(new Map());

  const registerCancel = useCallback((id: string, fn: () => void) => {
    cancelFnsRef.current.set(id, fn);
  }, []);

  const unregisterCancel = useCallback((id: string) => {
    cancelFnsRef.current.delete(id);
  }, []);

  const cancelJob = useCallback((id: string) => {
    const fn = cancelFnsRef.current.get(id);
    if (fn) fn();
    cancelFnsRef.current.delete(id);
    removeJob(id);
  }, [removeJob]);

  return (
    <GlobalJobsContext.Provider
      value={{ jobs, addJob, updateJob, removeJob, getJob, registerCancel, unregisterCancel, cancelJob }}
    >
      {children}
    </GlobalJobsContext.Provider>
  );
}

export function useGlobalJobs() {
  const ctx = useContext(GlobalJobsContext);
  if (!ctx)
    throw new Error("useGlobalJobs must be used within GlobalJobsProvider");
  return ctx;
}
