'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const ImageCard = ({ image, label, onClick }: { image: any; label: string; onClick: () => void }) => (
  <div 
    className="relative overflow-hidden rounded-lg shadow-lg group aspect-[4/3] cursor-pointer"
    onClick={onClick}
  >
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
      className="absolute top-3 right-3 text-sm md:text-lg"
    >
      {label}
    </Badge>
  </div>
);

export function Projects() {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; description: string } | null>(null);

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">من أعمالنا ومشاريعنا المنفذة</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            الصور تبيع أكثر من الكلام. شاهد بنفسك جودة أعمالنا وتأثيرها قبل وبعد التنفيذ.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            project.before && project.after && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col shadow-xl hover:shadow-2xl transition-shadow border-none">
                  <CardContent className="p-4 flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <ImageCard 
                        image={project.after} 
                        label="بعد" 
                        onClick={() => setSelectedImage({ url: project.after!.imageUrl, title: project.title, description: 'بعد التنفيذ' })}
                      />
                      <ImageCard 
                        image={project.before} 
                        label="قبل" 
                        onClick={() => setSelectedImage({ url: project.before!.imageUrl, title: project.title, description: 'قبل التنفيذ' })}
                      />
                    </div>
                     <div className="pt-2">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          {selectedImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <div className="bg-black/80 p-2 rounded-t-lg w-full text-center text-white">
                <h3 className="font-bold">{selectedImage.title}</h3>
                <p className="text-xs opacity-80">{selectedImage.description}</p>
              </div>
              <div className="relative w-full aspect-[4/3] max-h-[80vh]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}