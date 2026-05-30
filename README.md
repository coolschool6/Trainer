# PulsePlan

PulsePlan is a static, single-page fitness console built from patterns in the
four referenced GitHub projects:

- `wger-project/wger`: exercise wiki, routines, progress, and nutrition ideas
- `mckaywrigley/chatbot-ui`: chat workspace structure and conversation flow
- `CodeWithCJ/SparkyFitness`: daily goals, calorie math, check-ins, and privacy-first positioning
- `itskovacs/wingfit`: program cards, session planning, personal-record style tracking, and visual assets

## Run

Open `index.html` in a browser. No build step is required.

Flow:

- `index.html`: sign up and login
- `onboarding.html`: profile, body, training, nutrition, and recovery intake
- `dashboard.html`: personalized plan dashboard and today's workout
- `programs.html`: training block library
- `library.html`: exercise search and filters
- `coach.html`: chat-style coach

## What Works

- Responsive landing experience with real local assets
- Dashboard with workout checklist, readiness score, calories remaining, and load chart
- Program cards with add-program behavior
- Exercise library search and category filter
- Onboarding modal that generates a starter plan
- Local chat coach that can suggest swaps, calories, recovery changes, and log sessions
- Local persistence through `localStorage`

## Notes

The source repositories were cloned into `.reference/` for implementation
reference. This prototype is front-end only and does not include the original
projects' backends, authentication, AI providers, databases, or APIs.
