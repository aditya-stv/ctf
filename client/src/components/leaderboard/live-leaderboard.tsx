import { useQuery } from "@tanstack/react-query";
import { Crown, Users, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaderboardEntry } from "@shared/schema";

export default function LiveLeaderboard() {
  const { data: leaderboard, isLoading, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  if (isLoading) {
    return (
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-mono font-bold text-cyber-green flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-slate-800/50 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-400 ml-2" />;
      case 2:
        return <Badge variant="secondary" className="text-xs">2nd</Badge>;
      case 3:
        return <Badge variant="secondary" className="text-xs">3rd</Badge>;
      default:
        return null;
    }
  };

  const getTeamAvatar = (teamName: string) => {
    const initials = teamName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    const colors = [
      "from-cyber-green to-emerald-400",
      "from-blue-400 to-purple-400",
      "from-red-400 to-pink-400",
      "from-amber-400 to-orange-400",
      "from-purple-400 to-indigo-400",
    ];
    
    const colorIndex = teamName.length % colors.length;
    
    return (
      <div className={`w-8 h-8 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
        {initials}
      </div>
    );
  };

  const formatLastSubmission = (lastSubmission: string | null) => {
    if (!lastSubmission) return "Never";
    
    const now = new Date();
    const submissionTime = new Date(lastSubmission);
    const diffInMinutes = Math.floor((now.getTime() - submissionTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-mono font-bold text-cyber-green flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Live Leaderboard
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm font-mono text-slate-400">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            <span className="flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              Live Updates
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400">Rank</th>
                <th className="text-left py-3 text-slate-400">Team</th>
                <th className="text-right py-3 text-slate-400">Score</th>
                <th className="text-right py-3 text-slate-400">Solved</th>
                <th className="text-right py-3 text-slate-400">Last Submit</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((team) => (
                <tr 
                  key={team.teamId} 
                  className={`border-b border-slate-800 transition-colors ${
                    team.isCurrentUser 
                      ? "leaderboard-current" 
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center">
                      <span className={`font-bold ${team.rank <= 3 ? 'text-cyber-green' : 'text-slate-300'}`}>
                        #{team.rank}
                      </span>
                      {getRankIcon(team.rank)}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      {getTeamAvatar(team.teamName)}
                      <span className={`${team.isCurrentUser ? 'text-cyber-green font-bold' : 'text-slate-200'}`}>
                        {team.teamName}
                        {team.isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-cyber-green font-bold">
                    {team.totalScore.toLocaleString()}
                  </td>
                  <td className="py-4 text-right text-blue-400">
                    {team.challengesSolved}
                  </td>
                  <td className="py-4 text-right text-slate-400">
                    {formatLastSubmission(team.lastSubmission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboard && leaderboard.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No participants yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
