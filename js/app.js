(function () {
  const storageKey = "pulseplan_state_v2";

  const defaultState = {
    user: null,
    profile: null,
    onboarding: {
      started: false,
      step: 0,
      answers: {},
      generationStep: 0,
      completed: false,
      revealed: false
    },
    sessions: 12,
    streak: 4,
    readiness: 82,
    completedToday: false,
    goalCalories: 2300,
    eatenCalories: 1480,
    recommendations: null,
    sleep: 7,
    energy: 8,
    programs: [
      {
        name: "Strength Base",
        description: "Four weeks of upper/lower progression with conservative load jumps.",
        days: 4,
        focus: "Hypertrophy",
        image: "assets/cover.jpg"
      },
      {
        name: "Lean Engine",
        description: "Conditioning intervals, full-body strength, and nutrition compliance.",
        days: 3,
        focus: "Fat loss",
        image: "assets/about.jpg"
      },
      {
        name: "Home Reset",
        description: "Dumbbell and bodyweight sessions for travel weeks or busy seasons.",
        days: 3,
        focus: "Consistency",
        image: "assets/cover.jpg"
      }
    ],
    workout: [
      { name: "Incline Dumbbell Press", detail: "4 sets x 8 reps", tag: "Chest", done: false },
      { name: "Chest-Supported Row", detail: "4 sets x 10 reps", tag: "Back", done: false },
      { name: "Romanian Deadlift", detail: "3 sets x 8 reps", tag: "Posterior", done: false },
      { name: "Half-Kneeling Press", detail: "3 sets x 10 reps", tag: "Shoulders", done: false },
      { name: "Farmer Carry", detail: "4 x 35 meters", tag: "Core", done: false }
    ],
    chat: [
      { role: "system", text: "Coach ready. I can swap exercises, adjust the day, estimate calories, or log a session." }
    ]
  };

  const exercises = [
    { name: "Bench Press", type: "strength", muscle: "Chest", muscles: "Chest, triceps", equipment: "Barbell", equipmentKey: "barbell", note: "Use paused reps when joints feel good." },
    { name: "Goblet Squat", type: "strength", muscle: "Legs", muscles: "Quads, glutes", equipment: "Dumbbell", equipmentKey: "dumbbells", note: "Great swap for barbell squat on low-time days." },
    { name: "Pull-up", type: "strength", muscle: "Back", muscles: "Lats, biceps", equipment: "Bar", equipmentKey: "pullup", note: "Band assist keeps volume honest." },
    { name: "Romanian Deadlift", type: "strength", muscle: "Legs", muscles: "Hamstrings, glutes", equipment: "Barbell", equipmentKey: "barbell", note: "Progress load only if bracing stays clean." },
    { name: "Zone 2 Bike", type: "conditioning", muscle: "Cardio", muscles: "Heart, legs", equipment: "Bike", equipmentKey: "bike", note: "Keep nasal-breathing pace for 25-45 minutes." },
    { name: "Sled Push", type: "conditioning", muscle: "Cardio", muscles: "Quads, calves", equipment: "Sled", equipmentKey: "full-gym", note: "Low-skill conditioning with limited soreness." },
    { name: "Hip Airplane", type: "mobility", muscle: "Mobility", muscles: "Hips, trunk", equipment: "Bodyweight", equipmentKey: "bodyweight", note: "Use before hinge-heavy sessions." },
    { name: "Thoracic Opener", type: "mobility", muscle: "Mobility", muscles: "Upper back", equipment: "Bodyweight", equipmentKey: "bodyweight", note: "Useful before pressing days." }
  ];

  const equipmentAliases = [
    { key: "bodyweight", label: "Bodyweight", words: ["bodyweight", "no equipment", "none", "floor", "home only"] },
    { key: "dumbbells", label: "Dumbbells", words: ["dumbbell", "dumbbells", "db"] },
    { key: "bands", label: "Resistance bands", words: ["band", "bands", "resistance band"] },
    { key: "barbell", label: "Barbell", words: ["barbell", "rack", "squat rack", "bench press"] },
    { key: "pullup", label: "Pull-up bar", words: ["pullup", "pull-up", "pull up", "bar"] },
    { key: "kettlebell", label: "Kettlebell", words: ["kettlebell", "kb"] },
    { key: "bike", label: "Bike", words: ["bike", "bicycle", "stationary bike"] },
    { key: "treadmill", label: "Treadmill", words: ["treadmill", "run", "running"] },
    { key: "full-gym", label: "Full gym", words: ["full gym", "gym", "machines", "cable", "cables", "sled"] }
  ];

  const exercisePool = [
    { name: "Tempo Push-up", detail: "4 sets x 8-12 reps", tag: "Push", equipment: ["bodyweight"] },
    { name: "Split Squat", detail: "4 sets x 10 each", tag: "Legs", equipment: ["bodyweight", "dumbbells"] },
    { name: "Hip Bridge", detail: "3 sets x 15 reps", tag: "Glutes", equipment: ["bodyweight", "bands"] },
    { name: "Side Plank", detail: "3 x 35 seconds", tag: "Core", equipment: ["bodyweight"] },
    { name: "Dead Bug", detail: "3 sets x 12 reps", tag: "Core", equipment: ["bodyweight"] },
    { name: "Step-up", detail: "3 sets x 10 each", tag: "Legs", equipment: ["bodyweight", "dumbbells"] },
    { name: "Dumbbell Bench Press", detail: "4 sets x 8 reps", tag: "Chest", equipment: ["dumbbells", "full-gym"] },
    { name: "One-Arm Row", detail: "4 sets x 10 each", tag: "Back", equipment: ["dumbbells", "full-gym"] },
    { name: "Goblet Squat", detail: "4 sets x 10 reps", tag: "Legs", equipment: ["dumbbells", "kettlebell", "full-gym"] },
    { name: "Suitcase Carry", detail: "4 x 30 meters", tag: "Core", equipment: ["dumbbells", "kettlebell", "full-gym"] },
    { name: "Band Row", detail: "4 sets x 12 reps", tag: "Back", equipment: ["bands"] },
    { name: "Band Chest Press", detail: "4 sets x 12 reps", tag: "Push", equipment: ["bands"] },
    { name: "Band Good Morning", detail: "3 sets x 15 reps", tag: "Hinge", equipment: ["bands"] },
    { name: "Kettlebell Swing", detail: "5 sets x 12 reps", tag: "Power", equipment: ["kettlebell", "full-gym"] },
    { name: "Barbell Squat", detail: "4 sets x 6 reps", tag: "Legs", equipment: ["barbell", "full-gym"] },
    { name: "Bench Press", detail: "4 sets x 6-8 reps", tag: "Chest", equipment: ["barbell", "full-gym"] },
    { name: "Romanian Deadlift", detail: "3 sets x 8 reps", tag: "Posterior", equipment: ["barbell", "dumbbells", "full-gym"] },
    { name: "Pull-up", detail: "4 sets x 5-8 reps", tag: "Back", equipment: ["pullup", "full-gym"] },
    { name: "Cable Row", detail: "4 sets x 10 reps", tag: "Back", equipment: ["full-gym"] },
    { name: "Bike Intervals", detail: "6 x 2 minutes strong", tag: "Engine", equipment: ["bike", "full-gym"] },
    { name: "Incline Walk", detail: "18 minutes steady", tag: "Cardio", equipment: ["treadmill", "full-gym"] },
    { name: "Marching Intervals", detail: "10 x 45 seconds brisk", tag: "Cardio", equipment: ["bodyweight"] }
  ];

  const workoutTypeCards = [
    {
      type: "strength",
      title: "Strength training",
      icon: "S",
      image: "assets/workouts/bench-press.svg",
      description: "Build muscle and force production with compound lifts, machines, and smart progression.",
      howTo: ["Start with a stable setup and a controlled range of motion.", "Use 3-5 working sets and rest 90-180 seconds.", "Add reps first, then load when all sets are clean."],
      examples: ["Bench press", "Goblet squat", "Romanian deadlift"]
    },
    {
      type: "conditioning",
      title: "Conditioning",
      icon: "C",
      image: "assets/workouts/conditioning.svg",
      description: "Improve fitness, work capacity, and recovery with intervals, steady cardio, and low-impact engine work.",
      howTo: ["Choose a pace you can repeat without form breakdown.", "Mix easy aerobic work with short hard efforts.", "Keep one or two reps or minutes in reserve when fatigue is high."],
      examples: ["Zone 2 bike", "Tempo run", "Sled push"]
    },
    {
      type: "mobility",
      title: "Mobility and recovery",
      icon: "M",
      image: "assets/workouts/mobility.svg",
      description: "Restore range of motion, reduce stiffness, and prep the body for harder sessions.",
      howTo: ["Move slowly and stay out of pain.", "Use 5-10 minutes before training or on off days.", "Pair mobility with breathing and light loading."],
      examples: ["Hip airplane", "Thoracic opener", "Dynamic warm-up"]
    }
  ];

  const workoutIconGallery = [
    { name: "Bench press", image: "assets/workouts/bench-press.svg", tag: "strength" },
    { name: "Squat", image: "assets/workouts/squat.svg", tag: "legs" },
    { name: "Push-up", image: "assets/workouts/push-up.svg", tag: "bodyweight" },
    { name: "Deadlift", image: "assets/workouts/deadlift.svg", tag: "hinge" },
    { name: "Row", image: "assets/workouts/row.svg", tag: "back" },
    { name: "Run", image: "assets/workouts/run.svg", tag: "conditioning" },
    { name: "Bike", image: "assets/workouts/bike.svg", tag: "conditioning" },
    { name: "Mobility", image: "assets/workouts/mobility.svg", tag: "recovery" }
  ];

  const onboardingSteps = [
    {
      key: "age",
      prompt: "How old are you?",
      type: "number",
      placeholder: "Age",
      min: 13,
      max: 90,
      unit: "years"
    },
    {
      key: "gender",
      prompt: "How do you identify?",
      type: "single",
      options: ["Woman", "Man", "Non-binary", "Prefer not to say"]
    },
    {
      key: "height",
      prompt: "What is your height?",
      type: "number",
      placeholder: "175",
      min: 90,
      max: 240,
      unit: "cm"
    },
    {
      key: "weight",
      prompt: "What is your current weight?",
      type: "number",
      placeholder: "75",
      min: 30,
      max: 250,
      unit: "kg"
    },
    {
      key: "fitnessLevel",
      prompt: "What is your current fitness level?",
      type: "single",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    {
      key: "workoutExperience",
      prompt: "What describes your workout experience best?",
      type: "single",
      options: ["New to training", "Some experience", "Consistent for years", "Competitive athlete"]
    },
    {
      key: "goal",
      prompt: "What is your primary goal right now?",
      type: "single",
      options: ["Lose Weight", "Build Muscle", "Run Faster", "Improve Fitness", "Sports Performance", "Custom Goal"]
    },
    {
      key: "timeline",
      prompt: "What timeline do you want to train for?",
      type: "single",
      options: ["4 weeks", "8 weeks", "12 weeks", "16 weeks", "Custom timeline"]
    },
    {
      key: "days",
      prompt: "How many days per week can you realistically train?",
      type: "single",
      options: ["2", "3", "4", "5", "6", "7"]
    },
    {
      key: "sessionLength",
      prompt: "How long can each session be?",
      type: "single",
      options: ["20 minutes", "30 minutes", "45 minutes", "60 minutes", "75 minutes", "90 minutes"]
    },
    {
      key: "equipment",
      prompt: "What equipment do you have access to?",
      type: "multi",
      options: ["Bodyweight", "Dumbbells", "Bands", "Gym", "Barbell", "Kettlebells", "Running Track", "Bike", "Other"]
    },
    {
      key: "injuries",
      prompt: "Do you have any injuries, pain, or limitations?",
      type: "text",
      placeholder: "Anything the coach should protect"
    },
    {
      key: "nutritionPreferences",
      prompt: "Any nutrition preferences I should know about?",
      type: "single",
      options: ["Balanced", "High protein", "Calorie deficit", "Lean surplus", "Vegetarian", "Vegan", "Low carb", "Flexible"]
    },
    {
      key: "sleepQuality",
      prompt: "How is your sleep lately?",
      type: "single",
      options: ["Rough", "Okay", "Good", "Great"]
    },
    {
      key: "activityLevel",
      prompt: "How active are you outside training?",
      type: "single",
      options: ["Desk bound", "Lightly active", "Moderately active", "Very active"]
    }
  ];

  const generationStages = [
    "Analyzing Recovery Capacity...",
    "Building Training Blocks...",
    "Calculating Progression Strategy...",
    "Designing Nutrition Framework...",
    "Creating Adaptive Coach Profile..."
  ];

  let state = loadState();

  const $ = (selector) => document.querySelector(selector);

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const merged = { ...structuredClone(defaultState), ...saved };
      merged.onboarding = { ...structuredClone(defaultState.onboarding), ...(saved?.onboarding || {}) };
      return merged;
    } catch (error) {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function personalizeFromProfile(profile, resetChat = true) {
    const weight = Number(profile.weight || 75);
    const days = Number(profile.days || 3);
    const sleep = Number(profile.sleep || 7);
    const energy = Number(profile.energy || 7);
    const goal = String(profile.goal || "Build muscle");
    const nutrition = String(profile.nutrition || "Maintenance");
    const equipment = String(profile.equipment || "Full gym");

    state.profile = profile;
    state.completedToday = false;
    state.streak = Math.max(1, days);
    state.sleep = sleep;
    state.energy = energy;
    state.readiness = Math.min(100, Math.round(sleep * 5 + energy * 5 + 18));
    state.recommendations = buildRecommendations(profile);
    state.goalCalories = state.recommendations.nutrition.calories;
    state.eatenCalories = Math.round(state.goalCalories * 0.62);
    state.workout = buildWorkout(profile);
    state.programs = buildPrograms(profile);
    if (resetChat) {
      state.chat = [
        { role: "system", text: `Plan ready for ${profile.name}. Ask me for swaps, nutrition help, or recovery adjustments.` }
      ];
    }
    saveState();
  }

  function estimateCalories(weight, goal, nutrition) {
    const base = Math.round(weight * 31);
    const goalType = classifyGoal(goal);
    if (nutrition === "Calorie deficit" || goalType === "fat-loss") return Math.max(1400, base - 350);
    if (nutrition === "Lean surplus" || goalType === "muscle") return base + 250;
    return base;
  }

  function buildRecommendations(profile) {
    const weight = Number(profile.weight || 75);
    const days = Number(profile.days || 3);
    const level = profile.level || "Intermediate";
    const goal = profile.goal || "General fitness";
    const goalType = classifyGoal(goal);
    const calories = estimateCalories(weight, goal, profile.nutrition || "Maintenance");
    const protein = Math.round(weight * (goalType === "endurance" || goalType === "race" ? 1.7 : 2));
    const fat = Math.round(weight * 0.8);
    const carbs = Math.max(120, Math.round((calories - protein * 4 - fat * 9) / 4));
    const program = chooseProgramType(goalType, days);

    return {
      program,
      split: chooseWeeklySplit(goalType, days),
      intensity: level === "Beginner" ? "RPE 6-7, leave 3 reps in reserve" : level === "Advanced" ? "RPE 8-9 on top sets, leave 1 rep in reserve" : "RPE 7-8, leave 1-2 reps in reserve",
      progression: chooseProgression(goalType),
      conditioning: chooseConditioning(goalType, days),
      nutrition: {
        calories,
        protein,
        carbs,
        fat,
        hydration: `${Math.round(weight * 35)} ml water/day`,
        timing: goalType === "race" || goalType === "endurance"
          ? "Put most carbs before and after hard run or interval days."
          : "Anchor each meal with protein and place carbs around training."
      },
      recovery: {
        sleep: "Target 7.5-9 hours and keep wake time consistent.",
        deload: "Every 4th week, reduce sets by 30-40% if performance or joints feel flat.",
        mobility: "Use 6-8 minutes of joint-specific warmups before each session."
      },
      rationale: buildRationale(goal, profile.equipment, days)
    };
  }

  function chooseProgramType(goalType, days) {
    if (goalType === "race") return days >= 4 ? "5K performance hybrid: intervals, tempo, easy aerobic work, and strength support" : "Minimalist 5K PB plan: two quality runs plus strength support";
    if (goalType === "endurance") return "Engine-building plan: aerobic base, intervals, and full-body strength";
    if (goalType === "fat-loss") return "Fat-loss recomposition: full-body lifting plus low-impact conditioning";
    if (goalType === "muscle") return days >= 4 ? "Hypertrophy split: upper/lower progression" : "Full-body hypertrophy: repeatable compounds and accessories";
    return "General fitness: full-body strength, conditioning, and mobility";
  }

  function chooseWeeklySplit(goalType, days) {
    if (goalType === "race") return days >= 4 ? "Day 1 intervals, Day 2 strength, Day 3 tempo, Day 4 easy run, optional mobility" : "Day 1 intervals, Day 2 strength, Day 3 tempo/easy run";
    if (goalType === "muscle" && days >= 4) return "Upper, lower, upper, lower";
    if (goalType === "fat-loss") return "Three full-body sessions plus two easy walks or bike rides";
    return days >= 4 ? "Full body, conditioning, full body, mobility/zone 2" : "Full body, conditioning, full body";
  }

  function chooseProgression(goalType) {
    if (goalType === "race") return "Add 1 interval or 2-3 minutes tempo volume weekly until deload week.";
    if (goalType === "muscle") return "When all sets hit the top of the rep range, add 2-5% load next time.";
    if (goalType === "fat-loss") return "Keep loads steady while increasing steps or zone 2 by 5-10 minutes weekly.";
    return "Progress one variable weekly: reps first, then load, then density.";
  }

  function chooseConditioning(goalType, days) {
    if (goalType === "race") return "One interval day, one tempo day, one easy aerobic day. Keep strength away from hardest run if possible.";
    if (goalType === "endurance") return "Two zone 2 sessions and one short interval block weekly.";
    if (goalType === "fat-loss") return "Two to four 25-40 minute low-impact zone 2 sessions weekly.";
    return days >= 4 ? "One optional 20-30 minute zone 2 session weekly." : "Short finishers only when recovery is good.";
  }

  function buildRationale(goal, equipment, days) {
    return `Built around "${goal}" with ${formatEquipment(equipment)} and ${days} training days, so exercise selection, volume, and conditioning stay realistic.`;
  }

  function buildPrograms(profile) {
    const days = Number(profile.days || 3);
    const goal = profile.goal || "General fitness";
    const level = profile.level || "Intermediate";
    const length = profile.sessionLength || "45 minutes";
    const equipment = formatEquipment(profile.equipment);
    const program = chooseProgramType(classifyGoal(goal), days);

    return [
      {
        name: `${goal} Foundation`,
        description: `${days} days/week, ${length} sessions, built for a ${level.toLowerCase()} lifter using ${equipment}.`,
        prescription: `${program}. ${chooseProgression(classifyGoal(goal))}`,
        days,
        focus: goal,
        image: "assets/cover.jpg"
      },
      {
        name: "Recovery Support",
        description: `Mobility, easy conditioning, and fatigue management that does not require equipment outside ${equipment}.`,
        prescription: chooseConditioning(classifyGoal(goal), days),
        days: Math.max(1, Math.round(days / 2)),
        focus: "Recovery",
        image: "assets/about.jpg"
      },
      {
        name: "Progress Check",
        description: "Weekly load review, personal records, and nutrition target adjustments.",
        prescription: "Review body weight trend, session performance, and readiness before changing calories or volume.",
        days: 1,
        focus: "Tracking",
        image: "assets/cover.jpg"
      }
    ];
  }

  function detectEquipment(text) {
    const lower = String(text || "").toLowerCase();
    const found = equipmentAliases
      .filter((item) => item.words.some((word) => matchesEquipmentWord(lower, word)))
      .map((item) => item.key);

    if (found.includes("full-gym")) {
      return ["full-gym", "bodyweight", "dumbbells", "barbell", "bands", "pullup", "bike", "treadmill", "kettlebell"];
    }

    if (found.length && !found.includes("bodyweight")) found.push("bodyweight");
    return [...new Set(found)];
  }

  function matchesEquipmentWord(text, word) {
    if (word.length <= 3) {
      return new RegExp(`\\b${word}\\b`).test(text);
    }
    return text.includes(word);
  }

  function normalizeEquipment(equipment) {
    if (Array.isArray(equipment)) {
      const directKeys = equipment
        .map((item) => String(item || "").trim().toLowerCase())
        .map((item) => {
          if (item === "gym") return "full-gym";
          if (item === "running track") return "treadmill";
          if (item === "bike") return "bike";
          if (item === "bands") return "bands";
          if (item === "other") return "bodyweight";
          if (item === "kettlebells") return "kettlebell";
          if (item === "barbell") return "barbell";
          if (item === "dumbbells") return "dumbbells";
          if (item === "bodyweight") return "bodyweight";
          return item;
        });
      if (directKeys.length) return [...new Set(directKeys)];
    }

    const detected = detectEquipment(equipment);
    if (detected.length) return detected;
    return ["bodyweight"];
  }

  function formatEquipment(equipment) {
    const keys = normalizeEquipment(equipment);
    const labels = keys
      .filter((key) => key !== "full-gym" || keys.length === 1)
      .map((key) => equipmentAliases.find((item) => item.key === key)?.label || key);
    return labels.join(", ");
  }

  function getOnboardingStep() {
    return onboardingSteps[Math.min(state.onboarding?.step || 0, onboardingSteps.length - 1)];
  }

  function getOnboardingProgress() {
    const current = state.onboarding?.step || 0;
    return Math.min(100, Math.round((current / onboardingSteps.length) * 100));
  }

  function getOnboardingAnswers() {
    return state.onboarding?.answers || {};
  }

  function normalizeOnboardingValue(step, value) {
    if (step.type === "multi") {
      return Array.isArray(value) ? value : [value].filter(Boolean);
    }

    if (step.type === "number") {
      return String(value || "").trim();
    }

    return String(value || "").trim();
  }

  function formatGoalLabel(goal) {
    const label = String(goal || "").toLowerCase();
    if (label.includes("lose")) return "Lose Weight";
    if (label.includes("build")) return "Build Muscle";
    if (label.includes("run")) return "Run Faster";
    if (label.includes("sport")) return "Sports Performance";
    if (label.includes("fitness")) return "Improve Fitness";
    return String(goal || "General fitness");
  }

  function buildOnboardingProfile() {
    const answers = getOnboardingAnswers();
    const sleepMap = {
      rough: 5,
      okay: 7,
      good: 8,
      great: 9
    };
    const activityMap = {
      "desk bound": 5,
      "lightly active": 6,
      "moderately active": 8,
      "very active": 9
    };

    return {
      name: state.user?.name || state.profile?.name || "Athlete",
      age: answers.age || state.profile?.age || "30",
      gender: answers.gender || state.profile?.gender || "Prefer not to say",
      height: answers.height || state.profile?.height || "175",
      weight: answers.weight || state.profile?.weight || "75",
      level: answers.fitnessLevel || state.profile?.level || "Intermediate",
      workoutExperience: answers.workoutExperience || state.profile?.workoutExperience || "Some experience",
      goal: formatGoalLabel(answers.goal || state.profile?.goal || "Improve Fitness"),
      timeline: answers.timeline || state.profile?.timeline || "12 weeks",
      days: answers.days || state.profile?.days || "3",
      sessionLength: answers.sessionLength || state.profile?.sessionLength || "45 minutes",
      equipment: answers.equipment || state.profile?.equipment || ["bodyweight"],
      limitations: answers.injuries || state.profile?.limitations || "",
      nutrition: answers.nutritionPreferences || state.profile?.nutrition || "Balanced",
      sleep: sleepMap[String(answers.sleepQuality || state.profile?.sleepQuality || "okay").toLowerCase()] || state.profile?.sleep || 7,
      energy: activityMap[String(answers.activityLevel || state.profile?.activityLevel || "moderately active").toLowerCase()] || state.profile?.energy || 7,
      sleepQuality: answers.sleepQuality || state.profile?.sleepQuality || "Okay",
      activityLevel: answers.activityLevel || state.profile?.activityLevel || "Moderately active"
    };
  }

  function detectGoal(text) {
    const lower = String(text || "").toLowerCase();
    if (classifyGoal(lower) === "fat-loss") return "Lose fat";
    if (classifyGoal(lower) === "muscle") return "Build muscle";
    if (classifyGoal(lower) === "race") return extractRaceGoal(text);
    if (classifyGoal(lower) === "endurance") return "Improve endurance";
    if (lower.includes("fitness") || lower.includes("general")) return "General fitness";
    return "";
  }

  function classifyGoal(goal) {
    const lower = String(goal || "").toLowerCase();
    if (lower.includes("fat") || lower.includes("weight loss") || lower.includes("lose weight") || lower.includes("cut")) return "fat-loss";
    if (lower.includes("5k") || lower.includes("10k") || lower.includes("pb") || lower.includes("personal best") || lower.includes("race") || lower.includes("faster mile") || lower.includes("marathon")) return "race";
    if (lower.includes("endurance") || lower.includes("cardio") || lower.includes("conditioning") || lower.includes("stamina")) return "endurance";
    if (lower.includes("muscle") || lower.includes("hypertrophy") || lower.includes("bulk") || lower.includes("size") || lower.includes("strength") || lower.includes("stronger")) return "muscle";
    return "general";
  }

  function extractRaceGoal(text) {
    const lower = String(text || "").toLowerCase();
    if (lower.includes("5k")) return "Run a faster 5K PB";
    if (lower.includes("10k")) return "Run a faster 10K PB";
    if (lower.includes("mile")) return "Run a faster mile";
    if (lower.includes("marathon")) return "Improve marathon performance";
    return "Improve race performance";
  }

  function detectDays(text) {
    const lower = String(text || "").toLowerCase();
    const match = lower.match(/(\d)\s*(day|days|x)\s*(a|per)?\s*(week|wk)?/);
    if (!match) return "";
    const days = Math.max(1, Math.min(6, Number(match[1])));
    return String(days);
  }

  function renderWorkout() {
    const list = $("#workout-list");
    if (!list) return;
    list.innerHTML = "";

    state.workout.forEach((item, index) => {
      const row = document.createElement("label");
      row.className = "workout-item";
      row.innerHTML = `
        <input type="checkbox" ${item.done ? "checked" : ""} data-workout="${index}" />
        <span><strong>${item.name}</strong><span>${item.detail}</span></span>
        <span class="badge">${item.tag}</span>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", (event) => {
        state.workout[Number(event.target.dataset.workout)].done = event.target.checked;
        saveState();
        updateReadiness();
      });
    });
  }

  function renderPersonalizedCopy() {
    if (!state.profile) return;
    const title = $("#plan-hero-title");
    const copy = $("#plan-hero-copy");
    const today = $("#today-title");

    if (title) title.textContent = `${state.profile.name}'s ${state.profile.goal.toLowerCase()} plan is ready.`;
    if (copy) {
      copy.textContent = `${state.profile.days} days/week, ${state.profile.sessionLength}, ${state.profile.equipment.toLowerCase()} equipment, and a ${state.profile.nutrition.toLowerCase()} nutrition target.`;
    }
    if (today) today.textContent = `${state.profile.goal} Session`;
  }

  function renderPrograms() {
    const grid = $("#program-grid");
    if (!grid) return;
    grid.innerHTML = "";

    state.programs.forEach((program) => {
      const card = document.createElement("article");
      card.className = "program-card";
      card.innerHTML = `
        <img src="${program.image}" alt="" />
        <div>
          <strong>${program.name}</strong>
          <span>${program.description}</span>
          ${program.prescription ? `<p>${program.prescription}</p>` : ""}
          <small>${program.days} days/week | ${program.focus}</small>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderExercises() {
    const list = $("#exercise-list");
    const search = $("#exercise-search");
    const filterInput = $("#exercise-filter");
    const equipmentFilter = $("#exercise-equipment-filter");
    const muscleFilter = $("#exercise-muscle-filter");
    const count = $("#exercise-count");
    const emptyState = $("#exercise-empty");
    if (!list || !search || !filterInput || !equipmentFilter || !muscleFilter) return;

    const query = search.value.toLowerCase();
    const filter = filterInput.value;
    const equipmentValue = equipmentFilter.value;
    const muscleValue = muscleFilter.value;

    const filtered = exercises.filter((exercise) => {
      const matchesFilter = filter === "all" || exercise.type === filter;
      const matchesEquipment = equipmentValue === "all" || exercise.equipmentKey === equipmentValue || exercise.equipment.toLowerCase().includes(equipmentValue.replace("full-gym", "gym"));
      const matchesMuscle = muscleValue === "all" || exercise.muscle === muscleValue;
      const searchBlob = `${exercise.name} ${exercise.muscles} ${exercise.equipment} ${exercise.note}`.toLowerCase();
      return matchesFilter && matchesEquipment && matchesMuscle && searchBlob.includes(query);
    });

    if (count) count.textContent = `${filtered.length} movement${filtered.length === 1 ? "" : "s"}`;
    if (emptyState) emptyState.hidden = filtered.length !== 0;

    list.innerHTML = filtered.map((exercise) => `
      <article class="exercise-card">
        <div class="exercise-card-main">
          <span class="badge">${exercise.type}</span>
          <strong>${exercise.name}</strong>
          <span>${exercise.muscles}</span>
          <div class="exercise-meta">
            <span>${exercise.equipment}</span>
            <span>${exercise.muscle}</span>
          </div>
        </div>
        <p>${exercise.note}</p>
      </article>
    `).join("");
  }

  function renderWorkoutTypes() {
    const list = $("#workout-types");
    if (!list) return;

    list.innerHTML = workoutTypeCards.map((item) => `
      <article class="workout-type-card">
        <div class="workout-type-media">
          <img src="${item.image}" alt="${item.title} example" />
          <span>${item.icon}</span>
        </div>
        <div class="workout-type-body">
          <p class="kicker">${item.type}</p>
          <strong>${item.title}</strong>
          <p>${item.description}</p>
          <div class="workout-type-section">
            <span>How to do it</span>
            <ol>${item.howTo.map((step) => `<li>${step}</li>`).join("")}</ol>
          </div>
          <div class="workout-type-tags">
            ${item.examples.map((exercise) => `<span>${exercise}</span>`).join("")}
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderWorkoutIcons() {
    const list = $("#workout-icons");
    if (!list) return;

    list.innerHTML = workoutIconGallery.map((item) => `
      <article class="workout-icon-card">
        <img src="${item.image}" alt="${item.name} icon" />
        <div>
          <strong>${item.name}</strong>
          <span>${item.tag}</span>
        </div>
      </article>
    `).join("");
  }

  function renderOnboardingWizard() {
    const flow = $("#onboarding-flow");
    if (!flow) return;

    const onboarding = state.onboarding || structuredClone(defaultState.onboarding);
    const step = getOnboardingStep();
    const answers = getOnboardingAnswers();
    const started = Boolean(onboarding.started);
    const generationActive = Boolean(onboarding.generationStep && onboarding.generationStep < generationStages.length);
    const revealReady = Boolean(onboarding.revealed);

    const questionValue = answers[step?.key];
    const isMulti = step?.type === "multi";

    const progress = $("#onboarding-progress");
    const progressFill = $("#onboarding-progress-fill");
    const stepLabel = $("#onboarding-step-label");
    const coachCopy = $("#onboarding-coach-copy");
    const question = $("#onboarding-question");
    const response = $("#onboarding-response");
    const options = $("#onboarding-options");
    const actionRow = $("#onboarding-actions");
    const generation = $("#generation-sequence");
    const reveal = $("#plan-reveal");
    const summary = $("#plan-summary");

    if (progress) progress.textContent = `${getOnboardingProgress()}%`;
    if (progressFill) progressFill.style.width = `${getOnboardingProgress()}%`;
    if (stepLabel) stepLabel.textContent = started ? `Step ${Math.min(onboarding.step + 1, onboardingSteps.length)} of ${onboardingSteps.length}` : `Welcome step`;
    if (coachCopy) {
      coachCopy.textContent = started
        ? "Answer one question at a time. I’ll shape the entire plan as we go."
        : "I’ll ask the right questions and build your training strategy without a long form.";
    }

    if (!started) {
      question.innerHTML = `
        <div class="conversation-card intro-card">
          <p class="kicker">AI coach introduction</p>
          <h2>Welcome to PulsePlan.</h2>
          <p>I'm your fitness coach. I'll build your entire fitness strategy based on your body, goals, schedule, equipment, and lifestyle.</p>
          <p class="conversation-note">This takes about 2 minutes.</p>
        </div>
      `;
      if (response) response.innerHTML = "";
      if (options) {
        options.innerHTML = `
          <button class="btn primary full" type="button" data-onboarding-action="start">Let's Build My Plan</button>
        `;
      }
      if (actionRow) actionRow.innerHTML = "";
      if (generation) generation.hidden = true;
      if (reveal) reveal.hidden = true;
      return;
    }

    if (generationActive) {
      const visibleStages = generationStages.slice(0, onboarding.generationStep);
      question.innerHTML = `
        <div class="generation-panel">
          <p class="kicker">Plan generation</p>
          <h2>Building your coaching blueprint.</h2>
          <div class="generation-stack">
            ${visibleStages.map((stage, index) => `<div class="generation-item ${index === visibleStages.length - 1 ? "active" : "done"}"><span>${index + 1}</span><strong>${stage}</strong></div>`).join("")}
          </div>
        </div>
      `;
      if (response) response.innerHTML = "";
      if (options) options.innerHTML = "";
      if (actionRow) actionRow.innerHTML = `<button class="btn ghost" type="button" disabled>Generating...</button>`;
      if (generation) generation.hidden = false;
      if (reveal) reveal.hidden = true;
      return;
    }

    if (revealReady && state.recommendations) {
      const profile = state.profile || buildOnboardingProfile();
      const outcome = classifyGoal(profile.goal) === "muscle"
        ? "+4kg Lean Mass"
        : classifyGoal(profile.goal) === "race"
          ? "Faster race pace"
          : classifyGoal(profile.goal) === "fat-loss"
            ? "Lower body fat"
            : "Better fitness and consistency";

      question.innerHTML = `
        <div class="conversation-card">
          <p class="kicker">Your fitness blueprint</p>
          <h2>${profile.name}'s plan is ready.</h2>
          <p class="section-copy">Projected outcome: ${outcome}. Open the reveal below to activate the plan.</p>
        </div>
      `;
      if (response) response.innerHTML = "";
      if (options) options.innerHTML = "";
      if (actionRow) actionRow.innerHTML = "";
      if (generation) generation.hidden = true;
      if (reveal) reveal.hidden = false;
      if (summary) summary.innerHTML = `${profile.goal} | ${profile.timeline} | ${profile.days} days/week`;
      return;
    }

    if (question) {
      question.innerHTML = `<div class="conversation-card"><p class="kicker">Coach</p><h2>${step.prompt}</h2></div>`;
    }

    if (response) {
      response.innerHTML = questionValue
        ? `<span class="response-pill">${Array.isArray(questionValue) ? questionValue.join(", ") : questionValue}</span>`
        : `<span class="response-hint">Choose an answer to keep going.</span>`;
    }

    if (options) {
      if (step.type === "single") {
        options.innerHTML = step.options.map((item) => `<button class="choice-chip ${String(questionValue || "") === item ? "active" : ""}" type="button" data-onboarding-value="${item}">${item}</button>`).join("");
      } else if (step.type === "multi") {
        const selected = Array.isArray(questionValue) ? questionValue : [];
        options.innerHTML = step.options.map((item) => `<button class="choice-chip ${selected.includes(item) ? "active" : ""}" type="button" data-onboarding-toggle="${item}">${item}</button>`).join("");
      } else {
        options.innerHTML = `
          <label class="answer-field">
            <span>${step.unit ? `${step.unit}` : "Your answer"}</span>
            <input id="onboarding-input" name="${step.key}" type="${step.type === "number" ? "number" : "text"}" min="${step.min || ""}" max="${step.max || ""}" placeholder="${step.placeholder || "Type your answer"}" value="${questionValue || ""}" />
          </label>
        `;
      }
    }

    if (actionRow) {
      if (step.type === "text" || step.type === "number" || step.type === "multi") {
        actionRow.innerHTML = `
          <button class="btn ghost" type="button" data-onboarding-action="back" ${onboarding.step === 0 ? "disabled" : ""}>Back</button>
          <button class="btn primary" type="button" data-onboarding-action="continue">Continue</button>
        `;
      } else {
        actionRow.innerHTML = `<button class="btn ghost" type="button" data-onboarding-action="back" ${onboarding.step === 0 ? "disabled" : ""}>Back</button>`;
      }
    }

    if (generation) generation.hidden = true;
    if (reveal) reveal.hidden = true;
  }

  function saveOnboardingAnswer(key, value) {
    state.onboarding = {
      ...(state.onboarding || structuredClone(defaultState.onboarding)),
      answers: {
        ...(state.onboarding?.answers || {}),
        [key]: value
      }
    };
    saveState();
    renderOnboardingWizard();
  }

  function advanceOnboardingStep() {
    state.onboarding = {
      ...(state.onboarding || structuredClone(defaultState.onboarding)),
      step: Math.min(onboardingSteps.length - 1, (state.onboarding?.step || 0) + 1)
    };
    saveState();
    renderOnboardingWizard();
  }

  function retreatOnboardingStep() {
    state.onboarding = {
      ...(state.onboarding || structuredClone(defaultState.onboarding)),
      step: Math.max(0, (state.onboarding?.step || 0) - 1)
    };
    saveState();
    renderOnboardingWizard();
  }

  function startOnboardingGeneration() {
    state.onboarding = {
      ...(state.onboarding || structuredClone(defaultState.onboarding)),
      generationStep: 1,
      revealed: false,
      completed: false
    };
    saveState();
    renderOnboardingWizard();

    const tick = () => {
      const draft = state.onboarding || structuredClone(defaultState.onboarding);
      if (draft.generationStep >= generationStages.length) {
        const profile = buildOnboardingProfile();
        personalizeFromProfile(profile, true);
        state.onboarding = {
          ...draft,
          completed: true,
          revealed: true,
          generationStep: generationStages.length
        };
        saveState();
        renderOnboardingWizard();
        return;
      }

      state.onboarding = {
        ...draft,
        generationStep: draft.generationStep + 1
      };
      saveState();
      renderOnboardingWizard();
      window.setTimeout(tick, 780);
    };

    window.setTimeout(tick, 480);
  }

  function renderFitnessOS() {
    const profile = state.profile || buildOnboardingProfile();
    const blueprintTitle = $("#blueprint-title");
    const blueprintCopy = $("#blueprint-copy");
    const missionTitle = $("#mission-title");
    const missionCopy = $("#mission-copy");
    const roadmapTitle = $("#roadmap-title");
    const roadmapCopy = $("#roadmap-copy");
    const goalTrack = $("#goal-track");
    const progressMap = $("#progress-map");
    const historyList = $("#history-list");
    const achievementList = $("#achievement-list");
    const coachStatus = $("#coach-status");
    const goalCaloriesDisplay = $("#goal-calories-display");
    const eatenCaloriesDisplay = $("#eaten-calories-display");
    const currentGoal = $("#current-goal");
    const currentGoalCopy = $("#current-goal-copy");
    const goalBadges = $("#goal-badges");
    const milestoneTitle = $("#milestone-title");
    const milestoneCopy = $("#milestone-copy");

    if (blueprintTitle) blueprintTitle.textContent = `${profile.name}'s Fitness Blueprint`;
    if (blueprintCopy) blueprintCopy.textContent = `${profile.goal} | ${profile.timeline} | ${profile.days} days per week | ${formatEquipment(profile.equipment)}`;
    if (missionTitle) missionTitle.textContent = `Day ${Math.min(31, state.sessions + 1)} - ${state.workout[0]?.name || "Coach-selected mission"}`;
    if (missionCopy) missionCopy.textContent = state.recommendations?.rationale || "Your coach is keeping the day focused, adaptive, and realistic.";
    if (roadmapTitle) roadmapTitle.textContent = "Progress roadmap";
    if (roadmapCopy) roadmapCopy.textContent = state.recommendations?.progression || "Progress one variable weekly: reps first, then load, then density.";
    if (currentGoal) currentGoal.textContent = profile.goal;
    if (currentGoalCopy) currentGoalCopy.textContent = `${profile.days} days per week, ${profile.sessionLength}, ${formatEquipment(profile.equipment)}.`;
    if (goalBadges) {
      goalBadges.innerHTML = [profile.timeline, profile.level, profile.sleepQuality || "Balanced"].map((item) => `<span>${item}</span>`).join("");
    }
    if (milestoneTitle) milestoneTitle.textContent = classifyGoal(profile.goal) === "muscle" ? "Hit your first progression check" : classifyGoal(profile.goal) === "race" ? "Lock in your next test run" : "Complete this week cleanly";
    if (milestoneCopy) milestoneCopy.textContent = classifyGoal(profile.goal) === "fat-loss" ? "Maintain consistency, then let the coach reduce volume or adjust nutrition." : "Your next milestone is not perfection. It is clean execution and recovery feedback.";
    if (goalCaloriesDisplay) goalCaloriesDisplay.textContent = String(state.goalCalories || state.recommendations?.nutrition.calories || 0);
    if (eatenCaloriesDisplay) eatenCaloriesDisplay.textContent = String(state.eatenCalories || 0);
    if (goalTrack) {
      goalTrack.innerHTML = [
        ["Goal", profile.goal],
        ["Timeline", profile.timeline],
        ["Training", `${profile.days} days/week`],
        ["Readiness", `${state.readiness}/100`]
      ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
    }
    if (historyList) {
      historyList.innerHTML = `
        <div><strong>${state.sessions}</strong><span>sessions logged</span></div>
        <div><strong>${state.streak}</strong><span>week streak</span></div>
        <div><strong>${state.workout.filter((item) => item.done).length}</strong><span>moves completed today</span></div>
      `;
    }
    if (achievementList) {
      achievementList.innerHTML = [
        "Adaptive plan active",
        `${profile.level} training mode`,
        `${formatEquipment(profile.equipment)} setup`,
        `${profile.sleepQuality || "Balanced"} recovery`
      ].map((item) => `<span>${item}</span>`).join("");
    }
    if (progressMap) {
      progressMap.innerHTML = [
        { label: "Now", value: "Coach-led session", state: "active" },
        { label: "Soon", value: "Weekly progression check", state: "upcoming" },
        { label: "Next", value: profile.timeline, state: "future" }
      ].map((item, index) => `
        <div class="progress-node ${item.state}">
          <span>${index + 1}</span>
          <strong>${item.label}</strong>
          <small>${item.value}</small>
        </div>
      `).join("");
    }
    if (coachStatus) {
      coachStatus.textContent = state.recommendations?.conditioning || "Coach is ready to swap workouts, change intensity, or explain the plan.";
    }
  }

  function renderLoadChart() {
    const chart = $("#load-chart");
    if (!chart) return;
    const values = [62, 76, 48, 88, 74, 92, 58];
    chart.innerHTML = values.map((value) => `<span class="bar" style="height:${value}%"></span>`).join("");
  }

  function renderRecommendations() {
    const rec = state.recommendations;
    if (!rec) return;

    const programType = $("#program-type");
    const recommendationList = $("#recommendation-list");
    const macroTargets = $("#macro-targets");

    if (programType) programType.textContent = rec.program;
    if (recommendationList) {
      recommendationList.innerHTML = `
        <div><strong>Weekly split</strong><span>${rec.split}</span></div>
        <div><strong>Sets and effort</strong><span>${rec.intensity}</span></div>
        <div><strong>Progression</strong><span>${rec.progression}</span></div>
        <div><strong>Conditioning</strong><span>${rec.conditioning}</span></div>
        <div><strong>Recovery</strong><span>${rec.recovery.sleep} ${rec.recovery.deload}</span></div>
        <div><strong>Why this plan</strong><span>${rec.rationale}</span></div>
      `;
    }
    if (macroTargets) {
      macroTargets.innerHTML = `
        <span><strong>${rec.nutrition.protein}g</strong> protein</span>
        <span><strong>${rec.nutrition.carbs}g</strong> carbs</span>
        <span><strong>${rec.nutrition.fat}g</strong> fat</span>
        <span><strong>${rec.nutrition.hydration}</strong> hydration</span>
      `;
    }
  }

  function renderChat() {
    const messages = $("#messages");
    if (!messages) return;
    messages.innerHTML = "";
    state.chat.forEach((message) => appendMessage(message.role, message.text, false));
    messages.scrollTop = messages.scrollHeight;
  }

  function appendMessage(role, text, persist = true) {
    const messages = $("#messages");
    if (!messages) return;
    const item = document.createElement("div");
    item.className = `msg ${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    if (persist) {
      state.chat.push({ role, text });
      saveState();
    }
  }

  function coachReply(text) {
    const lower = text.toLowerCase();
    const equipment = detectEquipment(text);
    const goal = detectGoal(text);
    const days = detectDays(text);
    const limitation = detectLimitations(text);

    if (equipment.length || goal || days || limitation) {
      const profile = {
        ...(state.profile || {}),
        ...(state.user || {}),
        name: state.profile?.name || state.user?.name || "Athlete",
        age: state.profile?.age || "30",
        height: state.profile?.height || "175",
        weight: state.profile?.weight || "75",
        level: state.profile?.level || "Intermediate",
        sessionLength: state.profile?.sessionLength || "45 minutes",
        nutrition: state.profile?.nutrition || "Maintenance",
        equipment: equipment.length ? formatEquipment(equipment.join(" ")) : state.profile?.equipment || "Bodyweight",
        goal: goal || state.profile?.goal || "General fitness",
        days: days || state.profile?.days || "3",
        sleep: state.profile?.sleep || state.sleep || "7",
        energy: state.profile?.energy || state.energy || "7",
        limitations: mergeLimitations(state.profile?.limitations, limitation)
      };

      personalizeFromProfile(profile, false);
      renderAll();
      return buildPlanSummary(profile);
    }

    if (lower.includes("swap") || lower.includes("replace")) {
      return buildSwapReply();
    }

    if (lower.includes("calorie") || lower.includes("food") || lower.includes("meal")) {
      const remaining = computeCalories();
      const rec = state.recommendations || buildRecommendations(state.profile || {});
      return `Based on the current plan, you have about ${remaining} calories remaining. Daily targets: ${rec.nutrition.calories} calories, ${rec.nutrition.protein}g protein, ${rec.nutrition.carbs}g carbs, ${rec.nutrition.fat}g fat. ${rec.nutrition.timing}`;
    }

    if (lower.includes("log") || lower.includes("done") || lower.includes("session")) {
      logSession();
      return "Session logged. Your streak and readiness have been updated.";
    }

    if (lower.includes("tired") || lower.includes("sleep") || lower.includes("recovery")) {
      const rec = state.recommendations || buildRecommendations(state.profile || {});
      return `Recovery adjustment: reduce top sets by one, keep warmups slow, and finish with easy zone 2 work. ${rec.recovery.sleep} ${rec.recovery.deload}`;
    }

    const rec = state.recommendations || buildRecommendations(state.profile || {});
    return `Here is the current recommendation: ${rec.program}. Weekly split: ${rec.split}. Effort: ${rec.intensity}. Nutrition: ${rec.nutrition.calories} calories with ${rec.nutrition.protein}g protein. Ask me to change goal, equipment, days, injury limits, nutrition, reps, or conditioning and I will rebuild it.`;
  }

  function detectLimitations(text) {
    const lower = String(text || "").toLowerCase();
    const flags = [];
    if (lower.includes("knee")) flags.push("knee-friendly lower body choices");
    if (lower.includes("shoulder")) flags.push("shoulder-friendly pressing");
    if (lower.includes("back pain") || lower.includes("lower back")) flags.push("low-back cautious hinging");
    if (lower.includes("no jumping") || lower.includes("apartment")) flags.push("no jumping");
    if (lower.includes("no running")) flags.push("no running");
    return flags.join(", ");
  }

  function mergeLimitations(existing, next) {
    return [existing, next].filter(Boolean).join(", ");
  }

  function buildPlanSummary(profile) {
    const equipment = formatEquipment(profile.equipment);
    const workouts = buildWorkout(profile).map((item) => item.name).join(", ");
    const rec = buildRecommendations(profile);
    return `Updated the whole plan using only: ${equipment}. Program: ${rec.program}. Schedule: ${profile.days} days/week. Today's workout: ${workouts}. Nutrition: ${rec.nutrition.calories} calories, ${rec.nutrition.protein}g protein, ${rec.nutrition.carbs}g carbs, ${rec.nutrition.fat}g fat. Conditioning: ${rec.conditioning}. Progression: ${rec.progression}. Recovery: ${rec.recovery.sleep}`;
  }

  function buildSwapReply() {
    const equipment = normalizeEquipment(state.profile?.equipment || "Bodyweight");
    const allowed = exercisePool.filter((item) => item.equipment.some((key) => equipment.includes(key)));
    const sample = allowed.slice(0, 5).map((item) => item.name).join(", ");
    return `I will keep swaps inside your saved equipment: ${formatEquipment(state.profile?.equipment || "Bodyweight")}. Good options: ${sample}. Tell me the exact exercise you want replaced and I will rebuild around it.`;
  }

  function computeCalories() {
    const goalInput = $("#goal-calories");
    const eatenInput = $("#eaten-calories");
    const remainingOutput = $("#remaining-calories");
    const goal = Number(goalInput?.value || state.goalCalories);
    const eaten = Number(eatenInput?.value || state.eatenCalories);
    const completed = state.workout.filter((item) => item.done).length;
    const exerciseCredit = completed * 35;
    const remaining = Math.max(0, goal - eaten + exerciseCredit);

    state.goalCalories = goal;
    state.eatenCalories = eaten;
    if (remainingOutput) remainingOutput.textContent = remaining;
    saveState();
    return remaining;
  }

  function updateReadiness() {
    const sleepInput = $("#sleep");
    const energyInput = $("#energy");
    const readinessScore = $("#readiness-score");
    const readinessRing = document.querySelector(".readiness-ring");
    const recoveryNote = $("#recovery-note");

    const sleep = Number(sleepInput?.value || state.sleep);
    const energy = Number(energyInput?.value || state.energy);
    const completed = state.workout.filter((item) => item.done).length;
    const score = Math.min(100, Math.round((sleep * 5 + energy * 5 + completed * 6) + 12));

    state.sleep = sleep;
    state.energy = energy;
    state.readiness = score;
    if (readinessScore) readinessScore.textContent = score;
    if (readinessRing) readinessRing.style.background = `conic-gradient(var(--green) ${score}%, #ded8cc 0)`;
    if (recoveryNote) {
      recoveryNote.textContent = score >= 78
        ? "Solid day for normal progression."
        : score >= 60
          ? "Keep the plan, but leave more reps in reserve."
          : "Use a recovery session and protect tomorrow.";
    }
    saveState();
  }

  function logSession() {
    if (!state.completedToday) {
      state.sessions += 1;
      state.completedToday = true;
    }

    state.workout = state.workout.map((item) => ({ ...item, done: true }));
    if ($("#logged-sessions")) $("#logged-sessions").textContent = state.sessions;
    if ($("#week-streak")) $("#week-streak").textContent = state.streak;
    renderWorkout();
    updateReadiness();
    saveState();
  }

  function openModal() {
    $("#onboard-modal")?.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    $("#onboard-modal")?.setAttribute("aria-hidden", "true");
  }

  function initEvents() {
    $("#cta-start")?.addEventListener("click", openModal);
    $("#hero-start")?.addEventListener("click", openModal);
    $("#cancel-onboard")?.addEventListener("click", closeModal);
    $("#complete-workout")?.addEventListener("click", () => {
      logSession();
      appendMessage("system", "Workout logged from the dashboard.");
    });

    document.querySelectorAll("[data-scroll]").forEach((button) => {
      button.addEventListener("click", () => document.querySelector(button.dataset.scroll)?.scrollIntoView());
    });

    $("#goal-calories")?.addEventListener("input", computeCalories);
    $("#eaten-calories")?.addEventListener("input", computeCalories);
    $("#sleep")?.addEventListener("input", updateReadiness);
    $("#energy")?.addEventListener("input", updateReadiness);
    $("#exercise-search")?.addEventListener("input", renderExercises);
    $("#exercise-filter")?.addEventListener("change", renderExercises);
    $("#exercise-equipment-filter")?.addEventListener("change", renderExercises);
    $("#exercise-muscle-filter")?.addEventListener("change", renderExercises);

    $("#onboarding-flow")?.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const action = button.dataset.onboardingAction;
      const value = button.dataset.onboardingValue;
      const toggleValue = button.dataset.onboardingToggle;
      const currentStep = getOnboardingStep();
      const answers = getOnboardingAnswers();

      if (action === "start") {
        state.onboarding = {
          ...(state.onboarding || structuredClone(defaultState.onboarding)),
          started: true,
          step: 0
        };
        saveState();
        renderOnboardingWizard();
        return;
      }

      if (action === "back") {
        retreatOnboardingStep();
        return;
      }

      if (action === "continue") {
        const input = $("#onboarding-input");
        const nextValue = normalizeOnboardingValue(currentStep, input?.value || "");
        if (!nextValue) return;
        saveOnboardingAnswer(currentStep.key, nextValue);
        if (state.onboarding.step < onboardingSteps.length - 1) {
          advanceOnboardingStep();
        } else {
          startOnboardingGeneration();
        }
        return;
      }

      if (action === "activate") {
        window.location.href = "dashboard.html";
        return;
      }

      if (value && currentStep?.type === "single") {
        saveOnboardingAnswer(currentStep.key, value);
        if (state.onboarding.step < onboardingSteps.length - 1) {
          advanceOnboardingStep();
        } else {
          startOnboardingGeneration();
        }
        return;
      }

      if (toggleValue && currentStep?.type === "multi") {
        const selected = Array.isArray(answers[currentStep.key]) ? answers[currentStep.key] : [];
        const nextSelection = selected.includes(toggleValue)
          ? selected.filter((item) => item !== toggleValue)
          : [...selected, toggleValue];
        saveOnboardingAnswer(currentStep.key, nextSelection);
      }
    });

    $("#onboarding-flow")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const currentStep = getOnboardingStep();
      if (!currentStep) return;
      const input = $("#onboarding-input");
      const nextValue = normalizeOnboardingValue(currentStep, input?.value || "");
      if (!nextValue) return;
      saveOnboardingAnswer(currentStep.key, nextValue);
      if (state.onboarding.step < onboardingSteps.length - 1) {
        advanceOnboardingStep();
      } else {
        startOnboardingGeneration();
      }
    });

    $("#add-program")?.addEventListener("click", () => {
      const number = state.programs.length + 1;
      state.programs.push({
        name: `Custom Block ${number}`,
        description: "A new four-week training block ready to customize.",
        days: 3,
        focus: "Custom",
        image: number % 2 ? "assets/about.jpg" : "assets/cover.jpg"
      });
      renderPrograms();
      saveState();
    });

    $("#onboard-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const profile = { ...(state.profile || {}), ...(state.user || {}), ...data, name: state.profile?.name || state.user?.name || "Athlete" };
      personalizeFromProfile(profile, false);
      closeModal();
      renderAll();
      appendMessage("system", `Generated a ${data.days}-day ${data.goal.toLowerCase()} plan for ${data.equipment.toLowerCase()} training.`);
    });

    $("#reset-demo")?.addEventListener("click", () => {
      state = structuredClone(defaultState);
      saveState();
      closeModal();
      renderAll();
    });

    $("#chat-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("#chat-input");
      const text = input.value.trim();
      if (!text) return;
      appendMessage("user", text);
      input.value = "";
      setTimeout(() => appendMessage("bot", coachReply(text)), 250);
    });

    document.querySelectorAll("[data-coach-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = $("#chat-input");
        if (!input) return;
        input.value = button.dataset.coachPrompt || "";
        input.focus();
      });
    });

    $("#clear-chat")?.addEventListener("click", () => {
      state.chat = structuredClone(defaultState.chat);
      saveState();
      renderChat();
    });
  }

  function initAuth() {
    const signupForm = $("#signup-form");
    const loginForm = $("#login-form");
    if (!signupForm && !loginForm) return;

    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.authTab;
        document.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.toggle("active", item === tab));
        signupForm?.classList.toggle("active", mode === "signup");
        loginForm?.classList.toggle("active", mode === "login");
      });
    });

    signupForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.user = { name: data.name, email: data.email };
      saveState();
      window.location.href = "onboarding.html";
    });

    loginForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.user = state.user || { name: data.email.split("@")[0], email: data.email };
      saveState();
      window.location.href = "onboarding.html";
    });
  }

  function initProfileForm() {
    const form = $("#profile-form");
    if (!form) return;

    const existing = { ...(state.user || {}), ...(state.profile || {}) };
    Object.entries(existing).forEach(([key, value]) => {
      const input = form.elements.namedItem(key);
      if (input && value) input.value = value;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = Object.fromEntries(new FormData(event.currentTarget).entries());
      state.user = state.user || { name: profile.name, email: "" };
      personalizeFromProfile(profile);
      window.location.href = "dashboard.html";
    });
  }

  function initOnboardingWizard() {
    if (!$("#onboarding-flow")) return;
    state.onboarding = { ...structuredClone(defaultState.onboarding), ...(state.onboarding || {}) };
    if (state.profile && !state.onboarding.revealed) {
      state.onboarding = {
        ...state.onboarding,
        started: true,
        step: onboardingSteps.length - 1
      };
    }
    saveState();
    renderOnboardingWizard();
  }

  function initFitnessOS() {
    if (!$("#dashboard-os")) return;
    renderFitnessOS();
  }

  function buildWorkout(data) {
    const equipment = normalizeEquipment(data.equipment);
    const goal = String(data.goal || "").toLowerCase();
    const goalType = classifyGoal(goal);
    const limitations = String(data.limitations || "").toLowerCase();
    const priorityTags = goalType === "race" || goalType === "endurance"
      ? ["Cardio", "Engine", "Legs", "Core"]
      : goalType === "fat-loss"
        ? ["Legs", "Push", "Pull", "Cardio", "Core"]
        : goalType === "muscle"
          ? ["Chest", "Back", "Legs", "Posterior", "Core"]
          : ["Push", "Pull", "Legs", "Core", "Cardio"];

    const allowed = exercisePool
      .filter((item) => item.equipment.some((key) => equipment.includes(key)))
      .filter((item) => {
        if (limitations.includes("knee") && ["Barbell Squat", "Step-up"].includes(item.name)) return false;
        if (limitations.includes("shoulder") && ["Bench Press", "Dumbbell Bench Press", "Band Chest Press"].includes(item.name)) return false;
        if (limitations.includes("back") && ["Romanian Deadlift", "Kettlebell Swing"].includes(item.name)) return false;
        if ((limitations.includes("no running") || limitations.includes("no jumping")) && item.name === "Marching Intervals") return false;
        return true;
      });

    const chosen = [];
    priorityTags.forEach((tag) => {
      const match = allowed.find((item) => item.tag === tag && !chosen.includes(item));
      if (match) chosen.push(match);
    });

    allowed.forEach((item) => {
      if (chosen.length < 5 && !chosen.includes(item)) chosen.push(item);
    });

    if (!chosen.length) {
      chosen.push(
        { name: "Tempo Push-up", detail: "4 sets x 8-12 reps", tag: "Push", equipment: ["bodyweight"] },
        { name: "Split Squat", detail: "4 sets x 10 each", tag: "Legs", equipment: ["bodyweight"] },
        { name: "Side Plank", detail: "3 x 35 seconds", tag: "Core", equipment: ["bodyweight"] }
      );
    }

    return chosen.slice(0, 5).map((item) => ({ ...item, done: false }));
  }

  function renderAll() {
    if (!state.recommendations && state.profile) {
      state.recommendations = buildRecommendations(state.profile);
      state.programs = buildPrograms(state.profile);
      saveState();
    }
    if ($("#goal-calories")) $("#goal-calories").value = state.goalCalories;
    if ($("#eaten-calories")) $("#eaten-calories").value = state.eatenCalories;
    if ($("#sleep")) $("#sleep").value = state.sleep;
    if ($("#energy")) $("#energy").value = state.energy;
    if ($("#logged-sessions")) $("#logged-sessions").textContent = state.sessions;
    if ($("#week-streak")) $("#week-streak").textContent = state.streak;
    renderWorkout();
    renderPersonalizedCopy();
    renderPrograms();
    renderExercises();
    renderWorkoutTypes();
    renderWorkoutIcons();
    renderLoadChart();
    renderRecommendations();
    renderOnboardingWizard();
    renderFitnessOS();
    renderChat();
    computeCalories();
    updateReadiness();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initProfileForm();
    initOnboardingWizard();
    initFitnessOS();
    initEvents();
    renderAll();
  });
})();
