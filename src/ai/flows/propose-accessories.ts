
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
  openings: z.any().describe('A list of all openings in the order.'), // Use z.any() to avoid schema conflict
  hasDelivery: z.boolean().describe('Whether the order includes delivery service.'),
});
export type ProposeAccessoriesInput = {
    mainAbjourType: string;
    openings: Opening[];
    hasDelivery: boolean;
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

Openings Data:
{{#each openings}}
- Opening {{serial}}:
  - Dimensions (LxN): {{codeLength}}cm x {{numberOfCodes}}
  - Width x Height: {{#if width}}{{width}}cm x {{height}}cm{{else}}N/A{{/if}}
  - Has End Cap: {{hasEndCap}}
  - Has Accessories (Channels): {{hasAccessories}}
{{/each}}

Accessory Calculation Logic:
1.  **Main Axis (Tube):** One for each opening. The length should be the codeLength of the opening. Sum the total length required for all openings and provide one final number.
2.  **Motor:** One for each opening. Mark as optional. The power depends on the opening size (width * height). For areas < 5 sqm, suggest "Standard Motor". For areas > 5 sqm, suggest "Heavy-Duty Motor".
3.  **Channels (Majari):** Only if 'hasAccessories' is true. Two for each such opening. The length of each channel is opening height + 5cm. Sum the total length required.
4.  **End Caps (Tabbat):** Only if 'hasEndCap' is true. One set (pair) for each such opening. Count the total number of sets.
5.  **Screws/Bolts:** Calculate a reasonable number based on the total number and size of openings. Typically 8-12 screws per opening. Mark as required.
6.  **Security Locks:** Usually one per opening, mark as optional.
7.  **Remote Control:** If motors are included, suggest one remote per 3 motors as optional.
8.  **Hangers (Hamalat):** Required for every opening. Suggest 2 units per opening.

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

    