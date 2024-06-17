"use client";

import { useQuery } from "@tanstack/react-query";
import { PredictionStatus } from "@prisma/client";

import { getProfile, getUserRank } from "@/lib/queries";
import MatchCard from "../matches/match-card";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  DollarSign,
  Loader,
  Loader2,
  XCircle,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { DashboardPrediction } from "@/lib/types";
import { useMediaQuery } from "@/lib/hooks";
import {
  calculatePoints,
  cn,
  getDeadline,
  getPredictionResult,
} from "@/lib/utils";
import PredictionDeleteDialog from "./prediction-delete-dialog";
import PredictionEditDialog from "./prediction-edit-dialog";

type PredictionDialogProps = {
  prediction: DashboardPrediction;
  // setStripeClientSecret: Dispatch<SetStateAction<string>>;
};

const PredictionResult = ({
  match,
}: {
  match: DashboardPrediction["scores"][0];
}) => {
  const predictionResult = useMemo(() => getPredictionResult(match), [match]);

  if (predictionResult === "incorrect")
    return <XCircle className="text-destructive" />;

  if (predictionResult === "correct")
    return <CheckCircle2 className="text-green-600" />;

  if (predictionResult === "in_progress") return <Loader />;

  return null;
};

const PredictionScore = ({
  match,
  point,
  isEmpty,
}: {
  match: DashboardPrediction["scores"][0];
  point: number | null;
  isEmpty: boolean;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const matchDate = useMemo(() => {
    const date = new Date(match.fixture.date);

    return {
      date: `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })}`,
      time: `${
        date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
      }:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}
`,
    };
  }, [match.fixture.date]);

  return (
    <div
      key={match.fixture.id}
      className={cn(isDesktop ? "grid gap-4 grid-cols-6 items-center" : "")}
    >
      {isDesktop && (
        <div className="text-center space-x-2">
          <span>{matchDate.date},</span>
          <span>{matchDate.time}</span>
        </div>
      )}

      <div className={cn(isDesktop ? "col-span-3" : "")}>
        <MatchCard
          key={match.fixture.id}
          type="prediction"
          match={match}
          inEdit={false}
          isEmpty={isEmpty}
        />
      </div>

      {isDesktop && (
        <>
          <div className="flex items-center justify-center gap-4">
            {match.fixture.status.short === "FT" && (
              <div className="flex items-center gap-1">
                <p>{match.goals.home ?? "-"}</p>
                <span>-</span>
                <p>{match.goals.away ?? "-"}</p>
              </div>
            )}

            <PredictionResult match={match} />
          </div>

          <div className="text-center">
            <span>{point ?? "-"}</span>
          </div>
        </>
      )}
    </div>
  );
};

const PredictionDetails = ({
  prediction,
}: // setStripeClientSecret,
PredictionDialogProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: rank, isLoading: isLoadingRank } = useQuery({
    queryKey: ["rank", { round: prediction.round }],
    queryFn: () => getUserRank(prediction.round),
  });

  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const scores = useMemo(
    () =>
      prediction.scores.sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
      ),
    [prediction.scores]
  );

  const points = useMemo(() => {
    const data = {} as { [id: string]: number | null };

    prediction.scores.forEach((score) => {
      // no prediction is saved
      if (!prediction.isSaved) {
        data[score.fixture.id] = null;
        return;
      }

      // match has not finished yet
      if (score.fixture.status.short != "FT") {
        data[score.fixture.id] = null;
        return;
      }

      // calculate points in other cases
      data[score.fixture.id] = calculatePoints(
        score.savedGoals as any,
        score.goals
      );
      return;
    });

    let total: number | null = null;

    Object.values(data).forEach((point) => {
      if (!point) return;
      if (!total) {
        total = point;
        return;
      }
      total = total + point;
      return;
    });

    return { matches: data, total: total };
  }, [prediction.isSaved, prediction.scores]);

  // const handleCheckout = async () => {
  //   try {
  //     setIsCreatingSession(true);

  //     const checkoutData = await axios.post("/api/stripe/checkout-session", {
  //       customer: profile?.customerId,
  //       predictionId: prediction.id,
  //       origin: window.location.href,
  //     });

  //     setStripeClientSecret(checkoutData.data.client_secret);
  //   } catch (error) {
  //     toast({
  //       title: "Error Redirecting to Checkout",
  //       description:
  //         "Please complete the payment from the dashboard to enter competition",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsCreatingSession(false);
  //   }
  // };

  if (!prediction) return <></>;

  return (
    <div
      className={cn("grid gap-y-4 w-full max-w-4xl mx-auto", {
        "max-w-5xl": isDesktop,
      })}
    >
      {prediction && (
        <>
          {prediction.status === PredictionStatus.SAVED &&
            prediction.isCurrent &&
            getDeadline(prediction.scores) > Date.now() && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* <Button
                  onClick={handleCheckout}
                  className="bg-green-700 hover:bg-green-600"
                  size={isDesktop ? "sm" : "default"}
                  disabled={isCreatingSession}
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" /> Complete Payment
                    </>
                  )}
                </Button> */}

                <PredictionDeleteDialog prediction={prediction} />
                <PredictionEditDialog prediction={prediction} />
              </div>
            )}
          {isDesktop && (
            <div className="grid gap-4 grid-cols-6 text-center">
              <p className="font-semibold">Match Time</p>
              <div className="col-span-3"></div>
              <p className="font-semibold">Full Time Result</p>
              <p className="font-semibold">Points</p>
            </div>
          )}
          {scores.map((match) => (
            <PredictionScore
              match={match}
              point={points.matches[match.fixture.id]}
              isEmpty={!prediction.isSaved}
              key={match.fixture.id}
            />
          ))}

          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2  my-4 sm:my-0">
            {prediction.status === PredictionStatus.SAVED && (
              <div className="px-4 py-2 rounded-xl border border-input hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1">
                <span>Rank:</span>{" "}
                <span>
                  {isLoadingRank && !rank && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}

                  {rank && <>{rank}</>}
                </span>
              </div>
            )}

            <div className="px-4 py-2 rounded-xl border border-input hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1">
              <span>Total Points :</span> <span>{points.total ?? "-"}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionDetails;
