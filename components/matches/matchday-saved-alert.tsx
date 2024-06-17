"use client";

import { cn } from "@/lib/utils";
import { PredictionStatus } from "@prisma/client";
import { AlertTriangle, DollarSign, Loader2, PartyPopper } from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import axios from "axios";
import { getProfile } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { toast } from "../ui/use-toast";

type MatchdaySavedAlertProps = {
  status: PredictionStatus | null;
  round: number;
  predictionId: number | null;
  // setStripeClientSecret: Dispatch<SetStateAction<string>>;
};

const MatchdaySavedAlert = ({
  status,
  round,
  predictionId,
}: // setStripeClientSecret,
MatchdaySavedAlertProps) => {
  // const { data: profile } = useQuery({
  //   queryKey: ["profile"],
  //   queryFn: getProfile,
  // });

  // const [isCreatingSession, setIsCreatingSession] = useState(false);

  // const handleCheckout = async () => {
  //   try {
  //     setIsCreatingSession(true);

  //     const checkoutData = await axios.post("/api/stripe/checkout-session", {
  //       customer: profile?.customerId,
  //       predictionId,
  //       origin: window.location.href,
  //     });

  //     setStripeClientSecret(checkoutData.data.client_secret);
  //   } catch (error) {
  //     toast({
  //       title: "Error Redirecting to Checkout",
  //       description:
  //         "Please complete the payment from the dashboard to enter the competition",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsCreatingSession(false);
  //   }
  // };

  if (status === "PAYMENT_CONFIRMED") {
    return (
      <div className="my-4 md:max-w-4xl p-2 text-sm w-full rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4 bg-green-100 text-green-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm sm:text-base">
            You have been entered into the Matchday {round} competition
          </p>
        </div>

        <Link
          href={"/dashboard"}
          className={cn(
            buttonVariants({ variant: "destructive", size: "sm" }),
            "h-8 bg-green-700 hover:bg-green-600"
          )}
        >
          View Predictions
        </Link>
      </div>
    );
  }

  if (status === "SAVED") {
    return (
      <div className="my-4 md:max-w-4xl p-2 text-sm w-full rounded-xl bg-green-400/20 text-green-700 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5" />
          <p className="text-sm sm:text-base">
            Your predictions for Matchday {round} have been saved successfully.
            {/* Please complete the checkout to enter this week&apos;s competition. */}
          </p>
        </div>

        {/* <Button
          onClick={handleCheckout}
          size={"sm"}
          className={cn(
            buttonVariants({ variant: "destructive", size: "sm" }),
            "h-8"
          )}
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" /> Complete Checkout
            </>
          )}
        </Button> */}
      </div>
    );
  }

  return null;
};

export default MatchdaySavedAlert;
