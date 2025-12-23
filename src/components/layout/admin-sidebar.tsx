
'use client';

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
  Warehouse,
  Building,
  LogOut,
  Settings,
  Star,
  Bell,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { BrandLogo } from "../icons";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { ThemeSwitcher } from "../theme-switcher";
import { logout } from "@/lib/auth-actions";
import { useAuth } from "@/providers/auth-provider";

const links = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell, badgeKey: 'notifications' },
  { href: "/admin/reviews", label: "المراجعات", icon: Star },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/materials", label: "المواد", icon: Boxes },
  { href: "/admin/inventory", label: "المخزون", icon: Warehouse },
  { href: "/admin/suppliers", label: "الموردون", icon: Building },
  { href: "/admin/reports", label: "التقارير", icon: LineChart },
];

interface AdminSidebarProps {
  pendingOrdersCount?: number;
  newReviewsCount?: number;
  editRequestsCount?: number;
}

export function AdminSidebar({ pendingOrdersCount = 0, newReviewsCount = 0, editRequestsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useAuth();


  const badgeCounts = {
    notifications: pendingOrdersCount + editRequestsCount + newReviewsCount,
  };

  return (
    <Sidebar side="right" variant="floating">
      <SidebarRail />
      <SidebarHeader>
         <div className="flex items-center gap-3 p-2">
            <BrandLogo />
            {state === 'expanded' && (
                <span className="font-bold text-lg">طلب أباجور</span>
            )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => {
            const badgeCount = link.badgeKey ? badgeCounts[link.badgeKey as keyof typeof badgeCounts] : 0;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={pathname.startsWith(link.href) && (link.href.length > 6 ? pathname.length > link.href.length : pathname.length === link.href.length)}
                  tooltip={{
                      children: link.label,
                      side: "left"
                  }}
                >
                  <Link href={link.href} className="relative">
                    <link.icon />
                    <span className="group-data-[state=expanded]:opacity-100 group-data-[state=collapsed]:opacity-0 transition-opacity duration-200 flex items-center gap-2">
                        {link.label}
                        {link.badgeKey && badgeCount > 0 && state === 'expanded' && (
                          <SidebarMenuBadge>{badgeCount}</SidebarMenuBadge>
                        )}
                    </span>
                     {link.badgeKey && badgeCount > 0 && state === 'collapsed' && (
                       <SidebarMenuBadge className="absolute top-1.5 right-1.5 h-2 w-2 p-0 justify-center" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-2">
         <Separator className="bg-sidebar-border/50"/>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-sidebar-accent">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.email}`} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    {state === 'expanded' && (
                        <div className="flex flex-col items-start text-right">
                            <span className="font-semibold text-sm">{user?.name || 'مسؤول'}</span>
                            <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
                        </div>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-56">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/admin/profile"><User className="ml-2 h-4 w-4" /> الملف الشخصي</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/admin/settings"><Settings className="ml-2 h-4 w-4" /> الإعدادات</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard"><User className="ml-2 h-4 w-4" /> تبديل للمستخدم</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/welcome"><Home className="ml-2 h-4 w-4" /> العودة للرئيسية</Link>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ThemeSwitcher />
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                  <form action={logout}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className='w-full'>
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                      </button>
                    </DropdownMenuItem>
                  </form>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
