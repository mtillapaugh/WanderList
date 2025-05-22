
"use client"; // Keep this for potential client-side utility, though Firestore ops are server-friendly

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  // where, // If we add user-specific queries later
} from 'firebase/firestore';
import type { Trip, ItineraryItem, ItineraryItemDetails } from '@/types/itinerary';

const TRIPS_COLLECTION = 'trips';

// Helper to convert Firestore Timestamps to client-friendly ISO strings
const processTimestampsForTrip = (tripData: Omit<Trip, 'id'> & { id: string }): Trip => {
  const trip: Trip = { ...tripData, items: tripData.items || [] };

  if (trip.startDate && typeof trip.startDate === 'string' && trip.startDate.includes('T')) {
    // Already a string, potentially from Firestore emulator or manual entry if not Timestamp
  } else if (trip.startDate && trip.startDate instanceof Timestamp) {
    trip.startDate = trip.startDate.toDate().toISOString().split('T')[0]!;
  }

  if (trip.endDate && typeof trip.endDate === 'string' && trip.endDate.includes('T')) {
    // Already a string
  } else if (trip.endDate && trip.endDate instanceof Timestamp) {
    trip.endDate = trip.endDate.toDate().toISOString().split('T')[0]!;
  }

  trip.items = trip.items.map(item => {
    const processedItem = { ...item }; // Create a new object to avoid modifying the original
    if (item.startTime && item.startTime instanceof Timestamp) {
      const d = item.startTime.toDate();
      processedItem.startTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } else if (item.startTime === undefined || item.startTime === null) {
      processedItem.startTime = null;
    } // If already a string, assume it's correct format or handle as needed

    if (item.endTime && item.endTime instanceof Timestamp) {
      const d = item.endTime.toDate();
      processedItem.endTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } else if (item.endTime === undefined || item.endTime === null) {
      processedItem.endTime = null;
    }
    return processedItem;
  });
  return trip;
};

// Helper to convert a client-side ItineraryItem to Firestore-compatible format
function convertItemToFirestoreFormat(item: ItineraryItem): Record<string, any> {
  const firestoreItem: Record<string, any> = {
    id: item.id,
    type: item.type,
    title: item.title,
  };

  firestoreItem.startTime = item.startTime ? Timestamp.fromDate(new Date(item.startTime)) : null;
  firestoreItem.endTime = item.endTime ? Timestamp.fromDate(new Date(item.endTime)) : null;
  
  // Store empty strings as null for location/description, otherwise the value.
  firestoreItem.location = (item.location && item.location.trim() !== '') ? item.location.trim() : null;
  firestoreItem.description = (item.description && item.description.trim() !== '') ? item.description.trim() : null;

  const detailsToSave: Record<string, any> = {};
  let hasActualDetails = false;
  if (item.details) {
    for (const key of Object.keys(item.details) as Array<keyof ItineraryItemDetails>) {
      const value = item.details[key];
      // Only include the detail if it's not undefined. Null or empty string will be stored as null.
      if (value !== undefined) {
        if (typeof value === 'string' && value.trim() === '') {
          detailsToSave[key] = null; // Convert empty strings in details to null
        } else {
          detailsToSave[key] = value; // Store null as null, actual values as they are
        }
        hasActualDetails = true;
      }
    }
  }
  firestoreItem.details = hasActualDetails ? detailsToSave : null;

  // Final check to prevent any undefined value from slipping through
  for (const prop in firestoreItem) {
    if (firestoreItem[prop] === undefined) {
      firestoreItem[prop] = null;
    }
  }
  if (firestoreItem.details) {
    for (const prop in firestoreItem.details) {
      if (firestoreItem.details[prop] === undefined) {
        firestoreItem.details[prop] = null;
      }
    }
  }

  return firestoreItem;
}

// Helper to sort itinerary items that have Firestore Timestamps for consistent saving
const sortFirestoreItems = (items: any[]): any[] => {
  return items.sort((a, b) => {
    const aTime = a.startTime instanceof Timestamp ? a.startTime.toMillis() : null;
    const bTime = b.startTime instanceof Timestamp ? b.startTime.toMillis() : null;

    if (aTime && bTime) return aTime - bTime;
    if (aTime) return -1; // Items with start time come first
    if (bTime) return 1;
    return 0; // Items without start time (null) remain in their relative order or at the end
  });
};

// Client-side sorter (works on string dates)
const sortItineraryItems = (items: ItineraryItem[]): ItineraryItem[] => {
  return items.sort((a, b) => {
    if (a.startTime && b.startTime) {
      try {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } catch (e) { return 0; } 
    }
    if (a.startTime) return -1; 
    if (b.startTime) return 1;
    return 0; 
  });
};


