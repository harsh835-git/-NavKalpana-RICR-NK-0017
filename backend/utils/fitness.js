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

  const minCalories = sex === 'male' ? 1500 : 1200;
  return Math.max(target, minCalories);
};

const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

// ─── Workout templates ────────────────────────────────────────────────────────

const gymWorkoutTemplates = {
  weight_loss: {
    beginner: [
      {
        focus: 'Full Body Cardio', exercises: [
          { name: 'Treadmill / Brisk Walking', sets: 1, reps: '20 min', rest: '0 sec', form: 'Keep pace steady, maintain upright posture' },
          { name: 'Barbell / Goblet Squat', sets: 3, reps: '12', rest: '60 sec', form: 'Feet shoulder-width, knees tracking toes' },
          { name: 'Machine Chest Press', sets: 3, reps: '12', rest: '60 sec', form: 'Controlled descent, full extension' },
          { name: 'Plank', sets: 3, reps: '20 sec', rest: '45 sec', form: 'Core tight, don\'t let hips sag' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Light Cycling / Elliptical', sets: 1, reps: '30 min', rest: '0 sec', form: 'Easy pace, zone 1-2 cardio' },
          { name: 'Full Body Stretch', sets: 1, reps: '15 min', rest: '0 sec', form: 'Hold each stretch 30 seconds' }
        ]
      },
      {
        focus: 'Lower Body Focus', exercises: [
          { name: 'Leg Press', sets: 3, reps: '12', rest: '75 sec', form: 'Don\'t lock knees at top' },
          { name: 'Dumbbell Lunges', sets: 3, reps: '10 each leg', rest: '60 sec', form: 'Step forward, knee at 90 degrees' },
          { name: 'Leg Curls', sets: 3, reps: '15', rest: '60 sec', form: 'Full range of motion' },
          { name: 'Stairmaster / Step-ups', sets: 3, reps: '20 sec', rest: '45 sec', form: 'Steady pace, drive through heel' }
        ]
      },
      {
        focus: 'Upper Body + Core', exercises: [
          { name: 'Lat Pulldown', sets: 3, reps: '12', rest: '60 sec', form: 'Pull to upper chest, squeeze lats' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: '60 sec', form: 'Press straight up, core tight' },
          { name: 'Cable Rows', sets: 3, reps: '12', rest: '60 sec', form: 'Squeeze shoulder blades together' },
          { name: 'Cable Crunches', sets: 3, reps: '15', rest: '45 sec', form: 'Crunch from abs, not neck' }
        ]
      },
      {
        focus: 'HIIT Cardio', exercises: [
          { name: 'Rowing Machine', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Drive with legs first, then lean back' },
          { name: 'Battle Ropes', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Alternate arm waves, keep core tight' },
          { name: 'Spin Bike Sprints', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Full effort during work interval' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '0 sec', form: 'Slow pressure on tight spots' },
          { name: 'Stretching / Yoga', sets: 1, reps: '20 min', rest: '0 sec', form: 'Focus on breathing' }
        ]
      },
      {
        focus: 'Full Body Circuit', exercises: [
          { name: 'Dumbbell Squat to Press', sets: 3, reps: '12', rest: '60 sec', form: 'Fluid motion from squat to overhead press' },
          { name: 'Bench Press', sets: 3, reps: '10', rest: '60 sec', form: 'Controlled descent, full extension' },
          { name: 'Romanian Deadlift', sets: 3, reps: '12', rest: '60 sec', form: 'Hinge at hips, slight knee bend' },
          { name: 'Plank to Downdog', sets: 3, reps: '10', rest: '45 sec', form: 'Smooth transition' }
        ]
      }
    ]
  },
  muscle_gain: {
    beginner: [
      {
        focus: 'Chest & Triceps', exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90 sec', form: 'Controlled descent, full extension' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '75 sec', form: '30-45 degree incline' },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60 sec', form: 'Slight bend in elbows' },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12', rest: '60 sec', form: 'Keep elbows at sides' }
        ]
      },
      {
        focus: 'Back & Biceps', exercises: [
          { name: 'Pull-ups / Lat Pulldowns', sets: 4, reps: '6-8', rest: '90 sec', form: 'Full stretch at bottom' },
          { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90 sec', form: 'Pull to lower chest' },
          { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: '75 sec', form: 'Squeeze shoulder blades' },
          { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60 sec', form: 'No swinging' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Light Cardio', sets: 1, reps: '20 min', rest: '0 sec', form: 'Zone 2, conversational pace' },
          { name: 'Mobility Work', sets: 1, reps: '15 min', rest: '0 sec', form: 'Focus on previous day\'s worked muscles' }
        ]
      },
      {
        focus: 'Legs', exercises: [
          { name: 'Barbell Squats', sets: 4, reps: '8-10', rest: '2 min', form: 'Break parallel, chest up' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90 sec', form: 'Feel hamstring stretch' },
          { name: 'Leg Press', sets: 3, reps: '12-15', rest: '75 sec', form: 'Don\'t lock knees at top' },
          { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60 sec', form: 'Full range of motion' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '60 sec', form: 'Pause at top and bottom' }
        ]
      },
      {
        focus: 'Shoulders & Traps', exercises: [
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90 sec', form: 'Press straight up, core tight' },
          { name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '60 sec', form: 'Lead with elbows, slight forward lean' },
          { name: 'Face Pulls', sets: 3, reps: '15', rest: '60 sec', form: 'Pull to forehead, elbows high' },
          { name: 'Shrugs', sets: 3, reps: '15', rest: '60 sec', form: 'Straight up, no rolling' }
        ]
      },
      {
        focus: 'Arms & Core', exercises: [
          { name: 'EZ Bar Curls', sets: 4, reps: '10-12', rest: '75 sec', form: 'Full range, controlled negative' },
          { name: 'Hammer Curls', sets: 3, reps: '12', rest: '60 sec', form: 'Neutral grip, slow eccentric' },
          { name: 'Skull Crushers', sets: 4, reps: '10-12', rest: '75 sec', form: 'Lower to forehead level' },
          { name: 'Weighted Plank', sets: 3, reps: '30 sec', rest: '45 sec', form: 'Plate on back if comfortable' }
        ]
      },
      {
        focus: 'Rest', exercises: [
          { name: 'Complete Rest', sets: 0, reps: 'Rest', rest: '0 sec', form: 'Recovery is where muscle is built' }
        ]
      }
    ]
  }
};

const homeWorkoutTemplates = {
  weight_loss: {
    beginner: [
      {
        focus: 'Full Body Cardio', exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: '40', rest: '30 sec', form: 'Land softly, arms fully extend overhead' },
          { name: 'Bodyweight Squats', sets: 3, reps: '15', rest: '45 sec', form: 'Feet shoulder-width, sit back into squat' },
          { name: 'Push-ups (Modified)', sets: 3, reps: '10', rest: '60 sec', form: 'Keep body in straight line, controlled descent' },
          { name: 'Plank Hold', sets: 3, reps: '20 sec', rest: '30 sec', form: 'Core tight, shoulders over wrists' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Brisk Walking', sets: 1, reps: '30 min', rest: '0 sec', form: 'Easy pace, enjoy the movement' },
          { name: 'Full Body Stretch', sets: 1, reps: '15 min', rest: '0 sec', form: 'Hold each stretch 30 seconds' }
        ]
      },
      {
        focus: 'Lower Body Focus', exercises: [
          { name: 'Reverse Lunges', sets: 3, reps: '10 each leg', rest: '45 sec', form: 'Step back, front knee at 90 degrees' },
          { name: 'Glute Bridges', sets: 3, reps: '20', rest: '30 sec', form: 'Squeeze glutes at top, hold 1 sec' },
          { name: 'Wall Sit', sets: 3, reps: '30 sec', rest: '45 sec', form: 'Thighs parallel to floor, back flat on wall' },
          { name: 'Mountain Climbers', sets: 3, reps: '20 sec', rest: '30 sec', form: 'Fast pace, keep hips down and level' }
        ]
      },
      {
        focus: 'Upper Body + Core', exercises: [
          { name: 'Incline Push-ups (on table/chair)', sets: 3, reps: '12', rest: '60 sec', form: 'Hands elevated, lower chest to surface' },
          { name: 'Superman Hold', sets: 3, reps: '10', rest: '45 sec', form: 'Lift arms and legs simultaneously' },
          { name: 'Bicycle Crunches', sets: 3, reps: '20', rest: '30 sec', form: 'Slow and controlled, full rotation' },
          { name: 'Bird Dog', sets: 3, reps: '10 each side', rest: '30 sec', form: 'Lower back pressed down, extend opposite arm and leg' }
        ]
      },
      {
        focus: 'HIIT Cardio', exercises: [
          { name: 'Burpees (Modified)', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Step back instead of jump if needed' },
          { name: 'High Knees', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Drive knees up to hip height' },
          { name: 'Jump Squats', sets: 4, reps: '30 sec on/15 off', rest: '15 sec', form: 'Soft landing, absorb through knees' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Yoga Flow / Stretching', sets: 1, reps: '20 min', rest: '0 sec', form: 'Focus on breathing and flexibility' },
          { name: 'Foam Rolling (if available)', sets: 1, reps: '10 min', rest: '0 sec', form: 'Slow pressure on tight spots' }
        ]
      },
      {
        focus: 'Full Body Circuit', exercises: [
          { name: 'Squat Jumps', sets: 3, reps: '12', rest: '60 sec', form: 'Explosive jump, soft landing' },
          { name: 'Push-ups', sets: 3, reps: '12', rest: '60 sec', form: 'Full range of motion, core engaged' },
          { name: 'Single-Leg Glute Bridge', sets: 3, reps: '12 each', rest: '45 sec', form: 'Drive through heel, keep hips level' },
          { name: 'Side Plank', sets: 3, reps: '20 sec each', rest: '30 sec', form: 'Hips stacked, don\'t let them drop' }
        ]
      }
    ]
  },
  muscle_gain: {
    beginner: [
      {
        focus: 'Push Day (Chest & Triceps)', exercises: [
          { name: 'Push-ups', sets: 4, reps: '12-15', rest: '75 sec', form: 'Full range, chest nearly touching floor' },
          { name: 'Diamond Push-ups', sets: 3, reps: '10', rest: '75 sec', form: 'Hands close together, elbows flare back' },
          { name: 'Pike Push-ups', sets: 3, reps: '10', rest: '60 sec', form: 'Hips high, lower head toward floor' },
          { name: 'Tricep Dips (on chair)', sets: 3, reps: '12', rest: '60 sec', form: 'Elbows point back, lower slowly' }
        ]
      },
      {
        focus: 'Pull Day (Back & Biceps)', exercises: [
          { name: 'Table / Inverted Rows', sets: 4, reps: '10-12', rest: '90 sec', form: 'Body straight, pull chest to table edge' },
          { name: 'Resistance Band Rows', sets: 3, reps: '12-15', rest: '60 sec', form: 'Squeeze shoulder blades together' },
          { name: 'Resistance Band Curls', sets: 3, reps: '12', rest: '60 sec', form: 'No swinging, controlled negative' },
          { name: 'Superman Hold', sets: 3, reps: '12', rest: '45 sec', form: 'Squeeze back muscles at the top' }
        ]
      },
      {
        focus: 'Active Recovery', exercises: [
          { name: 'Brisk Walking', sets: 1, reps: '20 min', rest: '0 sec', form: 'Zone 2, conversational pace' },
          { name: 'Mobility & Stretching', sets: 1, reps: '15 min', rest: '0 sec', form: 'Focus on chest, back, and shoulders' }
        ]
      },
      {
        focus: 'Legs & Glutes', exercises: [
          { name: 'Bulgarian Split Squats', sets: 4, reps: '10 each leg', rest: '90 sec', form: 'Rear foot elevated, torso upright' },
          { name: 'Single-Leg Romanian Deadlift', sets: 3, reps: '10 each', rest: '75 sec', form: 'Hinge at hip, feel hamstring stretch' },
          { name: 'Jump Squats', sets: 3, reps: '12', rest: '60 sec', form: 'Explosive jump, absorb landing softly' },
          { name: 'Single-Leg Calf Raises', sets: 4, reps: '20', rest: '45 sec', form: 'Full range, pause at top' }
        ]
      },
      {
        focus: 'Shoulders & Upper Back', exercises: [
          { name: 'Pike Push-ups', sets: 4, reps: '10-12', rest: '75 sec', form: 'Hips high throughout' },
          { name: 'Resistance Band Lateral Raises', sets: 3, reps: '15', rest: '60 sec', form: 'Lead with elbows, slight lean forward' },
          { name: 'Band Pull-Aparts', sets: 3, reps: '20', rest: '45 sec', form: 'Arms straight, squeeze shoulder blades' },
          { name: 'Resistance Band Face Pulls', sets: 3, reps: '15', rest: '45 sec', form: 'Pull to forehead level, elbows high' }
        ]
      },
      {
        focus: 'Arms & Core', exercises: [
          { name: 'Close-Grip Push-ups', sets: 4, reps: '12', rest: '75 sec', form: 'Elbows close to body, controlled descent' },
          { name: 'Resistance Band Hammer Curls', sets: 3, reps: '12', rest: '60 sec', form: 'Neutral grip, slow eccentric' },
          { name: 'Hollow Body Hold', sets: 3, reps: '20 sec', rest: '45 sec', form: 'Lower back pressed to floor' },
          { name: 'L-Sit (on chairs)', sets: 3, reps: '10 sec', rest: '45 sec', form: 'Arms straight, legs extended' }
        ]
      },
      {
        focus: 'Rest', exercises: [
          { name: 'Complete Rest', sets: 0, reps: 'Rest', rest: '0 sec', form: 'Recovery is where muscle is built' }
        ]
      }
    ]
  }
};

const generateWorkoutPlan = (goal, experienceLevel, activityLevel, workoutType = 'gym') => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const templates = workoutType === 'home' ? homeWorkoutTemplates : gymWorkoutTemplates;
  const goalTemplates = templates[goal] || (workoutType === 'home' ? homeWorkoutTemplates.weight_loss : gymWorkoutTemplates.weight_loss);
  const levelTemplates = goalTemplates[experienceLevel] || goalTemplates.beginner;

  return days.map((day, index) => ({
    day,
    ...levelTemplates[index % levelTemplates.length]
  }));
};

// ─── Diet templates ───────────────────────────────────────────────────────────

const buildMeals = (targetCalories, goal, proteinG, carbsG, fatG) => {
  const all = {
    weight_loss: {
      non_vegetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['3 egg whites + 1 whole egg scrambled', 'Oatmeal with mixed berries (½ cup oats)', 'Green tea or black coffee'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.25), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Morning Snack', time: '10:00 AM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Greek yogurt (150g)', '1 medium apple'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '1:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Grilled chicken breast (150g)', 'Brown rice (½ cup cooked)', 'Mixed vegetables (unlimited)', 'Olive oil drizzle'],
          protein: Math.round(proteinG * 0.35), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Afternoon Snack', time: '4:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Handful of almonds (20g)', '1 medium orange'],
          protein: Math.round(proteinG * 0.05), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Dinner', time: '7:00 PM',
          calories: Math.round(targetCalories * 0.25),
          items: ['Grilled fish/salmon (150g)', 'Sweet potato (medium)', 'Steamed broccoli & spinach', 'Lemon & herbs seasoning'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.25)
        }
      ],
      eggetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['3 egg whites + 1 whole egg scrambled', 'Oatmeal with mixed berries (½ cup oats)', 'Green tea or black coffee'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.25), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Morning Snack', time: '10:00 AM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Low-fat curd (150g)', '1 medium apple'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '1:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Boiled eggs (2 whole + 1 white)', 'Brown rice or 2 chapattis', 'Mixed vegetable sabzi', 'Dal (lentil soup)'],
          protein: Math.round(proteinG * 0.35), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Afternoon Snack', time: '4:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Handful of walnuts (20g)', '1 medium orange'],
          protein: Math.round(proteinG * 0.05), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Dinner', time: '7:00 PM',
          calories: Math.round(targetCalories * 0.25),
          items: ['Egg bhurji / omelette (3 eggs)', 'Sweet potato or 1 chapatti', 'Steamed broccoli & spinach', 'Mint-coriander chutney'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.25)
        }
      ],
      vegetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['Moong dal chilla (2 pieces)', 'Oatmeal with mixed berries (½ cup oats)', 'Green tea or black coffee'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.25), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Morning Snack', time: '10:00 AM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Low-fat curd / Greek-style dahi (150g)', '1 medium apple'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '1:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Grilled paneer (100g) or tofu (150g)', 'Brown rice (½ cup) or 2 chapattis', 'Mixed vegetable sabzi', 'Masoor/moong dal'],
          protein: Math.round(proteinG * 0.35), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Afternoon Snack', time: '4:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Handful of almonds & walnuts (25g)', '1 medium orange or seasonal fruit'],
          protein: Math.round(proteinG * 0.05), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.20)
        },
        {
          name: 'Dinner', time: '7:00 PM',
          calories: Math.round(targetCalories * 0.25),
          items: ['Soya chunks curry (100g dry)', 'Sweet potato or 1 chapatti', 'Steamed broccoli, palak & beans', 'Coriander-lemon seasoning'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.15), fat: Math.round(fatG * 0.25)
        }
      ]
    },
    muscle_gain: {
      non_vegetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['3 whole eggs + 3 egg whites scrambled', 'Oatmeal (1 cup dry) with banana', 'Whole milk (1 cup)', 'Peanut butter (1 tbsp)'],
          protein: Math.round(proteinG * 0.25), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.25)
        },
        {
          name: 'Pre-Workout', time: '10:30 AM',
          calories: Math.round(targetCalories * 0.15),
          items: ['Greek yogurt (200g)', 'Banana', 'Protein shake (optional)'],
          protein: Math.round(proteinG * 0.20), carbs: Math.round(carbsG * 0.20), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '2:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Chicken breast or lean beef (200g)', 'White rice (1 cup cooked)', 'Mixed vegetables', 'Avocado (½)'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Post-Workout Snack', time: '5:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Protein shake', 'Banana (for glycogen replenishment)'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Dinner', time: '8:00 PM',
          calories: Math.round(targetCalories * 0.20),
          items: ['Salmon or tuna (180g)', 'Pasta or quinoa (1 cup cooked)', 'Olive oil & mixed vegetables'],
          protein: Math.round(proteinG * 0.10), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.35)
        }
      ],
      eggetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['4 whole eggs scrambled', 'Oatmeal (1 cup dry) with banana', 'Whole milk (1 cup)', 'Peanut butter (1 tbsp)'],
          protein: Math.round(proteinG * 0.25), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.25)
        },
        {
          name: 'Pre-Workout', time: '10:30 AM',
          calories: Math.round(targetCalories * 0.15),
          items: ['Low-fat paneer (100g)', 'Banana', 'Protein shake (optional)'],
          protein: Math.round(proteinG * 0.20), carbs: Math.round(carbsG * 0.20), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '2:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Egg curry (4 eggs) or boiled eggs', 'White rice (1 cup) or 3 chapattis', 'Dal (protein-rich)', 'Curd (150g)'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Post-Workout Snack', time: '5:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Protein shake or milk (300ml)', 'Banana (for glycogen replenishment)'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Dinner', time: '8:00 PM',
          calories: Math.round(targetCalories * 0.20),
          items: ['Egg bhurji (3 eggs) or omelette', 'Pasta or quinoa (1 cup cooked)', 'Olive oil, spinach & mushroom'],
          protein: Math.round(proteinG * 0.10), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.35)
        }
      ],
      vegetarian: [
        {
          name: 'Breakfast', time: '7:00 AM',
          calories: Math.round(targetCalories * 0.25),
          items: ['Paneer bhurji (150g paneer)', 'Oatmeal (1 cup) with banana', 'Whole milk (1 cup)', 'Peanut butter (1 tbsp)'],
          protein: Math.round(proteinG * 0.25), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.25)
        },
        {
          name: 'Pre-Workout', time: '10:30 AM',
          calories: Math.round(targetCalories * 0.15),
          items: ['Thick curd / hung curd (200g)', 'Banana', 'Protein shake (optional)'],
          protein: Math.round(proteinG * 0.20), carbs: Math.round(carbsG * 0.20), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Lunch', time: '2:00 PM',
          calories: Math.round(targetCalories * 0.30),
          items: ['Paneer tikka or soya chunks curry (200g)', 'White rice (1 cup) or 3 chapattis', 'Rajma / chana dal', 'Curd (150g)'],
          protein: Math.round(proteinG * 0.30), carbs: Math.round(carbsG * 0.30), fat: Math.round(fatG * 0.30)
        },
        {
          name: 'Post-Workout Snack', time: '5:00 PM',
          calories: Math.round(targetCalories * 0.10),
          items: ['Protein shake or milk (300ml)', 'Banana (for glycogen replenishment)'],
          protein: Math.round(proteinG * 0.15), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.05)
        },
        {
          name: 'Dinner', time: '8:00 PM',
          calories: Math.round(targetCalories * 0.20),
          items: ['Tofu stir-fry or paneer palak (180g)', 'Quinoa or pasta (1 cup cooked)', 'Olive oil, broccoli & mushroom'],
          protein: Math.round(proteinG * 0.10), carbs: Math.round(carbsG * 0.10), fat: Math.round(fatG * 0.35)
        }
      ]
    }
  };

  const goalMeals = all[goal] || all.weight_loss;
  return goalMeals;
};

