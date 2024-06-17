"use client";

import { getCurrentRound, getProfile } from "@/lib/queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import MatchCard from "./match-card";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import useAppStore from "@/zustand/store";
import { toast } from "../ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import StripeCheckoutUi from "../utils/stripe-checkout-ui";
import MatchdaySavedAlert from "./matchday-saved-alert";
import { getDeadline } from "@/lib/utils";
import DeadlineCountdown from "../utils/deadline-countdown";

const MatchList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.location.hash == "#enter-predictions") {
      ref.current.scrollIntoView({
        block: "start",
        behavior: "smooth",
        inline: "start",
      });
    }
  }, [params]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches", { userId: profile?.id ?? "" }],
    queryFn: getCurrentRound,
  });

  const { userPredictions } = useAppStore(
    (store) => store.userPredictionStateData
  );

  // const [stripeClientSecret, setStripeClientSecret] = useState("");

  const deadline = useMemo(() => {
    if (!data) return null;

    const _deadline = getDeadline(data.matches as any);
    if (!_deadline || Date.now() > _deadline) {
      return null;
    } else {
      return _deadline - Date.now();
    }
  }, [data]);

  const matches = useMemo(() => {
    if (!data) return [];

    return data.matches.sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  }, [data]);

  const handleSubmitScores = async () => {
    if (!data) return;

    if (!profile) {
      toast({
        title: "Please Login",
        description: "Your responses are saved. Please login to continue.",
      });
      router.push("/login");
      return;
    }

    // checking if user has predicted score for all matches
    let isPredicted = true;

    for (let i = 0; i < data.matches.length; i++) {
      const match = data.matches[i];

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
      const response = await axios.post("/api/predictions", {
        matchDay: data.round,
        scores: userPredictions,
      });

      const prediction = response.data.prediction;

      toast({
        title: "Predictions Saved",
        description: "Please complete the checkout to enter the competition",
      });

      await queryClient.refetchQueries({ queryKey: ["predictions"] });
      await queryClient.refetchQueries({ queryKey: ["matches"] });

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

      toast({
        title: "Error Saving Predictions",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // mutation to save user predictions
  const {
    mutate,
    data: prediction,
    isPending,
  } = useMutation({
    mutationFn: handleSubmitScores,
  });

  return (
    <section ref={ref}>
      <div className="text-wrap pt-12 flex flex-col items-center justify-center text-center">
        <h2 className="uppercase font-gothic-regular text-7xl md:text-[6rem] font-black tracking-wider text-white md:max-w-5xl">
          Enter Your Predictions
        </h2>
        <p className="text-base md:text-lg max-w-2xl my-4">
          Just enter how you think the matches will end and if you get them
          right you&apos;ll win prizes!
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        {data && !data.isAllowed && (
          <MatchdaySavedAlert
            round={data.round}
            status={data.predictionStatus}
            predictionId={data.predictionId}
            // setStripeClientSecret={setStripeClientSecret}
          />
        )}
        {deadline && <DeadlineCountdown deadline={deadline} />}

        <div className="flex flex-row w-full gap-4 flex-wrap justify-center items-center">
          {isLoading &&
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Skeleton className="w-full h-14" key={i} />
            ))}

          {data &&
            matches.map((match: any, index: number) => (
              <MatchCard
                type="competition"
                key={match.fixture.id}
                match={match}
                inEdit
              />
            ))}
        </div>

        <Button
          className="bg-accent text-accent-foreground min-w-[400px] h-16 text-center text-lg my-4 mx-10 rounded-2xl hover:bg-accent/85"
          onClick={() => mutate()}
          disabled={isLoading || isPending || !data?.isAllowed}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Scores...
            </>
          ) : (
            "Submit your scores"
          )}
        </Button>

        {/* Checkout UI */}
        {/* <StripeCheckoutUi
        stripeClientSecret={stripeClientSecret}
        setStripeClientSecret={setStripeClientSecret}
      /> */}
      </div>
    </section>
  );
};

export default MatchList;
