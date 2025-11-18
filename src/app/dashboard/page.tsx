'use client';

import { Dashboard } from "@/components/dashboard/dashboard";
import { MainFooter } from "@/components/layout/main-footer";
import { MainHeader } from "@/components/layout/main-header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-1">
        <Dashboard />
      </main>
      <MainFooter />
    </div>
  );
}
