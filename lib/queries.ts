import axios from "axios";
import {
  Matchday,
  Prediction,
  PredictionStatus,
  Profile,
} from "@prisma/client";
import { DashboardPrediction, Response } from "./types";
import { UserPredictions } from "@/zustand/slices/user-prediction-slice";

export const getProfile = async (): Promise<Profile | null | undefined> => {
  try {
    const response = await axios.get("/api/auth/profile");
    const data = response.data;
    return data.profile;
  } catch (error: any) {
    // console.log(error);
    const response = error.response;

    if (response.status !== 200) {
      if (response.status === 401) {
        return null;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Error fetching profile");
      }
    }
  }
};

export const getCurrentRound = async () => {
  const response = await axios.get("/api/matches/current-round");

  return response.data as {
    matches: Response[];
    isAllowed: boolean;
    round: number;
    predictionStatus: PredictionStatus | null;
    predictionId: number | null;
  };
};

const insertUserPredictionsIntoData = (
  userPredictions: UserPredictions,
  matches: Response[]
) => {
  return matches.map((match) => ({
    ...match,
    savedGoals: userPredictions[match.fixture.id],
  }));
};

export const getPredictions = async () => {
  const predictionData = await axios.get("/api/predictions");
  const predictions = predictionData.data.predictions as Prediction[];

  const matches = await axios.get("/api/matches");
  const { currentMatchDay, previousMatchDays } = matches.data as {
    currentMatchDay: Matchday;
    previousMatchDays: Matchday[];
  };

  //@ts-ignore
  let _currentMatchDay: DashboardPrediction = {
    ...currentMatchDay,
    isSaved: false,
    status: null,
  };
  //@ts-ignore
  let _previousMatchDays: DashboardPrediction[] = previousMatchDays.map(
    (p) => ({
      ...p,
      isSaved: false,
      status: null,
    })
  );

  const predictionIndex = predictions.findIndex(
    (prediction) => prediction.matchDay == currentMatchDay.round
  );
  if (predictionIndex != -1) {
    //@ts-ignore
    _currentMatchDay["scores"] = insertUserPredictionsIntoData(
      predictions[predictionIndex].scores as UserPredictions,
      _currentMatchDay.scores as Response[]
    );
    _currentMatchDay["isSaved"] = true;
    _currentMatchDay["status"] = predictions[predictionIndex].status;
    _currentMatchDay["id"] = predictions[predictionIndex].id; // override id to be that of prediction
  }

  for (let i = 0; i < _previousMatchDays.length; i++) {
    const match = _previousMatchDays[i];
    const index = predictions.findIndex(
      (prediction) => prediction.matchDay == match.round
    );
    if (index != -1) {
      _previousMatchDays[i] = {
        ...match,
        id: predictions[index].id, // override id to be that of prediction
        //@ts-ignore
        scores: insertUserPredictionsIntoData(
          predictions[index].scores as UserPredictions,
          _previousMatchDays[i].scores as Response[]
        ),
        isSaved: true,
        status: predictions[index].status,
      };
    }
  }

  return {
    currentMatchDay: _currentMatchDay,
    previousMatchDays: _previousMatchDays,
  };
};

export const getUserRank = async (round: number) => {
  const response = await axios.get(`/api/predictions/get-rank?round=${round}`);
  return response.data.rank as number | null;
};
