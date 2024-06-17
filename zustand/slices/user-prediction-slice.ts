import { StoreState } from "../store";

export type UserPredictions = {
  [id: string]: {
    home: number | undefined;
    away: number | undefined;
  };
};

export type UserPredictionState = {
  userPredictions: UserPredictions;

  setUserPredictions: (data: UserPredictions) => void;
  addUserPrediction: (
    id: number,
    data: { home: number | undefined; away: number | undefined }
  ) => void;
  resetPredictions: () => void;
};

export const createUserPredictionSlice: StoreState<UserPredictionState> = (
  set
) => ({
  userPredictions: {},

  setUserPredictions: (data) => {
    set(({ userPredictionStateData }) => {
      userPredictionStateData.userPredictions = data;
    });
  },

  addUserPrediction: (id, data) => {
    set(({ userPredictionStateData }) => {
      userPredictionStateData.userPredictions[id] = data;
    });
  },

  resetPredictions: () => {
    set(({ userPredictionStateData }) => {
      userPredictionStateData.userPredictions = {};
    });
  },
});
