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

### 🤖 Mistral AI — Intelligent Exercise Verification
StudyPal was built for the **Mistral AI Global Hackathon 2026** and uses **Mistral Large** as its AI brain for exercise verification. What makes the integration creative is how it goes far beyond a simple chat wrapper:

- **Text solution grading** — paste any typed solution and Mistral Large reads the exercise context (title + full problem statement) alongside a rich system prompt that instructs it to act as a university tutor, identify exactly where errors occur, and return a concise verdict (✅ Correct / ⚠️ Partially Correct / ❌ Incorrect) with encouraging feedback.
- **Handwritten photo grading** — using the browser's `capture="environment"` camera API, students can snap a picture of their copybook directly on mobile. The image is encoded to base64 and sent as a multimodal message; Mistral's vision capabilities then read and grade the handwritten work just like typed text.
- **Streaming responses** — results stream back token-by-token via Server-Sent Events (TanStack AI + TanStack Start server functions), rendered live with `Streamdown` so feedback appears instantly rather than waiting for the full response.
- **OpenAI-compatible adapter** — Mistral's API is consumed through TanStack AI's `openaiText` adapter pointed at `https://api.mistral.ai/v1`, keeping the integration thin and swappable.

To enable AI verification, add your key to `.env`:

```env
MISTRAL_API_KEY=your_mistral_api_key
```

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
| AI | [Mistral Large](https://mistral.ai) via [TanStack AI](https://tanstack.com/ai) OpenAI-compatible adapter |
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

Create a `.env` file in the project root and add your Mistral API key to enable exercise verification:

```env
MISTRAL_API_KEY=your_mistral_api_key
```

No key? You can still use the full platform — AI verification is an opt-in overlay on each exercise.

### Smart OCR routing for uploads

The upload pipeline now reviews PDFs page by page before OCR:

- Digital text pages bypass OCR entirely.
- Clean printed scans can be routed to a cheaper OpenAI-compatible open-source OCR backend.
- Formula-heavy, handwritten, blurry, or otherwise ambiguous pages stay on Mistral OCR.

Recommended open-source backends for the cheap path:

- `PaddleOCR-VL-0.9B`: best fit for clean printed document pages, multilingual text, and general page parsing.
- `Surya` or `Chandra`: good open-source fallback when you want strong layout handling and better robustness on noisy scans.

To enable the cheaper OCR lane, point StudyPal at any OpenAI-compatible server that exposes your chosen model:

```env
MISTRAL_API_KEY=your_mistral_api_key
OPEN_SOURCE_OCR_BASE_URL=http://localhost:8000/v1
OPEN_SOURCE_OCR_MODEL=PaddleOCR-VL-0.9B
OPEN_SOURCE_OCR_API_KEY=
```

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

## 🗺 Roadmap

The features below are planned for upcoming releases:

### 📝 In-App Course Editor
A fully fledged rich-text + Markdown editor built into every course page, letting instructors and students add, rearrange, and publish sections without touching source files. Supports LaTeX, code blocks, callouts, and image embeds.

### 📸 Copybook → Beautiful Notes
Point your camera at any page of your handwritten notes, select the target course section, and StudyPal will use Mistral's vision API to transcribe and reformat your handwriting into clean, structured Markdown — complete with headings, bullet points, and LaTeX math — and append it directly to the chosen section.

### 📊 Native JS Charts
Embed live, interactive charts directly inside course material using a JavaScript-native charting library (e.g. Chart.js or Observable Plot). Write a simple JSON data block in a section and StudyPal renders it as a bar chart, line graph, or scatter plot — ideal for visualising data sets, algorithm performance curves, or thermodynamic cycles.

### ⚙️ Rich Settings Panel
A comprehensive settings screen covering: preferred AI model, default exercise difficulty filter, theme customisation (accent colour, font size), notification preferences for upcoming sessions, and keyboard shortcuts.

### 🔗 Google Workspace Integration
Connect StudyPal to your Google account to:
- **Import** lecture slides and Docs as course sections automatically
- **Sync** your timetable with Google Calendar (two-way)
- **Export** solved exercises and notes to Google Drive as formatted PDFs

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
