// Helper: detect which page we're on
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  if (body.classList.contains("page-input")) {
    setupFormPage();
  } else if (body.classList.contains("page-plan")) {
    setupPlanPage();
  }
});

function setupFormPage() {
  const form = document.getElementById("sprint-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const age = document.getElementById("age").value;
    const level = document.getElementById("level").value;
    const days = document.getElementById("days").value;
    const surface = document.getElementById("surface").value;
    const injury = document.getElementById("injury").value;

    // Pack values into the URL so plan.html can read them
    const params = new URLSearchParams({
      age,
      level,
      days,
      surface,
      injury,
    });

    window.location.href = "plan.html?" + params.toString();
  });
}

function setupPlanPage() {
  const params = new URLSearchParams(window.location.search);
  const container = document.getElementById("plan-container");

  if (!params.has("age")) {
    container.innerHTML = "<p>No data found. Please go back and fill out the form.</p>";
    return;
  }

  const age = Number(params.get("age"));
  const level = params.get("level");
  const days = Number(params.get("days"));
  const surface = params.get("surface");
  const injury = params.get("injury");

  const plan = buildSprintPlan({ age, level, days, surface, injury });

  container.innerHTML = "";

  const intro = document.createElement("p");
  intro.textContent = `Here is your 6-week, 100-yard sprint program (${days} day(s) per week, ${level} level on ${surface}).`;
  container.appendChild(intro);

  plan.forEach((week) => {
    const card = document.createElement("div");
    card.className = "week-card";

    const title = document.createElement("h3");
    title.textContent = `Week ${week.week} — ${week.focus}`;
    card.appendChild(title);

    const details = document.createElement("p");
    details.textContent = `${week.sessionsPerWeek} session(s) per week. Each session: ${week.reps} x 100-yard sprints at RPE ${week.rpe}, ${week.restSeconds} seconds rest between sprints.`;
    card.appendChild(details);

    const notes = document.createElement("p");
    notes.className = "week-notes";
    notes.textContent = week.notes;
    card.appendChild(notes);

    container.appendChild(card);
  });
}

function buildSprintPlan({ age, level, days, surface, injury }) {
  // Base settings by level
  let baseReps, baseRpe, baseRest;
  switch (level) {
    case "advanced":
      baseReps = 10;
      baseRpe = 8;
      baseRest = 60;
      break;
    case "intermediate":
      baseReps = 8;
      baseRpe = 7;
      baseRest = 75;
      break;
    default:
      // beginner
      baseReps = 6;
      baseRpe = 6;
      baseRest = 90;
      break;
  }

  // Adjust slightly for age (very simple rule of thumb)
  if (age >= 50) {
    baseRest += 15;
    baseRpe -= 0.5;
  }

  // Injury adjustments (just for safety messaging & rest)
  let injuryNote = "";
  if (injury === "knees") {
    baseRest += 15;
    injuryNote = "Stay on a flat, predictable surface. Focus on soft landings and avoid heavy braking.";
  } else if (injury === "hamstrings") {
    baseRpe -= 0.5;
    injuryNote = "Emphasize a long warm-up and keep the first 2 weeks at controlled intensity. Stop immediately at any pulling sensation.";
  } else if (injury === "lower-back") {
    injuryNote = "Stay tall while sprinting, brace your core, and avoid excessive forward lean.";
  }

  const surfaceNote = `Surface: ${surface}. Choose shoes appropriate for that surface and do at least 2 easy build-up runs before the first sprint.`;

  const plan = [];

  for (let week = 1; week <= 6; week++) {
    // small progression over time
    const sessionsPerWeek = days;
    const reps = baseReps + Math.floor((week - 1) / 2); // add 1 rep every 2 weeks
    const rpe = (baseRpe + (week - 1) * 0.5).toFixed(1);
    const restSeconds = Math.max(45, baseRest - (week - 1) * 5); // slightly shorter rest

    let focus;
    if (week <= 2) focus = "Technique & acceleration";
    else if (week <= 4) focus = "Speed & consistency";
    else focus = "Peak speed & confidence";

    const notes =
      `Warm up thoroughly with 5–10 minutes of easy movement and 3–4 progressive build-up runs. ` +
      `${surfaceNote} ` +
      (injuryNote ? injuryNote + " " : "") +
      "Finish each session with light walking and stretching.";

    plan.push({
      week,
      sessionsPerWeek,
      reps,
      rpe,
      restSeconds,
      focus,
      notes,
    });
  }

  return plan;
}
