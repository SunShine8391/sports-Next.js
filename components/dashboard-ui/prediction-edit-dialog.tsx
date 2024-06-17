"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useMediaQuery } from "@/lib/hooks";
import { DashboardPrediction } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, Loader2, Pencil } from "lucide-react";
import MatchCard from "../matches/match-card";
import useAppStore from "@/zustand/store";
import { UserPredictions } from "@/zustand/slices/user-prediction-slice";
import { toast } from "../ui/use-toast";
import axios from "axios";

const PredictionEditDialog = ({
  prediction,
}: {
  prediction: DashboardPrediction;
}) => {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const { resetPredictions, setUserPredictions, userPredictions } = useAppStore(
    (store) => store.userPredictionStateData
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetPredictions();
      const userPredictions: UserPredictions = {};

      prediction.scores.forEach((score) => {
        userPredictions[score.fixture.id] = score.savedGoals;
      });

      setUserPredictions(userPredictions);
    }

    setIsVisible(open);
  };

  const handleEditPrediction = async () => {
    try {
      setIsSaving(true);

      await axios.patch(`/api/predictions/${prediction.id}`, {
        scores: userPredictions,
      });
      await queryClient.refetchQueries({ queryKey: ["predictions"] });

      toast({
        title: "Predictions Saved",
        description: "Your updated predictions are saved successfully!",
      });
      setIsVisible(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error saving predictions",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"secondary"} size={isDesktop ? "sm" : "default"}>
          <Pencil className="w-4 h-4 mr-2" /> Edit Predictions
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[75vw] sm:min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Edit Predictions</DialogTitle>
          <DialogDescription>
            Update your predictions for Matchday {prediction.round} below.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] w-full overflow-y-scroll my-2 p-4 space-y-2">
          {prediction.scores.map((match) => (
            <MatchCard
              type="competition"
              key={match.fixture.id}
              match={match}
              inEdit
            />
          ))}
        </div>

        <DialogFooter>
          <Button
            variant={"secondary"}
            onClick={() => setIsVisible(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            className="bg-green-700 hover:bg-green-600"
            onClick={handleEditPrediction}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Predictions...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" /> Save Predictions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PredictionEditDialog;
