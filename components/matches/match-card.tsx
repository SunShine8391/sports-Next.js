import Image from "next/image";
import React, { useMemo } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { cn, getPredictionResult } from "@/lib/utils";
import useAppStore from "@/zustand/store";
import { Input } from "../ui/input";
import { DashboardPrediction } from "@/lib/types";

type TeamType = { id: number; name: string; logo: string; winner: boolean };

const Team = ({
  team,
  inEdit,
  reverse = false,
}: {
  team: TeamType;
  reverse?: boolean;
  inEdit: boolean;
}) => {
  return (
    <div className="flex flex-col justify-center items-center gap-2 sm:gap-4 text-white">
      <Image
        src={team.logo}
        alt={`${team.name} Logo`}
        height={40}
        width={40}
        className="w-6 h-6 sm:h-10 sm:w-10"
      />

      <div
        className={cn("flex items-center gap-2 text-center font-semibold", {
          "sm:text-right flex-row-reverse": reverse,
        })}
      >
        <p className={"text-xs sm:text-sm"}>{team.name}</p>
        {team.winner && !inEdit && (
          <Award className="w-4 h-4 text-yellow-600" />
        )}
      </div>
    </div>
  );
};

const MatchCard = ({
  type,
  match,
  inEdit,
  isEmpty = false,
}: {
  type: "prediction" | "competition";
  match: DashboardPrediction["scores"][0];
  inEdit: boolean;
  isEmpty?: boolean;
}) => {
  const { userPredictions, addUserPrediction } = useAppStore(
    (store) => store.userPredictionStateData
  );

  const matchDate = useMemo(() => {
    const date = new Date(match.fixture.date);

    return {
      date: `${date.getDate()} ${date.toLocaleString("default", {
        month: "short",
      })}`,
      time: `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        } : ${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`,
    };
  }, [match.fixture.date]);

  const prediction = useMemo(() => {
    if (isEmpty) return { home: undefined, away: undefined };

    if (type === "prediction") return match.savedGoals;

    if (userPredictions[match.fixture.id]) {
      return userPredictions[match.fixture.id];
    } else return { home: undefined, away: undefined };
  }, [match.fixture.id, match.savedGoals, isEmpty, type, userPredictions]);

  const predictionResult = useMemo(() => getPredictionResult(match), [match]);

  return (
    <>
      <div
        className={cn(
          "space-y-2 rounded-3xl p-2 md:p-4 relative w-full xl:max-w-lg bg-muted",
          {
            "bg-green-50": predictionResult === "correct",
          },
          {
            "bg-red-50": predictionResult === "incorrect",
          },
          {
            "rounded-b-none":
              (!predictionResult && type === "prediction") ||
              predictionResult === "in_progress",
          }
        )}
      >
        <p className="text-center absolute top-1 left-1/2 -translate-x-1/2 text-muted-foreground font-medium">
          {match.fixture.status.short}, {matchDate.date}
        </p>

        <div className="grid grid-cols-3 items-center gap-2">
          <Team team={match.teams.home as any} inEdit={inEdit} />

          <div className="flex flex-row items-center justify-center gap-0.5 sm:gap-2">
            {inEdit ? (
              <Input
                value={prediction.home ?? 0}
                placeholder="0"
                className="font-gothic shadow-none w-14 sm:w-20 h-10 bg-transparent text-3xl sm:text-4xl font-extrabold text-center border-none z-10"
                onKeyDown={(e) => {
                  if (e.key == "Backspace" || e.keyCode == 8) {
                    addUserPrediction(match.fixture.id, {
                      home: undefined,
                      away: prediction.away,
                    });
                  }
                }}
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) return;

                  if (Number(e.target.value) > 9) {
                    addUserPrediction(match.fixture.id, {
                      home: Number(e.target.value.slice(-1)),
                      away: prediction.away,
                    });
                    return;
                  }

                  addUserPrediction(match.fixture.id, {
                    home: Number(e.target.value.slice(-1)),
                    away: prediction.away,
                  });
                }}
              />
            ) : (
              <span className="text-lg font-bold mx-3">
                {prediction.home ?? "-"}
              </span>
            )}

            <span className="text-white font-semibold text-sm min-w-fit">
              {matchDate.time}
            </span>

            {inEdit ? (
              <Input
                value={prediction.away ?? 0}
                placeholder="0"
                className="font-gothic shadow-none w-14 sm:w-20 h-10 bg-transparent text-3xl sm:text-4xl font-extrabold text-center border-none z-10"
                onKeyDown={(e) => {
                  if (e.key == "Backspace" || e.keyCode == 8) {
                    addUserPrediction(match.fixture.id, {
                      home: prediction.home,
                      away: undefined,
                    });
                  }
                }}
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) return;

                  if (Number(e.target.value) > 9) {
                    addUserPrediction(match.fixture.id, {
                      home: prediction.home,
                      away: Number(e.target.value.slice(-1)),
                    });
                    return;
                  }

                  addUserPrediction(match.fixture.id, {
                    home: prediction.home,
                    away: Number(e.target.value.slice(-1)),
                  });
                }}
              />
            ) : (
              <span className="text-lg font-bold mx-3">
                {prediction.away ?? "-"}
              </span>
            )}
          </div>

          <Team team={match.teams.away as any} inEdit={inEdit} reverse />
        </div>
      </div>

      {type === "prediction" && match.fixture.status.short === "FT" && (
        <div className="w-full flex items-center border rounded-b-xl justify-center gap-2 bg-secondary sm:hidden">
          <p>Full Time Score:</p>

          <div className="flex items-center gap-1">
            <p>{match.goals.home ?? "-"}</p>
            <span>-</span>
            <p>{match.goals.away ?? "-"}</p>
          </div>

          {predictionResult === "correct" && (
            <CheckCircle2 className="text-green-600" />
          )}
          {predictionResult === "incorrect" && (
            <XCircle className="text-destructive" />
          )}
        </div>
      )}

      {type === "prediction" && match.fixture.status.short === "NS" && (
        <div className="w-full flex items-center border rounded-b-xl justify-center gap-2 bg-secondary sm:hidden">
          <p>Match Time:</p>

          <div className="flex items-center gap-1">
            <span>{matchDate.date},</span>
            <span>{matchDate.time}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchCard;