export async function getAllTrips(): Promise<Trip[]> {
  const tripsQuery = query(collection(db, TRIPS_COLLECTION), orderBy('startDate', 'desc'));
  const querySnapshot = await getDocs(tripsQuery);
  const trips: Trip[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Omit<Trip, 'id'>;
    trips.push(processTimestampsForTrip({ id: docSnap.id, ...data, items: data.items || [] }));
  });
  return trips;
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripDocRef);
  if (tripDoc.exists()) {
    const data = tripDoc.data() as Omit<Trip, 'id'>;
    return processTimestampsForTrip({ id: tripDoc.id, ...data, items: data.items || [] });
  }
  return null;
}

export async function saveTrip(
  tripData: Omit<Trip, 'id' | 'items'> & { id?: string; items?: ItineraryItem[] }
): Promise<Trip> {
  
  const dataToSave: any = {
    destination: tripData.destination,
    startDate: tripData.startDate ? Timestamp.fromDate(new Date(tripData.startDate)) : null,
    endDate: tripData.endDate ? Timestamp.fromDate(new Date(tripData.endDate)) : null,
    notes: (tripData.notes && tripData.notes.trim() !== '') ? tripData.notes.trim() : null,
    imageUrl: tripData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(tripData.destination)}`,
  };

  const clientItems = tripData.items || [];
  const itemsForFirestore = clientItems.map(convertItemToFirestoreFormat);
  dataToSave.items = sortFirestoreItems(itemsForFirestore);

  let newTripId = tripData.id;

  if (tripData.id) { 
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripData.id);
    await updateDoc(tripDocRef, dataToSave); // Pass the whole dataToSave, ID is not part of Firestore doc fields
  } else { 
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), dataToSave);
    newTripId = docRef.id;
  }

  // Return a Trip object consistent with client-side expectations (string dates)
  return {
    id: newTripId!,
    destination: tripData.destination,
    startDate: tripData.startDate, 
    endDate: tripData.endDate,     
    notes: tripData.notes,
    imageUrl: dataToSave.imageUrl, 
    items: clientItems, // Return the original client items with string dates
  };
}

export async function deleteTrip(tripId: string): Promise<void> {
  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(tripDocRef);
}

export async function addItineraryItem(tripId: string, itemData: Omit<ItineraryItem, 'id'>): Promise<ItineraryItem> {
  const trip = await getTripById(tripId); // Fetches trip with client-formatted items
  if (!trip) throw new Error("Trip not found");

  const newItemWithId: ItineraryItem = { ...itemData, id: crypto.randomUUID() };
  
  const updatedClientItems = sortItineraryItems([...(trip.items || []), newItemWithId]);
  const itemsForFirestore = updatedClientItems.map(convertItemToFirestoreFormat);
  // Sorting by Firestore Timestamps for consistent storage order
  const sortedItemsForFirestore = sortFirestoreItems(itemsForFirestore); 

  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: sortedItemsForFirestore });
  
  return newItemWithId; // Return the new item in client-side format
}

export async function updateItineraryItem(tripId: string, updatedItemData: ItineraryItem): Promise<ItineraryItem> {
  const trip = await getTripById(tripId); // Fetches trip with client-formatted items
  if (!trip) throw new Error("Trip not found");

  const itemIndex = (trip.items || []).findIndex(item => item.id === updatedItemData.id);
  if (itemIndex === -1) throw new Error("Itinerary item not found");

  const updatedClientItemsList = [...(trip.items || [])];
  updatedClientItemsList[itemIndex] = updatedItemData;
  
  const sortedClientItems = sortItineraryItems(updatedClientItemsList);
  const itemsForFirestore = sortedClientItems.map(convertItemToFirestoreFormat);
  // Sorting by Firestore Timestamps
  const sortedItemsForFirestore = sortFirestoreItems(itemsForFirestore);

  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: sortedItemsForFirestore });
  
  return updatedItemData; // Return the updated item in client-side format
}

export async function deleteItineraryItem(tripId: string, itemId: string): Promise<void> {
  const trip = await getTripById(tripId); // Fetches trip with client-formatted items
  if (!trip) throw new Error("Trip not found");

  const updatedClientItems = (trip.items || []).filter(item => item.id !== itemId);
  // No need to sort here as we are just filtering. The existing order is maintained.
  
  const itemsForFirestore = updatedClientItems.map(convertItemToFirestoreFormat);
  // If order is critical even after deletion, sort them.
  // For now, assume map preserves relative order of remaining items.
  // Sorting by Firestore Timestamps
  const sortedItemsForFirestore = sortFirestoreItems(itemsForFirestore);

  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: sortedItemsForFirestore });
}
