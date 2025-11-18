import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, LayoutList, Rocket, Users } from "lucide-react";

const features = [
    {
        icon: <Calculator className="w-10 h-10 text-primary" />,
        title: "حساب دقيق للأبعاد",
        description: "أدخل عرض الفتحة واحصل على طول وعدد الأكواد المثالي تلقائيًا باستخدام الذكاء الاصطناعي."
    },
    {
        icon: <LayoutList className="w-10 h-10 text-primary" />,
        title: "إدارة طلبات متكاملة",
        description: "أنشئ، تتبع، وعدّل طلباتك وطلبات عملائك من لوحة تحكم واحدة سهلة الاستخدام."
    },
    {
        icon: <Rocket className="w-10 h-10 text-primary" />,
        title: "سرعة في الإنجاز",
        description: "قلل وقت إدخال البيانات والوقوع في الأخطاء مع نظامنا الذكي الذي يسرّع عملية الطلب."
    },
    {
        icon: <Users className="w-10 h-10 text-primary" />,
        title: "سهولة التعامل مع العملاء",
        description: "أنشئ طلبات لعملائك مباشرةً، مع حفظ بياناتهم لتسهيل الطلبات المستقبلية."
    }
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">لماذا تختار نظام طلب أباجور؟</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            نقدم لك الأدوات التي تحتاجها لتبسيط عملك وزيادة إنتاجيتك في مجال تصميم وتركيب الأباجور.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
