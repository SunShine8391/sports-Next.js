import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// retrive a session based on session_id
export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "not_authenticated",
        description:
          "The user does not have an active session or is not authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");

    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string
    );

    return NextResponse.json(
      {
        status: session.status,
        customer_email: session.customer_details?.email,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err, message: (err as any).message },
      { status: (err as any).statusCode || 500 }
    );
  }
}

// create a checkout session
export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "not_authenticated",
        description:
          "The user does not have an active session or is not authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const userId = session.user.id;
    const { customer, predictionId, origin } = await req.json();

    const checkoutResponse = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      ...(customer ? { customer } : { customer_email: session.user.email }),
      payment_intent_data: { metadata: { userId, predictionId } },
      allow_promotion_codes: true,
      return_url: `${origin}?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json(checkoutResponse, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err, message: (err as any).message },
      { status: (err as any).statusCode || 500 }
    );
  }
}
