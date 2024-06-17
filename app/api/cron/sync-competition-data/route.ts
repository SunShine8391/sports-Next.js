import axios from "axios";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Sport } from "@prisma/client";

// export const runtime = "edge";

// CRON job to update competition metadata every 24 hours
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false },
      {
        status: 401,
      }
    );
  }

  try {
    // get current season ( Hard Coded => Currently No way to get through API )
    // const seasonResponse = await axios.request({
    //   method: "GET",
    //   url: "https://api-football-v1.p.rapidapi.com/v3/leagues/seasons",
    //   headers: {
    //     "X-RapidAPI-Key": "0e666050e5msh210d8addad74a88p10c6eejsn3eea5a44da4a",
    //     "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    //   },
    // });

    // const allSeasons = seasonResponse.data.response as number[];
    const currentSeason = 2023;

    // get current round
    const roundResponse = await axios.request({
      method: "GET",
      url: "https://api-football-v1.p.rapidapi.com/v3/fixtures/rounds",
      params: {
        league: "39",
        season: currentSeason,
        current: "true",
      },
      headers: {
        "X-RapidAPI-Key": "0e666050e5msh210d8addad74a88p10c6eejsn3eea5a44da4a",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    });

    const currentRoundString = roundResponse.data.response[0] as string;
    const currentRound = parseInt(currentRoundString.split("-")[1].trim());

    // add data to competitions table
    await db.competition.create({
      data: {
        league: 39,
        currentRound,
        currentSeason,
        sport: Sport.PREMIER_LEAGUE,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
