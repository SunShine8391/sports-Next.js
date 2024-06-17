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
    const matchDays = await db.matchday.findMany({
      orderBy: {
        round: "desc",
      },
      take: 5,
    });

    if (!matchDays || matchDays.length == 0) {
      return NextResponse.json(
        { error: "Error fetching matchday data" },
        { status: 500 }
      );
    }

    let currentMatchDay;
    let previousMatchDays = [];

    for (let i = 0; i < matchDays.length; i++) {
      const match = matchDays[i];

      if (match.isCurrent) currentMatchDay = match;
      else previousMatchDays.push(match);
    }

    return NextResponse.json(
      {
        currentMatchDay,
        previousMatchDays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
