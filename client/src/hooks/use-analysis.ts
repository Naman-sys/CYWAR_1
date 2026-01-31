import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Analysis } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useAnalysisHistory() {
  return useQuery({
    queryKey: [api.analysis.history.path],
    queryFn: async () => {
      const res = await fetch(api.analysis.history.path, {
        credentials: "include",
      });
      if (res.status === 401) return []; // Guest has no history
      if (!res.ok) throw new Error("Failed to fetch history");
      return await res.json() as Analysis[];
    },
  });
}

export function useAnalyze() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (text: string) => {
      // Client-side validation using the schema from routes
      const inputSchema = z.object({ text: z.string().min(10, "Text must be at least 10 characters") });
      const validated = inputSchema.parse({ text });

      const res = await fetch(api.analysis.analyze.path, {
        method: api.analysis.analyze.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
      }

      return await res.json() as Analysis;
    },
    onSuccess: (data) => {
      // Invalidate history query to show new item
      queryClient.invalidateQueries({ queryKey: [api.analysis.history.path] });
      toast({
        title: "Analysis Complete",
        description: `Confidence: ${data.confidence}%`,
        className: "border-green-500 text-green-500",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
