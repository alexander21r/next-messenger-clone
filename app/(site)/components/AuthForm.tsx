"use client";

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import Input from "@/app/components/inputs/Input";
import AuthSocialButton from "./AuthSocialButton";
import Button from "@/app/components/Button";
import { toast } from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [variant, setVariant] = useState<Variant>("LOGIN");

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/conversations");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setLoading(true);
    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() =>
          signIn("credentials", {
            ...data,
            redirect: false,
          })
        )
        .then((callback) => {
          if (callback?.error) {
            toast.error("Something went wrong!");
          }

          if (callback?.ok) {
            router.push("/conversations");
          }
        })
        .catch(() => {
          toast.error("Email or name is already taken!");
        })
        .finally(() => setLoading(false));
    }

    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials!");
          }

          if (callback?.ok) {
            router.push("/conversations");
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const socialAction = (action: string) => {
    signIn(action, { redirect: false }).then((callback) => {
      if (callback?.error) {
        toast.error("Something went wrong!");
      }

      if (callback?.ok) {
        router.push("/conversations");
      }
    });
  };

  return (
    <>
      {session.status === "unauthenticated" && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        ">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {variant === "REGISTER" && (
                <Input
                  register={register}
                  errors={errors}
                  required
                  id="name"
                  label="Name"
                />
              )}
              <Input
                register={register}
                errors={errors}
                required
                id="email"
                label="Email address"
                type="email"
              />
              <Input
                register={register}
                errors={errors}
                required
                id="password"
                label="Password"
                type="password"
              />
              <div>
                <Button fullWidth type="submit" disabled={loading}>
                  {variant === "LOGIN" ? "Sign in" : "Register"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div
                  className="
                absolute 
                inset-0 
                flex 
                items-center
              ">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <AuthSocialButton
                  icon={BsGithub}
                  onClick={() => socialAction("github")}
                />
                <AuthSocialButton
                  icon={BsGoogle}
                  onClick={() => socialAction("google")}
                />
              </div>
            </div>
            <div
              className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          ">
              <div>
                {variant === "LOGIN"
                  ? "New to Messenger?"
                  : "Already have an account?"}
              </div>
              <div onClick={toggleVariant} className="underline cursor-pointer">
                {variant === "LOGIN" ? "Create an account" : "Login"}
              </div>
            </div>
          </div>
        </div>
      )}
      {(session.status === "loading" || session.status === "authenticated") && (
        <div className="m-auto">
          <ClipLoader
            color="black"
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </>
  );
};

export default AuthForm;
