# Wellness Matrix – Mobile App Interface Design

## Brand & Visual Identity

**App Name:** Wellness Matrix  
**Tagline:** Build your self-care habits, one week at a time.

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F8F5F2` (warm cream) | All screen backgrounds |
| Foreground | `#2D2D2D` (dark grey) | Primary text |
| Muted | `#7A7A7A` | Secondary/hint text |
| Surface | `#FFFFFF` | Cards, input fields |
| Border | `#E8E0D8` | Dividers, card borders |
| Primary | `#A8C4D8` (dusty blue) | CTA buttons, active states |
| Blue (Week 1) | `#A8C4D8` | Blue quadrant accent |
| Yellow (Week 2) | `#E8D5A3` | Yellow quadrant accent |
| Green (Week 3) | `#B8D5A3` | Green quadrant accent |
| Red (Week 4) | `#F4C2C2` | Red quadrant accent |
| Success | `#6DB87A` | Completion states |
| Error | `#E07070` | Errors |

### Typography
- Font: System default (SF Pro on iOS, Roboto on Android)
- Heading: 28–32px bold
- Subheading: 18–22px semibold
- Body: 15–16px regular, line-height 1.5×
- Caption: 12–13px muted

### Layout Principles
- Rounded corners: 16–24px on cards, 12px on buttons
- Generous white space: 24px horizontal padding, 20px vertical gaps
- Bottom navigation: 4 tabs (Home, Journal, Progress, Profile)
- Every journaling screen: Back + Home + Next bottom action bar

---

## Screen List

### Auth & Onboarding
1. **Landing / Welcome** – App logo, tagline, Sign Up + Login buttons
2. **Sign Up** – Email, password, confirm password, Create & Pay CTA
3. **Login** – Email, password (with show toggle), Login CTA, Forgot password
4. **Forgot Password** – Email input, send reset link
5. **Privacy Screen** – One-time post-signup data privacy confirmation
6. **Vision Screen** – 500-char text box to set 4-week vision
7. **Prep Week Home** – Checklist: set vision ✓, choose Week 1 practice

### Practice Chooser (Weeks 1–4, Sundays)
8. **Week 1 Practice Chooser** – Blue quadrant, ideas list, custom text input
9. **Week 2 Practice Chooser** – Yellow quadrant
10. **Week 3 Practice Chooser** – Green quadrant
11. **Week 4 Practice Chooser** – Red quadrant

### Daily Home
12. **Daily Home Screen** – Vision preview, week/day progress, today's practice, journal buttons (timing-gated)

### Journaling
13. **Morning Journal (5 screens)** – Practice intent → 5 gratitudes → focus → important → better moments
14. **Evening Journal (5 screens)** – Practice completion → 3 gratitudes → evening moment → learned → let go
15. **Free Write** – Open text area, always available

### Weekly Reflection (Sundays)
16. **Weekly Reflection (6 screens)** – 6 guided questions, week summary

### Milestones
17. **Week 4 Gift Transition** – Bonus weeks 5–8 unlocked celebration
18. **Week 8 Completion** – Full matrix summary, Continue £3/mo or Download PDF

### Supporting Screens
19. **Progress Overview** – Journey timeline, completion stats, all 4 practices
20. **Profile / Settings** – Account info, subscription status, delete account, logout
21. **Journal Overview** – Calendar/list of past entries

---

## Key User Flows

### New User Flow
Landing → Sign Up → (Stripe payment) → Privacy Screen → Vision Screen → Prep Week Home → (Sunday) Week 1 Practice Chooser → Daily Home

### Returning User Flow
Landing → Login → Daily Home (resume exactly where left off)

### Daily Journaling Flow
Daily Home → (before 12pm) Morning Journal Screen 1/5 → … → 5/5 → Daily Home  
Daily Home → (after 6pm) Evening Journal Screen 1/5 → … → 5/5 → Daily Home  
Daily Home → Free Write (always) → Daily Home

### Weekly Reflection Flow
(Sunday) Daily Home → Weekly Reflection 1/6 → … → 6/6 → (Week 4) Gift Transition → Week 5 Home  
(Week 8) Weekly Reflection 6/6 → Week 8 Completion → Continue or Download PDF

### Practice Selection Flow
(Sunday, Weeks 1–4) Daily Home → Practice Chooser → Save & Commit → Daily Home

---

## Screen Layouts

### Daily Home Screen
```
┌─────────────────────────────────┐
│ Good morning, [Name]            │
│ YOUR 4-WEEK VISION              │
│ "I want to feel lighter..."  ↓  │
│                                 │
│ Week 3 of 4 · Day 18           │
│ [═══════░░░░░░░░] 75%          │
│                                 │
│ TODAY'S PRACTICE                │
│ Week 3 – Green List             │
│ "Pet time after dinner"  [ ]   │
│                                 │
│ [MORNING]  [EVENING]           │
│ [FREE WRITE]  [REFLECTION]     │
│                                 │
│ 🏠  📝  📊  👤                  │
└─────────────────────────────────┘
```

### Morning Journal Screen (per step)
```
┌─────────────────────────────────┐
│ ← Back                    🏠   │
│                                 │
│ MORNING JOURNAL                 │
│ Screen 2 of 5                   │
│ ─────────────────────           │
│                                 │
│ GRATITUDE 2 OF 5                │
│ What are you grateful for?      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Type here...                │ │
│ └─────────────────────────────┘ │
│                                 │
│         [← Back] [Next →]      │
└─────────────────────────────────┘
```

### Practice Chooser Screen
```
┌─────────────────────────────────┐
│ CHOOSE YOUR WEEK 1 PRACTICE     │
│ Blue List – Connection & Calm   │
│                                 │
│ [Matrix quadrant image]         │
│                                 │
│ IDEAS:                          │
│ • 3 mindful breaths             │
│ • 10min nature walk             │
│ • 5min sunshine moment          │
│ • Help someone small            │
│                                 │
│ My Week 1 practice:             │
│ ┌─────────────────────────────┐ │
│ │ Type your practice...       │ │
│ └─────────────────────────────┘ │
│                                 │
│      [Save & Commit]            │
└─────────────────────────────────┘
```
