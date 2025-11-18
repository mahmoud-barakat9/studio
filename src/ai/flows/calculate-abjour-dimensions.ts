'use server';

/**
 * @fileOverview Calculates abjour dimensions (code length and number of codes) based on width and abjour type.
 *
 * - calculateAbjourDimensions - A function that calculates abjour dimensions.
 * - CalculateAbjourDimensionsInput - The input type for the calculateAbjourDimensions function.
 * - CalculateAbjourDimensionsOutput - The return type for the calculateAbjourDimensions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateAbjourDimensionsInputSchema = z.object({
  width: z.number().describe('The width of the abjour opening in centimeters.'),
  abjourType: z.string().describe('The type of abjour (e.g., standard, narrow).'),
});
export type CalculateAbjourDimensionsInput = z.infer<typeof CalculateAbjourDimensionsInputSchema>;

const CalculateAbjourDimensionsOutputSchema = z.object({
  codeLength: z.number().describe('The calculated code length in centimeters.'),
  numberOfCodes: z.number().describe('The calculated number of codes.'),
});
export type CalculateAbjourDimensionsOutput = z.infer<typeof CalculateAbjourDimensionsOutputSchema>;

export async function calculateAbjourDimensions(input: CalculateAbjourDimensionsInput): Promise<CalculateAbjourDimensionsOutput> {
  return calculateAbjourDimensionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateAbjourDimensionsPrompt',
  input: {schema: CalculateAbjourDimensionsInputSchema},
  output: {schema: CalculateAbjourDimensionsOutputSchema},
  prompt: `You are an expert in abjour design and manufacturing. Given the width of an abjour opening and the type of abjour, calculate the appropriate code length and number of codes.

Width: {{width}} cm
Abjour Type: {{abjourType}}

Consider various abjour types and their standard dimensions, calculate and return the codeLength and numberOfCodes. You must return a number for each field.

Ensure that your response can be parsed according to the CalculateAbjourDimensionsOutputSchema schema. Do not return any explanation text.`, 
});

const calculateAbjourDimensionsFlow = ai.defineFlow(
  {
    name: 'calculateAbjourDimensionsFlow',
    inputSchema: CalculateAbjourDimensionsInputSchema,
    outputSchema: CalculateAbjourDimensionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
