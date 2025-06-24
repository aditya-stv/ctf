import { useLocation } from "wouter";
import { Shield, BarChart3, Flag, Trophy, Send, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/challenges", label: "Challenges", icon: Flag },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className={`glassmorphism border-b border-slate-700 px-6 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-mono font-bold text-cyber-green neon-text">
            <Shield className="inline-block mr-2 w-6 h-6" />
            CyberArena
          </h1>
          <div className="hidden md:flex space-x-6 font-mono text-sm">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive
                      ? "text-cyber-green border-b-2 border-cyber-green pb-1"
                      : "text-slate-400 hover:text-cyber-green"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {user?.isAdmin && (
              <button
                onClick={() => setLocation("/admin")}
                className={`flex items-center space-x-2 transition-colors ${
                  location === "/admin"
                    ? "text-cyber-green border-b-2 border-cyber-green pb-1"
                    : "text-slate-400 hover:text-cyber-green"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4 font-mono text-sm">
            <div className="text-slate-400">
              Team: <span className="text-cyber-green">{user?.teamName}</span>
            </div>
            <div className="text-slate-400">
              Rank: <span className="text-blue-400">#{user?.currentRank || "-"}</span>
            </div>
            <div className="text-slate-400">
              Score: <span className="text-amber-400">{user?.totalScore || 0}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
