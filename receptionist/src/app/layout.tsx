import { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

// Export metadata at the top level for Next.js to use
export const metadata: Metadata = {
   title: 'Le panier à linge - Receptionist Portal',
   description: 'Manage laundry orders and customers efficiently.',
   icons: {
      icon: '/favicon.ico',
   },
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <ClientLayout>{children}</ClientLayout>
      </html>
   );
}
