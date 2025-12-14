
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">تواصل سريع</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                لديك سؤال؟ تواصل معنا مباشرة عبر واتساب أو الهاتف، أو املأ النموذج السريع.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-green-500" />
                            تواصل عبر واتساب
                        </CardTitle>
                        <CardDescription>اضغط على الزر لبدء محادثة مباشرة معنا على واتساب.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                            <a href="https://wa.me/963123456789" target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="ml-2" />
                                إرسال رسالة واتساب
                            </a>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Phone className="w-8 h-8 text-primary" />
                            اتصال هاتفي مباشر
                        </CardTitle>
                        <CardDescription>تفضل بالاتصال بنا مباشرة على الرقم الموضح أدناه.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full text-lg font-bold" dir="ltr">
                            <a href="tel:+963123456789">
                                +963 123 456 789
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>نموذج طلب سريع</CardTitle>
                        <CardDescription>املأ النموذج أدناه وسنعاود الاتصال بك في أقرب وقت ممكن.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">الاسم الكامل</Label>
                                    <Input id="name" placeholder="مثال: أحمد علي" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone-form">رقم الهاتف</Label>
                                    <Input id="phone-form" type="tel" placeholder="963123456789" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">الموضوع</Label>
                                <Input id="subject" placeholder="مثال: استفسار عن أبجور صناعي" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">رسالتك</Label>
                                <Textarea id="message" placeholder="اكتب تفاصيل طلبك أو استفسارك هنا..." />
                            </div>
                            <Button type="submit" className="w-full">إرسال الرسالة</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </section>
  );
}
