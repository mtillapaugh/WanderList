"use client";

import type { ItineraryItem, Trip } from "@/types/itinerary";
import ItineraryItemCard from "./itinerary-item-card";
import { format, parseISO, startOfDay } from 'date-fns'; // Removed isEqual as it's not used

interface ItineraryTimelineProps {
  trip: Trip;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

interface GroupedItems {
  [dateKey: string]: ItineraryItem[];
}

export default function ItineraryTimeline({ trip, onEditItem, onDeleteItem }: ItineraryTimelineProps) {
  if (!trip.items || trip.items.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
        <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6m8-9.228c.294-.103.604-.17.928-.195M8.772 3.772A9.001 9.001 0 006 12m0 0a9.001 9.001 0 0012 0M6 12a9.001 9.001 0 011.772-5.228M15.228 20.228A9.001 9.001 0 0118 12m0 0a9.001 9.001 0 01-12 0m12 0a9.001 9.001 0 00-1.772 5.228" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-foreground">No itinerary items yet.</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add flights, accommodations, or activities to your trip.</p>
      </div>
    );
  }

  const groupedItems = trip.items.reduce((acc: GroupedItems, item) => {
    const dateKey = item.startTime ? format(startOfDay(parseISO(item.startTime)), 'yyyy-MM-dd') : 'unscheduled';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item); // Items are already sorted by storage functions
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'unscheduled') return 1; // Push 'unscheduled' to the end
    if (b === 'unscheduled') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="space-y-8">
      {sortedDateKeys.map(dateKey => (
        <div key={dateKey} className="relative pl-8"> {/* Add padding for timeline line */}
          {/* Timeline line */}
          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-border"></div>
          {/* Date marker */}
          <div className="absolute left-0 top-1.5 transform -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-4 border-background"></div>
          
          <h3 className="text-xl font-semibold mb-6 text-primary ml-[-0.25rem]"> {/* Adjust margin for alignment */}
            {dateKey === 'unscheduled' ? 'Unscheduled Items' : format(parseISO(dateKey), 'EEEE, MMMM do, yyyy')}
          </h3>
          <div className="space-y-4">
            {groupedItems[dateKey].map(item => (
              <ItineraryItemCard
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
