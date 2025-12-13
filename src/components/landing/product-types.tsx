
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppWindow, DoorOpen, Warehouse, Building2 } from "lucide-react";
import { motion } from 'framer-motion';

const productTypes = [
  {
    icon: <AppWindow className="w-10 h-10 text-primary" />,
    title: "أباجور شبابيك",
    description: "حماية وأناقة لنوافذ منزلك، مع تحكم كامل في الإضاءة والخصوصية.",
  },
  {
    icon: <DoorOpen className="w-10 h-10 text-primary" />,
    title: "أباجور أبواب",
    description: "أمان إضافي لمداخل منزلك ومحلك التجاري بتصاميم عصرية ومتينة.",
  },
  {
    icon: <Warehouse className="w-10 h-10 text-primary" />,
    title: "أباجور للمستودعات",
    description: "حلول عملية وقوية لحماية مستودعاتك ومخازنك من العوامل الخارجية والسرقة.",
  },
  {
    icon: <Building2 className="w-10 h-10 text-primary" />,
    title: "أباجور صناعية",
    description: "أباجورات ذات قدرة تحمل عالية مصممة خصيصًا للمصانع والمنشآت الصناعية الكبيرة.",
  },
];

export function ProductTypes() {
  return (
    <section id="product-types" className="py-20 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">أنواع الأباجور المتوفرة</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            نوفر حلولاً متنوعة تناسب جميع احتياجاتك، من المنازل إلى المنشآت الصناعية.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productTypes.map((type, index) => (
             <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
             >
                <Card className="text-center h-full shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 transform">
                <CardHeader className="items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        {type.icon}
                    </div>
                    <CardTitle>{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{type.description}</p>
                </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
