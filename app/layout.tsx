import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AiStatus } from "@/components/navigation/AiStatus";
import { AuthGate } from "@/components/navigation/AuthGate";
import { LeaderboardSync } from "@/components/navigation/LeaderboardSync";
import { Nav } from "@/components/navigation/Nav";
import { ViewToggle } from "@/components/navigation/ViewToggle";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ActFlow — turn “I should” into “I did”",
  description: "ActFlow finds what's stopping you and gives you the smallest useful next action.",
};

// Runs before first paint so the saved (or screen-appropriate) layout never flashes.
const VIEW_SCRIPT = `(function(){try{var v=localStorage.getItem('actflow:view');if(v!=='desktop'&&v!=='mobile'){v=window.innerWidth>=1024?'desktop':'mobile'}document.documentElement.dataset.view=v}catch(e){document.documentElement.dataset.view='mobile'}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VIEW_SCRIPT }} />
      </head>
      <body className="flex min-h-full justify-center p-4 sm:p-8">
        <ToastProvider>
          <div className="w-full max-w-md self-start desktop:max-w-5xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <AiStatus />
              <ViewToggle />
            </div>
            <div className="relative flex min-h-[600px] flex-col rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
              <main className="flex-1 px-6 pb-8 pt-8">
                <AuthGate>{children}</AuthGate>
                <LeaderboardSync />
              </main>
              <Nav />
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
