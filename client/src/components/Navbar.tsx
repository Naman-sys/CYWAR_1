import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, UserCircle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (location === "/") return null; // Don't show on Landing

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-bold font-display tracking-widest text-foreground">
            CY<span className="text-primary">WAR</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                <UserCircle className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary-foreground">{user.username}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logoutMutation.mutate()}
                className="text-muted-foreground hover:text-destructive transition-colors"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mr-2 hidden sm:block">Guest Mode</span>
              <Link href="/auth">
                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
