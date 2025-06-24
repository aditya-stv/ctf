import { TrendingUp, Flag, Trophy, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from "@shared/schema";

interface StatsGridProps {
  stats: UserStats;
  isLoading?: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const statCards = [
    {
      title: "Total Score",
      value: stats.totalScore?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-cyber-green",
      bgColor: "text-cyber-green",
    },
    {
      title: "Challenges Solved",
      value: `${stats.challengesSolved || 0}/${stats.totalChallenges || 0}`,
      icon: Flag,
      color: "text-blue-400",
      bgColor: "text-blue-400",
    },
    {
      title: "Current Rank",
      value: stats.currentRank ? `#${stats.currentRank}` : "#-",
      icon: Trophy,
      color: "text-amber-400",
      bgColor: "text-amber-400",
    },
    {
      title: "Last Activity",
      value: stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : "Never",
      icon: Clock,
      color: "text-red-400",
      bgColor: "text-red-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="glassmorphism">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono text-sm">{stat.title}</p>
                  <p className={`text-2xl font-mono font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} text-2xl`}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
