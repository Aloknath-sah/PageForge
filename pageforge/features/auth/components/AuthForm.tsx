'use client';

import { FormEvent, useState } from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { createClient } from '../../../lib/supabase/client';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export default function AuthForm({
  mode,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const supabase = createClient();

  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [message, setMessage] =
    useState('');
  const [error, setError] =
    useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isLogin =
    mode === 'login';

  const nextPath =
    searchParams.get('next') ||
    '/dashboard';

  const getSafeNextPath = (
    value: string,
  ) => {
    if (
      !value.startsWith('/') ||
      value.startsWith('//')
    ) {
      return '/dashboard';
    }

    return value;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const {
          error: signInError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            },
          );

        if (signInError) {
          throw signInError;
        }

        router.replace(
          getSafeNextPath(nextPath),
        );

        router.refresh();

        return;
      }

      const callbackUrl =
        `${window.location.origin}/auth/callback`;

      const {
        data,
        error: signUpError,
      } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              callbackUrl,
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace(
          getSafeNextPath(nextPath),
        );

        router.refresh();

        return;
      }

      setMessage(
        'Account created. Check your email to confirm your account.',
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-950">
          {isLogin
            ? 'Welcome back'
            : 'Create your account'}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {isLogin
            ? 'Sign in to continue to PageForge.'
            : 'Create an account to start building pages.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-800"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-800"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
            autoComplete={
              isLogin
                ? 'current-password'
                : 'new-password'
            }
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting
            ? isLogin
              ? 'Signing in...'
              : 'Creating account...'
            : isLogin
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        {isLogin ? (
          <>
            Don&apos;t have an account?{' '}
            <a
              href="/auth/sign-up"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create one
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}