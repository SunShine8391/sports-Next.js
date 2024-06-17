import { db } from "@/lib/db";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    // fetch profile based on user id
    const profile = await db.profile.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile does not exist" },
        { status: 404 }
      );
    }

    let plan = "FREE";
    // const subscriptionData = await getUserSubscriptionPlan(profile.id);

    // // This will run only when the user has a active plan
    // if (subscriptionData.isPro) {
    //   plan = getPlan(subscriptionData.variantId as string) ?? "FREE";
    // }

    //test
    return NextResponse.json(
      { profile: { ...profile, plan, isPro: false } },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error fetching profile." },
      { status: 400 }
    );
  }
}
