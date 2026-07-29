import { MUSCLE_MEDIA_MAP } from '../services/rapidApiMedia';

export const UPPER_BODY_IMG = MUSCLE_MEDIA_MAP['Chest'];
export const LOWER_BODY_IMG = MUSCLE_MEDIA_MAP['Legs'];

export const MASTER_EXERCISES = [
  // CHEST
  { id: 'c1', name: 'Incline Barbell Press', muscle: 'Upper Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c2', name: 'Incline Dumbbell Press', muscle: 'Upper Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c3', name: 'Incline Smith Press', muscle: 'Upper Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c4', name: 'Incline Machine Press', muscle: 'Upper Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c5', name: 'Low-to-High Cable Fly', muscle: 'Upper Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c6', name: 'Landmine Press', muscle: 'Upper Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c7', name: 'Incline Push-Up', muscle: 'Upper Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c8', name: 'Barbell Bench Press', muscle: 'Middle Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c9', name: 'Dumbbell Bench Press', muscle: 'Middle Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c10', name: 'Machine Chest Press', muscle: 'Middle Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c11', name: 'Pec Deck Fly', muscle: 'Middle Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c12', name: 'Cable Fly', muscle: 'Middle Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c13', name: 'Push-Up', muscle: 'Middle Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c14', name: 'Smith Bench Press', muscle: 'Middle Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c15', name: 'Chest Dips', muscle: 'Lower Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c16', name: 'Decline Bench Press', muscle: 'Lower Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c17', name: 'Decline Dumbbell Press', muscle: 'Lower Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c18', name: 'High-to-Low Cable Fly', muscle: 'Lower Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c19', name: 'Decline Machine Press', muscle: 'Lower Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c20', name: 'Bench Dips', muscle: 'Lower Chest', category: 'Chest', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },
  { id: 'c21', name: 'Weighted Dips', muscle: 'Lower Chest', category: 'Chest', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Chest'] },

  // BACK
  { id: 'b1', name: 'Pull-Up', muscle: 'Lats (Width)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b2', name: 'Chin-Up', muscle: 'Lats (Width)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b3', name: 'Lat Pulldown', muscle: 'Lats (Width)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b4', name: 'Close Grip Pulldown', muscle: 'Lats (Width)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b5', name: 'Single Arm Pulldown', muscle: 'Lats (Width)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b6', name: 'Straight Arm Pulldown', muscle: 'Lats (Width)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b7', name: 'Dumbbell Row', muscle: 'Lats (Width)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b8', name: 'Barbell Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b9', name: 'T-Bar Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b10', name: 'Seated Cable Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b11', name: 'Chest Supported Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b12', name: 'Machine Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b13', name: 'Pendlay Row', muscle: 'Upper Back (Thickness)', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b14', name: 'Deadlift', muscle: 'Lower Back', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b15', name: 'Romanian Deadlift', muscle: 'Lower Back', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b16', name: 'Back Extension', muscle: 'Lower Back', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b17', name: 'Rack Pull', muscle: 'Lower Back', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b18', name: 'Good Morning', muscle: 'Lower Back', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b19', name: 'Hyperextension', muscle: 'Lower Back', category: 'Back', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Back'] },
  { id: 'b20', name: 'Kettlebell Swing', muscle: 'Lower Back', category: 'Back', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Back'] },

  // SHOULDERS
  { id: 's1', name: 'Barbell Overhead Press', muscle: 'Front Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's2', name: 'Dumbbell Shoulder Press', muscle: 'Front Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's3', name: 'Arnold Press', muscle: 'Front Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's4', name: 'Machine Shoulder Press', muscle: 'Front Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's5', name: 'Front Raise', muscle: 'Front Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's6', name: 'Landmine Press', muscle: 'Front Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's7', name: 'Push Press', muscle: 'Front Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's8', name: 'Dumbbell Lateral Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's9', name: 'Cable Lateral Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's10', name: 'Machine Lateral Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's11', name: 'Upright Row', muscle: 'Side Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's12', name: 'Leaning Cable Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's13', name: 'Seated Lateral Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's14', name: 'Partial Lateral Raise', muscle: 'Side Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's15', name: 'Reverse Pec Deck', muscle: 'Rear Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's16', name: 'Face Pull', muscle: 'Rear Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's17', name: 'Rear Delt Fly', muscle: 'Rear Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's18', name: 'Cable Rear Fly', muscle: 'Rear Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's19', name: 'Bent Over Fly', muscle: 'Rear Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's20', name: 'Wide Grip Row', muscle: 'Rear Delts', category: 'Shoulders', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },
  { id: 's21', name: 'Band Pull Apart', muscle: 'Rear Delts', category: 'Shoulders', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Shoulders'] },

  // BICEPS
  { id: 'bi1', name: 'Incline Dumbbell Curl', muscle: 'Long Head', category: 'Biceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi2', name: 'Bayesian Curl', muscle: 'Long Head', category: 'Biceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi3', name: 'Hammer Curl', muscle: 'Long Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi4', name: 'EZ Bar Curl', muscle: 'Long Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi5', name: 'Drag Curl', muscle: 'Long Head', category: 'Biceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi6', name: 'Dumbbell Curl', muscle: 'Long Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi7', name: 'Cable Curl', muscle: 'Long Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi8', name: 'Preacher Curl', muscle: 'Short Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi9', name: 'Concentration Curl', muscle: 'Short Head', category: 'Biceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },
  { id: 'bi10', name: 'Wide Grip EZ Curl', muscle: 'Short Head', category: 'Biceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Biceps'] },

  // TRICEPS
  { id: 't1', name: 'Overhead Cable Extension', muscle: 'Long Head', category: 'Triceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Triceps'] },
  { id: 't2', name: 'Overhead Dumbbell Extension', muscle: 'Long Head', category: 'Triceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Triceps'] },
  { id: 't3', name: 'Skull Crusher', muscle: 'Long Head', category: 'Triceps', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Triceps'] },
  { id: 't7', name: 'Rope Pushdown', muscle: 'Lateral Head', category: 'Triceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Triceps'] },
  { id: 't8', name: 'Straight Bar Pushdown', muscle: 'Lateral Head', category: 'Triceps', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Triceps'] },

  // LEGS
  { id: 'l1', name: 'Back Squat', muscle: 'Quads', category: 'Legs', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },
  { id: 'l2', name: 'Front Squat', muscle: 'Quads', category: 'Legs', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },
  { id: 'l3', name: 'Leg Press', muscle: 'Quads', category: 'Legs', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },
  { id: 'l5', name: 'Leg Extension', muscle: 'Quads', category: 'Legs', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },
  { id: 'l8', name: 'Seated Leg Curl', muscle: 'Hamstrings', category: 'Legs', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },
  { id: 'l13', name: 'Hip Thrust', muscle: 'Glutes', category: 'Legs', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Legs'] },

  // ABS & CORE
  { id: 'a1', name: 'Crunch', muscle: 'Upper Abs', category: 'Abs & Core', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Abs & Core'] },
  { id: 'a2', name: 'Cable Crunch', muscle: 'Upper Abs', category: 'Abs & Core', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Abs & Core'] },
  { id: 'a8', name: 'Hanging Leg Raise', muscle: 'Lower Abs', category: 'Abs & Core', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Abs & Core'] },
  { id: 'a22', name: 'Plank', muscle: 'Core Stability', category: 'Abs & Core', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Abs & Core'] },

  // CARDIO
  { id: 'cd1', name: 'Incline Walking', muscle: 'Cardio', category: 'Cardio', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Cardio'] },
  { id: 'cd4', name: 'Running', muscle: 'Cardio', category: 'Cardio', beginner: false, gifUrl: MUSCLE_MEDIA_MAP['Cardio'] },
  { id: 'cd5', name: 'Cycling', muscle: 'Cardio', category: 'Cardio', beginner: true, gifUrl: MUSCLE_MEDIA_MAP['Cardio'] }
];
