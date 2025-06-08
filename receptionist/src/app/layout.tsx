import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Sidebar from './Sidebar';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});
const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export const metadata = {
   title: 'Laundry Receptionist Portal',
   description: 'Manage laundry orders and customers efficiently.',
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}
         >
            <div className="flex min-h-screen bg-[#28B9F4]">
               {/* Sidebar */}
               <Sidebar />
               {/* Main content area */}
               <div className="flex-1 flex flex-col min-h-screen ">
                  {/* Top bar */}
                  <header className="flex items-center justify-between bg-white shadow rounded-b-3xl ml-10 px-8 py-5 mb-6 sticky top-0 z-20">
                     <div className="text-lg font-semibold text-gray-800">
                        Welcome,{' '}
                        <span className="text-[#28B9F4]">Receptionist!</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <Image
                           src="/profile-avatar.png"
                           alt="Profile"
                           width={40}
                           height={40}
                           className="w-10 h-10 rounded-full shadow object-cover border-2 border-[#28B9F4]"
                           priority
                        />
                        {/* You can replace with a dropdown menu for more options */}
                     </div>
                  </header>
                  <main className="flex-1 px-4 md:px-8 pb-8">{children}</main>
               </div>
            </div>
         </body>
      </html>
   );
}
