
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trip-card';
import type { Trip } from '@/types/itinerary';
import { getAllTrips, deleteTrip as deleteTripFromStorage } from '@/lib/storage';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const fetchedTrips = await getAllTrips();
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        toast({
          title: "Error",
          description: "Could not load trips. Please check your connection or Firebase setup.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    // Ensure this runs client-side and Firebase is configured
     if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        fetchTrips();
    } else if (typeof window !== 'undefined') {
        // Handle case where Firebase might not be configured yet
        toast({
          title: "Configuration Needed",
          description: "Firebase is not configured. Please set up your .env file.",
          variant: "destructive",
        });
        setIsLoading(false);
    }
  }, [toast]);

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await deleteTripFromStorage(tripId);
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      toast({ title: "Trip Deleted", description: "The trip has been removed." });
    } catch (error) {
      console.error("Failed to delete trip:", error);
      toast({
        title: "Error",
        description: "Could not delete trip.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold tracking-tight">My Trips</h2>
        <Link href="/trips/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Trip
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-foreground">No trips yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new trip.
          </p>
          <div className="mt-6">
            <Link href="/trips/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Trip
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex justify-between p-6 bg-muted/50 border-t">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
