"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Project } from "./types";

export function useProjectId() {
  const { session, selectedProjectId, setSelectedProjectId } = useAppStore();

  const projects = useQuery({
    queryKey: ["projects", session?.accessToken],
    queryFn: () => apiFetch<Project[]>("/projetos"),
    enabled: Boolean(session?.accessToken)
  });

  const projectId = useMemo(() => {
    if (!session?.accessToken) return "";
    const list = projects.data ?? [];
    if (list.length === 0) return "";
    if (selectedProjectId && list.some((p) => p.id === selectedProjectId)) return selectedProjectId;
    return list[0]!.id;
  }, [session?.accessToken, projects.data, selectedProjectId]);

  useEffect(() => {
    if (!session?.accessToken || !projects.data?.length) return;
    const valid = selectedProjectId && projects.data.some((p) => p.id === selectedProjectId);
    if (!valid) setSelectedProjectId(projects.data[0]!.id);
  }, [session?.accessToken, projects.data, selectedProjectId, setSelectedProjectId]);

  return {
    session,
    projectId,
    projects,
    hasProject: Boolean(projectId),
    selectedProjectId,
    setSelectedProjectId
  };
}
