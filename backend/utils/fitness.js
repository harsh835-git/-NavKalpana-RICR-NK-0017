// Mifflin-St Jeor formula
const calculateMaintenanceCalories = (weight, height, age, sex, activityLevel) => {
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

const calculateTargetCalories = (maintenanceCalories, goal, sex) => {
  let target;
  switch (goal) {
    case 'weight_loss':
      target = maintenanceCalories - 500;
      break;
    case 'muscle_gain':
      target = maintenanceCalories + 300;
      break;
    case 'recomposition':
      target = maintenanceCalories - 100;
      break;
    case 'endurance':
      target = maintenanceCalories + 100;
      break;
    default:
      target = maintenanceCalories;
  }
  
  // Safety floors
  const minCalories = sex === 'male' ? 1500 : 1200;
  return Math.max(target, minCalories);
};

const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

const generateWorkoutPlan = (goal, experienceLevel, activityLevel) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const workoutTemplates = {
    weight_loss: {
      beginner: [
        { focus: 'Full Body Cardio', exercises: [
          { name: 'Brisk Walking/Jogging', sets: 1, reps: '20 min', rest: '0 sec', form: 'Keep pace steady, maintain posture' },
          { name: 'Bodyweight Squats', sets: 3, reps: '12', rest: '60 sec', form: 'Feet shoulder-width, knees tracking toes' },
          { name: 'Push-ups (Modified)', sets: 3, reps: '8', rest: '60 sec', form: 'Keep body straight, controlled descent' },
          { name: 'Plank', sets: 3, reps: '20 sec', rest: '45 sec', form: 'Core tight, don\'t let hips sag' }
        ]},
        { focus: 'Active Recovery', exercises: [
          { name: 'Light Walking', sets: 1, reps: '30 min', rest: '0 sec', form: 'Easy pace, enjoy the movement' },
          { name: 'Stretching', sets: 1, reps: '15 min', rest: '0 sec', form: 'Hold each stretch 30 seconds' }
        ]},
        { focus: 'Lower Body Focus', exercises: [
          { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '60 sec', form: 'Step forward, knee at 90 degrees' },
          { name: 'Glute Bridges', sets: 3, reps: '15', rest: '45 sec', form: 'Squeeze glutes at top' },
          { name: 'Calf Raises', sets: 3, reps: '20', rest: '45 sec', form: 'Full range of motion' },
          { name: 'Mountain Climbers', sets: 3, reps: '20 sec', rest: '45 sec', form: 'Fast pace, keep hips down' }
        ]},
        { focus: 'Upper Body + Core', exercises: [
          { name: 'Incline Push-ups', sets: 3, reps: '10', rest: '60 sec', form: 'Hands on elevated surface' },
          { name: 'Dumbbell Rows', sets: 3, reps: '10', rest: '60 sec', form: 'Pull elbow back, squeeze shoulder blade' },
          { name: 'Bicycle Crunches', sets: 3, reps: '20', rest: '45 sec', form: 'Slow and controlled' },
          { name: 'Dead Bug', sets: 3, reps: '8 each', rest: '45 sec', form: 'Lower back pressed to floor' }
        ]},
        { focus: 'HIIT Cardio', exercises: [
          { name: 'Jumping Jacks', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Land softly' },
          { name: 'High Knees', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Drive knees up' },
          { name: 'Burpees (Modified)', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Step back instead of jump if needed' }
        ]},
        { focus: 'Active Recovery', exercises: [
          { name: 'Yoga Flow', sets: 1, reps: '20 min', rest: '0 sec', form: 'Focus on breathing' },
          { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '0 sec', form: 'Slow pressure on tight spots' }
        ]},
        { focus: 'Full Body Circuit', exercises: [
          { name: 'Squat to Press', sets: 3, reps: '12', rest: '60 sec', form: 'Controlled movement throughout' },
          { name: 'Push-ups', sets: 3, reps: '10', rest: '60 sec', form: 'Full range of motion' },
          { name: 'Romanian Deadlift', sets: 3, reps: '12', rest: '60 sec', form: 'Hinge at hips, slight knee bend' },
          { name: 'Plank to Downdog', sets: 3, reps: '10', rest: '45 sec', form: 'Smooth transition' }
        ]}
      ]
    },
    muscle_gain: {
      beginner: [
        { focus: 'Chest & Triceps', exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90 sec', form: 'Controlled descent, full extension' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75 sec', form: '30-45 degree incline' },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60 sec', form: 'Slight bend in elbows' },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12', rest: '60 sec', form: 'Keep elbows at sides' }
        ]},
        { focus: 'Back & Biceps', exercises: [
          { name: 'Pull-ups/Lat Pulldowns', sets: 4, reps: '6-8', rest: '90 sec', form: 'Full stretch at bottom' },
          { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90 sec', form: 'Pull to lower chest' },
          { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: '75 sec', form: 'Squeeze shoulder blades' },
          { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60 sec', form: 'No swinging' }
        ]},
        { focus: 'Active Recovery', exercises: [
          { name: 'Light Cardio', sets: 1, reps: '20 min', rest: '0 sec', form: 'Zone 2, conversational pace' },
          { name: 'Mobility Work', sets: 1, reps: '15 min', rest: '0 sec', form: 'Focus on previous day\'s worked muscles' }
        ]},
        { focus: 'Legs', exercises: [
          { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: '2 min', form: 'Break parallel, chest up' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90 sec', form: 'Feel hamstring stretch' },
          { name: 'Leg Press', sets: 3, reps: '12-15', rest: '75 sec', form: 'Don\'t lock knees at top' },
          { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60 sec', form: 'Full range of motion' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '60 sec', form: 'Pause at top and bottom' }
        ]},
        { focus: 'Shoulders & Traps', exercises: [
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90 sec', form: 'Press straight up, core tight' },
          { name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '60 sec', form: 'Lead with elbows, slight forward lean' },
          { name: 'Face Pulls', sets: 3, reps: '15', rest: '60 sec', form: 'Pull to forehead, elbows high' },
          { name: 'Shrugs', sets: 3, reps: '15', rest: '60 sec', form: 'Straight up, no rolling' }
        ]},
        { focus: 'Arms & Core', exercises: [
          { name: 'EZ Bar Curls', sets: 4, reps: '10-12', rest: '75 sec', form: 'Full range, controlled negative' },
          { name: 'Hammer Curls', sets: 3, reps: '12', rest: '60 sec', form: 'Neutral grip, slow eccentric' },
          { name: 'Skull Crushers', sets: 4, reps: '10-12', rest: '75 sec', form: 'Lower to forehead level' },
          { name: 'Weighted Plank', sets: 3, reps: '30 sec', rest: '45 sec', form: 'Plate on back if comfortable' }
        ]},
        { focus: 'Rest', exercises: [
          { name: 'Complete Rest', sets: 0, reps: 'Rest', rest: '0 sec', form: 'Recovery is where muscle is built' }
        ]}
      ]
    }
  };

  // Get template or fallback to weight_loss beginner
  const goalTemplates = workoutTemplates[goal] || workoutTemplates.weight_loss;
  const levelTemplates = goalTemplates[experienceLevel] || goalTemplates.beginner;

  return days.map((day, index) => ({
    day,
    ...levelTemplates[index % levelTemplates.length]
  }));
};

const generateDietPlan = (targetCalories, goal, sex) => {
  const macroTemplates = {
    weight_loss: { protein: 0.40, carbs: 0.30, fat: 0.30 },
    muscle_gain: { protein: 0.30, carbs: 0.50, fat: 0.20 },
    recomposition: { protein: 0.40, carbs: 0.35, fat: 0.25 },
    maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
    endurance: { protein: 0.25, carbs: 0.55, fat: 0.20 }
  };

  const macros = macroTemplates[goal] || macroTemplates.maintain;
  const proteinCals = Math.round(targetCalories * macros.protein);
  const carbCals = Math.round(targetCalories * macros.carbs);
  const fatCals = Math.round(targetCalories * macros.fat);

  const proteinG = Math.round(proteinCals / 4);
  const carbsG = Math.round(carbCals / 4);
  const fatG = Math.round(fatCals / 9);

  const meals = {
    weight_loss: [
      {
        name: 'Breakfast',
        time: '7:00 AM',
        calories: Math.round(targetCalories * 0.25),
        items: ['3 egg whites + 1 whole egg scramble', 'Oatmeal with berries (½ cup oats)', 'Green tea or black coffee'],
        protein: Math.round(proteinG * 0.30),
        carbs: Math.round(carbsG * 0.25),
        fat: Math.round(fatG * 0.20)
      },
      {
        name: 'Morning Snack',
        time: '10:00 AM',
        calories: Math.round(targetCalories * 0.10),
        items: ['Greek yogurt (150g)', '1 medium apple'],
        protein: Math.round(proteinG * 0.15),
        carbs: Math.round(carbsG * 0.15),
        fat: Math.round(fatG * 0.05)
      },
      {
        name: 'Lunch',
        time: '1:00 PM',
        calories: Math.round(targetCalories * 0.30),
        items: ['Grilled chicken breast (150g)', 'Brown rice (½ cup cooked)', 'Mixed vegetables (unlimited)', 'Olive oil drizzle'],
        protein: Math.round(proteinG * 0.35),
        carbs: Math.round(carbsG * 0.30),
        fat: Math.round(fatG * 0.30)
      },
      {
        name: 'Afternoon Snack',
        time: '4:00 PM',
        calories: Math.round(targetCalories * 0.10),
        items: ['Handful of almonds (20g)', '1 medium orange'],
        protein: Math.round(proteinG * 0.05),
        carbs: Math.round(carbsG * 0.15),
        fat: Math.round(fatG * 0.20)
      },
      {
        name: 'Dinner',
        time: '7:00 PM',
        calories: Math.round(targetCalories * 0.25),
        items: ['Grilled salmon or tofu (150g)', 'Sweet potato (medium)', 'Steamed broccoli & spinach', 'Lemon & herbs'],
        protein: Math.round(proteinG * 0.15),
        carbs: Math.round(carbsG * 0.15),
        fat: Math.round(fatG * 0.25)
      }
    ],
    muscle_gain: [
      {
        name: 'Breakfast',
        time: '7:00 AM',
        calories: Math.round(targetCalories * 0.25),
        items: ['3 whole eggs + 3 egg whites', 'Oatmeal (1 cup dry) with banana', 'Whole milk (1 cup)', 'Peanut butter (1 tbsp)'],
        protein: Math.round(proteinG * 0.25),
        carbs: Math.round(carbsG * 0.30),
        fat: Math.round(fatG * 0.25)
      },
      {
        name: 'Pre-Workout',
        time: '10:30 AM',
        calories: Math.round(targetCalories * 0.15),
        items: ['Greek yogurt (200g)', 'Banana', 'Protein shake (optional)'],
        protein: Math.round(proteinG * 0.20),
        carbs: Math.round(carbsG * 0.20),
        fat: Math.round(fatG * 0.05)
      },
      {
        name: 'Lunch',
        time: '2:00 PM',
        calories: Math.round(targetCalories * 0.30),
        items: ['Chicken breast or beef (200g)', 'White rice (1 cup cooked)', 'Vegetables', 'Avocado (½)'],
        protein: Math.round(proteinG * 0.30),
        carbs: Math.round(carbsG * 0.30),
        fat: Math.round(fatG * 0.30)
      },
      {
        name: 'Post-Workout Snack',
        time: '5:00 PM',
        calories: Math.round(targetCalories * 0.10),
        items: ['Protein shake', 'Banana or dextrose (for glycogen replenishment)'],
        protein: Math.round(proteinG * 0.15),
        carbs: Math.round(carbsG * 0.10),
        fat: Math.round(fatG * 0.05)
      },
      {
        name: 'Dinner',
        time: '8:00 PM',
        calories: Math.round(targetCalories * 0.20),
        items: ['Salmon (180g)', 'Pasta or quinoa (1 cup cooked)', 'Olive oil & vegetables'],
        protein: Math.round(proteinG * 0.10),
        carbs: Math.round(carbsG * 0.10),
        fat: Math.round(fatG * 0.35)
      }
    ]
  };

  const mealPlan = meals[goal] || meals.weight_loss;

  return {
    targetCalories,
    macros: {
      protein: { grams: proteinG, calories: proteinCals, percentage: Math.round(macros.protein * 100) },
      carbs: { grams: carbsG, calories: carbCals, percentage: Math.round(macros.carbs * 100) },
      fat: { grams: fatG, calories: fatCals, percentage: Math.round(macros.fat * 100) }
    },
    meals: mealPlan
  };
};

const calculateHabitScore = (workoutAdherence, dietAdherence) => {
  return Math.round((workoutAdherence * 0.60) + (dietAdherence * 0.40));
};

module.exports = {
  calculateMaintenanceCalories,
  calculateTargetCalories,
  calculateBMI,
  generateWorkoutPlan,
  generateDietPlan,
  calculateHabitScore
};
