"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PredictionStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { getPredictions, getProfile } from "@/lib/queries";

import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

import PredictionDetails from "./prediction-details";
// import StripeCheckoutUi from "../utils/stripe-checkout-ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { DashboardPrediction } from "@/lib/types";
import SubmitSavedScores from "./submit-saved-scores";
import { getDeadline } from "@/lib/utils";

const getPredictionStatus = (status: PredictionStatus | null) => {
  switch (status) {
    case PredictionStatus.PAYMENT_CONFIRMED:
      return "Payment Confirmed";

    case PredictionStatus.SAVED:
      return "Saved";

    case PredictionStatus.EXPIRED:
      return "Competition Expired";

    default:
      return "No Participation";
  }
};

const getDescription = (status: PredictionStatus, deadline: number) => {
  switch (status) {
    case "PAYMENT_CONFIRMED":
      return "You have successfully entered the competition. Good luck and may luck be on your side!";

    case "SAVED":
      if (deadline < Date.now())
        return "Competition for the matchday has expired. Please submit your predictions for the new matchday.";
      else
        return "Your predictions have been saved successfully. You can still edit your predictions before the deadline. Good luck!";

    case "EXPIRED":
      return "Competition for the matchday has expired. Please submit your predictions for the new matchday.";

    default:
      return "You did not participate in the competition. Please submit your predictions for the new matchday.";
  }
};

const Predictions = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["predictions", { userId: profile?.id ?? "" }],
    queryFn: getPredictions,
  });

  // const [stripeClientSecret, setStripeClientSecret] = useState("");

  const [selectedPredictionId, setSelectedPredictionId] = useState<
    number | null
  >(null);

  const selectedPrediction = useMemo(() => {
    if (!selectedPredictionId || !predictions) return null;
    if (selectedPredictionId === predictions.currentMatchDay.id)
      return predictions.currentMatchDay;
    return predictions.previousMatchDays.find(
      (p) => p.id === selectedPredictionId
    );
  }, [predictions, selectedPredictionId]);

  const handleShowDetails = (prediction: DashboardPrediction) => {
    setSelectedPredictionId(prediction.id);
  };

  return (
    <div className="grid gap-4 my-8">
      {isLoading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}

      {predictions && predictions.currentMatchDay.isSaved && (
        <div className="flex flex-col items-center sm:block">
          <h3 className="mb-4 text-xl font-semibold tracking-tight">
            Current Matchday
          </h3>

          <Accordion
            type="single"
            className="w-full"
            key={predictions.currentMatchDay.round}
            value={String(selectedPrediction?.round)}
            onValueChange={(value) => {
              if (value) {
                handleShowDetails(predictions.currentMatchDay);
              } else {
                setSelectedPredictionId(null);
              }
            }}
            collapsible
          >
            <AccordionItem
              value={String(predictions.currentMatchDay.round)}
              className="rounded-xl bg-muted px-4 border border-muted-foreground"
            >
              <AccordionTrigger className="hover:no-underline text-left">
                <div className="flex items-center gap-4 sm:gap-6">
                  <p>Matchday {predictions.currentMatchDay.round}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={"accent"}>
                      {getPredictionStatus(predictions.currentMatchDay.status)}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-primary-foreground">
                  {getDescription(
                    selectedPrediction?.status!,
                    getDeadline(selectedPrediction?.scores!)
                  )}
                </p>

                <div className="overflow-y-scroll max-h-[60vh] py-4 my-4">
                  {selectedPrediction && (
                    <PredictionDetails
                      prediction={selectedPrediction}
                      // setStripeClientSecret={setStripeClientSecret}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {predictions && !predictions.currentMatchDay.isSaved && (
        <div>
          <h3 className="mb-4 text-2xl font-semibold tracking-tight">
            Saved Predictions
          </h3>

          <div className="my-4 max-w-4xl mx-auto p-2 w-full rounded-xl bg-destructive/10 flex items-center justify-center gap-4 text-red-700 font-bold">
            <AlertTriangle className="w-6 h-6" />
            <p>
              Submit your predictions to enter the competition for Matchday{" "}
              {predictions.currentMatchDay.round}
            </p>
          </div>

          <SubmitSavedScores
            prediction={predictions.currentMatchDay}
            // setStripeClientSecret={setStripeClientSecret}
          />
        </div>
      )}

      {predictions && predictions.previousMatchDays.length > 0 && (
        <div className="flex flex-col items-center sm:block">
          <h3 className="my-4 text-xl font-semibold tracking-tight">
            Previous Matchdays
          </h3>

          {predictions.previousMatchDays.map((match) => (
            <Accordion
              type="single"
              className="w-full my-2"
              key={match.round}
              value={String(selectedPrediction?.round)}
              onValueChange={(value) => {
                if (value) {
                  handleShowDetails(match);
                } else {
                  setSelectedPredictionId(null);
                }
              }}
              collapsible
            >
              <AccordionItem
                value={String(match.round)}
                className="rounded-xl bg-muted px-4 border border-muted-foreground"
              >
                <AccordionTrigger className="hover:no-underline text-left">
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <p>Matchday {match.round}</p>

                    <div className="flex items-center gap-2">
                      <Badge variant="accent">
                        {getPredictionStatus(match.status)}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-primary-foreground">
                    {getDescription(
                      selectedPrediction?.status!,
                      getDeadline(selectedPrediction?.scores!)
                    )}
                  </p>

                  <div className="overflow-y-scroll max-h-[60vh] py-4 my-4">
                    {selectedPrediction && (
                      <PredictionDetails
                        prediction={selectedPrediction}
                        // setStripeClientSecret={setStripeClientSecret}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      )}

      {/* Checkout UI */}
      {/* <StripeCheckoutUi
        stripeClientSecret={stripeClientSecret}
        setStripeClientSecret={setStripeClientSecret}
      /> */}
    </div>
  );
};

export default Predictions;
