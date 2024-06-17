"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const EmailSchema = z.object({
  email: z.string({ required_error: "Please provide a valid email." }),
});

const ForgotPasswordForm = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: z.infer<typeof EmailSchema>) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: `${window.location.origin}/api/auth/callback?to=/reset-password`,
      }
    );

    setIsLoading(false);
    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset email sent successfully!",
        description:
          "Please check your inbox. You might need to check your spam folder",
        variant: "default",
      });
    }
  };

  return (
    <div className="p-8 flex flex-col w-full max-w-4xl mx-auto">
      <div className="my-8 text-center">
        <h2 className="uppercase font-gothic scroll-m-20 text-5xl font-black tracking-tight first:mt-0 text-white mb-2">
          Forgot Password?
        </h2>
        <p className="text-lg text-primary-foreground">
          Enter your email and we&apos;ll send you instructions to reset your
          password
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="my-8 w-10/12 md:w-2/3 space-y-6 mx-auto"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground text-lg font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                instructions...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Link
            href={"/login"}
            className="text-sm text-blue-400 hover:underline my-4 text-center flex items-center gap-2"
          >
            <ChevronLeft />
            Back to login
          </Link>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
