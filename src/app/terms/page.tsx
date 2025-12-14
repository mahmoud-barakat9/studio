
import { WelcomeFooter } from "@/components/landing/welcome-footer";
import { WelcomeHeader } from "@/components/landing/welcome-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WelcomeHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">شروط الخدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>

                    <h2 className="text-xl font-semibold text-foreground">1. الموافقة على الشروط</h2>
                    <p>
                    باستخدامك لتطبيق "طلب أباجور" (المشار إليه فيما يلي بـ "الخدمة")، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الخدمة.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">2. استخدام الخدمة</h2>
                    <p>
                    يجب عليك استخدام الخدمة بطريقة قانونية ومناسبة. أنت مسؤول عن أي نشاط يحدث عبر حسابك. يُمنع استخدام الخدمة لأي أغراض غير قانونية أو غير مصرح بها.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">3. الحسابات</h2>
                    <p>
                    عند إنشاء حساب معنا، يجب عليك تزويدنا بمعلومات دقيقة وكاملة وحديثة. إن عدم القيام بذلك يشكل خرقًا للشروط، مما قد يؤدي إلى إنهاء حسابك على خدمتنا فورًا.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">4. الملكية الفكرية</h2>
                    <p>
                    الخدمة ومحتواها الأصلي وميزاتها ووظائفها هي وستبقى ملكية حصرية لـ "طلب أباجور" ومرخصيها.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">5. إنهاء الخدمة</h2>
                    <p>
                    يجوز لنا إنهاء أو تعليق حسابك فورًا، دون إشعار مسبق أو مسؤولية، لأي سبب من الأسباب، بما في ذلك على سبيل المثال لا الحصر إذا انتهكت الشروط.
                    </p>

                     <h2 className="text-xl font-semibold text-foreground">6. تحديد المسؤولية</h2>
                    <p>
                    لن نكون مسؤولين بأي حال من الأحوال عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو جزائية، تنشأ عن استخدامك للخدمة.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
      <WelcomeFooter />
    </div>
  );
}
