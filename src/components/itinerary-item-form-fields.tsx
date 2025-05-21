"use client";

import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ItineraryItemType } from "@/types/itinerary";

interface ItineraryItemFormFieldsProps {
  control: Control<any>; // Control from react-hook-form
  itemType: ItineraryItemType | undefined;
}

export default function ItineraryItemFormFields({ control, itemType }: ItineraryItemFormFieldsProps) {
  if (!itemType) return null;

  return (
    <>
      {/* Common Details */}
      <FormField
        control={control}
        name="details.confirmationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmation Number (Optional)</FormLabel>
            <FormControl><Input placeholder="e.g., XYZ123" {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="details.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specific Item Notes (Optional)</FormLabel>
            <FormControl><Textarea placeholder="Any specific notes for this item..." {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Flight Specific Fields */}
      {itemType === 'flight' && (
        <>
          <FormField
            control={control}
            name="details.airline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Airline (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., Wander Airlines" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.flightNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Number (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., WA456" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.departureAirport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Airport (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., JFK" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.arrivalAirport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrival Airport (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., LHR" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Accommodation Specific Fields */}
      {itemType === 'accommodation' && (
        <>
          <FormField
            control={control}
            name="details.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., 123 Main St, Anytown" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.checkInTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Time (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., 3:00 PM or 2024-10-20T15:00" {...field} value={field.value || ''} /></FormControl>
                <FormDescription>Can be just a time, or a full date & time if different from item start time.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.checkOutTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Time (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., 11:00 AM or 2024-10-25T11:00" {...field} value={field.value || ''} /></FormControl>
                 <FormDescription>Can be just a time, or a full date & time if different from item end time.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Rental Car Specific Fields */}
      {itemType === 'rental_car' && (
        <>
          <FormField
            control={control}
            name="details.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Company (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., WanderWheels" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pick-up Location (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., Airport Terminal 1" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={control}
            name="details.pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pick-up Time (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., 10:00 AM" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.dropoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drop-off Location (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., Downtown Office" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="details.dropoffTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drop-off Time (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., 5:00 PM" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      
      {/* Activity Specific Fields */}
      {itemType === 'activity' && (
        <>
          <FormField
            control={control}
            name="details.provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Provider/Organizer (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., City Tours Inc." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}
