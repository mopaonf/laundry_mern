'use client';

// We don't need to import fonts here as they come from the root layout
// This layout is used only to override the structure for the login page
// The actual styling comes from the login page component itself

export default function LoginLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return <>{children}</>;
}
