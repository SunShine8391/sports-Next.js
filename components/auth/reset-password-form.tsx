"use client";

import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQueryClient } from "@tanstack/react-query";

const ResetSchema = z
  .object({
    password: z.string().min(1, {
      message: "Please provide your new password.",
    }),
    confirmPassword: z.string().min(1, {
      message: "Please confirm your new password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

const ResetPasswordForm = () => {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: z.infer<typeof ResetSchema>) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    await queryClient.refetchQueries({ queryKey: ["profile"] });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated successfully!",
        variant: "default",
      });
    }
  };

  return (
    <div className="p-8 flex flex-col w-full max-w-4xl mx-auto">
      <div className="my-8 text-center">
        <h2 className="uppercase font-gothic scroll-m-20 text-5xl font-black tracking-tight first:mt-0 text-white mb-2">
          Reset Passwoard
        </h2>
        <p className="text-lg text-primary-foreground">
          Your new password must be different from previously used passwords
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-10/12 md:w-2/3 space-y-6 mx-auto"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="* * * * * * * *"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary-foreground">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="* * * * * * * *"
                    type="password"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting
                Password...
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

export default ResetPasswordForm;
