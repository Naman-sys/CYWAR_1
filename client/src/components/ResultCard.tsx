import { Analysis } from "@shared/schema";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldAlert, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  analysis: Analysis;
}

export function ResultCard({ analysis }: ResultCardProps) {
  const isFake = analysis.label.toLowerCase().includes("fake");
  const isReal = analysis.label.toLowerCase().includes("real");
  const isSuspicious = !isFake && !isReal;

  const colorClass = isReal ? "text-green-500" : isFake ? "text-red-500" : "text-yellow-500";
  const bgClass = isReal ? "bg-green-500/10" : isFake ? "bg-red-500/10" : "bg-yellow-500/10";
  const borderClass = isReal ? "border-green-500/30" : isFake ? "border-red-500/30" : "border-yellow-500/30";
  
  const Icon = isReal ? CheckCircle : isFake ? ShieldAlert : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full"
    >
      <Card className={cn("glass-panel overflow-hidden border-2 shadow-lg", borderClass)}>
        <div className={cn("absolute inset-0 opacity-5 pointer-events-none", bgClass)} />
        
        <CardHeader className="pb-3 border-b border-white/5 relative z-10">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn("p-2.5 rounded-lg flex-shrink-0 mt-0.5", bgClass)}>
                  <Icon className={cn("h-5 w-5 md:h-6 md:w-6", colorClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm md:text-base font-display tracking-wider text-muted-foreground mb-1">ANALYSIS RESULT</CardTitle>
                  <div className={cn("text-2xl md:text-3xl font-bold uppercase tracking-widest truncate", colorClass)}>
                    {analysis.label}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Confidence</span>
                <span className={cn("text-2xl md:text-3xl font-mono font-bold", colorClass)}>{analysis.confidence}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 md:pt-6 relative z-10 space-y-4 md:space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground font-medium">
              <span>Trust Level</span>
              <span>{analysis.confidence}% Verified</span>
            </div>
            <div className={cn("w-full h-2 bg-secondary/30 rounded-full overflow-hidden", "transition-all duration-1000 ease-out")}>
              <div 
                className={cn("h-full transition-all duration-1000 ease-out", isReal ? "bg-green-500" : isFake ? "bg-red-500" : "bg-yellow-500")}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">Label</p>
              <p className={cn("text-sm font-bold uppercase", colorClass)}>{analysis.label}</p>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-sm font-bold text-foreground">{analysis.confidence}%</p>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 md:p-4 border border-white/5 space-y-2">
            <h4 className="flex items-center gap-2 text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">
              <FileText className="h-3 w-3 md:h-4 md:w-4" /> AI Analysis
            </h4>
            <p className="text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-4 md:line-clamp-none">
              {analysis.explanation}
            </p>
          </div>
          
          <div className="pt-2 text-xs text-muted-foreground border-t border-white/5">
            <p>Analysis ID: <span className="font-mono text-white/60">{analysis.id || 'temporary'}</span></p>
            {analysis.createdAt && (
              <p>Time: <span className="font-mono text-white/60">{new Date(analysis.createdAt).toLocaleString()}</span></p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
