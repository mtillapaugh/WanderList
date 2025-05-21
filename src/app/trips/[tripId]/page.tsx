
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Trip, ItineraryItem } from '@/types/itinerary';
import { getTripById, saveTrip, addItineraryItem, updateItineraryItem, deleteItineraryItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import TripForm from '@/components/trip-form';
import ItineraryItemForm, { type ItineraryItemFormValues } from '@/components/itinerary-item-form';
import ItineraryTimeline from '@/components/itinerary-timeline';
import SummarizeButton from '@/components/summarize-button';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Edit, PlusCircle, ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTripFormOpen, setIsTripFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const fetchTrip = useCallback(() => {
    if (tripId && typeof window !== 'undefined') { // Ensure window is defined for localStorage
      const currentTrip = getTripById(tripId);
      if (currentTrip) {
        setTrip(currentTrip);
      } else {
        toast({ title: "Error", description: "Trip not found.", variant: "destructive" });
        router.push('/'); 
      }
      setIsLoading(false);
    }
  }, [tripId, router, toast]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const handleTripFormSubmit = (data: any) => { // data type from TripFormValues
    if (!trip) return;
    try {
      const updatedTripData = {
        ...trip,
        destination: data.destination,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        notes: data.notes,
        imageUrl: data.imageUrl || trip.imageUrl || `https://placehold.co/1200x400.png?text=${encodeURIComponent(data.destination)}`,
      };
      saveTrip(updatedTripData);
      fetchTrip(); 
      setIsTripFormOpen(false);
      toast({ title: "Trip Updated", description: "Your trip details have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Could not update trip.", variant: "destructive" });
    }
  };

  const handleItemFormSubmit = (data: ItineraryItemFormValues) => {
    if (!trip) return;
    try {
      const itemToSave = {
        ...data,
        // startTime and endTime from form are already YYYY-MM-DDTHH:MM or null
      };

      if (editingItem) {
        updateItineraryItem(trip.id, { ...editingItem, ...itemToSave });
        toast({ title: "Item Updated", description: `${data.title} has been updated.` });
      } else {
        addItineraryItem(trip.id, itemToSave as Omit<ItineraryItem, 'id'>);
        toast({ title: "Item Added", description: `${data.title} has been added to your trip.` });
      }
      fetchTrip();
      setIsItemFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({ title: "Error", description: "Could not save item.", variant: "destructive" });
    }
  };

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!trip) return;
    try {
      deleteItineraryItem(trip.id, itemId);
      fetchTrip();
      toast({ title: "Item Deleted", description: "The itinerary item has been removed." });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    }
  };

  if (isLoading || !trip) { // Show skeleton loader if trip is null as well
    return (
       <div className="space-y-6">
        <Skeleton className="h-10 w-32 mb-6" /> {/* Back button skeleton */}
        <div className="animate-pulse">
          <Skeleton className="h-60 md:h-80 w-full rounded-lg mb-8" /> {/* Image skeleton */}
          <div className="bg-card p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-start mb-6">
              <Skeleton className="h-8 w-1/2" /> {/* Trip Details title skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" /> {/* Edit Trip button skeleton */}
                <Skeleton className="h-10 w-36" /> {/* Summarize button skeleton */}
              </div>
            </div>
            <Skeleton className="h-6 w-1/4 mb-2" /> {/* Notes title skeleton */}
            <Skeleton className="h-16 w-full" /> {/* Notes content skeleton */}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/3" /> {/* Itinerary title skeleton */}
            <Skeleton className="h-10 w-32" /> {/* Add Item button skeleton */}
          </div>
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="p-4 border bg-card rounded-lg animate-pulse">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const formattedStartDate = format(parseISO(trip.startDate), 'MMMM do, yyyy');
  const formattedEndDate = format(parseISO(trip.endDate), 'MMMM do, yyyy');

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
      </Button>

      <div className="relative rounded-lg overflow-hidden shadow-xl h-60 md:h-80 mb-8">
        <Image 
            src={trip.imageUrl || `https://placehold.co/1200x400.png?text=${encodeURIComponent(trip.destination)}`}
            alt={trip.destination}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            style={{objectFit:"cover"}}
            priority
            data-ai-hint="destination travel"
            onError={(e) => (e.currentTarget.src = `https://placehold.co/1200x400.png?text=Error`)} // Fallback for broken image URLs
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">{trip.destination}</h1>
            <p className="text-lg text-gray-200 flex items-center gap-2 mt-2 drop-shadow-sm">
                <CalendarDays className="h-5 w-5" /> {formattedStartDate} - {formattedEndDate}
            </p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Trip Details</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setIsTripFormOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Trip
            </Button>
            <SummarizeButton trip={trip} />
          </div>
        </div>
        {trip.notes && (
          <div className="mt-4">
             <h3 className="text-lg font-medium flex items-center gap-2 mb-2"><FileText className="h-5 w-5 text-primary"/>Overall Notes:</h3>
             <p className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-md text-foreground/80">{trip.notes}</p>
          </div>
        )}
         {!trip.notes && <p className="text-sm text-muted-foreground">No overall trip notes added yet.</p>}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Itinerary</h2>
          <Button onClick={() => { setEditingItem(null); setIsItemFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
        <ItineraryTimeline trip={trip} onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
      </div>

      <Dialog open={isTripFormOpen} onOpenChange={setIsTripFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Trip to {trip.destination}</DialogTitle>
            <DialogDescription>Update the details for your trip.</DialogDescription>
          </DialogHeader>
          <TripForm onSubmit={handleTripFormSubmit} initialData={trip} submitButtonText="Save Changes" />
           <DialogClose className="sr-only">Close</DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Itinerary Item</DialogTitle>
            <DialogDescription>
              {editingItem ? `Update details for ${editingItem.title}.` : 'Add a new flight, accommodation, activity, etc.'}
            </DialogDescription>
          </DialogHeader>
          <ItineraryItemForm
            onSubmit={handleItemFormSubmit}
            initialData={editingItem || undefined} // Pass undefined if no initialData
            submitButtonText={editingItem ? "Save Changes" : "Add Item"}
          />
          <DialogClose className="sr-only">Close</DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    