import { StateCreator, create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  UserPredictionState,
  createUserPredictionSlice,
} from "./slices/user-prediction-slice";

export type RootState = {
  userPredictionStateData: UserPredictionState;
};

export type StoreState<T extends Object> = StateCreator<
  RootState,
  [
    ["zustand/devtools", never],
    ["zustand/persist", unknown],
    ["zustand/immer", unknown]
  ],
  [],
  T
>;

const useAppStore = create<RootState>()(
  devtools(
    persist(
      immer((...actions) => ({
        userPredictionStateData: createUserPredictionSlice(...actions),
      })),
      {
        name: "persisted-football-prediction-store",
        storage: createJSONStorage(() => localStorage),
        // @ts-ignore
        merge: (persisted: RootState, current): RootState => {
          return {
            userPredictionStateData: Object.assign(
              current.userPredictionStateData,
              persisted.userPredictionStateData
            ),
          };
        },
      }
    ),
    {
      name: "football-prediction-store",
    }
  )
);

export default useAppStore;
