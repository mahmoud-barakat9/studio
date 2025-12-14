
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { deleteUser } from "@/lib/actions";
import { getUsers } from "@/lib/firebase-actions";
import { useEffect, useState } from "react";
import type { User } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";

function UserActions({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user.id}`}>
                        <Eye className="ml-2 h-4 w-4" />
                        عرض التفاصيل
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user.id}/edit`}>
                        <Pencil className="ml-2 h-4 w-4" />
                        تعديل
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DeleteUserAlert userId={user.id} asChild>
                    <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:text-destructive">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                    </button>
                </DeleteUserAlert>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function DeleteUserAlert({ userId, asChild, children }: { userId: string; asChild?: boolean; children?: React.ReactNode; }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild={asChild} onClick={(e) => e.stopPropagation()}>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المستخدم وجميع طلباته نهائيًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <form action={deleteUser.bind(null, userId)}>
              <AlertDialogAction type="submit">متابعة</AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
}

export default function AdminUsersPage() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUsers() {
            setLoading(true);
            const data = await getUsers(true); // Get all users including admins
            setUsers(data);
            setLoading(false);
        }
        loadUsers();
    }, []);

    if(loading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="flex items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="mr-auto"><Skeleton className="h-10 w-36" /></div>
                </div>
                <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-3xl">إدارة المستخدمين</h1>
        <div className="mr-auto">
            <Link href="/admin/users/new">
                <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مستخدم جديد
                </Button>
            </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>عرض وتعديل جميع المستخدمين في النظام.</CardDescription>
        </CardHeader>
        <CardContent>
            {isDesktop ? (
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                        <TableRow>
                            <TableHead>الاسم</TableHead>
                            <TableHead>البريد الإلكتروني</TableHead>
                            <TableHead>الدور</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="even:bg-muted/40">
                            <TableCell className="font-medium">
                                <Link href={`/admin/users/${user.id}`} className="hover:underline">
                                    {user.name}
                                </Link>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'مسؤول' : 'مستخدم'}</Badge>
                            </TableCell>
                            <TableCell className="text-left">
                                <UserActions user={user} />
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid gap-4">
                    {users.map((user) => (
                         <Card key={user.id}>
                            <CardHeader>
                                 <div className="flex justify-between items-start gap-4">
                                     <div>
                                        <CardTitle className="text-base">{user.name}</CardTitle>
                                        <CardDescription>{user.email}</CardDescription>
                                     </div>
                                     <UserActions user={user} />
                                 </div>
                            </CardHeader>
                            <CardContent>
                                 <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'مسؤول' : 'مستخدم'}</Badge>
                            </CardContent>
                             <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/admin/users/${user.id}`}>
                                        <Eye className="h-4 w-4 ml-2" />
                                        عرض التفاصيل
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
