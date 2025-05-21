"use client";

import TripForm from "@/components/trip-form";
import { saveTrip } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatISO } from 'date-fns';
import type { TripFormValues } from "@/components/trip-form";

export default function NewTripPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: TripFormValues) => {
    try {
      const newTrip = saveTrip({
        destination: data.destination,
        startDate: formatISO(data.startDate, { representation: 'date' }),
        endDate: formatISO(data.endDate, { representation: 'date' }),
        notes: data.notes,
        imageUrl: data.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(data.destination)}`,
      });
      toast({
        title: "Trip Created!",
        description: `Your trip to ${newTrip.destination} has been saved.`,
      });
      router.push(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error("Failed to save trip:", error);
      toast({
        title: "Error",
        description: "Could not save the trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Create New Trip</h1>
      <TripForm onSubmit={handleSubmit} />
    </div>
  );
}
