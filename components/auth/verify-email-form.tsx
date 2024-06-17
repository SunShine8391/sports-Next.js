"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Mail } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

const VerifyEmailForm = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();

  const handleResend = async () => {
    const email = params.get("email");

    if (!email) {
      return;
    }

    const { data, error } = await supabase.auth.resend({
      email,
      type: "signup",
      options: {
        emailRedirectTo: `${window.origin}/verify-email?email=${email}&success=true`,
      },
    });

    await queryClient.refetchQueries({ queryKey: ["profile"] });

    if (error) {
      toast({
        title: "Error sending verification email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent successfully!",
        description:
          "Please check your inbox. You might need to check your spam folder",
        variant: "default",
      });
    }
  };

  return (
    <div className="p-8 flex flex-col w-full max-w-4xl mx-auto">
      <div className="my-8 w-full flex flex-col items-center justify-center h-full">
        <div className="w-10/12 md:w-2/3 mx-auto space-y-6">
          <div className="my-8 text-center">
            <h2 className="uppercase font-gothic scroll-m-20 text-5xl font-black tracking-tight first:mt-0 text-white mb-2">
              {params.get("success") && Boolean(params.get("success")) ? (
                "Email Successfully Verified 🚀"
              ) : (
                <>Verify your email</>
              )}
            </h2>
            <p className="text-lg text-primary-foreground">
              {params.get("success") && Boolean(params.get("success"))
                ? "Congratulations, your email address has been successfully verified, Start you Magicx!"
                : `Account activation link sent to your email address:
            ${params.get("email")} Please follow the link inside to continue.`}
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-accent text-accent-foreground text-lg font-bold"
            variant={"secondary"}
            onClick={() => router.push("/login")}
          >
            Login
          </Button>

          <p className="text-sm text-primary-foreground my-4 text-center">
            Didn&apos;t get the mail?{" "}
            <span
              className="text-blue-400 hover:underline ml-2"
              onClick={handleResend}
            >
              Resend
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
