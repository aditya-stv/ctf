import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, User, Key, Terminal, Users, Clock, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/lib/auth";

const loginSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login: authLogin, isAuthenticated } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      teamId: "",
      accessToken: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      authLogin(response.token, response.user);
      
      toast({
        title: "Welcome to CyberArena!",
        description: `Successfully logged in as ${response.user.teamName}`,
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please check your Team ID and Access Token.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glassmorphism rounded-xl p-8 w-full max-w-md">
        {/* Cyber Arena Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-bold neon-text text-cyber-green mb-2">
            <Shield className="inline-block mr-2 w-8 h-8" />
            CyberArena
          </h1>
          <p className="text-slate-400 font-mono text-sm">Capture The Flag Competition</p>
          <div className="mt-4 w-full h-1 bg-gradient-to-r from-transparent via-cyber-green to-transparent"></div>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-mono font-medium text-slate-300 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Team ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="terminal-input"
                      placeholder="TEAM_001"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-mono font-medium text-slate-300 flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Access Token
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="terminal-input"
                      placeholder="CTF{access_token_here}"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit"
              className="cyber-button w-full py-3 px-6 rounded-lg"
              disabled={isLoading}
            >
              <Terminal className="w-4 h-4 mr-2" />
              {isLoading ? "ENTERING..." : "ENTER ARENA"}
            </Button>
          </form>
        </Form>

        {/* Event Info */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="text-center space-y-2 text-sm font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Event Status:</span>
              <span className="text-cyber-green flex items-center">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Participants:</span>
              <span className="text-blue-400 flex items-center">
                <Users className="w-3 h-3 mr-1" />
                0/250
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Time Remaining:</span>
              <span className="text-amber-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                23:45:12
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
