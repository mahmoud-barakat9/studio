
import { ShieldCheck, Award, Wrench } from 'lucide-react';

const trustElements = [
    {
        icon: <Award className="w-12 h-12 text-primary" />,
        title: "مواد عالية الجودة",
        description: "نستخدم أفضل أنواع الألمنيوم والمواد المستوردة لضمان المتانة والأداء الطويل الأمد.",
    },
    {
        icon: <ShieldCheck className="w-12 h-12 text-primary" />,
        title: "ضمان على التصنيع والتركيب",
        description: "نقدم ضمانًا شاملًا على جودة التصنيع وعملية التركيب لتنعم براحة البال.",
    },
    {
        icon: <Wrench className="w-12 h-12 text-primary" />,
        title: "خبرة تمتد لسنوات",
        description: "فريقنا يمتلك خبرة واسعة في مجال الأباجورات، مما يضمن لك الحصول على أفضل الحلول.",
    },
]

export function Trust() {
  return (
    <section id="trust" className="py-20 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">ضمان وثقة</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            نلتزم بتقديم أعلى مستويات الجودة والاحترافية في كل مشروع.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {trustElements.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
