
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

const profileSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب."),
  email: z.string().email("بريد إلكتروني غير صالح."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    toast({
      title: "تم تحديث الملف الشخصي!",
      description: "تم حفظ معلوماتك الجديدة بنجاح (محاكاة).",
    });
  }

  return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <main className="flex-1 bg-muted/40 p-4 md:p-8">
             <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                    <CardTitle>الملف الشخصي</CardTitle>
                    <CardDescription>
                        قم بإدارة معلومات حسابك وتفضيلاتك.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.email}`} />
                                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" type="button">تغيير الصورة</Button>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>الاسم</FormLabel>
                                <FormControl>
                                <Input placeholder="اسمك الكامل" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>البريد الإلكتروني</FormLabel>
                                <FormControl>
                                <Input placeholder="m@example.com" {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit">حفظ التغييرات</Button>
                            </CardFooter>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>
        </main>
        <MainFooter />
        <BottomNavbar />
      </div>
  );
}
