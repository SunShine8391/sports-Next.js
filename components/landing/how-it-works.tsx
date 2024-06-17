"use client";

import Image from "next/image";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const steps = [
  {
    title: "Step 2: Wait for the results",
    image: "/landing/step-2-icon.svg",
    description: "Wait for the matches to end to see how well you do!",
  },
  {
    title: "Step 3: Win Cash & Prizes",
    image: "/landing/step-3-icon.svg",
    description:
      "Based on your predictions, the best participant will win cash and prizes!",
  },
  {
    title: "Prize of the week",
    image: "/landing/step-4-icon.svg",
    description:
      "This week's prize is $1,000. Place your bet and get a chance to win the prize!",
  },
];

const StepCard = ({ step }: { step: (typeof steps)[0] }) => {
  return (
    <div className="bg-muted w-full min-h-72 space-y-6 rounded-3xl p-8 transition-all duration-200 hover:scale-105 hover:bg-muted/40">
      <Image
        src={step.image}
        alt={step.title}
        width={40}
        height={40}
        className="w-14 h-14 rounded-3xl bg-[#FFFFFF33] p-3"
      />

      <h4 className="text-2xl font-semibold tracking-tight text-white">
        {step.title}
      </h4>
      <p className="text-white/70">{step.description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const params = useParams();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.location.hash == "#how-it-works") {
      ref.current.scrollIntoView({
        block: "start",
        behavior: "smooth",
        inline: "start",
      });
    }
  }, [params]);

  return (
    <section ref={ref}>
      <div className="text-wrap pt-12 flex flex-col items-center justify-center text-center">
        <h2 className="uppercase font-gothic-regular text-7xl md:text-[6rem] font-black tracking-wider text-white md:max-w-5xl">
          How To Play
        </h2>
        <p className="text-base md:text-lg max-w-2xl my-4">
          {/* Simply place your bets on teams before the first game starts, wait for the results, and if you guessed right, cash in your winnings. Don&apos;t miss your chance to compete for the weekly prize! */}
        </p>
      </div>

      <div className="my-8">
        <div className="bg-accent text-accent-foreground rounded-3xl relative p-8 overflow-hidden">
          <div className="w-[650px] max-[1680px]:w-[550px] max-[1440px]:w-[450px] max-[1370px]:w-[350px] max-[1275px]:w-full space-y-8 z-10">
            <Image
              src={"/landing/step-1-icon.svg"}
              alt="Step 1 Icon"
              width={40}
              height={40}
              className="w-14 h-14 rounded-xl bg-[#03020814] p-3"
            />

            <h4 className="text-3xl font-semibold">
              Step 1: Submit Your Predictions
            </h4>

            <div className="font-light text-lg">
              <p>Enter your predictions for the upcoming matches.</p>
              {/* <p className="my-2">
                Enter your predictions now and prove your sports knowledge!
              </p> */}
            </div>

            <Link
              href={"/dashboard"}
              className={cn(
                buttonVariants(),
                "bg-white hover:bg-gray-100 text-lg min-w-52 h-16 py-4 px-10 font-medium text-accent-foreground rounded-3xl"
              )}
            >
              Place a bet
            </Link>
          </div>

          <Image
            src={"/landing/match-list.svg"}
            alt="Match List Image"
            width={900}
            height={600}
            className="h-full w-[960px] max-[1800px]:w-[800px] max-[1600px]:w-fit max-[1600px]:right-[-80px] max-[1450px]:right-[-150px] max-[1450px]:right-[-250px] max-[1275px]:hidden block object-cover absolute right-0 bottom-0"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-8">
          {steps.map((step, index) => (
            <StepCard step={step} key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
