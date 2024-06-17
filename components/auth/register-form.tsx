"use client";

import { z } from "zod";
import { toast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { handleGoogleAuth } from "@/lib/utils";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

const RegisterSchema = z
  .object({
    email: z.string().min(1, {
      message: "Please provide a valid email.",
    }),
    password: z.string().min(1, {
      message: "Please provide your password.",
    }),
    confirmPassword: z.string().min(1, {
      message: "Please confirm your password.",
    }),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept Terms and Conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

const RegisterForm = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData: z.infer<typeof RegisterSchema>) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.origin}/verify-email?success=true&email=${formData.email}`,
      },
    });

    await queryClient.refetchQueries({ queryKey: ["profile"] });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      router.push(`/verify-email?email=${formData.email}`);
    }
  };

  return (
    <div className="p-8 flex flex-col w-full max-w-4xl mx-auto">
      <div className="my-8 text-center">
        <h2 className="uppercase font-gothic scroll-m-20 text-5xl font-black tracking-tight first:mt-0 text-white mb-2">
          Sports Stakes
        </h2>
        <p className="text-lg text-primary-foreground">Predict and win!</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-10/12 md:w-2/3 space-y-4 mx-auto"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Password</FormLabel>
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
                <FormLabel>Confirm Password</FormLabel>
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
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-end space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-primary-foreground font-normal">
                  I agree to{" "}
                  <Link href="/terms" className="hover:underline">
                    privacy policy & terms
                  </Link>
                  <FormMessage />
                </FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground text-lg font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <p className="text-sm text-primary-foreground my-4">
            Already have an account?{" "}
            <span>
              <Link
                href={"/login"}
                className="text-blue-400 hover:underline ml-2"
              >
                Sign in instead
              </Link>
            </span>
          </p>

          <div className="my-4 flex items-center justify-center gap-2 w-full overflow-hidden">
            <Separator className="w-36" />
            <p className="text-muted-foreground">OR</p>
            <Separator className="w-36" />
          </div>

          <Button
            className="flex items-center gap-2 justify-center w-full"
            type="button"
            variant="secondary"
            onClick={() => handleGoogleAuth(supabase)}
          >
            <Image
              src={"/google.svg"}
              alt="Google Logo"
              width={30}
              height={30}
              className="w-5 h-5"
            />
            Signup with Google
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
