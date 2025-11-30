
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

const profileSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب."),
  email: z.string().email("بريد إلكتروني غير صالح."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "مسؤول",
      email: "admin@abjour.com",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    toast({
      title: "تم تحديث الملف الشخصي!",
      description: "تم حفظ معلوماتك الجديدة بنجاح.",
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card className="max-w-2xl">
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
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Button variant="outline">تغيير الصورة</Button>
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
                      <Input placeholder="m@example.com" {...field} />
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
    </main>
  );
}
