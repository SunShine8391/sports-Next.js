"use client";
import { DashboardPrediction } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import axios from "axios";
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
import { Loader2, Trash2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks";

const PredictionDeleteDialog = ({
  prediction,
}: {
  prediction: DashboardPrediction;
}) => {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleDeletePrediction = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/predictions?id=${prediction.id}`);

      toast({
        title: "Prediction Deleted Successfully",
      });

      await queryClient.refetchQueries({ queryKey: ["predictions"] });
      await queryClient.refetchQueries({ queryKey: ["matches"] });
      setIsVisible(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Deleting Prediction",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogTrigger asChild>
        <Button variant={"secondary"} size={isDesktop ? "sm" : "default"}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Predictions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            predictions for matchday {prediction.round}.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant={"destructive"}
            onClick={handleDeletePrediction}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PredictionDeleteDialog;
