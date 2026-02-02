export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-grow flex items-center justify-center min-h-screen">
      {children}
    </main>
  );
}
