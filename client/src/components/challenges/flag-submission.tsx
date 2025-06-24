import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChallengeWithProgress } from "@shared/schema";

const submissionSchema = z.object({
  challengeId: z.string().min(1, "Please select a challenge"),
  submittedFlag: z.string().min(1, "Flag is required").regex(/^CTF\{.*\}$/, "Flag must be in CTF{...} format"),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function FlagSubmission() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading: challengesLoading } = useQuery<ChallengeWithProgress[]>({
    queryKey: ["/api/challenges"],
  });

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      challengeId: "",
      submittedFlag: "",
    },
  });

  const submitFlagMutation = useMutation({
    mutationFn: async (data: { challengeId: number; submittedFlag: string }) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isCorrect) {
        toast({
          title: "Correct Flag! 🎉",
          description: `You earned ${data.pointsAwarded} points!`,
        });
        form.reset();
      } else {
        toast({
          title: "Incorrect Flag",
          description: "That's not the right flag. Keep trying!",
          variant: "destructive",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit flag. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    submitFlagMutation.mutate({
      challengeId: parseInt(data.challengeId),
      submittedFlag: data.submittedFlag,
    });
  };

  // Filter out solved challenges
  const availableChallenges = challenges?.filter(c => !c.isSolved) || [];

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-lg font-mono font-bold text-cyber-green flex items-center">
          <Flag className="w-5 h-5 mr-2" />
          Submit Flag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="challengeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-mono font-medium text-slate-300">
                      Challenge
                    </FormLabel>
                    <FormControl>
                      <Select 
                        disabled={challengesLoading || submitFlagMutation.isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="terminal-input">
                          <SelectValue placeholder="Select a challenge..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableChallenges.map((challenge) => (
                            <SelectItem key={challenge.id} value={challenge.id.toString()}>
                              {challenge.title} ({challenge.points} pts)
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
                name="submittedFlag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-mono font-medium text-slate-300">
                      Flag
                    </FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          {...field}
                          className="terminal-input flex-1"
                          placeholder="CTF{your_flag_here}"
                          disabled={submitFlagMutation.isPending}
                        />
                        <Button 
                          type="submit"
                          className="cyber-button px-6"
                          disabled={submitFlagMutation.isPending || !field.value || !form.getValues("challengeId")}
                        >
                          {submitFlagMutation.isPending ? (
                            <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        {availableChallenges.length === 0 && !challengesLoading && (
          <div className="text-center py-4 text-slate-400 font-mono text-sm">
            All available challenges have been solved! 🎉
          </div>
        )}
      </CardContent>
    </Card>
  );
}
