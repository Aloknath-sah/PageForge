import AuthForm from '../../../features/auth/components/AuthForm';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <AuthForm
        mode="signup"
      />
    </main>
  );
}