import { db } from "@/lib/db";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const prediction = await db.prediction.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!prediction) {
      return NextResponse.json(
        { error: "not_found", description: "Prediction does not exist." },
        { status: 404 }
      );
    }

    const matchDay = await db.matchday.findFirst({
      where: {
        round: prediction.matchDay,
      },
    });

    return NextResponse.json(
      { prediction, scores: matchDay?.scores ?? {} },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const prediction = await db.prediction.findUnique({
      where: {
        id: Number(params.id),
        userId: session.user.id,
      },
    });

    if (prediction) {
      const { scores } = await req.json();

      await db.prediction.update({
        where: {
          id: Number(params.id),
        },
        data: {
          scores,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        {
          error:
            "Prediction either does not exist or does not belong to the user.",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
