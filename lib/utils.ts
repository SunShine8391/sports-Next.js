import { toast } from "@/components/ui/use-toast";
import { SupabaseClient } from "@supabase/supabase-js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DashboardPrediction, Goals } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleGoogleAuth = async (
  supabase: SupabaseClient<any, "public", any>,
  to?: string
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback?to=${to}`,
    },
  });

  if (error) {
    toast({
      title: "Error signing up",
      description: error.message,
      variant: "destructive",
    });
  }
};

export const getPredictionResult = (
  match: DashboardPrediction["scores"][0]
) => {
  if (!match.savedGoals) return null;
  if (match.fixture.status.short != "FT") return "in_progress";
  if (
    match.savedGoals.home === match.goals.home &&
    match.savedGoals.away === match.goals.away
  )
    return "correct";
  return "incorrect";
};

export const getDeadline = (scores: DashboardPrediction["scores"]) => {
  if (!scores) return 0;

  let deadline: number | undefined;

  scores.forEach((score) => {
    const date = new Date(score.fixture.date).getTime();
    if (!deadline) {
      deadline = date;
    } else if (date < deadline) {
      deadline = date;
    }
  });

  return deadline as number;
};

const getResult = (goals: Goals) => {
  if (goals.home > goals.away) return "home";
  if (goals.away > goals.home) return "away";
  if (goals.away == goals.home) return "draw";
};

export const calculatePoints = (savedGoals: Goals, goals: Goals) => {
  // correct prediction
  if (savedGoals.home === goals.home && savedGoals.away === goals.away)
    return 10;

  const predictedOutcome = getResult(savedGoals);
  const realOutcome = getResult(goals);

  // correct outcome
  if (predictedOutcome === realOutcome) {
    // for matches with a winner
    // if margin is correct => 7 points
    if (savedGoals.home - savedGoals.away === goals.home - goals.away) return 7;

    // if margin is incorrect but one score is correct => 5 points
    if (savedGoals.home === goals.home || savedGoals.away === goals.away)
      return 5;

    // only correct outcome is predicted
    return 3;
  }

  // wrong outcome but one score correct => 1 point
  if (savedGoals.home === goals.home || savedGoals.away === goals.away)
    return 1;

  // completely incorrect prediction
  return 0;
};
