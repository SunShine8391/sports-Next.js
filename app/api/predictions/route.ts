import { db } from "@/lib/db";
import { UserPredictions } from "@/zustand/slices/user-prediction-slice";
import { Sport } from "@prisma/client";
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
    const predictions = await db.prediction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ predictions }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error fetching predictions." },
      { status: 400 }
    );
  }
}

// save a user prediction
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
    const { scores, matchDay }: { scores: UserPredictions; matchDay: number } =
      await req.json();

    const prediction = await db.prediction.create({
      data: {
        matchDay,
        scores,
        sport: Sport.PREMIER_LEAGUE,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({ prediction }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error saving prediction." },
      { status: 400 }
    );
  }
}

// delete a user prediction
export async function DELETE(req: Request) {
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
    const id = new URL(req.url).searchParams.get("id");

    // console.log(id);
    // check if the prediction belongs to user
    const prediction = await db.prediction.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (prediction && prediction.userId === session.user.id) {
      await db.prediction.delete({
        where: {
          id: Number(id),
        },
      });

      return NextResponse.json(null, { status: 200 });
    } else {
      // console.log(prediction?.userId);
      // console.log(session.user.id);
      return NextResponse.json(
        { error: "Prediction does belong to the user" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error deleting prediction." },
      { status: 400 }
    );
  }
}
