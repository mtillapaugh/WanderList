"use client";

import type { ItineraryItem } from "@/types/itinerary";
import { CardFooter } from "@/components/ui/card"; // Card, CardHeader, CardTitle, CardContent removed as not directly used
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getItineraryItemIcon } from "@/components/icons";
import { format } from 'date-fns';
import { Clock, MapPin, Edit3, Trash2, FileText, CheckSquare, Plane, BedDouble, CarFront, ClipboardList, Package } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface ItineraryItemCardProps {
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (itemId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start text-sm">
      <Icon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <span className="font-medium text-muted-foreground">{label}: </span>
        <span className="break-words">{value}</span>
      </div>
    </div>
  );
};


export default function ItineraryItemCard({ item, onEdit, onDelete }: ItineraryItemCardProps) {
  const IconComponent = getItineraryItemIcon(item.type);

  const formatItemTime = (isoTime?: string | null) => {
    if (!isoTime) return null; // Return null if no time
    try {
      return format(new Date(isoTime), "h:mm a");
    } catch (e) {
      return "Invalid Date";
    }
  };
  
  const formatItemDateTime = (isoTime?: string | null) => {
    if (!isoTime) return null; // Return null if no time
    try {
      return format(new Date(isoTime), "MMM dd, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const renderDetails = () => {
    if (!item.details || Object.keys(item.details).every(k => !item.details![k as keyof typeof item.details])) {
       // Check if all detail values are undefined or empty
      const hasAnyDetail = Object.values(item.details || {}).some(value => value !== undefined && value !== '');
      if (!hasAnyDetail) return <p className="text-sm text-muted-foreground">No specific details provided.</p>;
    }
    
    const commonDetails = (
      <>
        <DetailItem icon={CheckSquare} label="Confirmation #" value={item.details?.confirmationNumber} />
        <DetailItem icon={FileText} label="Item Notes" value={item.details?.notes} />
      </>
    );

    let typeSpecificDetails;
    switch (item.type) {
      case 'flight':
        typeSpecificDetails = (
          <>
            <DetailItem icon={Plane} label="Airline" value={item.details?.airline} />
            <DetailItem icon={Package} label="Flight No." value={item.details?.flightNumber} />
            <DetailItem icon={MapPin} label="Departure" value={item.details?.departureAirport} />
            <DetailItem icon={MapPin} label="Arrival" value={item.details?.arrivalAirport} />
          </>
        );
        break;
      case 'accommodation':
        typeSpecificDetails = (
          <>
            <DetailItem icon={MapPin} label="Address" value={item.details?.address} />
            <DetailItem icon={Clock} label="Check-in" value={item.details?.checkInTime} />
            <DetailItem icon={Clock} label="Check-out" value={item.details?.checkOutTime} />
          </>
        );
        break;
      case 'rental_car':
        typeSpecificDetails = (
          <>
            <DetailItem icon={CarFront} label="Company" value={item.details?.company} />
            <DetailItem icon={MapPin} label="Pick-up Loc." value={item.details?.pickupLocation} />
            <DetailItem icon={Clock} label="Pick-up Time" value={item.details?.pickupTime} />
            <DetailItem icon={MapPin} label="Drop-off Loc." value={item.details?.dropoffLocation} />
            <DetailItem icon={Clock} label="Drop-off Time" value={item.details?.dropoffTime} />
          </>
        );
        break;
      case 'activity':
         typeSpecificDetails = (
          <>
            <DetailItem icon={ClipboardList} label="Provider" value={item.details?.provider} />
          </>
        );
        break;
      default: // 'note' or other types
        typeSpecificDetails = null;
    }

    const allDetailsEmpty = !typeSpecificDetails && !item.details?.confirmationNumber && !item.details?.notes;
    if (allDetailsEmpty && Object.values(item.details || {}).every(v => !v)) {
        return <p className="text-sm text-muted-foreground">No specific details provided.</p>;
    }


    return (
      <div className="space-y-2">
        {typeSpecificDetails}
        {commonDetails}
      </div>
    );
  };

  const startTimeFormatted = formatItemTime(item.startTime);
  const endTimeFormatted = formatItemTime(item.endTime);
  const startDateTimeFormatted = formatItemDateTime(item.startTime);
  const endDateTimeFormatted = formatItemDateTime(item.endTime);

  return (
    <div className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg border bg-card">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={item.id} className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-lg">
            <div className="flex items-center gap-3 w-full">
              <IconComponent className="h-6 w-6 text-primary shrink-0" />
              <div className="flex-grow text-left">
                <h4 className="text-lg font-semibold text-card-foreground">{item.title}</h4>
                {(startTimeFormatted || item.location) && (
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    {startTimeFormatted && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {startTimeFormatted}
                        {endTimeFormatted && ` - ${endTimeFormatted}`}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> 
                        {item.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {item.description && <p className="text-sm text-foreground/90">{item.description}</p>}
              
              {(startDateTimeFormatted || endDateTimeFormatted) && (
                <div className="text-sm text-muted-foreground space-y-1">
                    {startDateTimeFormatted && <p><strong>Starts:</strong> {startDateTimeFormatted}</p>}
                    {endDateTimeFormatted && <p><strong>Ends:</strong> {endDateTimeFormatted}</p>}
                </div>
              )}
              
              <h5 className="font-medium mt-3 mb-1 text-card-foreground">Details:</h5>
              {renderDetails()}

              <CardFooter className="flex justify-end gap-2 p-0 pt-4 mt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete the item "{item.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
