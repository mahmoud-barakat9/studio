
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

const projects = [
  {
    before: PlaceHolderImages.find(img => img.id === 'project-before-1'),
    after: PlaceHolderImages.find(img => img.id === 'project-after-1'),
    title: 'تجديد واجهة سكنية',
    description: 'تم استبدال الأباجورات القديمة بأخرى حديثة من الألمنيوم، مما أضفى لمسة عصرية وحماية فائقة.',
  },
  {
    before: PlaceHolderImages.find(img => img.id === 'project-before-2'),
    after: PlaceHolderImages.find(img => img.id === 'project-after-2'),
    title: 'تركيب باب مستودع',
    description: 'تم تركيب باب أباجور صناعي متين لتأمين المستودع وتسهيل عملية الدخول والخروج.',
  },
  {
    before: PlaceHolderImages.find(img => img.id === 'project-before-3'),
    after: PlaceHolderImages.find(img => img.id === 'project-after-3'),
    title: 'تجهيز فيلا جديدة',
    description: 'تم تزويد الفيلا بأباجورات أنيقة لجميع النوافذ لتحقيق الخصوصية والتحكم في الإضاءة.',
  },
];

const ImageCard = ({ image, label }: { image: any; label: string }) => (
  <div className="relative overflow-hidden rounded-lg shadow-lg group">
    <Image
      src={image.imageUrl}
      alt={image.description}
      width={600}
      height={400}
      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
      data-ai-hint={image.imageHint}
    />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
    <Badge
      variant={label === 'قبل' ? 'destructive' : 'default'}
      className="absolute top-3 right-3 text-lg"
    >
      {label}
    </Badge>
  </div>
);

export function Projects() {
  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">من أعمالنا ومشاريعنا المنفذة</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            الصور تبيع أكثر من الكلام. شاهد بنفسك جودة أعمالنا وتأثيرها قبل وبعد التنفيذ.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            project.before && project.after && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <CardContent className="p-0 flex-grow">
                    <div className="grid grid-cols-2">
                      <ImageCard image={project.after} label="بعد" />
                      <ImageCard image={project.before} label="قبل" />
                    </div>
                     <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
