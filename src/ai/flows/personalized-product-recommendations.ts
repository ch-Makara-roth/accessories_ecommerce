
'use server';

/**
 * @fileOverview Personalized product recommendations based on browsing history.
 *
 * - getPersonalizedProductRecommendations - A function that generates personalized product recommendations.
 * - PersonalizedProductRecommendationsInput - The input type for the getPersonalizedProductRecommendations function.
 * - PersonalizedProductRecommendationsOutput - The return type for the getPersonalizedProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedProductRecommendationsInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe('An array of product IDs representing the user\'s browsing history.'),
});
export type PersonalizedProductRecommendationsInput = z.infer<
  typeof PersonalizedProductRecommendationsInputSchema
>;

const PersonalizedProductRecommendationsOutputSchema = z.object({
  productRecommendations: z
    .array(z.string())
    .describe('An array of product IDs representing personalized product recommendations.'),
});
export type PersonalizedProductRecommendationsOutput = z.infer<
  typeof PersonalizedProductRecommendationsOutputSchema
>;

export async function getPersonalizedProductRecommendations(
  input: PersonalizedProductRecommendationsInput
): Promise<PersonalizedProductRecommendationsOutput> {
  return personalizedProductRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductRecommendationsPrompt',
  input: {schema: PersonalizedProductRecommendationsInputSchema},
  output: {schema: PersonalizedProductRecommendationsOutputSchema},
  prompt: `You are an expert e-commerce product recommendation engine.

  Based on the user's browsing history, provide a list of product recommendations.

  Browsing History:
  {{#each browsingHistory}}
  - {{{this}}}
  {{/each}}

  Product Recommendations (as product IDs):
  `,
});

const personalizedProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedProductRecommendationsFlow',
    inputSchema: PersonalizedProductRecommendationsInputSchema,
    outputSchema: PersonalizedProductRecommendationsOutputSchema,
  },
  async (input): Promise<PersonalizedProductRecommendationsOutput> => {
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
      // If output is null/undefined for some reason, return empty recommendations
      console.warn('Personalized product recommendations prompt returned no output, returning empty recommendations.');
      return { productRecommendations: [] };
    } catch (error) {
      console.error("Error in personalizedProductRecommendationsFlow:", error);
      // Return an empty list of recommendations as a fallback
      return { productRecommendations: [] };
    }
  }
);
