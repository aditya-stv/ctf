import { useQuery } from "@tanstack/react-query";
import { Bug, Lock, Cpu, Search, Terminal, Flag, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengeWithProgress } from "@shared/schema";

export default function ChallengeGrid() {
  const { data: challenges, isLoading } = useQuery<ChallengeWithProgress[]>({
    queryKey: ["/api/challenges"],
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      "Web Exploitation": Bug,
      "Cryptography": Lock,
      "Reverse Engineering": Cpu,
      "Forensics": Search,
      "Binary Exploitation": Terminal,
    };
    return icons[category as keyof typeof icons] || Flag;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Web Exploitation": "category-web",
      "Cryptography": "category-crypto",
      "Reverse Engineering": "category-reverse",
      "Forensics": "category-forensics",
      "Binary Exploitation": "category-binary",
    };
    return colors[category as keyof typeof colors] || "bg-slate-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      "Easy": "text-green-400",
      "Medium": "text-amber-400",
      "Hard": "text-red-400",
    };
    return colors[difficulty as keyof typeof colors] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="glassmorphism">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-20 bg-slate-700 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-slate-700 rounded"></div>
                  <div className="h-6 w-20 bg-slate-700 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const groupedChallenges = challenges?.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as Record<string, ChallengeWithProgress[]>) || {};

  return (
    <div className="space-y-8">
      {Object.entries(groupedChallenges).map(([category, categoryChanges]) => {
        const Icon = getCategoryIcon(category);
        const solved = categoryChanges.filter(c => c.isSolved).length;
        const total = categoryChanges.length;

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-mono font-bold text-cyber-green flex items-center">
                <div className={`w-10 h-10 ${getCategoryColor(category)} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {category}
              </h3>
              <Badge variant="outline" className="font-mono">
                {solved}/{total} solved
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryChanges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={`glassmorphism transition-all hover:scale-105 cursor-pointer ${
                    challenge.isSolved ? 'border-cyber-green/50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-mono text-slate-200 flex items-start">
                        {challenge.isSolved ? (
                          <CheckCircle className="w-5 h-5 text-cyber-green mr-2 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-400 mr-2 mt-0.5" />
                        )}
                        <span className="line-clamp-2">{challenge.title}</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`font-mono ${getDifficultyColor(challenge.difficulty)}`}
                      >
                        {challenge.difficulty}
                      </Badge>
                      <span className="font-mono font-bold text-amber-400">
                        {challenge.points} pts
                      </span>
                    </div>

                    {challenge.attempts > 0 && (
                      <div className="text-xs font-mono text-slate-500">
                        {challenge.attempts} attempt{challenge.attempts !== 1 ? 's' : ''}
                      </div>
                    )}

                    {challenge.isSolved && (
                      <div className="mt-2 text-xs font-mono text-cyber-green flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Solved!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {Object.keys(groupedChallenges).length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-mono text-lg">No challenges available</p>
          <p className="font-mono text-sm">Check back later for new challenges!</p>
        </div>
      )}
    </div>
  );
}
