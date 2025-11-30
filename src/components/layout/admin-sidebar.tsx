
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Home,
  Boxes,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { BrandLogo } from "../icons";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const links = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList, badge: true },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/materials", label: "المواد", icon: Boxes },
  { href: "/admin/reports", label: "التقارير", icon: LineChart },
];

export function AdminSidebar({ pendingOrdersCount = 0 }: { pendingOrdersCount?: number }) {
  const pathname = usePathname();

  return (
    <Sidebar side="right">
      <SidebarRail />
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
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(link.href)}
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                  {link.badge && pendingOrdersCount > 0 && (
                     <SidebarMenuBadge>{pendingOrdersCount}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 justify-start p-2 w-full h-auto">
                        <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?u=admin@abjour.com" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-sm">مسؤول</span>
                            <span className="text-xs text-muted-foreground">admin@abjour.com</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="mb-2">
                    <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href="/admin/profile"><User className="ml-2 h-4 w-4" /> الملف الشخصي</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard"><User className="ml-2 h-4 w-4" /> تبديل للمستخدم</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/welcome"><Home className="ml-2 h-4 w-4" /> العودة للرئيسية</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
