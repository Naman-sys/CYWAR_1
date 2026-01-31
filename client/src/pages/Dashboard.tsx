import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyze, useAnalysisHistory } from "@/hooks/use-analysis";
import { useURLAnalyze, useExport } from "@/hooks/use-url-analyze";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultCard } from "@/components/ResultCard";
import { URLAnalyzer } from "@/components/URLAnalyzer";
import { Analysis } from "@shared/schema";
import { Scan, History, Sparkles, AlertCircle, Download, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<[number, number]>([0, 100]);
  
  const analyzeMutation = useAnalyze();
  const urlAnalyzeMutation = useURLAnalyze();
  const exportMutation = useExport();
  
  const { data: history, isLoading: historyLoading } = useAnalysisHistory();
  const [lastResult, setLastResult] = useState<Analysis | null>(null);

  const handleTextAnalyze = async () => {
    if (!text.trim()) return;
    try {
      const result = await analyzeMutation.mutateAsync(text);
      setLastResult(result);
    } catch (e) {
      // Handled by mutation error
    }
  };

  const handleURLAnalyze = async (url: string) => {
    try {
      const result = await urlAnalyzeMutation.mutateAsync(url);
      setLastResult(result);
    } catch (e) {
      // Handled by mutation error
    }
  };

  // Filter history
  let filteredHistory = history || [];
  if (searchTerm) {
    filteredHistory = filteredHistory.filter(item =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (filterLabel) {
    filteredHistory = filteredHistory.filter(item => item.label === filterLabel);
  }
  filteredHistory = filteredHistory.filter(item =>
    item.confidence >= filterConfidence[0] && item.confidence <= filterConfidence[1]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        
        {/* Left Column: Analysis Input */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/10">
                <TabsTrigger value="text" className="text-xs md:text-sm">Text</TabsTrigger>
                <TabsTrigger value="url" className="text-xs md:text-sm">URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-4">
                <Card className="glass-panel border-primary/20 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-display tracking-wide">
                      <Scan className="text-primary h-5 w-5" />
                      CONTENT ANALYZER
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Paste news article or text snippet for forensic AI analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste text here to detect potential disinformation..."
                      className="min-h-[240px] md:min-h-[280px] bg-black/40 border-white/10 focus:border-primary/50 resize-none font-mono text-xs md:text-sm leading-relaxed"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setText('')}
                        className="text-xs md:text-sm px-4"
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleTextAnalyze}
                        disabled={analyzeMutation.isPending || text.length < 10}
                        className="neon-button bg-primary text-background hover:bg-primary/90 font-bold tracking-widest px-6 text-xs md:text-sm"
                      >
                        {analyzeMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Scan className="animate-spin h-3 w-3 md:h-4 md:w-4" /> PROCESSING
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> ANALYZE
                          </span>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {text.length} / 10 characters
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="url" className="mt-4">
                <URLAnalyzer 
                  onAnalyze={handleURLAnalyze} 
                  isLoading={urlAnalyzeMutation.isPending} 
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Analysis Result Display */}
          <AnimatePresence mode="wait">
            {lastResult && (
              <ResultCard key={lastResult.id || 'new'} analysis={lastResult} />
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: History & Stats */}
        <div className="xl:col-span-1 space-y-6">
           {/* Info Card if no result yet */}
           {!lastResult && !user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
               <Card className="border border-dashed border-white/20 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Ready to Scan</h3>
                    <p className="max-w-xs">Log in to save your analysis history. Guest scans are temporary.</p>
                  </CardContent>
               </Card>
            </motion.div>
           )}

           {/* History Panel (Only for users) */}
           {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full"
            >
              <Card className="glass-panel border-white/10 flex flex-col h-[400px] md:h-[550px]\">
                <CardHeader className="pb-3 border-b border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-display tracking-wide">
                      <History className="text-secondary" />
                      ANALYSIS LOGS
                    </CardTitle>
                    {history && history.length > 0 && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => exportMutation.mutate("json")}
                          disabled={exportMutation.isPending}
                          className="text-xs h-7 px-2"
                          title="Export as JSON"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => exportMutation.mutate("csv")}
                          disabled={exportMutation.isPending}
                          className="text-xs h-7 px-2"
                          title="Export as CSV"
                        >
                          CSV
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {history && history.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-2 items-center flex-wrap text-xs">
                        <button
                          onClick={() => setFilterLabel(null)}
                          className={`px-2 py-1 rounded border transition ${
                            filterLabel === null ? 'border-primary bg-primary/20' : 'border-white/20'
                          }`}
                        >
                          All
                        </button>
                        {['Real', 'Fake', 'Suspicious'].map(label => (
                          <button
                            key={label}
                            onClick={() => setFilterLabel(label)}
                            className={`px-2 py-1 rounded border transition ${
                              filterLabel === label ? 'border-primary bg-primary/20' : 'border-white/20'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 items-center text-xs">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                  {historyLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                      Loading archives...
                    </div>
                  ) : history?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                      <p>No prior scans found.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        {filteredHistory.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center text-xs">
                            <p>No matching analyses found.</p>
                          </div>
                        ) : (
                          filteredHistory.map((item) => (
                            <div 
                              key={item.id}
                              onClick={() => setLastResult(item)}
                              className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                  item.label === 'Real' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                  item.label === 'Fake' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                  'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                                }`}>
                                  {item.label.toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {new Date(item.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-foreground line-clamp-2 font-medium mb-2">
                                {item.text.substring(0, 100)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                Confidence: {item.confidence}%
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
           )}
        </div>
        </div>
      </main>
    </div>
  );
}
