import { QueryClient } from "@tanstack/react-query";

import { getCurrentRound } from "@/lib/queries";
import MatchList from "@/components/matches/match-list";
import HowItWorks from "@/components/landing/how-it-works";
import FAQ from "@/components/landing/faq";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const queryClient = new QueryClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  await queryClient.prefetchQuery({
    queryKey: ["matches"],
    queryFn: getCurrentRound,
  });

  return (
    <main className="flex flex-col gap-12 py-4 px-8 sm:px-12 md:px-24 md:py-8">
      <section className="min-h-[75vh] py-12 relative 2xl:flex 2xl:items-center">
        <div className="text-wrap">
          <h1 className="uppercase font-gothic-regular text-7xl lg:text-[7rem] xl:text-[140px] font-black tracking-wider text-white lg:max-w-[50vw] xl:max-w-[45vw]">
            {"Predict sport scores, "} <span className="text-accent">Win</span>{" "}
            cash <span className="text-accent">prizes</span>
          </h1>
          <p className="text-lg md:max-w-[50vw] lg:max-w-[45vw] my-4 xl:text-2xl xl:max-w-[40vw]">
            It&apos;s simple, enter your predictions for free and compete
            against the rest of the world.
          </p>

          <div className="flex justify-center items-center md:justify-start">
            <Link
              href={"#enter-predictions"}
              className={cn(
                buttonVariants(),
                "bg-accent text-accent-foreground min-w-52 h-16 py-4 px-10 text-center text-lg my-4 rounded-2xl hover:bg-accent/85"
              )}
            >
              Predict scores
            </Link>
          </div>
        </div>

        <Image
          src={"/landing/hero-1.png"}
          alt="Hero Image"
          width={1000}
          height={1000}
          className="h-60 md:h-64 mx-auto lg:mx-0 lg:h-72 w-fit object-cover lg:absolute lg:right-2 lg:top-52 lg:z-10 xl:h-96 2xl:h-[32rem]"
        />

        <Image
          src={"/landing/hero-2.png"}
          alt="Hero Image"
          width={1000}
          height={1000}
          className="h-60 md:h-64 mx-auto lg:mx-0 lg:h-72 w-fit object-cover lg:absolute lg:-right-4 lg:top-10 lg:z-0 xl:h-96 2xl:h-[32rem]"
        />
      </section>

      <MatchList />
      <HowItWorks />
      <FAQ />
    </main>
  );
}
