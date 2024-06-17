import React from "react";

import Countdown, { CountdownRendererFn } from "react-countdown";

// Random component
const Completionist = () => <span>You are good to go!</span>;

// Renderer callback with condition
const renderer: CountdownRendererFn = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}) => {
  if (completed) {
    // Render a completed state
    return <Completionist />;
  } else {
    // Render a countdown
    return (
      <span className="font-gothic text-3xl font-black tracking-tight">
        {days} days, {hours}:{minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </span>
    );
  }
};

const DeadlineCountdown = ({ deadline }: { deadline: number }) => {
  return (
    <div className="my-4 md:max-w-4xl text-lg font-medium text-center w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 text-white">
      <span>Match will start in</span>
      <Countdown date={Date.now() + deadline} renderer={renderer} />
    </div>
  );
};

export default DeadlineCountdown;
