import { useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/layout/navigation";
import ChallengeGrid from "@/components/challenges/challenge-grid";
import FlagSubmission from "@/components/challenges/flag-submission";
import { useAuth } from "@/hooks/use-auth";

export default function Challenges() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-cyber-green mb-2">
            Challenges
          </h1>
          <p className="text-slate-400 font-mono">
            Solve challenges to earn points and climb the leaderboard
          </p>
        </div>

        {/* Flag Submission */}
        <div className="mb-8">
          <FlagSubmission />
        </div>

        {/* Challenge Grid */}
        <ChallengeGrid />
      </main>
    </div>
  );
}
