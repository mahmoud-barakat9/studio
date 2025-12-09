
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
import { MapPin } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface MapSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function MapSelector({ value, onChange }: MapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

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
            الرجاء لصق رابط الموقع من خرائط جوجل وإضافة أي ملاحظات إضافية.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                <Image 
                    src="https://picsum.photos/seed/map/800/400" 
                    alt="Map placeholder"
                    fill
                    className="object-cover"
                    data-ai-hint="world map"
                />
                 <div className="absolute inset-0 bg-primary/10" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="map-link">رابط خرائط جوجل</Label>
                <Input
                id="map-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
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
