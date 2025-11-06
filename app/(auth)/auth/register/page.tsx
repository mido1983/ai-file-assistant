import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 p-6">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900">Create your account</h1>
        <p className="mb-6 text-sm text-zinc-600">Start organizing your files with AI in minutes.</p>
        <RegisterForm />
      </div>
    </section>
  );
}

