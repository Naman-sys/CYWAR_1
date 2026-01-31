import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Link2, Loader2 } from "lucide-react";

interface URLAnalyzerProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function URLAnalyzer({ onAnalyze, isLoading }: URLAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      await onAnalyze(url);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze URL");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Card className="glass-panel border-secondary/20 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-display tracking-wide">
          <Link2 className="text-secondary h-5 w-5" />
          URL ANALYZER
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Paste a news article URL to analyze its content for disinformation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com/article"
            className="bg-black/40 border-white/10 focus:border-secondary/50 font-mono text-xs md:text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Supported Sources</h4>
          <p className="text-xs text-muted-foreground">
            News websites, blogs, and articles that allow content scraping. Some sites may block requests.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUrl("")}
            className="text-xs md:text-sm px-4"
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || !url.trim()}
            className="neon-button bg-secondary text-background hover:bg-secondary/90 font-bold tracking-widest px-6 text-xs md:text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-3 w-3 md:h-4 md:w-4" /> PROCESSING
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> ANALYZE URL
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
