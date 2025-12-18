'use server';

/**
 * @fileOverview An AI flow to propose accessories for an abjour order.
 *
 * - proposeAccessories - A function that suggests accessories based on order details.
 * - ProposeAccessoriesInput - The input type for the proposeAccessories function.
 * - ProposeAccessoriesOutput - The return type for the proposeAccessories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Opening } from '@/lib/definitions';


const ProposeAccessoriesInputSchema = z.object({
  mainAbjourType: z.string().describe('The main type of abjour material being used.'),
  openings: z.any().describe('A list of all openings in the order. Each opening is an object with properties like codeLength, numberOfCodes, width, height, hasEndCap, hasAccessories.'),
  hasDelivery: z.boolean().describe('Whether the order includes delivery service.'),
  hasInstallation: z.boolean().describe('Whether the order includes installation service.'),
});
export type ProposeAccessoriesInput = {
    mainAbjourType: string;
    openings: Opening[];
    hasDelivery: boolean;
    hasInstallation: boolean;
};

const AccessorySchema = z.object({
    name: z.string().describe('The name of the accessory.'),
    quantity: z.number().describe('The calculated quantity for the accessory.'),
    unit: z.enum(['unit', 'meter', 'kg']).describe('The unit of measurement for the quantity (e.g., unit, meter, kg).'),
    type: z.enum(['required', 'optional']).describe('Whether the accessory is required or optional.'),
});

const ProposeAccessoriesOutputSchema = z.object({
  accessories: z.array(AccessorySchema).describe('A list of suggested accessories.'),
});
export type ProposeAccessoriesOutput = z.infer<typeof ProposeAccessoriesOutputSchema>;

export async function proposeAccessories(input: ProposeAccessoriesInput): Promise<ProposeAccessoriesOutput> {
  return proposeAccessoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proposeAccessoriesPrompt',
  input: { schema: ProposeAccessoriesInputSchema },
  output: { schema: ProposeAccessoriesOutputSchema },
  prompt: `You are an expert in abjour manufacturing and installation. Based on the following order details, propose a list of required and optional accessories with their calculated quantities.

Order Details:
- Main Abjour Type: {{{mainAbjourType}}}
- Number of Openings: {{openings.length}}
- Delivery requested: {{hasDelivery}}
- Installation requested: {{hasInstallation}}

Openings Data (JSON format):
{{{json openings}}}

Accessory Calculation Logic:
1.  **Main Axis (Tube):** Required. One for each opening. The length should be the codeLength of the opening. Sum the total length required for all openings and provide one final number in 'meter' unit, divided by 100 to convert from cm.
2.  **Motor:** Optional. One for each opening. If installation is requested, mark as 'required'. The power depends on the opening size (width * height). For areas < 5 sqm, suggest "Standard Motor". For areas > 5 sqm, suggest "Heavy-Duty Motor". If width/height are not available, use total area of the opening to decide. If motor is added, remote should be suggested.
3.  **Channels (Majari):** Required if 'hasAccessories' is true for an opening. Two for each such opening. The length of each channel is opening height. Sum the total length required (height * 2 for each relevant opening) and provide result in 'meter', divided by 100 to convert from cm. If height is not available, do not suggest channels.
4.  **End Caps (Tabbat):** Required if 'hasEndCap' is true. One set (pair, which is 1 unit) for each such opening. Count the total number of sets.
5.  **Screws/Bolts:** Required if 'hasInstallation' is true. Calculate a reasonable number based on the total number and size of openings. Typically 8-12 screws per opening. Provide total count.
6.  **Security Locks:** Always optional. Usually one per opening.
7.  **Remote Control:** Optional. If motors are included, suggest one remote per 3 motors (round up).
8.  **Hangers (Hamalat):** Required if 'hasInstallation' is true. Suggest 2 units per opening.
9.  **Bottom Bar (Barra):** Required. One for each opening. Length is codeLength. Sum total length and provide in 'meter', divided by 100 to convert from cm.

Based on this logic, generate a JSON object with a list of accessories. Combine quantities for the same accessory (e.g., total meters of channels, total units of screws). Do not include any explanations in the output. Ensure the response adheres strictly to the ProposeAccessoriesOutputSchema.
`,
});

const proposeAccessoriesFlow = ai.defineFlow(
  {
    name: 'proposeAccessoriesFlow',
    inputSchema: ProposeAccessoriesInputSchema,
    outputSchema: ProposeAccessoriesOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
    
