import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Fingerprint, Globe, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [_, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial system boot sequence
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setLocation("/dashboard"); // Default entry point (Guest allowed)
  };

  const handleLogin = () => {
    setLocation("/auth");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <ShieldAlert className="w-24 h-24 text-primary animate-pulse" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-display font-bold text-white tracking-[0.2em]"
          >
            CY<span className="text-primary">WAR</span>
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 text-primary/70 font-mono text-sm tracking-widest"
          >
            INITIALIZING NEURAL NETWORKS...
          </motion.p>
        </div>
        
        {/* Background Grid Animation */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30 animate-[pulse_4s_ease-in-out_infinite]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <main className="flex-1 container relative z-10 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary tracking-widest uppercase">System Online v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 mb-6 drop-shadow-lg">
            TRUTH IN THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-secondary text-glow">
              DIGITAL AGE
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Advanced AI algorithms designed to detect fabrication, bias, and manipulation in news media with 99.8% accuracy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12 w-full sm:w-fit max-w-2xl mx-auto">
            <Button 
              size="lg" 
              className="neon-button bg-primary text-background hover:bg-primary/90 text-lg px-10 sm:px-12 py-7 sm:py-8 rounded-none skew-x-[-10deg] origin-center transform-gpu w-full sm:w-auto"
              onClick={handleEnter}
            >
              <div className="skew-x-[10deg] flex items-center gap-3">
                <Cpu className="w-5 h-5" />
                INITIATE SCANNER
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 hover:border-white/40 hover:bg-white/5 text-lg px-10 sm:px-12 py-7 sm:py-8 rounded-none skew-x-[-10deg] origin-center transform-gpu backdrop-blur-sm w-full sm:w-auto"
              onClick={handleLogin}
            >
              <div className="skew-x-[10deg] flex items-center gap-3">
                <Fingerprint className="w-5 h-5" />
                AUTHENTICATE
              </div>
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-20 md:mt-24 max-w-6xl w-full">
          {[
            { icon: Globe, title: "Global Analysis", desc: "Scans sources across 150+ countries in real-time." },
            { icon: Cpu, title: "Neural Processing", desc: "Deep learning models trained on 50TB of verified data." },
            { icon: ShieldAlert, title: "Threat Detection", desc: "Identifies propaganda and malicious disinformation patterns." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-xl flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group text-center"
            >
              <div className="p-4 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors text-primary">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-display tracking-wider">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
