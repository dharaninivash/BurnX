// RapidAPI EDB Media Service for Exercise Images & Videos
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '114fb48a5amsh56e435b794b0d05p1524f5jsn87c391240842';
const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

// Curated high quality fitness media map categorized by target muscle
export const MUSCLE_MEDIA_MAP = {
  Chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  Back: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80',
  Shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
  Biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
  Triceps: 'https://images.unsplash.com/photo-1530822847156-5df6846166b3?auto=format&fit=crop&w=600&q=80',
  Forearms: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
  Legs: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80',
  Calves: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
  Tibialis: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  'Abs & Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
  Cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80',
};

export async function fetchBodyPartsFromRapidAPI() {
  try {
    const response = await fetch('https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/bodyparts', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('RapidAPI EDB connection status:', error.message);
  }
  return null;
}

export function getExerciseMediaUrl(category) {
  return MUSCLE_MEDIA_MAP[category] || MUSCLE_MEDIA_MAP['Chest'];
}
