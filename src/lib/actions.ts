"use server";

import type { Trip, ItineraryItem } from '@/types/itinerary';
import { summarizeItinerary } from '@/ai/flows/summarize-itinerary';
import { format, parseISO } from 'date-fns';

function formatItemToString(item: ItineraryItem): string {
  let itemStr = `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${item.title}`;
  if (item.startTime) {
    try {
      itemStr += ` (Starts: ${format(parseISO(item.startTime), "MMM dd, yyyy 'at' h:mm a")}`;
      if (item.endTime) {
        itemStr += ` - Ends: ${format(parseISO(item.endTime), "MMM dd, yyyy 'at' h:mm a")}`;
      }
      itemStr += ")";
    } catch (e) {
      // Handle invalid date string if necessary, though form validation should prevent this
      itemStr += ` (Time: unparseable)`;
    }
  }
  if (item.location) itemStr += ` at ${item.location}`;
  if (item.description) itemStr += `. Description: ${item.description}`;
  
  if (item.details) {
    const detailsParts: string[] = [];
    if (item.details.confirmationNumber) detailsParts.push(`Conf#: ${item.details.confirmationNumber}`);
    if (item.details.airline) detailsParts.push(`Airline: ${item.details.airline}`);
    if (item.details.flightNumber) detailsParts.push(`Flight#: ${item.details.flightNumber}`);
    if (item.details.address) detailsParts.push(`Address: ${item.details.address}`);
    if (item.details.notes) detailsParts.push(`Item Notes: ${item.details.notes}`);
    // Add more relevant details based on type if needed
    if (detailsParts.length > 0) itemStr += `. Details: ${detailsParts.join(', ')}`;
  }
  return itemStr;
}

export async function getItinerarySummary(trip: Trip): Promise<string> {
  if (!trip) {
    throw new Error("Trip data is required for summarization.");
  }

  let itineraryDetailsString = `Trip to ${trip.destination} from ${format(parseISO(trip.startDate), "MMM dd, yyyy")} to ${format(parseISO(trip.endDate), "MMM dd, yyyy")}.\n`;
  if (trip.notes) {
    itineraryDetailsString += `Overall trip notes: ${trip.notes}\n`;
  }
  itineraryDetailsString += "\nItinerary Items:\n";

  if (trip.items && trip.items.length > 0) {
    trip.items.forEach(item => {
      itineraryDetailsString += `- ${formatItemToString(item)}\n`;
    });
  } else {
    itineraryDetailsString += "No specific items listed for this trip.\n";
  }

  try {
    const result = await summarizeItinerary({ itineraryDetails: itineraryDetailsString });
    return result.narrativeSummary;
  } catch (error) {
    console.error("Error summarizing itinerary:", error);
    // Provide a more user-friendly error or re-throw a custom error
    if (error instanceof Error && error.message.includes('quota')) {
         throw new Error("AI summarization quota exceeded. Please try again later.");
    }
    throw new Error("Failed to generate itinerary summary due to an unexpected issue.");
  }
}
