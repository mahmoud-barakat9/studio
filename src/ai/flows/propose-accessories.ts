'use server';

/**
 * @fileOverview An AI flow to propose accessories for an abjour order.
 *
 * - proposeAccessories - A function that suggests accessories based on order details.
 * - ProposeAccessoriesInput - The input type for the proposeAccessories function.
 * - ProposeAccessoriesOutput - The return type for the proposeAccessories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Opening } from '@/lib/definitions';

const OpeningSchema = z.object({
  serial: z.string(),
  abjourType: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  codeLength: z.number(),
  numberOfCodes: z.number(),
  hasEndCap: z.boolean(),
  hasAccessories: z.boolean(),
  notes: z.string().optional(),
});


const ProposeAccessoriesInputSchema = z.object({
  mainAbjourType: z.string().describe('The main type of abjour material being used.'),
  openings: z.array(OpeningSchema).describe('A list of all openings in the order.'),
  hasDelivery: z.boolean().describe('Whether the order includes delivery service.'),
});
export type ProposeAccessoriesInput = z.infer<typeof ProposeAccessoriesInputSchema>;

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
1.  **Main Axis (Tube):** One for each opening. The length should be the codeLength of the opening.
2.  **Motor:** One for each opening. This is usually optional unless specified.
3.  **Channels (Majari):** Only if 'hasAccessories' is true. Two for each such opening. The length of each channel is opening height + 5cm. Sum the total length required.
4.  **End Caps (Tabbat):** Only if 'hasEndCap' is true. One set (pair) for each such opening.
5.  **Screws/Bolts:** Calculate a reasonable number based on the total number and size of openings. Typically 8-12 screws per opening. Mark as required.
6.  **Security Locks:** Usually one per opening, mark as optional.
7.  **Remote Control:** If motors are included, suggest one remote as optional.

Based on this logic, generate a JSON object with a list of accessories, their quantities, units, and whether they are 'required' or 'optional'. Combine quantities for the same accessory (e.g., total meters of channels). Do not include any explanations in the output.
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
