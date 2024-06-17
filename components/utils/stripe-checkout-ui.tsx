"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const StripeCheckoutUi = ({
  stripeClientSecret,
  setStripeClientSecret,
}: {
  stripeClientSecret: string;
  setStripeClientSecret: Dispatch<SetStateAction<string>>;
}) => {
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");

    if (sessionId) {
      fetch(`/api/stripe/checkout-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.status);
          setCustomerEmail(data.customer_email);

          queryClient.refetchQueries({ queryKey: ["profile"] });
          queryClient.refetchQueries({ queryKey: ["predictions"] });
          queryClient.refetchQueries({ queryKey: ["matches"] });
        });
    }
  }, [queryClient, params]);

  return (
    <>
      <Dialog
        open={status === "complete"}
        onOpenChange={(open) => {
          if (!open) {
            setStatus(null);
            setCustomerEmail("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Successful 🎉</DialogTitle>
            <DialogDescription>
              You have successfully entered the competition. A confirmation
              email will be sent to {customerEmail} shortly. Thank You!
            </DialogDescription>

            <div className="w-full h-full flex items-center justify-center">
              <CheckCircle2 className="w-36 h-36 text-green-400" />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Stripe Checkout overlay */}
      <Dialog
        open={stripeClientSecret != ""}
        onOpenChange={() => setStripeClientSecret("")}
      >
        <DialogContent className="overflow-y-scroll w-full h-[90vh]">
          <DialogHeader>
            <DialogTitle>Complete Payment to Enter Competition</DialogTitle>
            <DialogDescription>
              Enter this week&apos;s competition by completing the checkout.
            </DialogDescription>
          </DialogHeader>

          {stripeClientSecret && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret: stripeClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StripeCheckoutUi;
