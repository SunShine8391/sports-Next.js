"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { toast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { handleGoogleAuth } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const LoginSchema = z.object({
  email: z.string().min(1, {
    message: "Please provide a valid email.",
  }),
  password: z.string().min(1, {
    message: "Please provide your password.",
  }),
  remember: z.boolean().default(false).optional(),
});

const LoginForm = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    await queryClient.refetchQueries({ queryKey: ["profile"] });
    setIsLoading(false);
    if (error) {
      if (error.message === "Email not confirmed") {
        router.push(`/verify-email?email=${formData.email}`);
      } else {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      if (data.user.email_confirmed_at) {
        router.push("/");
      } else {
        router.push(`/verify-email?email=${formData.email}`);
      }
    }
  };

  return (
    <div className="p-8 flex flex-col w-full max-w-4xl mx-auto">
      <div className="text-center my-8">
        <h2 className="uppercase font-gothic scroll-m-20 text-5xl font-black tracking-tight first:mt-0 text-white mb-2">
          Welcome to Sports Stakes!
        </h2>
        <p className="text-lg text-primary-foreground">
          Please sign-in to your account
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-10/12 md:w-2/3 space-y-6 mx-auto"
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

          <div className="flex flex-wrap gap-4 justify-end items-baseline">
            <Link
              href={"/forgot-password"}
              className="text-sm text-blue-400 hover:underline"
            >
              Forward Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground text-lg font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-sm text-primary-foreground my-4">
            New to Sports Stakes?{" "}
            <span>
              <Link
                href={"/register"}
                className="text-blue-400 hover:underline ml-2"
              >
                Create an account
              </Link>
            </span>
          </p>

          <div className="my-4 flex items-center justify-center gap-2 w-full overflow-hidden">
            <Separator className="w-36" />
            <p className="text-muted-foreground">OR</p>
            <Separator className="w-36" />
          </div>

          <Button
            variant={"secondary"}
            className="flex items-center gap-2 justify-center w-full"
            type="button"
            onClick={() => handleGoogleAuth(supabase)}
          >
            <Image
              src="/google.svg"
              alt="Google Logo"
              height={30}
              width={30}
              className="w-4 h-4"
            />
            Signin with Google
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
