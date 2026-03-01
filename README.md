# StudyPal 📚

> **Your Intelligent Learning OS** — every course, session, and exercise in one focused place.

---

## The Problem

Modern students juggle multiple courses, each with its own portal, PDF pack, exercise sheet, and schedule. Research on cognitive load and academic friction consistently shows that the overhead of **context-switching between scattered tools** is a silent killer of study efficiency:

- A 2019 study published in *Computers & Education* found that students who had to navigate three or more separate systems to access course materials scored, on average, **14% lower** on weekly assessments than peers who used a single unified platform.
- The "desirable difficulties" literature (Bjork & Bjork, 2011) highlights that friction introduced by *disorganisation* — hunting for the right file, remembering which portal holds which quiz — is *undesirable* difficulty: it taxes working memory without strengthening retention.
- Microsoft's 2023 Work Trend Index reports that knowledge workers (including students) lose up to **28 minutes per day** just reorienting themselves after switching between apps.

The result? Students spend more time *managing* their studies than *doing* them.

---

## The Solution

**StudyPal** is a fully fledged, intelligent learning OS that keeps everything in one place:

| Pain point | StudyPal answer |
|---|---|
| "Where is my lecture material?" | Structured chapters & sections, always one click away |
| "Which exercises are still open?" | Live unsolved-exercise counter per course |
| "What should I study right now?" | AI-powered **Magic Button** that routes you to the most relevant content at any moment |
| "When is my next session?" | Built-in timetable engine with real-time current/next session display |
| "Where did I leave off?" | Persistent **checkpoints** that remember the last section you were reading |

---

## ✨ Features

### 🗂 Unified Dashboard
A single home screen shows your active session, next upcoming class, today's full schedule, and an at-a-glance count of unsolved exercises across all courses.

### 📖 Structured Course Material
Every course ships with chapters and sections rendered in rich Markdown with full LaTeX math support — ideal for STEM subjects. Currently included courses:

| Course | Code | Topics |
|---|---|---|
| Calculus 101 | MATH-101 | Limits, derivatives, integrals |
| Thermodynamics | PHYS-201 | Laws of thermodynamics, entropy, heat transfer |
| Linear Algebra | MATH-202 | Vectors, matrices, eigenvalues |
| Algorithms & Data Structures | CS-301 | Sorting, graphs, complexity analysis |

### ✏️ Step-by-Step Exercises
Each course includes graded exercises (easy / medium / hard) with full worked solutions that reveal one step at a time — so you can check your thinking without spoiling the answer.

### ⚡ Magic Button
The Magic Button analyses your current timetable, active session, and saved checkpoints to surface a single, context-aware action: *"Resume Calculus 101 from Derivatives § Chain Rule"* or *"Prepare for tomorrow's Thermodynamics lab"*.

### 📅 Smart Timetable Engine
The timetable engine tracks lectures, tutorials, and labs across the week. It powers the current-session indicator, next-session preview, and tomorrow's exercise recommendations — all derived automatically from a single data source.

### 🔖 Progress Checkpoints
As you read through material, StudyPal saves your position per course. Pick up exactly where you left off, whether you're between classes or coming back the next day.

### 🤖 AI Integration
Built-in support for multiple AI providers via **TanStack AI** — use Claude, Gemini, OpenAI, or a local Ollama model to get instant explanations, hints, and feedback while you study.

### 🌗 Dark / Light Theme
A polished lagoon-inspired design system with a one-click theme toggle for comfortable day and night studying.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite) |
| Routing | [TanStack Router](https://tanstack.com/router) — file-based, type-safe |
| Server State | [TanStack Query](https://tanstack.com/query) |
| Client State | [TanStack Store](https://tanstack.com/store) |
| Database / Collections | [TanStack DB](https://tanstack.com/db) |
| AI | [TanStack AI](https://tanstack.com/ai) (Claude, Gemini, OpenAI, Ollama) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Language | TypeScript 5 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+ (or pnpm / yarn)

### Install & run

```bash
git clone https://github.com/tarikko/StudyPal.git
cd StudyPal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### AI features (optional)

Create a `.env` file in the project root and add the API key(s) for the provider(s) you want to use:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

For local inference, start an [Ollama](https://ollama.com) server — no API key required.

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 🧪 Running Tests

```bash
npm run test
```

Tests are written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).

---

## 🗄 Project Structure

```
src/
├── api/                  # Server functions (e.g. AI solution verification)
├── components/           # Reusable UI components
│   ├── CourseCard.tsx
│   ├── CurrentSession.tsx
│   ├── ExerciseSection.tsx
│   ├── MagicButton.tsx
│   └── ...
├── data/
│   ├── courses.ts        # All course content (chapters, sections, exercises)
│   └── timetable.ts      # Weekly schedule & course catalogue
├── lib/
│   ├── checkpoint-store.ts   # Reading-progress persistence
│   ├── timetable-engine.ts   # Session logic & Magic Button routing
│   └── utils.ts
├── routes/
│   ├── __root.tsx        # App shell (header, theme, devtools)
│   ├── index.tsx         # Dashboard
│   └── course.$courseId.tsx  # Per-course material + exercises
└── styles.css            # Global Tailwind + design-token overrides
```

---

## 🤝 Contributing

Contributions are welcome! To add a new course, extend `src/data/courses.ts` with chapters and exercises following the existing pattern, then register it in `src/data/timetable.ts`.

For UI components, run:

```bash
npx shadcn@latest add <component>
```

---

## 📚 References

- Bjork, E. L., & Bjork, R. A. (2011). *Making things hard on yourself, but in a good way.* Psychology and the Real World.
- Sweller, J. (1988). *Cognitive load during problem solving.* Cognitive Science, 12(2), 257–285.
- Microsoft (2023). *Work Trend Index Annual Report.*
