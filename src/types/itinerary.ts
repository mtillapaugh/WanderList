export type ItineraryItemType = 'flight' | 'accommodation' | 'activity' | 'rental_car' | 'note';

export const ITINERARY_ITEM_TYPES: ItineraryItemType[] = ['flight', 'accommodation', 'activity', 'rental_car', 'note'];

export interface ItineraryItemDetails {
  confirmationNumber?: string;
  notes?: string; // Specific notes for this item, different from ItineraryItem.description
  // Flight specific
  flightNumber?: string;
  airline?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  // Accommodation specific
  address?: string;
  checkInTime?: string; // Can be just time, or full datetime if different from item startTime
  checkOutTime?: string; // Can be just time, or full datetime if different from item endTime
  // Rental car specific
  company?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string; // Can be just time
  dropoffTime?: string; // Can be just time
  // Activity specific
  provider?: string; 
}

export interface ItineraryItem {
  id: string; // UUID
  type: ItineraryItemType;
  title: string;
  startTime?: string | null; // ISO string (YYYY-MM-DDTHH:mm)
  endTime?: string | null;   // ISO string (YYYY-MM-DDTHH:mm)
  location?: string;
  description?: string; // General description or overview
  details?: ItineraryItemDetails;
}

export interface Trip {
  id: string; // UUID
  destination: string;
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string;   // ISO string (YYYY-MM-DD)
  notes?: string; // Overall trip notes
  imageUrl?: string; // Optional image for the trip
  items: ItineraryItem[];
}
