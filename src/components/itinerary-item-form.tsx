
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ItineraryItem, ItineraryItemType } from "@/types/itinerary";
import { ITINERARY_ITEM_TYPES } from "@/types/itinerary";
import { Save } from "lucide-react";
import ItineraryItemFormFields from "./itinerary-item-form-fields";
// Removed ScrollArea import as it's no longer used here

// Helper to validate ISO-like date strings (YYYY-MM-DDTHH:MM) or allow null/empty
const optionalIsoDateTimeString = z.string().refine(val => {
  if (val === null || val === undefined || val === '') return true;
  // Regex for YYYY-MM-DDTHH:MM
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val);
}, { message: "Invalid date/time format. Use YYYY-MM-DDTHH:MM or leave empty." }).nullable().optional();


const itineraryItemFormSchema = z.object({
  type: z.custom<ItineraryItemType>((val) => ITINERARY_ITEM_TYPES.includes(val as ItineraryItemType), {
    message: "Invalid item type",
  }),
  title: z.string().min(2, "Title must be at least 2 characters."),
  startTime: optionalIsoDateTimeString,
  endTime: optionalIsoDateTimeString,
  location: z.string().optional(),
  description: z.string().optional(),
  details: z.object({
    confirmationNumber: z.string().optional(),
    notes: z.string().optional(),
    flightNumber: z.string().optional(),
    airline: z.string().optional(),
    departureAirport: z.string().optional(),
    arrivalAirport: z.string().optional(),
    address: z.string().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    company: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    pickupTime: z.string().optional(),
    dropoffTime: z.string().optional(),
    provider: z.string().optional(),
  }).optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    try {
      return new Date(data.endTime) >= new Date(data.startTime);
    } catch (e) { return true; } 
  }
  return true;
}, {
  message: "End time cannot be before start time.",
  path: ["endTime"],
});


export type ItineraryItemFormValues = z.infer<typeof itineraryItemFormSchema>;

interface ItineraryItemFormProps {
  onSubmit: (data: ItineraryItemFormValues) => void;
  initialData?: Partial<ItineraryItem>;
  submitButtonText?: string;
}

export default function ItineraryItemForm({
  onSubmit,
  initialData,
  submitButtonText = "Save Item",
}: ItineraryItemFormProps) {
  const form = useForm<ItineraryItemFormValues>({
    resolver: zodResolver(itineraryItemFormSchema),
    defaultValues: {
      type: initialData?.type || ITINERARY_ITEM_TYPES[0],
      title: initialData?.title || "",
      startTime: initialData?.startTime ? initialData.startTime.slice(0,16) : null, // Format for datetime-local
      endTime: initialData?.endTime ? initialData.endTime.slice(0,16) : null, // Format for datetime-local
      location: initialData?.location || "",
      description: initialData?.description || "",
      details: initialData?.details || {},
    },
  });

  const selectedItemType = form.watch("type");

  const handleSubmit = (values: ItineraryItemFormValues) => {
    // Values from datetime-local are already YYYY-MM-DDTHH:MM if not empty
    onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ScrollArea removed, content will flow normally and DialogContent will handle scrolling */}
        <div className="space-y-6 pb-1"> {/* Adjusted padding, pr-4 removed */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ITINERARY_ITEM_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title / Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Flight to Paris, Eiffel Tower Visit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value || ''} // Handle null/undefined for input value
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value || ''} // Handle null/undefined for input value
                      min={form.getValues("startTime") || undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Charles de Gaulle Airport, Louvre Museum" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief overview or notes about this item..." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <h3 className="text-lg font-medium pt-4 border-t">Additional Details</h3>
          <ItineraryItemFormFields control={form.control} itemType={selectedItemType} />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <Save className="mr-2 h-4 w-4" /> {form.formState.isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}

    