const generateDietPlan = (targetCalories, goal, sex, dietPreference = 'non_vegetarian') => {
  const macroTemplates = {
    weight_loss:    { protein: 0.40, carbs: 0.30, fat: 0.30 },
    muscle_gain:    { protein: 0.30, carbs: 0.50, fat: 0.20 },
    recomposition:  { protein: 0.40, carbs: 0.35, fat: 0.25 },
    maintain:       { protein: 0.30, carbs: 0.40, fat: 0.30 },
    endurance:      { protein: 0.25, carbs: 0.55, fat: 0.20 }
  };

  const macros = macroTemplates[goal] || macroTemplates.maintain;
  const proteinCals = Math.round(targetCalories * macros.protein);
  const carbCals    = Math.round(targetCalories * macros.carbs);
  const fatCals     = Math.round(targetCalories * macros.fat);

  const proteinG = Math.round(proteinCals / 4);
  const carbsG   = Math.round(carbCals / 4);
  const fatG     = Math.round(fatCals / 9);

  const allMeals = buildMeals(targetCalories, goal, proteinG, carbsG, fatG);
  const mealPlan = (allMeals[dietPreference] || allMeals.non_vegetarian);

  return {
    targetCalories,
    dietPreference,
    macros: {
      protein: { grams: proteinG, calories: proteinCals, percentage: Math.round(macros.protein * 100) },
      carbs:   { grams: carbsG,   calories: carbCals,    percentage: Math.round(macros.carbs * 100) },
      fat:     { grams: fatG,     calories: fatCals,     percentage: Math.round(macros.fat * 100) }
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
