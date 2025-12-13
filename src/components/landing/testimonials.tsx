
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "محمد الأحمد",
    title: "صاحب فيلا",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    rating: 5,
    quote: "جودة ممتازة والتسليم كان أسرع من المتوقع. فريق العمل محترف وأنصح بهم بشدة.",
  },
  {
    name: "سارة عبدالله",
    title: "مهندسة ديكور",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    rating: 5,
    quote: "أعتمد عليهم في جميع مشاريعي. المواد عالية الجودة والخيارات متنوعة، مما يسهل عليّ إرضاء عملائي.",
  },
  {
    name: "خالد المصري",
    title: "صاحب شركة",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
    rating: 4,
    quote: "خدمة جيدة وأسعار تنافسية. كان هناك تأخير بسيط في التركيب ولكن النتيجة النهائية كانت مرضية جدًا.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">شهادات عملائنا</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            نفخر بثقة عملائنا، وهذه بعض آرائهم في خدماتنا.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-14 w-14 ml-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <blockquote className="text-foreground/80 italic border-r-4 border-primary pr-4">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
