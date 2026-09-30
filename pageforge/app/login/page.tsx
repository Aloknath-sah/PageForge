import AuthForm from '../../features/auth/components/AuthForm';

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params =
    await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <AuthForm
        mode="login"
      />
    </main>
  );
}