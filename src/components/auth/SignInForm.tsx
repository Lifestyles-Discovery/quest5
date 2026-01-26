import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { useSignIn } from "@hooks/api/useAuth";
import type { AxiosError } from "axios";

export default function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the redirect destination from location state, or default to /deals
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/deals";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    signIn.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate(from, { replace: true });
        },
        onError: (err) => {
          const axiosError = err as AxiosError;
          if (axiosError.response?.status === 404) {
            setError("Your email or password were entered incorrectly");
          } else if (axiosError.response?.status === 403) {
            // Subscription inactive - redirect to reactivate page
            // Pass credentials so user doesn't have to re-enter them
            navigate("/reactivate", { state: { email, password } });
          } else {
            setError("An unexpected error occurred. Please try again.");
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Mobile-only logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link to="/" className="dark:bg-white dark:rounded-lg dark:p-3">
              <img
                src="/images/logo/quest-logo-small.png"
                alt="Quest Logo"
                className="h-12 object-contain"
              />
            </Link>
          </div>

          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            {error && (
              <div className="mb-4">
                <Alert
                  variant="error"
                  title="Sign In Failed"
                  message={error}
                />
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={signIn.isPending}
                    autoFocus
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={signIn.isPending}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={signIn.isPending}
                  >
                    {signIn.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Mobile-only video section */}
            <div className="mt-8 lg:hidden">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center mb-2">
                New Quest Orientation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                There's a new Quest! Watch this video to get familiar and up-to-speed quickly.
              </p>
              <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
                <iframe
                  src="https://fast.wistia.net/embed/iframe/1ubgx153s0"
                  title="New Quest Orientation"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
