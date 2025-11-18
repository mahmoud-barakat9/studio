'use server';

/**
 * @fileOverview A flow to generate a suggested order name based on abjour details.
 *
 * - generateOrderName - A function that generates a suggested order name.
 * - GenerateOrderNameInput - The input type for the generateOrderName function.
 * - GenerateOrderNameOutput - The return type for the generateOrderName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOrderNameInputSchema = z.object({
  abjourType: z.string().describe('The type of abjour.'),
  color: z.string().describe('The color of the abjour.'),
  codeLength: z.number().describe('The length of the abjour code.'),
  numberOfCodes: z.number().describe('The number of abjour codes.'),
});
export type GenerateOrderNameInput = z.infer<typeof GenerateOrderNameInputSchema>;

const GenerateOrderNameOutputSchema = z.object({
  orderName: z.string().describe('The generated name for the order.'),
});
export type GenerateOrderNameOutput = z.infer<typeof GenerateOrderNameOutputSchema>;

export async function generateOrderName(input: GenerateOrderNameInput): Promise<GenerateOrderNameOutput> {
  return generateOrderNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOrderNamePrompt',
  input: {schema: GenerateOrderNameInputSchema},
  output: {schema: GenerateOrderNameOutputSchema},
  prompt: `You are an expert order name generator for abjour orders. You will generate a creative and descriptive name for the order based on the abjour details.

Abjour Type: {{{abjourType}}}
Color: {{{color}}}
Code Length: {{{codeLength}}}
Number of Codes: {{{numberOfCodes}}}

Generate a concise and appealing name that captures the essence of the order.`, // Fixed typo here
});

const generateOrderNameFlow = ai.defineFlow(
  {
    name: 'generateOrderNameFlow',
    inputSchema: GenerateOrderNameInputSchema,
    outputSchema: GenerateOrderNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
