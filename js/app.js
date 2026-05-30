(function () {
  const storageKey = "pulseplan_state_v2";

  const defaultState = {
    user: null,
    profile: null,
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

  let state = loadState();

  const $ = (selector) => document.querySelector(selector);

  function loadState() {
    try {
      return { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey)) };
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
      window.location.href = state.profile ? "dashboard.html" : "onboarding.html";
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
    renderChat();
    computeCalories();
    updateReadiness();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initProfileForm();
    initEvents();
    renderAll();
  });
})();
