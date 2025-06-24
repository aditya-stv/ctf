import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Plus, Edit, Trash2, Users, Flag, UserPlus, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Challenge, User } from "@shared/schema";

const challengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  points: z.number().min(1, "Points must be greater than 0"),
  flag: z.string().min(1, "Flag is required").regex(/^CTF\{.*\}$/, "Flag must be in CTF{...} format"),
  isActive: z.boolean().default(true),
});

const userSchema = z.object({
  teamId: z.string().min(1, "Team ID is required").regex(/^TEAM_\d{3}$/, "Team ID must be in TEAM_XXX format"),
  accessToken: z.string().min(1, "Access token is required").regex(/^CTF\{.*\}$/, "Access token must be in CTF{...} format"),
  teamName: z.string().min(1, "Team name is required"),
  email: z.string().email("Valid email is required").optional(),
  isAdmin: z.boolean().default(false),
});

const eventConfigSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventDescription: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isEventActive: z.boolean().default(true),
  allowLateRegistration: z.boolean().default(true),
  maxTeamSize: z.number().min(1).max(10).default(4),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;
type UserFormData = z.infer<typeof userSchema>;
type EventConfigFormData = z.infer<typeof eventConfigSchema>;

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/admin/challenges"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: eventConfig, isLoading: eventConfigLoading } = useQuery({
    queryKey: ["/api/event/config"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "",
      points: 100,
      flag: "",
      isActive: true,
    },
  });

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      teamId: "",
      accessToken: "",
      teamName: "",
      email: "",
      isAdmin: false,
    },
  });

  const eventForm = useForm<EventConfigFormData>({
    resolver: zodResolver(eventConfigSchema),
    defaultValues: {
      eventName: "",
      eventDescription: "",
      startTime: "",
      endTime: "",
      isEventActive: true,
      allowLateRegistration: true,
      maxTeamSize: 4,
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: ChallengeFormData) => {
      const response = await apiRequest("POST", "/api/admin/challenges", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created",
        description: "New challenge has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create challenge.",
        variant: "destructive",
      });
    },
  });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Challenge> }) => {
      const response = await apiRequest("PUT", `/api/admin/challenges/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Updated",
        description: "Challenge has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      setEditingChallenge(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update challenge.",
        variant: "destructive",
      });
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/challenges/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Challenge Deleted",
        description: "Challenge has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete challenge.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateUserDialogOpen(false);
      userForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const updateEventConfigMutation = useMutation({
    mutationFn: async (data: EventConfigFormData) => {
      const response = await apiRequest("PUT", "/api/event/config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Settings Updated",
        description: "Contest timing and settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event/config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update event settings.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, authLoading, user, setLocation]);

  useEffect(() => {
    if (editingChallenge) {
      form.reset({
        title: editingChallenge.title,
        description: editingChallenge.description,
        category: editingChallenge.category,
        difficulty: editingChallenge.difficulty,
        points: editingChallenge.points,
        flag: editingChallenge.flag,
        isActive: editingChallenge.isActive,
      });
    }
  }, [editingChallenge, form]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 animate-spin border-2 border-cyber-green border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const onSubmit = (data: ChallengeFormData) => {
    if (editingChallenge) {
      updateChallengeMutation.mutate({ id: editingChallenge.id, data });
    } else {
      createChallengeMutation.mutate(data);
    }
  };

  const onUserSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const onEventSubmit = (data: EventConfigFormData) => {
    updateEventConfigMutation.mutate(data);
  };

  useEffect(() => {
    if (eventConfig) {
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format for datetime-local input
      };

      eventForm.reset({
        eventName: eventConfig.eventName || "",
        eventDescription: eventConfig.eventDescription || "",
        startTime: formatDateForInput(eventConfig.startTime),
        endTime: formatDateForInput(eventConfig.endTime),
        isEventActive: eventConfig.isEventActive ?? true,
        allowLateRegistration: eventConfig.allowLateRegistration ?? true,
        maxTeamSize: eventConfig.maxTeamSize ?? 4,
      });
    }
  }, [eventConfig, eventForm]);

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this challenge?")) {
      deleteChallengeMutation.mutate(id);
    }
  };

  const categories = ["Web Exploitation", "Cryptography", "Reverse Engineering", "Forensics", "Binary Exploitation"];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-cyber-green mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Admin Panel
          </h1>
          <p className="text-slate-400 font-mono">
            Manage challenges and monitor the competition
          </p>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="glassmorphism">
            <TabsTrigger value="challenges" className="font-mono">Challenges</TabsTrigger>
            <TabsTrigger value="users" className="font-mono">Users</TabsTrigger>
            <TabsTrigger value="event" className="font-mono">Event Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-mono font-bold text-cyber-green flex items-center">
                    <Flag className="w-5 h-5 mr-2" />
                    Challenge Management
                  </CardTitle>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="cyber-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glassmorphism max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-mono text-cyber-green">
                          {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-mono">Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="terminal-input" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-mono">Category</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger className="terminal-input">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="terminal-input" rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-mono">Difficulty</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger className="terminal-input">
                                        <SelectValue placeholder="Select difficulty" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {difficulties.map((difficulty) => (
                                          <SelectItem key={difficulty} value={difficulty}>
                                            {difficulty}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="points"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-mono">Points</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      className="terminal-input"
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="flag"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Flag</FormLabel>
                                <FormControl>
                                  <Input {...field} className="terminal-input" placeholder="CTF{flag_here}" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCreateDialogOpen(false);
                                setEditingChallenge(null);
                                form.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="cyber-button"
                              disabled={createChallengeMutation.isPending || updateChallengeMutation.isPending}
                            >
                              {editingChallenge ? "Update" : "Create"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {challengesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-20 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {challenges?.map((challenge) => (
                      <div key={challenge.id} className="glassmorphism p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-mono font-bold text-cyber-green">{challenge.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs font-mono">
                              <span className="text-blue-400">{challenge.category}</span>
                              <span className="text-amber-400">{challenge.difficulty}</span>
                              <span className="text-cyber-green">{challenge.points} pts</span>
                              <span className={challenge.isActive ? "text-green-400" : "text-red-400"}>
                                {challenge.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="mt-3 p-2 bg-slate-800/50 rounded border-l-2 border-red-400">
                              <span className="text-xs text-slate-400 font-mono">FLAG (Admin Only):</span>
                              <div className="text-red-400 font-mono text-sm mt-1 break-all">
                                {challenge.flag}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(challenge)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(challenge.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-mono font-bold text-cyber-green flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management & Login Credentials
                  </CardTitle>
                  <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="cyber-button">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Participant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glassmorphism max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-mono text-cyber-green">
                          Add New Participant
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                          <FormField
                            control={userForm.control}
                            name="teamId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Team ID</FormLabel>
                                <FormControl>
                                  <Input {...field} className="terminal-input" placeholder="TEAM_251" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="accessToken"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Access Token</FormLabel>
                                <FormControl>
                                  <Input {...field} className="terminal-input" placeholder="CTF{unique_access_token}" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="teamName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Team Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="terminal-input" placeholder="Team Name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono">Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" className="terminal-input" placeholder="team@example.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="isAdmin"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-3">
                                <div className="space-y-0.5">
                                  <FormLabel className="font-mono">Admin Privileges</FormLabel>
                                  <div className="text-sm text-slate-400">Grant admin access to this user</div>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-cyber-green bg-slate-800 border-slate-600 rounded focus:ring-cyber-green"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCreateUserDialogOpen(false);
                                userForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="cyber-button"
                              disabled={createUserMutation.isPending}
                            >
                              Create User
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 text-slate-400">Team ID</th>
                          <th className="text-left py-3 text-slate-400">Access Token</th>
                          <th className="text-left py-3 text-slate-400">Team Name</th>
                          <th className="text-right py-3 text-slate-400">Score</th>
                          <th className="text-right py-3 text-slate-400">Rank</th>
                          <th className="text-center py-3 text-slate-400">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users?.map((user) => (
                          <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="py-3 text-cyber-green font-bold">{user.teamId}</td>
                            <td className="py-3 text-blue-400 font-mono text-xs max-w-[200px] truncate" title={user.accessToken}>
                              {user.accessToken}
                            </td>
                            <td className="py-3 text-slate-200">{user.teamName}</td>
                            <td className="py-3 text-right text-amber-400">{user.totalScore}</td>
                            <td className="py-3 text-right text-blue-400">#{user.currentRank || "-"}</td>
                            <td className="py-3 text-center">
                              {user.isAdmin ? (
                                <span className="text-red-400 font-bold">✓</span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="event" className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-xl font-mono font-bold text-cyber-green flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Contest Timing & Event Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventConfigLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="eventName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono">Event Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="terminal-input" placeholder="CyberArena CTF 2024" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="maxTeamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono">Max Team Size</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  className="terminal-input" 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={eventForm.control}
                        name="eventDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono">Event Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="terminal-input" placeholder="Welcome to our CTF competition!" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Contest Start Time
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="datetime-local" 
                                  className="terminal-input" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Contest End Time
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="datetime-local" 
                                  className="terminal-input" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="isEventActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="font-mono">Contest Active</FormLabel>
                                <div className="text-sm text-slate-400">Enable/disable the entire contest</div>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 text-cyber-green bg-slate-800 border-slate-600 rounded focus:ring-cyber-green"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="allowLateRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="font-mono">Late Registration</FormLabel>
                                <div className="text-sm text-slate-400">Allow registration after contest starts</div>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 text-cyber-green bg-slate-800 border-slate-600 rounded focus:ring-cyber-green"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="cyber-button"
                          disabled={updateEventConfigMutation.isPending}
                        >
                          Update Contest Settings
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Challenge Dialog */}
      <Dialog open={!!editingChallenge} onOpenChange={(open) => !open && setEditingChallenge(null)}>
        <DialogContent className="glassmorphism max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-cyber-green">Edit Challenge</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Title</FormLabel>
                      <FormControl>
                        <Input {...field} className="terminal-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Category</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="terminal-input">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="terminal-input" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Difficulty</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="terminal-input">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((difficulty) => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Points</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="terminal-input"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="flag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono">Flag</FormLabel>
                    <FormControl>
                      <Input {...field} className="terminal-input" placeholder="CTF{flag_here}" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingChallenge(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="cyber-button"
                  disabled={updateChallengeMutation.isPending}
                >
                  Update Challenge
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
