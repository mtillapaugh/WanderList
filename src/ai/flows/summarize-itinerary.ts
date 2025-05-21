// Summarize the itinerary into a cohesive narrative.
'use server';
/**
 * @fileOverview Summarizes an itinerary into a shareable narrative.
 *
 * - summarizeItinerary - A function that summarizes the itinerary.
 * - SummarizeItineraryInput - The input type for the summarizeItinerary function.
 * - SummarizeItineraryOutput - The return type for the summarizeItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeItineraryInputSchema = z.object({
  itineraryDetails: z
    .string()
    .describe('The detailed itinerary information to be summarized.'),
});
export type SummarizeItineraryInput = z.infer<typeof SummarizeItineraryInputSchema>;

const SummarizeItineraryOutputSchema = z.object({
  narrativeSummary: z
    .string()
    .describe('A narrative summary of the itinerary suitable for sharing.'),
});
export type SummarizeItineraryOutput = z.infer<typeof SummarizeItineraryOutputSchema>;

export async function summarizeItinerary(input: SummarizeItineraryInput): Promise<SummarizeItineraryOutput> {
  return summarizeItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeItineraryPrompt',
  input: {schema: SummarizeItineraryInputSchema},
  output: {schema: SummarizeItineraryOutputSchema},
  prompt: `You are a travel writer summarizing travel itineraries for sharing with friends and family.

  Please create an engaging narrative summary of the following itinerary details:
  {{{itineraryDetails}}}
  `,
});

const summarizeItineraryFlow = ai.defineFlow(
  {
    name: 'summarizeItineraryFlow',
    inputSchema: SummarizeItineraryInputSchema,
    outputSchema: SummarizeItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
