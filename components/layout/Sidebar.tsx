"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// 1. Import LucideIcon type
import { BarChart2, Users, Dumbbell, Calendar, MessageSquare, HeadphonesIcon, Home, LineChart, Settings, HelpCircle, Menu, X, LucideAward, LucideIcon } from 'lucide-react'
import { useSession } from "next-auth/react"

// 2. Update the type definition
type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon; // Use the official type from the library
  super_admin_only?: boolean;
};

// Admin navigation items
const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Admin Management", href: "/admin/super", icon: LucideAward, super_admin_only: true },
  { name: "Trainers", href: "/admin/trainers", icon: Dumbbell },
  { name: "Sessions", href: "/admin/sessions", icon: Calendar },
  { name: "Community", href: "/admin/community", icon: MessageSquare },
  { name: "Chats", href: "/admin/chats", icon: MessageSquare, super_admin_only: true},
  { name: "Chat Support", href: "/admin/support", icon: HeadphonesIcon },
]

// Trainer navigation items - matching the image
const trainerNavigation: NavigationItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/trainer/analytics", icon: LineChart },
  { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
  { name: "Chats", href: "/trainer/chats", icon: MessageSquare },
  { name: "Settings", href: "/trainer/settings", icon: Settings },
  { name: "Help", href: "", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // Select navigation based on user role
  const navigation = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" ? adminNavigation : trainerNavigation

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call once to set initial state

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <button
        className=" fixed top-1 left-0 z-50 bg-black p-2 text-white lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-gray-700 bg-black pt-16 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
{navigation
  .filter((item) => !item.super_admin_only || session?.user?.role === "SUPER_ADMIN")
  .map((item) => {
    const isActive = pathname === item.href;
    const IconComponent = item.icon; // Assign to capitalized variable for JSX rendering
    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={`flex items-center rounded-lg p-2 text-base hover:text-white ${
            isActive ? "text-white" : "text-gray-600"
          }`}
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
        >
          {/* Render the icon correctly */}
          <IconComponent size={24} className="h-6 w-6" />
          <span className="ml-3">{item.name}</span>
        </Link>
      </li>
    );
  })}
          </ul>
        </div>
      </aside>
    </>
  )
}
