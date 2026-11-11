import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import LuxuryLoader from "@/components/ui/LuxuryLoader";
import AuthGuard from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50/70 overflow-hidden font-sans relative">
        {/* Luxury GSAP First-Time Loader */}
        <LuxuryLoader />

        {/* Sleek Fixed Sidebar */}
        <Sidebar />

        {/* Main App Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
