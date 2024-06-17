import axios from "axios";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Competition, Sport } from "@prisma/client";
import { Response } from "@/lib/types";

// export const runtime = "edge";

// update data for previous matchdays which are not current / live
const syncPreviousMatchdayData = async (metaData: Competition) => {
  const previousMatchDays = await db.matchday.findMany({
    where: {
      // all matchdays instead of current and next (since we have updated the data in the cron)
      round: { notIn: [metaData.currentRound, metaData.currentRound + 1] },
      // incomplete matchdays
      isCompleted: false,
      // current season matches only
      season: metaData.currentSeason,
      isCurrent: false,
    },
  });

  for (let i = 0; i < previousMatchDays.length; i++) {
    const matchDay = previousMatchDays[i];

    // fetch data for the matchday
    const response = await axios.request({
      method: "GET",
      url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
      params: {
        league: matchDay.league,
        season: matchDay.season,
        round: `Regular Season - ${matchDay.round}`,
      },
      headers: {
        "X-RapidAPI-Key": "0e666050e5msh210d8addad74a88p10c6eejsn3eea5a44da4a",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    });
    const matches = response.data.response as Response[];
    // Completed matchday if all matches's status == FT
    const isCompleted = matches.every(
      (match) => match.fixture.status.short == "FT"
    );

    await db.matchday.update({
      where: {
        id: matchDay.id,
      },
      data: {
        scores: matches as any,
        updatedAt: new Date(Date.now()),
        isCompleted,
      },
    });
  }
};

const syncLiveCompetitionData = async (metaData: Competition) => {
  // fetch data for the currently played matchday
  const response = await axios.request({
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: metaData.league,
      season: metaData.currentSeason,
      round: `Regular Season - ${metaData.currentRound}`,
    },
    headers: {
      "X-RapidAPI-Key": "0e666050e5msh210d8addad74a88p10c6eejsn3eea5a44da4a",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  });
  const matches = response.data.response as Response[];

  // Currently live competition if no match is started ( status == NS )
  const isCurrent = matches.every(
    (match) => match.fixture.status.short == "NS"
  );
  // Completed matchday if all matches's status == FT
  const isCompleted = matches.every(
    (match) => match.fixture.status.short == "FT"
  );

  const matchDayExists = await db.matchday.findFirst({
    where: {
      round: metaData.currentRound,
      season: metaData.currentSeason,
      league: metaData.league,
    },
  });

  // update or insert the scores for the current round
  if (matchDayExists) {
    // console.log("UPDATE");
    await db.matchday.update({
      where: { id: matchDayExists.id },
      data: {
        scores: matches as any,
        updatedAt: new Date(Date.now()),
        isCompleted,
        isCurrent,
      },
    });
  } else {
    // console.log("CREATE");
    await db.matchday.create({
      data: {
        round: metaData.currentRound,
        season: metaData.currentSeason,
        league: metaData.league,
        scores: matches as any,
        isCompleted,
        isCurrent,
        sport: Sport.PREMIER_LEAGUE,
      },
    });
  }

  // is the matchday has started => fetch next matchday data and add to the table
  if (!isCurrent) {
    // fetch data for the next matchday
    const response = await axios.request({
      method: "GET",
      url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
      params: {
        league: metaData.league,
        season: metaData.currentSeason,
        round: `Regular Season - ${metaData.currentRound + 1}`,
      },
      headers: {
        "X-RapidAPI-Key": "0e666050e5msh210d8addad74a88p10c6eejsn3eea5a44da4a",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    });
    const matches = response.data.response as Response[];

    const matchDayExists = await db.matchday.findFirst({
      where: {
        round: metaData.currentRound + 1,
        season: metaData.currentSeason,
        league: metaData.league,
      },
    });

    if (matchDayExists) {
      await db.matchday.update({
        where: { id: matchDayExists.id },
        data: {
          scores: matches as any,
          isCompleted: false,
          isCurrent: true,
          updatedAt: new Date(Date.now()),
        },
      });
    } else {
      await db.matchday.create({
        data: {
          round: metaData.currentRound + 1,
          season: metaData.currentSeason,
          league: metaData.league,
          scores: matches as any,
          isCompleted: false,
          isCurrent: true,
          sport: Sport.PREMIER_LEAGUE,
        },
      });
    }
  }
};

// CRON job to update chatbot credits every three hours
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
    const competitionMetaData = await db.competition.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    if (!competitionMetaData || competitionMetaData.length == 0) {
      return NextResponse.json(
        { error: "Error fetching competition metadata" },
        { status: 500 }
      );
    }

    const metaData = competitionMetaData[0];

    // console.log(metaData);
    await syncLiveCompetitionData(metaData);
    await syncPreviousMatchdayData(metaData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
