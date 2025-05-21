"use client";

import type { Trip } from '@/types/itinerary';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const formattedStartDate = format(new Date(trip.startDate), 'MMM dd, yyyy');
  const formattedEndDate = format(new Date(trip.endDate), 'MMM dd, yyyy');

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={trip.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(trip.destination)}`}
            alt={trip.destination}
            fill // Changed from layout="fill"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Added for responsive images with fill
            style={{objectFit: "cover"}} // Changed from objectFit="cover"
            data-ai-hint="travel landscape"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-2xl font-semibold mb-2">{trip.destination}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-muted-foreground mb-4">
          <CalendarDays className="h-4 w-4" />
          {formattedStartDate} - {formattedEndDate}
        </CardDescription>
        {trip.notes && (
          <p className="text-sm text-foreground/80 line-clamp-2">{trip.notes}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
        <Link href={`/trips/${trip.id}`} passHref>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your trip
                to {trip.destination}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(trip.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
