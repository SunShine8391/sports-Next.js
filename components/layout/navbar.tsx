"use client";

import axios from "axios";
import Link from "next/link";

import { Button, buttonVariants } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Menu } from "lucide-react";
import { toast } from "../ui/use-toast";
import { useMediaQuery } from "@/lib/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/lib/queries";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NavbarItems = ({ close = () => {} }: { close?: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
  }, [params]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await axios.post("/api/auth/logout");
      await queryClient.refetchQueries({ queryKey: ["profile"] });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error Signing Out",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouting = (href: string) => {
    close();
    // router in 300 milliseconds to allow the sheet to close on mobile
    if (isDesktop) router.push(href);
    else setTimeout(() => router.push(href), 300);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 text-primary md:text-primary-foreground p-4 md:p-0">
        <p
          className={cn(
            "hover:text-white text-base font-medium cursor-pointer",
            {
              "text-accent hover:text-accent/50": hash === "#enter-prediction",
            }
          )}
          onClick={() => handleRouting("#enter-predictions")}
        >
          Enter Your Predictions
        </p>
        <p
          onClick={() => handleRouting("#how-it-works")}
          className={cn(
            "hover:text-white cursor-pointer text-base font-medium",
            {
              "text-accent hover:text-accent/50": hash === "#how-it-works",
            }
          )}
        >
          How to play
        </p>
        <p
          onClick={() => handleRouting("#faq")}
          className={cn(
            "hover:text-white cursor-pointer text-base font-medium",
            {
              "text-accent hover:text-accent/50": hash === "#faq",
            }
          )}
        >
          FAQs
        </p>
      </div>

      {isLoadingProfile && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Skeleton className="bg-muted-foreground/50 rounded-full h-10 w-24" />
          <Skeleton className="bg-muted-foreground/50 rounded-full h-10 w-24" />
        </div>
      )}

      {!isLoadingProfile && !profile && (
        <div className="flex flex-col text-base font-medium md:flex-row md:items-center md:justify-end gap-2 p-4 md:p-0">
          <Link
            href={"/register"}
            className={cn(buttonVariants(), "rounded-full")}
          >
            Sign up
          </Link>

          <Link
            href={"/login"}
            className={cn(
              buttonVariants({ variant: isDesktop ? "secondary" : "default" }),
              "rounded-full"
            )}
          >
            Login
          </Link>
        </div>
      )}

      {!isLoadingProfile && profile && (
        <div className="flex flex-col text-base font-medium md:flex-row md:items-center gap-2 p-4 md:p-0">
          <Link
            href={"/dashboard"}
            className={cn(buttonVariants(), "rounded-full")}
          >
            Dashboard
          </Link>

          <Button
            variant={isDesktop ? "secondary" : "default"}
            className="rounded-full"
            onClick={handleSignOut}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing Out...
              </>
            ) : (
              "Sign Out"
            )}
          </Button>
        </div>
      )}
    </>
  );
};

const Navbar = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) setMounted(true);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <header>
      <nav className="flex items-center justify-between gap-2 py-4 px-6">
        <Link
          href={"/"}
          className="font-black tracking-tight font-gothic uppercase text-white"
        >
          Sports Stakes
        </Link>

        {isDesktop && <NavbarItems />}

        {!isDesktop && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Menu className="rounded-lg p-1 w-10 h-10" />
            </SheetTrigger>
            <SheetContent className="font-sans w-screen">
              <SheetHeader>
                <SheetTitle className="font-black tracking-tight font-gothic uppercase text-primary">
                  Sports Stakes
                </SheetTitle>
                <NavbarItems close={() => setOpen(false)} />
              </SheetHeader>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
