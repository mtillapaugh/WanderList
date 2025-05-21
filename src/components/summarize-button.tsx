"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import type { Trip } from '@/types/itinerary';
import { getItinerarySummary } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface SummarizeButtonProps {
  trip: Trip;
}

export default function SummarizeButton({ trip }: SummarizeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await getItinerarySummary(trip);
      setSummary(result);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization Failed",
        description: (error as Error).message || "Could not generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleSummarize} disabled={isLoading} variant="outline">
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? 'Summarizing...' : 'Get AI Summary'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Itinerary Summary for {trip.destination}</DialogTitle>
            <DialogDescription>
              Here's an AI-generated narrative summary of your trip.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(70vh-150px)] my-4 p-1 rounded-md border">
            <p className="text-sm whitespace-pre-wrap p-3">{summary || "No summary generated."}</p>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
