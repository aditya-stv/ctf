import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { History, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/layout/navigation";
import StatsGrid from "@/components/dashboard/stats-grid";
import LiveLeaderboard from "@/components/leaderboard/live-leaderboard";
import ChallengeGrid from "@/components/challenges/challenge-grid";
import FlagSubmission from "@/components/challenges/flag-submission";
import { useAuth } from "@/hooks/use-auth";
import { UserStats, Submission } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentSubmissions } = useQuery<Submission[]>({
    queryKey: ["/api/user/submissions"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 animate-spin border-2 border-cyber-green border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatLastActivity = (submission: Submission) => {
    const time = new Date(submission.submittedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Stats */}
        <div className="mb-8">
          <StatsGrid stats={stats || {} as UserStats} isLoading={statsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <LiveLeaderboard />
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-lg font-mono font-bold text-cyber-green flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSubmissions?.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        submission.isCorrect ? 'bg-cyber-green' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="text-sm text-slate-300">
                          <span className={`font-mono ${submission.isCorrect ? 'text-cyber-green' : 'text-red-400'}`}>
                            {submission.isCorrect ? 'Flag accepted' : 'Flag rejected'}
                          </span>
                          {submission.isCorrect && (
                            <span className="text-blue-400 ml-1">
                              (+{submission.pointsAwarded} pts)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {formatLastActivity(submission)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!recentSubmissions || recentSubmissions.length === 0) && (
                    <div className="text-center py-4 text-slate-400">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-mono text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Flag Submission */}
        <div className="mt-8">
          <FlagSubmission />
        </div>
      </main>
    </div>
  );
}
