import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Analysis } from "@shared/schema";

export function useURLAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze URL");
      }

      return response.json() as Promise<Analysis>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    },
    onError: (error: Error) => {
      console.error("URL analysis error:", error);
    },
  });
}

export function useExport() {
  return useMutation({
    mutationFn: async (format: "json" | "csv") => {
      const response = await fetch(`/api/export?format=${format}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analysis-results.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
