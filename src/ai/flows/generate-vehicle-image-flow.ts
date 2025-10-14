
'use server';
/**
 * @fileOverview An AI flow to generate vehicle images.
 *
 * - generateVehicleImage - A function that generates an image of a vehicle based on brand, model, and color.
 * - GenerateVehicleImageInput - The input type for the generateVehicleImage function.
 * - GenerateVehicleImageOutput - The return type for the generateVehicleImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateVehicleImageInputSchema = z.object({
  brand: z.string().describe('The brand of the vehicle (e.g., Honda, Volkswagen).'),
  model: z.string().describe('The model of the vehicle (e.g., Civic, Gol).'),
  color: z.string().optional().describe('The color of the vehicle (e.g., Silver, Black).'),
});
export type GenerateVehicleImageInput = z.infer<typeof GenerateVehicleImageInputSchema>;

const GenerateVehicleImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated vehicle image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateVehicleImageOutput = z.infer<typeof GenerateVehicleImageOutputSchema>;

export async function generateVehicleImage(input: GenerateVehicleImageInput): Promise<GenerateVehicleImageOutput> {
  return generateVehicleImageFlow(input);
}

const generateVehicleImageFlow = ai.defineFlow(
  {
    name: 'generateVehicleImageFlow',
    inputSchema: GenerateVehicleImageInputSchema,
    outputSchema: GenerateVehicleImageOutputSchema,
  },
  async ({ brand, model, color }) => {
    const prompt = `Generate a high-quality, photorealistic image of a ${color || ''} ${brand} ${model}. The car should be shown from a 3/4 front angle, parked in a neutral, well-lit setting like a modern showroom or an empty parking lot. Focus on the car itself.`;
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return an image.');
    }

    return { imageDataUri: media.url };
  }
);
