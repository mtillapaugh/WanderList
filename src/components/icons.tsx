import type { ItineraryItemType } from '@/types/itinerary';
import { Plane, BedDouble, ClipboardList, CarFront, StickyNote, LucideIcon } from 'lucide-react';

interface IconMap {
  [key: string]: LucideIcon;
}

const iconMap: IconMap = {
  flight: Plane,
  accommodation: BedDouble,
  activity: ClipboardList,
  rental_car: CarFront,
  note: StickyNote,
};

export function getItineraryItemIcon(type: ItineraryItemType): LucideIcon {
  return iconMap[type] || StickyNote; // Default to StickyNote if type is unknown
}
