
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, LocateFixed } from "lucide-react";
import React, { useState, useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

interface MapSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

const DEFAULT_MAP_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102919.23126322045!2d37.09116744869384!3d36.202113300000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15255853d9943485%3A0x95cf94f86153e0a3!2sAleppo%2C%20Syria!5e0!3m2!1sen!2sae!4v1766020584288!5m2!1sen!2sae"

export function MapSelector({ value, onChange }: MapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [mapSrc, setMapSrc] = useState(DEFAULT_MAP_SRC);
  const { toast } = useToast();
  const [isLocating, startLocatingTransition] = useTransition();


  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        setLink(parsed.link || '');
        setNotes(parsed.notes || '');
      } catch {
        // If not a JSON, assume it's a legacy string address
        setLink('');
        setNotes(value);
      }
    } else {
        setLink('');
        setNotes('');
    }
  }, [value]);

  const handleSave = () => {
    const addressObject = { link, notes };
    onChange(JSON.stringify(addressObject));
    setIsOpen(false);
  };

  const handleGetCurrentLocation = () => {
    startLocatingTransition(() => {
        if (!navigator.geolocation) {
        toast({
            variant: "destructive",
            title: "غير مدعوم",
            description: "خاصية تحديد المواقع غير مدعومة في متصفحك.",
        });
        return;
        }

        navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const embedMapLink = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=ar&z=14&output=embed`;
            
            setLink(googleMapsLink);
            setMapSrc(embedMapLink);

            toast({
            title: "تم تحديد الموقع بنجاح!",
            description: "تم تحديث الخريطة والرابط بموقعك الحالي.",
            });
        },
        (error) => {
            let errorMessage = "حدث خطأ أثناء تحديد الموقع.";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "لقد رفضت طلب الوصول إلى موقعك.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "معلومات الموقع غير متاحة.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "انتهت مهلة طلب تحديد الموقع.";
                    break;
            }
            toast({
            variant: "destructive",
            title: "خطأ في تحديد الموقع",
            description: errorMessage,
            });
        }
        );
    });
  };
  
  const displayValue = notes ? `${notes.substring(0, 30)}...` : link ? 'تم تحديد الموقع' : 'لم يتم التحديد';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
            <MapPin className="ml-2 h-4 w-4" />
            <span className="truncate">{displayValue}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تحديد موقع التوصيل</DialogTitle>
          <DialogDescription>
            استخدم الخريطة للعثور على موقعك، ثم قم بنسخ الرابط ولصقه، أو استخدم زر تحديد الموقع الحالي.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="relative h-64 w-full rounded-lg overflow-hidden border">
                <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title="Google Maps"
                    key={mapSrc}
                ></iframe>
            </div>
             <Button variant="outline" className="w-full" onClick={handleGetCurrentLocation} disabled={isLocating}>
                <LocateFixed className="ml-2 h-4 w-4" />
                {isLocating ? 'جاري تحديد الموقع...' : 'تحديد موقعي الحالي'}
            </Button>
            <div className="space-y-2">
                <Label htmlFor="map-link">رابط خرائط جوجل</Label>
                <Input
                id="map-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                dir="ltr"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="map-notes">ملاحظات العنوان</Label>
                <Textarea
                id="map-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: المبنى رقم 5، الطابق الثاني، بجانب المسجد"
                />
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button type="button" onClick={handleSave}>حفظ الموقع</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
