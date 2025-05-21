"use client";

import type { Trip, ItineraryItem } from '@/types/itinerary';

const TRIPS_STORAGE_KEY = 'wanderlist_trips';

function getTripsFromStorage(): Trip[] {
  if (typeof window === 'undefined') return [];
  const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
  return storedTrips ? JSON.parse(storedTrips) : [];
}

function saveTripsToStorage(trips: Trip[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

export function getAllTrips(): Trip[] {
  return getTripsFromStorage();
}

export function getTripById(tripId: string): Trip | undefined {
  const trips = getTripsFromStorage();
  return trips.find(trip => trip.id === tripId);
}

export function saveTrip(tripData: Omit<Trip, 'id' | 'items'> & { id?: string; items?: ItineraryItem[] }): Trip {
  const trips = getTripsFromStorage();
  let tripToSave: Trip;

  if (tripData.id) { // Existing trip
    const index = trips.findIndex(t => t.id === tripData.id);
    if (index === -1) throw new Error("Trip not found for update");
    tripToSave = { ...trips[index], ...tripData, items: tripData.items || trips[index].items || [] };
    trips[index] = tripToSave;
  } else { // New trip
    tripToSave = { 
      ...tripData, 
      id: crypto.randomUUID(),
      items: tripData.items || [],
      // Ensure imageUrl has a default if not provided
      imageUrl: tripData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(tripData.destination)}`
    };
    trips.push(tripToSave);
  }
  saveTripsToStorage(trips);
  return tripToSave;
}

export function deleteTrip(tripId: string): void {
  let trips = getTripsFromStorage();
  trips = trips.filter(trip => trip.id !== tripId);
  saveTripsToStorage(trips);
}

export function addItineraryItem(tripId: string, itemData: Omit<ItineraryItem, 'id'>): ItineraryItem {
  const trips = getTripsFromStorage();
  const tripIndex = trips.findIndex(trip => trip.id === tripId);
  if (tripIndex === -1) throw new Error("Trip not found");

  const newItem: ItineraryItem = { ...itemData, id: crypto.randomUUID() };
  trips[tripIndex].items.push(newItem);
  // Sort items by start time after adding
  trips[tripIndex].items.sort((a, b) => {
    if (a.startTime && b.startTime) return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    if (a.startTime) return -1; // Items with start time come first
    if (b.startTime) return 1;
    return 0; // Items without start time remain in their relative order at the end
  });
  saveTripsToStorage(trips);
  return newItem;
}

export function updateItineraryItem(tripId: string, updatedItem: ItineraryItem): ItineraryItem {
  const trips = getTripsFromStorage();
  const tripIndex = trips.findIndex(trip => trip.id === tripId);
  if (tripIndex === -1) throw new Error("Trip not found");

  const itemIndex = trips[tripIndex].items.findIndex(item => item.id === updatedItem.id);
  if (itemIndex === -1) throw new Error("Itinerary item not found");

  trips[tripIndex].items[itemIndex] = updatedItem;
  // Sort items by start time after updating
  trips[tripIndex].items.sort((a, b) => {
    if (a.startTime && b.startTime) return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });
  saveTripsToStorage(trips);
  return updatedItem;
}

export function deleteItineraryItem(tripId: string, itemId: string): void {
  const trips = getTripsFromStorage();
  const tripIndex = trips.findIndex(trip => trip.id === tripId);
  if (tripIndex === -1) throw new Error("Trip not found");

  trips[tripIndex].items = trips[tripIndex].items.filter(item => item.id !== itemId);
  saveTripsToStorage(trips);
}
