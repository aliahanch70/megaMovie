"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import UserProfile from "@/components/dashboard/UserProfile";
import KPICard from "@/components/dashboard/KPICard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import SearchBar from "@/components/dashboard/SearchBar";
import Navigation from "@/components/dashboard/Navigation";
import { Users, Activity, TrendingUp, Clock, Eye, Menu } from "lucide-react"; // اضافه کردن Menu
import { useLanguage } from "@/contexts/LanguageContext";
import { getViewsByIpAddress, getViewsTimeline, getTotalUniqueVisitors, getUniqueVisitorsTimeline } from "@/utils/viewAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MostViewedProducts from "@/components/dashboard/MostViewedProducts";
import Overview from "@/components/overview";


function DashboardContent() {
  const mockActivityData = [
    { date: '2023-01', value: 40 },
    { date: '2023-02', value: 65 },
    { date: '2023-03', value: 52 },
    { date: '2023-04', value: 78 }
  ];
  const { isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewCount, setViewCount] = useState(0);
  const [viewsTimeline, setViewsTimeline] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [visitorTimeline, setVisitorTimeline] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // برای منوی موبایل
  const supabase = createClient();

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch("/api/views");
        const views = await response.json();
        const ipAddress = "81.19.216.3";
        const count = getViewsByIpAddress(views, ipAddress);
        const timeline = getViewsTimeline(views, ipAddress);
        const totalUniqueVisitors = getTotalUniqueVisitors(views);
        const visitorsOverTime = getUniqueVisitorsTimeline(views);

        setViewCount(count);
        setViewsTimeline(timeline);
        setUniqueVisitors(totalUniqueVisitors);
        setVisitorTimeline(visitorsOverTime);
      } catch (error) {
        console.error("Failed to fetch views:", error);
      }
    };

    fetchViews();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUser(profile);
      }
    };
    getUser();
  }, [supabase]);

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-black ${isRTL ? "rtl" : "ltr"}`}>
      {/* هدر با دکمه منو برای موبایل */}
      <Header>
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </Header>

      <div className="flex pt-16">
        {/* سایدبار */}
        <div
          className={`fixed inset-y-0 ${isRTL ? "right-0" : "left-0"} w-64 bg-black border-${isRTL ? "l" : "r"} z-50 transform transition-transform lg:transform-none lg:static lg:w-64 lg:top-16 lg:bottom-0 ${
            isSidebarOpen ? "translate-x-0" : `${isRTL ? "translate-x-64" : "-translate-x-full"}`
          }`}
        >
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={`flex items-center flex-shrink-0 px-4 ${isRTL ? "justify-end" : "justify-start"}`}>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>
            <div className="mt-8 flex-1 px-4">
              <Navigation />
            </div>
          </div>
        </div>

        {/* overlay برای بستن سایدبار توی موبایل */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* محتوای اصلی */}
        <div className={`flex flex-col flex-1 ${isRTL ? "lg:pr-64" : "lg:pl-64"} px-4 sm:px-6 lg:px-8`}>
          <div className="flex-1 py-6">
            {/* سرچ */}
            <div className="mb-6">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            {/* KPIها */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICard
                title="Total Users"
                value="1,234"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                trend={{ value: 12, isPositive: true }}
              />
              <KPICard
                title="Active Now"
                value="123"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                description="Users online"
              />
              <KPICard
                title="Growth Rate"
                value="23%"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                trend={{ value: 8, isPositive: true }}
              />
              <KPICard
                title="Avg. Session"
                value="24m"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                description="Per user"
              />
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{viewCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Unique Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{uniqueVisitors}</div>
                </CardContent>
              </Card>
            </div>

            {/* Most Viewed Products */}
            <div className="mb-8">
              <MostViewedProducts />
            </div>

            {/* چارت‌ها و پروفایل */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <ActivityChart data={mockActivityData} />
              <UserProfile user={user} />
            </div>

            {/* Overview چارت‌ها */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Activity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Overview data={viewsTimeline.data} labels={viewsTimeline.labels} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Visitor Activity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Overview data={visitorTimeline.data} labels={visitorTimeline.labels} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}