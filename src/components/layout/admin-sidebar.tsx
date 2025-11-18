"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { BrandLogo } from "../icons";

const links = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/reports", label: "التقارير", icon: LineChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <BrandLogo />
            <span className="text-lg font-semibold">طلب أباجور</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/login" passHref legacyBehavior>
                <SidebarMenuButton tooltip="تسجيل الخروج">
                    <LogOut />
                    <span>تسجيل الخروج</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-semibold text-sm">مسؤول</span>
                <span className="text-xs text-muted-foreground">admin@abjour.com</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
