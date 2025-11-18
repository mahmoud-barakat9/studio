import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-muted/40">
      <div className="container">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">تواصل معنا</CardTitle>
                <CardDescription>هل لديك سؤال أو استفسار؟ املأ النموذج أدناه وسنعاود الاتصال بك.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">الاسم الكامل</Label>
                            <Input id="name" placeholder="مثال: أحمد علي" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" type="email" placeholder="m@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">الموضوع</Label>
                        <Input id="subject" placeholder="مثال: استفسار عن ميزة" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="message">رسالتك</Label>
                        <Textarea id="message" placeholder="اكتب رسالتك هنا..." />
                    </div>
                    <Button type="submit" className="w-full">إرسال الرسالة</Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </section>
  );
}
