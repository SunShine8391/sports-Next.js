"use client";

import { DashboardPrediction } from "@/lib/types";
import useAppStore from "@/zustand/store";
import { toast } from "../ui/use-toast";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/lib/queries";
import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction } from "react";
import MatchCard from "../matches/match-card";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

const SubmitSavedScores = ({
  prediction,
}: // setStripeClientSecret,
{
  prediction: DashboardPrediction;
  // setStripeClientSecret: Dispatch<SetStateAction<string>>;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { userPredictions } = useAppStore(
    (store) => store.userPredictionStateData
  );

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const handleSubmitScores = async () => {
    // checking if user has predicted score for all matches
    let isPredicted = true;

    for (let i = 0; i < prediction.scores.length; i++) {
      const match = prediction.scores[i];

      if (!userPredictions[match.fixture.id]) {
        isPredicted = false;

        break;
      }
    }

    if (!isPredicted) {
      toast({
        title: "Incomplete Submission",
        description: "Please predict scores for all the listed matches.",
        variant: "destructive",
      });
      return;
    }

    // save prediction and move to payment
    try {
      await axios.post("/api/predictions", {
        matchDay: prediction.round,
        scores: userPredictions,
      });

      toast({
        title: "Predictions Saved",
        description: "Please complete the checkout to enter the competition",
      });

      await queryClient.refetchQueries({ queryKey: ["predictions"] });

      // stripe checkout session
      // if (profile) {
      //   try {
      //     const checkoutData = await axios.post(
      //       "/api/stripe/checkout-session",
      //       {
      //         customer: profile?.customerId,
      //         predictionId: prediction.id,
      //         origin: window.location.href,
      //       }
      //     );

      //     setStripeClientSecret(checkoutData.data.client_secret);
      //   } catch (error) {
      //     toast({
      //       title: "Error Redirecting to Checkout",
      //       description:
      //         "Please complete the payment from the dashboard to enter competition",
      //       variant: "destructive",
      //     });
      //   }
      // } else {
      //   router.push("/login");
      // }
    } catch (error: any) {
      console.log(error);

      const response = error.response;

      if (response.status === 401) {
        toast({
          title: "Please Login",
          description: "Your responses are saved. Please login to continue.",
        });
        router.push("/login");
        return;
      }

      toast({
        title: "Error Saving Predictions",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // mutation to save user predictions
  const { mutate, isPending } = useMutation({
    mutationFn: handleSubmitScores,
  });

  return (
    <div className="my-4 max-w-4xl mx-auto p-4 flex items-center flex-col">
      <div className="space-y-2">
        {prediction.scores.map((match) => (
          <MatchCard
            type="competition"
            key={match.fixture.id}
            match={match}
            inEdit
          />
        ))}
      </div>

      <Button
        variant={"destructive"}
        size="lg"
        className="my-4"
        onClick={() => mutate()}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Scores...
          </>
        ) : (
          <>
            Submit your scores <SendHorizonal className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default SubmitSavedScores;
