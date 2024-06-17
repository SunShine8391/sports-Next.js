import { db } from "@/lib/db";
import { PredictionStatus } from "@prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const matchDay = await db.matchday.findMany({
      where: {
        isCurrent: true,
      },
    });

    if (!matchDay || matchDay.length == 0) {
      return NextResponse.json(
        { error: "Error fetching matchday data" },
        { status: 500 }
      );
    }

    const liveMatchday = matchDay[0];

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let isAllowed = true;
    let predictionStatus: PredictionStatus | null = null;
    let predictionId: number | null = null;

    if (session) {
      const userPredictionHistory = await db.prediction.findMany({
        where: {
          userId: session.user.id,
          matchDay: liveMatchday.round,
        },
      });

      // user has already entered the predictions
      if (userPredictionHistory.length > 0) {
        isAllowed = false;
        predictionStatus = userPredictionHistory[0].status;
        predictionId = userPredictionHistory[0].id;
      }
    }

    return NextResponse.json(
      {
        isAllowed,
        predictionStatus,
        predictionId,
        matches: liveMatchday.scores,
        round: liveMatchday.round,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
