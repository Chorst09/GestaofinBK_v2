
import { createApi } from 'unsplash-js';

// Define the structure for our feature objects
interface Feature {
  title: string;
  description: string;
  href: string;
  src: string;
  imageHint: string;
  alt?: string;
}

// Initialize the Unsplash API client
// It's safe to use process.env here as this code only runs on the server.
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

// A fallback function to return a placeholder image
const getPlaceholder = (hint: string): Pick<Feature, 'src' | 'alt'> => {
  return {
    src: `https://placehold.co/600x400.png`,
    alt: hint,
  };
};

/**
 * Fetches a single image from Unsplash for a given feature.
 * @param feature The feature object with an imageHint.
 * @returns A promise that resolves to an object with src and alt properties.
 */
async function fetchImageForFeature(feature: Feature): Promise<Pick<Feature, 'src' | 'alt'>> {
  try {
    const result = await unsplash.search.getPhotos({
      query: feature.imageHint,
      page: 1,
      perPage: 1,
      orientation: 'landscape',
    });

    if (result.response && result.response.results.length > 0) {
      const photo = result.response.results[0];
      return {
        src: photo.urls.regular,
        alt: photo.alt_description || feature.title,
      };
    } else {
      console.warn(`No Unsplash image found for hint: "${feature.imageHint}". Using placeholder.`);
      return getPlaceholder(feature.imageHint);
    }
  } catch (error) {
    console.error(`Error fetching from Unsplash for hint "${feature.imageHint}":`, error);
    return getPlaceholder(feature.imageHint);
  }
}

/**
 * Takes an array of features, fetches images for them from Unsplash,
 * and returns the array with updated src and alt properties.
 * If the Unsplash API key is not available, it returns the original features with placeholders.
 * @param features An array of feature objects.
 * @returns A promise that resolves to the updated array of features.
 */
export async function getImagesForFeatures(features: Feature[]): Promise<Feature[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY not found. Using placeholder images.");
    return features.map(feature => ({
        ...feature,
        ...getPlaceholder(feature.imageHint)
    }));
  }

  const imagePromises = features.map(feature => fetchImageForFeature(feature));
  const newImageData = await Promise.all(imagePromises);

  return features.map((feature, index) => ({
    ...feature,
    src: newImageData[index].src,
    alt: newImageData[index].alt,
  }));
}

/**
 * Fetches a single banner image.
 * @returns A promise that resolves to an object with src and alt properties.
 */
export async function getBannerImage(): Promise<Pick<Feature, 'src' | 'alt'>> {
     const bannerFeature = { imageHint: 'finance management' } as Feature;
     if (!process.env.UNSPLASH_ACCESS_KEY) {
        console.warn("UNSPLASH_ACCESS_KEY not found. Using placeholder for banner.");
        return getPlaceholder(bannerFeature.imageHint);
    }
    return fetchImageForFeature(bannerFeature);
}
