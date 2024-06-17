import { db } from "@/lib/db";
import { PredictionStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const metadata = event.data.object.metadata;

      // check if user id of prediction is correct
      const prediction = await db.prediction.findUnique({
        where: {
          id: Number(metadata.predictionId),
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (prediction && prediction.userId == metadata.userId) {
        await db.prediction.update({
          where: {
            id: Number(metadata.predictionId),
          },
          data: {
            status: PredictionStatus.PAYMENT_CONFIRMED,
          },
        });
      }

    default:
      null;
  }

  return NextResponse.json(
    { success: true },
    {
      status: 200,
    }
  );
}
