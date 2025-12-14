
import { WelcomeFooter } from "@/components/landing/welcome-footer";
import { WelcomeHeader } from "@/components/landing/welcome-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WelcomeHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">سياسة الخصوصية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>

                    <h2 className="text-xl font-semibold text-foreground">مقدمة</h2>
                    <p>
                    نحن في "طلب أباجور" نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لتطبيقنا وخدماتنا.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">المعلومات التي نجمعها</h2>
                    <p>
                    قد نجمع المعلومات التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li><strong>المعلومات الشخصية:</strong> مثل الاسم، وعنوان البريد الإلكتروني، ورقم الهاتف التي تقدمها عند إنشاء حساب.</li>
                        <li><strong>معلومات الطلبات:</strong> تفاصيل الطلبات التي تقوم بإنشائها، بما في ذلك المواصفات والأبعاد والعناوين.</li>
                        <li><strong>بيانات الاستخدام:</strong> معلومات حول كيفية تفاعلك مع تطبيقنا، مثل الصفحات التي تزورها والميزات التي تستخدمها.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-foreground">كيف نستخدم معلوماتك</h2>
                    <p>
                    نستخدم المعلومات التي نجمعها من أجل:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>توفير وتحسين خدماتنا وإدارة طلباتك.</li>
                        <li>التواصل معك بخصوص طلباتك أو أي تحديثات على خدماتنا.</li>
                        <li>تخصيص تجربتك داخل التطبيق.</li>
                        <li>تحليل استخدام التطبيق لتحسين أدائه وتطوير ميزات جديدة.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-foreground">أمان البيانات</h2>
                    <p>
                    نحن نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف أو الإتلاف. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.
                    </p>

                     <h2 className="text-xl font-semibold text-foreground">التغييرات على سياسة الخصوصية</h2>
                    <p>
                    قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
      <WelcomeFooter />
    </div>
  );
}
