import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/layout/navigation";
import LiveLeaderboard from "@/components/leaderboard/live-leaderboard";
import { useAuth } from "@/hooks/use-auth";
import { LeaderboardEntry, EventConfig } from "@shared/schema";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const { data: eventConfig } = useQuery<EventConfig>({
    queryKey: ["/api/event/config"],
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

  const totalParticipants = leaderboard?.length || 0;
  const activeParticipants = leaderboard?.filter(team => team.challengesSolved > 0).length || 0;
  const topScore = leaderboard?.[0]?.totalScore || 0;
  const averageScore = totalParticipants > 0 
    ? Math.round(leaderboard!.reduce((sum, team) => sum + team.totalScore, 0) / totalParticipants)
    : 0;

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-cyber-green mb-2">
            Leaderboard
          </h1>
          <p className="text-slate-400 font-mono">
            Real-time rankings and competition statistics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono text-sm">Total Participants</p>
                  <p className="text-2xl font-mono font-bold text-cyber-green">
                    {totalParticipants}/{eventConfig?.maxParticipants || 250}
                  </p>
                </div>
                <Users className="w-8 h-8 text-cyber-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono text-sm">Active Teams</p>
                  <p className="text-2xl font-mono font-bold text-blue-400">
                    {activeParticipants}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono text-sm">Highest Score</p>
                  <p className="text-2xl font-mono font-bold text-amber-400">
                    {topScore.toLocaleString()}
                  </p>
                </div>
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono text-sm">Average Score</p>
                  <p className="text-2xl font-mono font-bold text-purple-400">
                    {averageScore.toLocaleString()}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <LiveLeaderboard />
      </main>
    </div>
  );
}
