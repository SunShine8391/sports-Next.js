import { db } from "@/lib/db";
import { Goals, Response } from "@/lib/types";
import { calculatePoints } from "@/lib/utils";
import { PredictionStatus } from "@prisma/client";
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
    const round = new URL(req.url).searchParams.get("round");

    if (!round) {
      return NextResponse.json(
        { error: "Matchday round is required" },
        { status: 400 }
      );
    }

    const predictions = await db.prediction.findMany({
      where: {
        matchDay: Number(round),
        status: PredictionStatus.SAVED,
      },
    });

    if (!predictions) {
      return NextResponse.json(
        { error: "not_found", description: "Prediction does not exist." },
        { status: 404 }
      );
    }

    const matchDay = await db.matchday.findFirst({
      where: {
        round: Number(round),
      },
    });

    if (!matchDay) {
      return NextResponse.json(
        { error: "not_found", description: "Matchday does not exist." },
        { status: 404 }
      );
    }

    let userPointList = [] as { userId: string; points: number }[];

    predictions.forEach((prediction) => {
      const predictedScores = prediction.scores as unknown as {
        [id: string]: Goals;
      };
      let total = 0;

      // calculate the total points
      (matchDay.scores as unknown as Response[]).forEach((match) => {
        if (match.fixture.status.short != "FT") return;
        const points = calculatePoints(
          predictedScores[match.fixture.id],
          match.goals
        );

        total = total + points;
      });

      userPointList.push({ userId: prediction.userId, points: total });
    });

    // if the user did not enter competition, add them to the array
    const userIndex = userPointList.findIndex(
      (users) => users.userId === session.user.id
    );

    if (userIndex == -1) {
      const userPredictions = await db.prediction.findFirst({
        where: {
          userId: session.user.id,
          matchDay: Number(round),
        },
      });

      if (userPredictions) {
        const predictedScores = userPredictions.scores as unknown as {
          [id: string]: Goals;
        };
        let total = 0;

        // calculate the total points
        (matchDay.scores as unknown as Response[]).forEach((match) => {
          if (match.fixture.status.short != "FT") return;
          const points = calculatePoints(
            predictedScores[match.fixture.id],
            match.goals
          );

          total = total + points;
        });

        userPointList.push({ userId: session.user.id, points: total });
      }
    }

    // sort the users based on sort and find the rank of logged in user
    const rankIndex = userPointList
      .sort((a, b) => a.points - b.points)
      .findIndex((users) => users.userId === session.user.id);

    return NextResponse.json(
      { rank: rankIndex == -1 ? null : rankIndex + 1 },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
