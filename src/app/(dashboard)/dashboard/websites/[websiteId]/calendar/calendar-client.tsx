"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  keyword: { keyword: string } | null;
}

interface Props {
  websiteId: string;
  website: { id: string; brandName: string; primaryColor: string | null };
  posts: Post[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PUBLISHED: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
  DRAFT: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Edit3 className="h-3 w-3" /> },
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-800", icon: <Clock className="h-3 w-3" /> },
  GENERATING: { bg: "bg-purple-100", text: "text-purple-800", icon: <FileText className="h-3 w-3" /> },
};

export default function CalendarClient({ websiteId, website, posts }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const primaryColor = website.primaryColor || "#6366f1";

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Build a map: "YYYY-MM-DD" -> Post[]
  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      const dateStr =
        post.publishedAt?.slice(0, 10) ||
        post.scheduledAt?.slice(0, 10) ||
        null;
      if (!dateStr) continue;
      const [y, m] = dateStr.split("-").map(Number);
      if (y === year && m - 1 === month) {
        const existing = map.get(dateStr) || [];
        map.set(dateStr, [...existing, post]);
      }
    }
    return map;
  }, [posts, year, month]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedPosts = selectedDay ? (postsByDate.get(selectedDay) || []) : [];

  const monthStats = {
    published: posts.filter(p => p.publishedAt?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length,
    scheduled: posts.filter(p => p.scheduledAt?.startsWith(`${year}-${String(month+1).padStart(2,"0")}`) && p.status === "SCHEDULED").length,
    total: posts.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Calendar</h2>
          <p className="text-muted-foreground">Track and plan your content schedule</p>
        </div>
        <Link href={`/dashboard/websites/${websiteId}/keywords`} className="shrink-0">
          <Button>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Add Keywords
          </Button>
        </Link>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{monthStats.published}</p>
            <p className="text-xs text-muted-foreground">Published this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{monthStats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{monthStats.total}</p>
            <p className="text-xs text-muted-foreground">Total posts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(null); }}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const dayPosts = postsByDate.get(dateStr) || [];
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    className={`relative min-h-[60px] p-1 rounded-lg text-left transition-all hover:bg-muted/50 ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    } ${isToday ? "bg-muted" : ""}`}
                  >
                    <span className={`text-xs font-medium ${
                      isToday
                        ? "inline-flex items-center justify-center h-5 w-5 rounded-full text-white"
                        : "text-foreground"
                    }`}
                    style={isToday ? { backgroundColor: primaryColor } : {}}>
                      {day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayPosts.slice(0, 2).map(post => {
                        const style = STATUS_STYLE[post.status] || STATUS_STYLE.DRAFT;
                        return (
                          <div key={post.id} className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${style.bg} ${style.text}`}>
                            {post.title}
                          </div>
                        );
                      })}
                      {dayPosts.length > 2 && (
                        <div className="text-[9px] text-muted-foreground px-1">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedDay ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPosts.map(post => {
                      const style = STATUS_STYLE[post.status] || STATUS_STYLE.DRAFT;
                      return (
                        <Link
                          key={post.id}
                          href={`/dashboard/websites/${websiteId}/posts/${post.id}`}
                          className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className={`${style.text} mt-0.5 shrink-0`}>{style.icon}</span>
                            <div>
                              <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                              {post.keyword && (
                                <p className="text-xs text-muted-foreground mt-0.5">{post.keyword.keyword}</p>
                              )}
                              <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 ${style.bg} ${style.text}`}>
                                {post.status.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click a day to see posts</p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {Object.entries(STATUS_STYLE).map(([status, style]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`${style.text}`}>{style.icon}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
                    {status.toLowerCase()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming posts */}
          {posts.filter(p => p.scheduledAt && new Date(p.scheduledAt) > today).slice(0, 5).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {posts
                  .filter(p => p.scheduledAt && new Date(p.scheduledAt) > today)
                  .slice(0, 5)
                  .map(post => (
                    <Link
                      key={post.id}
                      href={`/dashboard/websites/${websiteId}/posts/${post.id}`}
                      className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded text-sm"
                    >
                      <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium line-clamp-1">{post.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(post.scheduledAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
