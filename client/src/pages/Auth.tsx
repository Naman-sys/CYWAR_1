import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm<{ username: string; password: string }>({
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4 border border-primary/20">
            <LockKeyhole className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-widest text-foreground">ACCESS CONTROL</h1>
          <p className="text-muted-foreground mt-2">Identify yourself to proceed</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-white/10 backdrop-blur-md mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-display tracking-wide">LOGIN</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary font-display tracking-wide">REGISTER</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="glass-panel border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Existing User</CardTitle>
                <CardDescription>Enter your credentials to access the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-black/20 border-white/10 focus:border-primary/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-black/20 border-white/10 focus:border-primary/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold tracking-widest mt-2"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="glass-panel border-t-4 border-t-secondary">
              <CardHeader>
                <CardTitle>New User</CardTitle>
                <CardDescription>Create a new identity record in the database.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Username</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-black/20 border-white/10 focus:border-secondary/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Set Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-black/20 border-white/10 focus:border-secondary/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold tracking-widest mt-2"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "REGISTERING..." : "CREATE IDENTITY"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
