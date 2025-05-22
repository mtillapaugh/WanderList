
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
  where, // If we add user-specific queries later
} from 'firebase/firestore';
import type { Trip, ItineraryItem } from '@/types/itinerary';

const TRIPS_COLLECTION = 'trips';

// Helper to convert Firestore Timestamps to ISO strings for dates (YYYY-MM-DD)
// and date-times (YYYY-MM-DDTHH:mm) when fetching data.
// Firestore stores dates as Timestamps.
const processTimestampsForTrip = (trip: Trip): Trip => {
  // For trip dates (YYYY-MM-DD)
  if (trip.startDate && trip.startDate instanceof Timestamp) {
    trip.startDate = trip.startDate.toDate().toISOString().split('T')[0]!;
  }
  if (trip.endDate && trip.endDate instanceof Timestamp) {
    trip.endDate = trip.endDate.toDate().toISOString().split('T')[0]!;
  }

  // For itinerary item date-times (YYYY-MM-DDTHH:mm)
  trip.items = trip.items.map(item => {
    if (item.startTime && item.startTime instanceof Timestamp) {
      // Format to YYYY-MM-DDTHH:MM (local time)
      const d = item.startTime.toDate();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      item.startTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else if (item.startTime === undefined) {
      item.startTime = null; // Ensure it's null if undefined
    }
    if (item.endTime && item.endTime instanceof Timestamp) {
      const d = item.endTime.toDate();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      item.endTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else if (item.endTime === undefined) {
      item.endTime = null; // Ensure it's null if undefined
    }
    return item;
  });
  return trip;
};

export async function getAllTrips(): Promise<Trip[]> {
  // Later, we'll add a 'where' clause for the current user ID
  const tripsQuery = query(collection(db, TRIPS_COLLECTION), orderBy('startDate', 'desc'));
  const querySnapshot = await getDocs(tripsQuery);
  const trips: Trip[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<Trip, 'id'>;
    // Ensure items is always an array, even if undefined in Firestore
    const tripWithItems = { ...data, items: data.items || [] };
    trips.push(processTimestampsForTrip({ id: doc.id, ...tripWithItems }));
  });
  return trips;
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripDoc = await getDoc(tripDocRef);
  if (tripDoc.exists()) {
    const data = tripDoc.data() as Omit<Trip, 'id'>;
    const tripWithItems = { ...data, items: data.items || [] };
    return processTimestampsForTrip({ id: tripDoc.id, ...tripWithItems });
  }
  return null;
}

export async function saveTrip(
  tripData: Omit<Trip, 'id' | 'items'> & { id?: string; items?: ItineraryItem[] }
): Promise<Trip> {
  // Convert date strings to Firestore Timestamps before saving
  const dataToSave: any = { ...tripData };
  if (tripData.startDate) {
    dataToSave.startDate = Timestamp.fromDate(new Date(tripData.startDate));
  }
  if (tripData.endDate) {
    dataToSave.endDate = Timestamp.fromDate(new Date(tripData.endDate));
  }

  // Ensure items array exists
  dataToSave.items = (tripData.items || []).map(item => {
    const newItem = { ...item };
    if (item.startTime) {
      newItem.startTime = Timestamp.fromDate(new Date(item.startTime));
    }
    if (item.endTime) {
      newItem.endTime = Timestamp.fromDate(new Date(item.endTime));
    }
    return newItem;
  });
  
  // Ensure imageUrl default if not provided
  if (!dataToSave.imageUrl) {
    dataToSave.imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(dataToSave.destination)}`;
  }


  if (tripData.id) { // Existing trip
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripData.id);
    await updateDoc(tripDocRef, dataToSave);
    return { ...dataToSave, id: tripData.id }; // Return original dates for consistency if needed, or re-fetch
  } else { // New trip
    // Remove id if it was accidentally passed for a new trip
    const { id, ...dataForAddDoc } = dataToSave;
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), dataForAddDoc);
    return { ...dataToSave, id: docRef.id };
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(tripDocRef);
}

// Helper to sort itinerary items
const sortItineraryItems = (items: ItineraryItem[]): ItineraryItem[] => {
  return items.sort((a, b) => {
    if (a.startTime && b.startTime) {
      try {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } catch (e) { return 0; } // Should not happen with valid ISO strings
    }
    if (a.startTime) return -1; // Items with start time come first
    if (b.startTime) return 1;
    return 0; // Items without start time remain in their relative order
  });
};

export async function addItineraryItem(tripId: string, itemData: Omit<ItineraryItem, 'id'>): Promise<ItineraryItem> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const newItem: ItineraryItem = { ...itemData, id: crypto.randomUUID() };
  const updatedItems = sortItineraryItems([...(trip.items || []), newItem]);

  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: updatedItems.map(item => {
    const firestoreItem = {...item};
    if (item.startTime) firestoreItem.startTime = Timestamp.fromDate(new Date(item.startTime)); else firestoreItem.startTime = null;
    if (item.endTime) firestoreItem.endTime = Timestamp.fromDate(new Date(item.endTime)); else firestoreItem.endTime = null;
    return firestoreItem;
  })});
  return newItem;
}

export async function updateItineraryItem(tripId: string, updatedItemData: ItineraryItem): Promise<ItineraryItem> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const itemIndex = trip.items.findIndex(item => item.id === updatedItemData.id);
  if (itemIndex === -1) throw new Error("Itinerary item not found");

  const updatedItems = [...trip.items];
  updatedItems[itemIndex] = updatedItemData;
  
  const sortedItems = sortItineraryItems(updatedItems);

  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: sortedItems.map(item => {
    const firestoreItem = {...item};
    if (item.startTime) firestoreItem.startTime = Timestamp.fromDate(new Date(item.startTime)); else firestoreItem.startTime = null;
    if (item.endTime) firestoreItem.endTime = Timestamp.fromDate(new Date(item.endTime)); else firestoreItem.endTime = null;
    return firestoreItem;
  })});
  return updatedItemData;
}

export async function deleteItineraryItem(tripId: string, itemId: string): Promise<void> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const updatedItems = trip.items.filter(item => item.id !== itemId);
  const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripDocRef, { items: updatedItems.map(item => { // Ensure timestamps are converted if any remain
    const firestoreItem = {...item};
    if (item.startTime) firestoreItem.startTime = Timestamp.fromDate(new Date(item.startTime)); else firestoreItem.startTime = null;
    if (item.endTime) firestoreItem.endTime = Timestamp.fromDate(new Date(item.endTime)); else firestoreItem.endTime = null;
    return firestoreItem;
  })});
}
