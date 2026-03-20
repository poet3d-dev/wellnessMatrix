# Wellness Matrix – Project TODO

## Phase 1: Theme & Branding
- [x] Configure warm cream theme colors in theme.config.js
- [x] Generate app logo and update app.config.ts
- [x] Add all required icon mappings in icon-symbol.tsx

## Phase 2: Database & Backend
- [x] Define database schema (users, practices, daily_entries, weekly_reflections, free_writes, journey_progress)
- [x] Add tRPC routes for auth, practices, journal entries, reflections, free writes
- [x] Run db:push to apply migrations

## Phase 3: Auth & Onboarding
- [x] Landing/Welcome screen
- [x] Privacy screen (one-time post-signup)
- [x] Vision screen (500-char text box)
- [x] Prep Week Home screen

## Phase 4: Home & Navigation
- [x] Tab bar navigation (Home, Journal, Progress, Profile)
- [x] Daily Home screen with timing logic
- [x] Practice chooser – Week 1 (Blue)
- [x] Practice chooser – Week 2 (Yellow)
- [x] Practice chooser – Week 3 (Green)
- [x] Practice chooser – Week 4 (Red)
- [x] Timing gates (morning before 12pm, evening after 6pm)

## Phase 5: Journaling Flows
- [x] Morning Journal – multi-step flow (mood, gratitude, intention, practice intent)
- [x] Evening Journal – multi-step flow (gratitude, reflection, practice check-in)
- [x] Free Write screen (always available)
- [x] Journal Overview screen (list of past entries with badges)

## Phase 6: Reflections & Milestones
- [x] Sunday Weekly Reflection – 6-question flow (weeks 1–8)
- [x] Week 8 Completion screen (PDF export prompt)
- [x] Journey export / share summary screen

## Phase 7: Profile & Progress
- [x] Progress Overview screen (journey timeline, stats, week-by-week)
- [x] Profile / Settings screen (account info, logout, delete account)
- [x] Journey summary share (text export)

## Phase 8: Polish & Delivery
- [x] App logo generated and applied
- [x] All TypeScript errors resolved (0 errors)
- [x] Checkpoint saved


## Phase 9: Push Notifications & Reminders
- [ ] Set up expo-notifications and request permissions
- [ ] Schedule daily 7am morning journal reminder
- [ ] Schedule daily 7pm evening journal reminder
- [ ] Test notification delivery on device

## Phase 10: Expanded Morning Journal
- [ ] Add "5 Better Moments" multi-input to morning flow
- [ ] Add "Most Important Thing" single-input to morning flow
- [ ] Update database schema to store these new fields
- [ ] Update morning journal API route to handle new fields
- [ ] Integrate new prompts into morning journal UI

## Phase 11: Streak Tracking
- [ ] Add streak calculation logic to timing utilities
- [ ] Calculate consecutive days with completed journals
- [ ] Display streak counter on home screen
- [ ] Add streak badge/visual indicator
- [ ] Show streak in progress overview


## Phase 9: Push Notifications & Reminders
- [x] Set up expo-notifications and request permissions
- [x] Schedule daily 7am morning journal reminder
- [x] Schedule daily 7pm evening journal reminder
- [x] Test notification delivery on device

## Phase 10: Expanded Morning Journal
- [x] Add "5 Better Moments" multi-input to morning flow
- [x] Add "Most Important Thing" single-input to morning flow
- [x] Update morning journal UI with new prompts
- [x] Integrate new prompts into morning journal flow

## Phase 11: Streak Tracking
- [x] Add streak calculation logic to timing utilities
- [x] Calculate consecutive days with completed journals
- [x] Display streak counter on home screen
- [x] Add streak badge/visual indicator with emoji and message
