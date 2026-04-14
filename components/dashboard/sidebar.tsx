"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  ChevronsRight,
  ChevronDown,
  CreditCard,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Bell,
  Megaphone,
  Tag,
  Trophy,
  Users,
} from "lucide-react";

interface SidebarProps {
  role: "ADMIN" | "STUDENT";
  collapsed?: boolean;
}

const adminRoutes = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: FolderOpen, label: "Categories", href: "/admin/categories" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: Megaphone, label: "Announcements", href: "/admin/announcements" },
  { icon: CreditCard, label: "Payment Methods", href: "/admin/payments" },
  { icon: Bell, label: "Activity Feed", href: "/admin/notifications" },
];

const studentRoutes = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
  { icon: BookOpen, label: "Browse Courses", href: "/student/courses" },
  { icon: GraduationCap, label: "My Learning", href: "/student/my-courses" },
  { icon: Trophy, label: "Leaderboard", href: "/student/leaderboard" },
];

export function Sidebar({ role, collapsed: controlledCollapsed }: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const open = controlledCollapsed !== undefined ? !controlledCollapsed : internalOpen;
  const setOpen = (v: boolean) => setInternalOpen(v);

  const pathname = usePathname();
  const routes = role === "ADMIN" ? adminRoutes : studentRoutes;

  return (
    <nav
      className={cn(
        "flex h-full flex-col border-r bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-2 shadow-sm transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      {/* Logo / Title */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-[#1D6FF2] to-[#1858D0] shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {open && (
            <div className="transition-opacity duration-200">
              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Learn With John
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {role === "ADMIN" ? "Admin Panel" : "Student"}
              </span>
            </div>
          )}
          {open && (
            <ChevronDown className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </Link>
      </div>

      {/* Main Routes */}
      <div className="flex-1 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link key={route.href} href={route.href}>
              <button
                className={cn(
                  "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <div className="grid h-full w-12 place-content-center">
                  <route.icon className="h-4 w-4" />
                </div>
                {open && (
                  <span className="text-sm font-medium">{route.label}</span>
                )}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Account Section */}
      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </div>
          <Link href={role === "ADMIN" ? "/admin/settings" : "/student/settings"}>
            <button
              className={cn(
                "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                pathname.includes("/settings")
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <div className="grid h-full w-12 place-content-center">
                <Settings className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </Link>
          <Link href={role === "ADMIN" ? "/student" : "/student/help"}>
            <button
              className={cn(
                "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
                pathname === "/student/help"
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <div className="grid h-full w-12 place-content-center">
                {role === "ADMIN" ? <GraduationCap className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">
                {role === "ADMIN" ? "Student View" : "Help & Support"}
              </span>
            </button>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="relative flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div className="grid h-full w-12 place-content-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      )}

      {/* Collapsed: just show icons for account actions */}
      {!open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-2 space-y-1">
          <Link href={role === "ADMIN" ? "/admin/settings" : "/student/settings"}>
            <button className="flex h-11 w-full items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              <Settings className="h-4 w-4" />
            </button>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex h-11 w-full items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="mt-2 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div className="flex items-center p-3">
          <div className="grid size-10 place-content-center">
            <ChevronsRight
              className={cn(
                "h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400",
                open && "rotate-180"
              )}
            />
          </div>
          {open && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Collapse
            </span>
          )}
        </div>
      </button>
    </nav>
  );
}
