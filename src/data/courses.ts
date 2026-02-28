export interface Chapter {
  id: string
  title: string
  sections: Section[]
}

export interface Section {
  id: string
  title: string
  content: string
}

export interface Exercise {
  id: string
  courseId: string
  chapterId: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  prerequisites: { sectionId: string; chapterId: string; label: string }[]
  problem: string
  steps: string[]
  solved: boolean
}

export interface CourseContent {
  courseId: string
  chapters: Chapter[]
  exercises: Exercise[]
}

export const courseContents: Record<string, CourseContent> = {
  calc101: {
    courseId: 'calc101',
    chapters: [
      {
        id: 'ch1',
        title: 'Limits and Continuity',
        sections: [
          {
            id: 'sec1-1',
            title: 'Definition of a Limit',
            content: `The **limit** of a function f(x) as x approaches a value c is the value that f(x) gets closer to as x gets closer to c.

**Formal (ε-δ) Definition:** For every ε > 0 there exists a δ > 0 such that if 0 < |x − c| < δ, then |f(x) − L| < ε.

We write: lim(x→c) f(x) = L

**Example:** lim(x→2) (3x + 1) = 7, because as x approaches 2, 3x + 1 approaches 7.

**Key Properties:**
- Sum Rule: lim(x→c) [f(x) + g(x)] = lim(x→c) f(x) + lim(x→c) g(x)
- Product Rule: lim(x→c) [f(x) · g(x)] = lim(x→c) f(x) · lim(x→c) g(x)
- Quotient Rule: lim(x→c) [f(x)/g(x)] = lim(x→c) f(x) / lim(x→c) g(x), provided lim(x→c) g(x) ≠ 0`,
          },
          {
            id: 'sec1-2',
            title: 'One-Sided Limits',
            content: `A **one-sided limit** considers the behavior of f(x) as x approaches c from only one direction.

**Left-hand limit:** lim(x→c⁻) f(x) — x approaches c from values less than c.
**Right-hand limit:** lim(x→c⁺) f(x) — x approaches c from values greater than c.

**Theorem:** lim(x→c) f(x) = L if and only if lim(x→c⁻) f(x) = L and lim(x→c⁺) f(x) = L.

**Example:** For f(x) = |x|/x:
- lim(x→0⁺) f(x) = 1
- lim(x→0⁻) f(x) = −1
- Therefore lim(x→0) f(x) does not exist.`,
          },
          {
            id: 'sec1-3',
            title: 'Continuity',
            content: `A function f is **continuous at a point c** if:
1. f(c) is defined
2. lim(x→c) f(x) exists
3. lim(x→c) f(x) = f(c)

**Types of Discontinuity:**
- **Removable:** The limit exists but f(c) ≠ lim(x→c) f(x)
- **Jump:** Left and right limits exist but are not equal
- **Infinite:** The function approaches ±∞

**Intermediate Value Theorem (IVT):** If f is continuous on [a, b] and N is between f(a) and f(b), then there exists a c in (a, b) such that f(c) = N.`,
          },
        ],
      },
      {
        id: 'ch2',
        title: 'Derivatives',
        sections: [
          {
            id: 'sec2-1',
            title: 'Definition of the Derivative',
            content: `The **derivative** of f at x is defined as:

f'(x) = lim(h→0) [f(x + h) − f(x)] / h

This represents the instantaneous rate of change (slope of the tangent line) at point x.

**Notation:** f'(x), dy/dx, Df(x), ẏ

**Basic Derivatives:**
- d/dx [xⁿ] = nxⁿ⁻¹ (Power Rule)
- d/dx [eˣ] = eˣ
- d/dx [ln x] = 1/x
- d/dx [sin x] = cos x
- d/dx [cos x] = −sin x`,
          },
          {
            id: 'sec2-2',
            title: 'Differentiation Rules',
            content: `**Sum Rule:** (f + g)' = f' + g'

**Product Rule:** (fg)' = f'g + fg'

**Quotient Rule:** (f/g)' = (f'g − fg') / g²

**Chain Rule:** If y = f(g(x)), then dy/dx = f'(g(x)) · g'(x)

**Example:** d/dx [sin(x²)] = cos(x²) · 2x (Chain Rule applied)`,
          },
          {
            id: 'sec2-3',
            title: 'Applications of Derivatives',
            content: `**Critical Points:** Points where f'(x) = 0 or f'(x) is undefined.

**First Derivative Test:**
- If f' changes from + to − at c, then f has a local maximum at c
- If f' changes from − to + at c, then f has a local minimum at c

**Second Derivative Test:**
- If f'(c) = 0 and f''(c) > 0, then f has a local minimum at c
- If f'(c) = 0 and f''(c) < 0, then f has a local maximum at c

**L'Hôpital's Rule:** If lim f(x)/g(x) gives 0/0 or ∞/∞, then lim f(x)/g(x) = lim f'(x)/g'(x).`,
          },
        ],
      },
      {
        id: 'ch3',
        title: 'Integration',
        sections: [
          {
            id: 'sec3-1',
            title: 'Antiderivatives and Indefinite Integrals',
            content: `An **antiderivative** of f(x) is a function F(x) such that F'(x) = f(x).

**Indefinite Integral:** ∫f(x)dx = F(x) + C

**Basic Integrals:**
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C, n ≠ −1
- ∫(1/x) dx = ln|x| + C
- ∫eˣ dx = eˣ + C
- ∫sin x dx = −cos x + C
- ∫cos x dx = sin x + C`,
          },
          {
            id: 'sec3-2',
            title: 'Definite Integrals and the Fundamental Theorem',
            content: `**Fundamental Theorem of Calculus (Part 1):**
If f is continuous on [a, b] and F is an antiderivative of f, then:
∫ₐᵇ f(x)dx = F(b) − F(a)

**Fundamental Theorem of Calculus (Part 2):**
If f is continuous on [a, b], then:
d/dx [∫ₐˣ f(t)dt] = f(x)

**Properties:**
- ∫ₐᵇ [f(x) + g(x)]dx = ∫ₐᵇ f(x)dx + ∫ₐᵇ g(x)dx
- ∫ₐᵇ cf(x)dx = c∫ₐᵇ f(x)dx
- ∫ₐᵇ f(x)dx = −∫ᵇₐ f(x)dx`,
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-calc-1',
        courseId: 'calc101',
        chapterId: 'ch1',
        title: 'Evaluate a limit using limit laws',
        difficulty: 'easy',
        prerequisites: [
          { sectionId: 'sec1-1', chapterId: 'ch1', label: 'Definition of a Limit' },
        ],
        problem: 'Evaluate: lim(x→3) (2x² − 5x + 1)',
        steps: [
          'Step 1: Since f(x) = 2x² − 5x + 1 is a polynomial, it is continuous everywhere. We can evaluate by direct substitution.',
          'Step 2: Substitute x = 3: 2(3)² − 5(3) + 1',
          'Step 3: Calculate: 2(9) − 15 + 1 = 18 − 15 + 1 = 4',
          'Final Answer: lim(x→3) (2x² − 5x + 1) = 4',
        ],
        solved: false,
      },
      {
        id: 'ex-calc-2',
        courseId: 'calc101',
        chapterId: 'ch1',
        title: 'Determine continuity of a piecewise function',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec1-2', chapterId: 'ch1', label: 'One-Sided Limits' },
          { sectionId: 'sec1-3', chapterId: 'ch1', label: 'Continuity' },
        ],
        problem:
          'Is f(x) = { x² if x < 1, 2x − 1 if x ≥ 1 } continuous at x = 1?',
        steps: [
          'Step 1: Check if f(1) is defined. f(1) = 2(1) − 1 = 1. ✓',
          'Step 2: Find the left-hand limit: lim(x→1⁻) x² = 1² = 1.',
          'Step 3: Find the right-hand limit: lim(x→1⁺) (2x − 1) = 2(1) − 1 = 1.',
          'Step 4: Since lim(x→1⁻) = lim(x→1⁺) = 1, the two-sided limit exists and equals 1.',
          'Step 5: Check: f(1) = 1 = lim(x→1) f(x). All three conditions hold.',
          'Final Answer: Yes, f is continuous at x = 1.',
        ],
        solved: false,
      },
      {
        id: 'ex-calc-3',
        courseId: 'calc101',
        chapterId: 'ch2',
        title: 'Apply the chain rule',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec2-1', chapterId: 'ch2', label: 'Definition of the Derivative' },
          { sectionId: 'sec2-2', chapterId: 'ch2', label: 'Differentiation Rules' },
        ],
        problem: 'Find the derivative of f(x) = (3x² + 2)⁵.',
        steps: [
          'Step 1: Identify the outer function u⁵ and inner function u = 3x² + 2.',
          'Step 2: Apply the chain rule: f\'(x) = 5(3x² + 2)⁴ · d/dx(3x² + 2).',
          'Step 3: Compute the inner derivative: d/dx(3x² + 2) = 6x.',
          'Final Answer: f\'(x) = 30x(3x² + 2)⁴',
        ],
        solved: false,
      },
      {
        id: 'ex-calc-4',
        courseId: 'calc101',
        chapterId: 'ch2',
        title: 'Find critical points and classify extrema',
        difficulty: 'hard',
        prerequisites: [
          { sectionId: 'sec2-2', chapterId: 'ch2', label: 'Differentiation Rules' },
          { sectionId: 'sec2-3', chapterId: 'ch2', label: 'Applications of Derivatives' },
        ],
        problem: 'Find and classify all critical points of f(x) = x³ − 6x² + 9x + 1.',
        steps: [
          'Step 1: Find f\'(x) = 3x² − 12x + 9.',
          'Step 2: Set f\'(x) = 0: 3x² − 12x + 9 = 0 → 3(x² − 4x + 3) = 0 → 3(x − 1)(x − 3) = 0.',
          'Step 3: Critical points at x = 1 and x = 3.',
          'Step 4: Find f\'\'(x) = 6x − 12.',
          'Step 5: f\'\'(1) = 6(1) − 12 = −6 < 0 → local maximum at x = 1. f(1) = 1 − 6 + 9 + 1 = 5.',
          'Step 6: f\'\'(3) = 6(3) − 12 = 6 > 0 → local minimum at x = 3. f(3) = 27 − 54 + 27 + 1 = 1.',
          'Final Answer: Local maximum at (1, 5); Local minimum at (3, 1).',
        ],
        solved: false,
      },
      {
        id: 'ex-calc-5',
        courseId: 'calc101',
        chapterId: 'ch3',
        title: 'Evaluate a definite integral',
        difficulty: 'easy',
        prerequisites: [
          { sectionId: 'sec3-1', chapterId: 'ch3', label: 'Antiderivatives and Indefinite Integrals' },
          { sectionId: 'sec3-2', chapterId: 'ch3', label: 'Definite Integrals and the Fundamental Theorem' },
        ],
        problem: 'Evaluate: ∫₁³ (2x + 1) dx',
        steps: [
          'Step 1: Find the antiderivative: F(x) = x² + x.',
          'Step 2: Apply FTC: F(3) − F(1) = (9 + 3) − (1 + 1) = 12 − 2.',
          'Final Answer: ∫₁³ (2x + 1) dx = 10',
        ],
        solved: false,
      },
    ],
  },
  thermo: {
    courseId: 'thermo',
    chapters: [
      {
        id: 'ch1',
        title: 'Fundamental Concepts',
        sections: [
          {
            id: 'sec1-1',
            title: 'Systems and Surroundings',
            content: `A **thermodynamic system** is a quantity of matter or a region in space chosen for study.

**Types of Systems:**
- **Open system:** Mass and energy can cross the boundary
- **Closed system:** Only energy crosses the boundary (mass is fixed)
- **Isolated system:** Neither mass nor energy crosses the boundary

**State variables:** Properties that define the condition of a system (P, V, T, U, S, H).

**Equation of State:** PV = nRT (ideal gas law) relates pressure, volume, and temperature.`,
          },
          {
            id: 'sec1-2',
            title: 'Temperature and Zeroth Law',
            content: `The **Zeroth Law of Thermodynamics:** If system A is in thermal equilibrium with system C, and system B is also in thermal equilibrium with system C, then A and B are in thermal equilibrium with each other.

This law provides the basis for temperature measurement.

**Temperature Scales:**
- Kelvin: T(K) = T(°C) + 273.15
- Celsius: T(°C) = T(K) − 273.15
- Fahrenheit: T(°F) = (9/5)T(°C) + 32`,
          },
        ],
      },
      {
        id: 'ch2',
        title: 'First Law of Thermodynamics',
        sections: [
          {
            id: 'sec2-1',
            title: 'Internal Energy and Heat',
            content: `The **First Law of Thermodynamics** is a statement of energy conservation:

ΔU = Q − W

Where:
- ΔU = change in internal energy
- Q = heat added to the system
- W = work done by the system

**Sign Convention:**
- Q > 0: heat flows into the system
- W > 0: work is done by the system on surroundings
- ΔU > 0: internal energy increases`,
          },
          {
            id: 'sec2-2',
            title: 'Work and PV Diagrams',
            content: `**Work done by a gas:** W = ∫PdV

**Special Processes:**
- **Isobaric** (constant P): W = PΔV
- **Isochoric** (constant V): W = 0
- **Isothermal** (constant T): W = nRT ln(V₂/V₁)
- **Adiabatic** (Q = 0): PVᵞ = constant, where γ = Cₚ/Cᵥ

Work equals the area under the curve on a P-V diagram.`,
          },
        ],
      },
      {
        id: 'ch3',
        title: 'Second Law and Entropy',
        sections: [
          {
            id: 'sec3-1',
            title: 'Entropy and the Second Law',
            content: `**Second Law of Thermodynamics:** The total entropy of an isolated system can never decrease over time.

**Entropy:** dS = δQ_rev / T

For an irreversible process: ΔS_total > 0
For a reversible process: ΔS_total = 0

**Clausius Inequality:** ∮(δQ/T) ≤ 0

Entropy is a measure of the number of microscopic configurations (disorder): S = k_B ln Ω`,
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-thermo-1',
        courseId: 'thermo',
        chapterId: 'ch1',
        title: 'Classify thermodynamic systems',
        difficulty: 'easy',
        prerequisites: [
          { sectionId: 'sec1-1', chapterId: 'ch1', label: 'Systems and Surroundings' },
        ],
        problem:
          'Classify each as open, closed, or isolated: (a) a sealed insulated thermos, (b) a boiling pot without a lid, (c) a sealed balloon.',
        steps: [
          'Step 1: (a) Sealed insulated thermos — no mass transfer (sealed), no significant heat transfer (insulated). → Isolated system.',
          'Step 2: (b) Boiling pot without lid — steam escapes (mass transfer) and heat enters from stove. → Open system.',
          'Step 3: (c) Sealed balloon — no mass transfer, but heat can pass through the balloon wall. → Closed system.',
          'Final Answer: (a) Isolated, (b) Open, (c) Closed.',
        ],
        solved: false,
      },
      {
        id: 'ex-thermo-2',
        courseId: 'thermo',
        chapterId: 'ch2',
        title: 'Apply the first law to an isobaric process',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec2-1', chapterId: 'ch2', label: 'Internal Energy and Heat' },
          { sectionId: 'sec2-2', chapterId: 'ch2', label: 'Work and PV Diagrams' },
        ],
        problem:
          'A gas expands isobarically at P = 2 atm from V₁ = 3L to V₂ = 8L. If Q = 1200 J, find ΔU. (1 atm·L = 101.325 J)',
        steps: [
          'Step 1: Calculate work: W = PΔV = 2 atm × (8 − 3) L = 10 atm·L.',
          'Step 2: Convert: W = 10 × 101.325 J = 1013.25 J.',
          'Step 3: Apply first law: ΔU = Q − W = 1200 − 1013.25 = 186.75 J.',
          'Final Answer: ΔU ≈ 186.8 J.',
        ],
        solved: false,
      },
      {
        id: 'ex-thermo-3',
        courseId: 'thermo',
        chapterId: 'ch3',
        title: 'Calculate entropy change for reversible heating',
        difficulty: 'hard',
        prerequisites: [
          { sectionId: 'sec3-1', chapterId: 'ch3', label: 'Entropy and the Second Law' },
        ],
        problem:
          'Calculate the entropy change when 2 mol of an ideal gas (Cᵥ = 3R/2) is heated reversibly at constant volume from 300 K to 600 K.',
        steps: [
          'Step 1: At constant volume, δQ = nCᵥdT.',
          'Step 2: ΔS = ∫(δQ/T) = ∫₃₀₀⁶⁰⁰ nCᵥ(dT/T) = nCᵥ ln(T₂/T₁).',
          'Step 3: ΔS = 2 × (3/2)(8.314) × ln(600/300).',
          'Step 4: ΔS = 2 × 12.471 × ln(2) = 24.942 × 0.6931.',
          'Final Answer: ΔS ≈ 17.29 J/K.',
        ],
        solved: false,
      },
    ],
  },
  linalg: {
    courseId: 'linalg',
    chapters: [
      {
        id: 'ch1',
        title: 'Vectors and Vector Spaces',
        sections: [
          {
            id: 'sec1-1',
            title: 'Vectors in Rⁿ',
            content: `A **vector** in Rⁿ is an ordered n-tuple of real numbers: v = (v₁, v₂, …, vₙ).

**Operations:**
- Addition: u + v = (u₁ + v₁, u₂ + v₂, …, uₙ + vₙ)
- Scalar multiplication: cv = (cv₁, cv₂, …, cvₙ)

**Dot product:** u · v = u₁v₁ + u₂v₂ + … + uₙvₙ

**Norm (length):** ‖v‖ = √(v · v)

Two vectors are **orthogonal** if u · v = 0.`,
          },
          {
            id: 'sec1-2',
            title: 'Linear Independence and Span',
            content: `Vectors v₁, v₂, …, vₖ are **linearly independent** if the only solution to c₁v₁ + c₂v₂ + … + cₖvₖ = 0 is c₁ = c₂ = … = cₖ = 0.

The **span** of a set of vectors is the set of all linear combinations: Span{v₁, …, vₖ} = {c₁v₁ + … + cₖvₖ : cᵢ ∈ R}.

A **basis** for a vector space V is a linearly independent set that spans V.

The **dimension** of V is the number of vectors in any basis for V.`,
          },
        ],
      },
      {
        id: 'ch2',
        title: 'Matrices and Linear Transformations',
        sections: [
          {
            id: 'sec2-1',
            title: 'Matrix Operations',
            content: `An **m × n matrix** A has m rows and n columns. Entry aᵢⱼ is in row i, column j.

**Matrix multiplication:** If A is m × n and B is n × p, then AB is m × p with (AB)ᵢⱼ = Σₖ aᵢₖbₖⱼ.

**Properties:**
- AB ≠ BA in general (not commutative)
- A(BC) = (AB)C (associative)
- A(B + C) = AB + AC (distributive)

**Identity matrix:** I_n is the n × n matrix with 1s on the diagonal and 0s elsewhere. AI = IA = A.`,
          },
          {
            id: 'sec2-2',
            title: 'Determinants',
            content: `The **determinant** of a 2×2 matrix: det[a b; c d] = ad − bc.

**Properties:**
- det(AB) = det(A) · det(B)
- det(Aᵀ) = det(A)
- If det(A) = 0, then A is singular (not invertible)
- Row swapping changes the sign of the determinant
- Multiplying a row by c multiplies det by c

**Cofactor expansion** can compute the determinant of larger matrices by expanding along a row or column.`,
          },
        ],
      },
      {
        id: 'ch3',
        title: 'Eigenvalues and Eigenvectors',
        sections: [
          {
            id: 'sec3-1',
            title: 'Eigenvalue Problems',
            content: `An **eigenvalue** λ of matrix A satisfies Av = λv for some nonzero vector v (the **eigenvector**).

**Finding eigenvalues:** Solve det(A − λI) = 0 (the **characteristic equation**).

**Finding eigenvectors:** For each eigenvalue λ, solve (A − λI)v = 0.

**Diagonalization:** If A has n linearly independent eigenvectors, then A = PDP⁻¹, where D is diagonal with eigenvalues and P has eigenvectors as columns.`,
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-linalg-1',
        courseId: 'linalg',
        chapterId: 'ch1',
        title: 'Test linear independence',
        difficulty: 'easy',
        prerequisites: [
          { sectionId: 'sec1-2', chapterId: 'ch1', label: 'Linear Independence and Span' },
        ],
        problem:
          'Determine if v₁ = (1, 2, 3), v₂ = (4, 5, 6), v₃ = (7, 8, 9) are linearly independent.',
        steps: [
          'Step 1: Form the matrix with these vectors as rows and row reduce.',
          'Step 2: [1 2 3; 4 5 6; 7 8 9] → R₂ − 4R₁, R₃ − 7R₁ → [1 2 3; 0 −3 −6; 0 −6 −12].',
          'Step 3: R₃ − 2R₂ → [1 2 3; 0 −3 −6; 0 0 0]. The third row is all zeros.',
          'Step 4: Since we get a zero row, the rank is 2 < 3.',
          'Final Answer: The vectors are linearly dependent (v₃ = 2v₂ − v₁).',
        ],
        solved: false,
      },
      {
        id: 'ex-linalg-2',
        courseId: 'linalg',
        chapterId: 'ch2',
        title: 'Compute a 3×3 determinant',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec2-2', chapterId: 'ch2', label: 'Determinants' },
        ],
        problem: 'Find det(A) where A = [2 1 3; 0 −1 2; 1 4 −1].',
        steps: [
          'Step 1: Expand along the first row: det(A) = 2·det[−1 2; 4 −1] − 1·det[0 2; 1 −1] + 3·det[0 −1; 1 4].',
          'Step 2: Compute minors: det[−1 2; 4 −1] = (−1)(−1) − (2)(4) = 1 − 8 = −7.',
          'Step 3: det[0 2; 1 −1] = (0)(−1) − (2)(1) = −2.',
          'Step 4: det[0 −1; 1 4] = (0)(4) − (−1)(1) = 1.',
          'Step 5: det(A) = 2(−7) − 1(−2) + 3(1) = −14 + 2 + 3 = −9.',
          'Final Answer: det(A) = −9.',
        ],
        solved: false,
      },
      {
        id: 'ex-linalg-3',
        courseId: 'linalg',
        chapterId: 'ch3',
        title: 'Find eigenvalues and eigenvectors',
        difficulty: 'hard',
        prerequisites: [
          { sectionId: 'sec2-2', chapterId: 'ch2', label: 'Determinants' },
          { sectionId: 'sec3-1', chapterId: 'ch3', label: 'Eigenvalue Problems' },
        ],
        problem: 'Find the eigenvalues and eigenvectors of A = [4 1; 2 3].',
        steps: [
          'Step 1: Characteristic equation: det(A − λI) = 0 → det[4−λ 1; 2 3−λ] = 0.',
          'Step 2: (4 − λ)(3 − λ) − 2 = 0 → λ² − 7λ + 10 = 0.',
          'Step 3: Factor: (λ − 5)(λ − 2) = 0 → λ₁ = 5, λ₂ = 2.',
          'Step 4: For λ₁ = 5: (A − 5I)v = 0 → [−1 1; 2 −2]v = 0 → v₁ = t(1, 1).',
          'Step 5: For λ₂ = 2: (A − 2I)v = 0 → [2 1; 2 1]v = 0 → v₂ = t(1, −2).',
          'Final Answer: λ₁ = 5 with eigenvector (1, 1); λ₂ = 2 with eigenvector (1, −2).',
        ],
        solved: false,
      },
    ],
  },
  algo: {
    courseId: 'algo',
    chapters: [
      {
        id: 'ch1',
        title: 'Complexity Analysis',
        sections: [
          {
            id: 'sec1-1',
            title: 'Big-O Notation',
            content: `**Big-O notation** describes an upper bound on the growth rate of a function.

f(n) = O(g(n)) if there exist constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀.

**Common complexities (from fastest to slowest):**
- O(1) — constant
- O(log n) — logarithmic
- O(n) — linear
- O(n log n) — linearithmic
- O(n²) — quadratic
- O(2ⁿ) — exponential

**Rules:**
- Drop constants: O(3n) = O(n)
- Drop lower-order terms: O(n² + n) = O(n²)
- Nested loops multiply: two nested O(n) loops → O(n²)`,
          },
          {
            id: 'sec1-2',
            title: 'Recurrence Relations',
            content: `Many divide-and-conquer algorithms are described by **recurrence relations**.

**Master Theorem:** For T(n) = aT(n/b) + O(nᵈ):
- If d < log_b(a): T(n) = O(n^(log_b a))
- If d = log_b(a): T(n) = O(nᵈ log n)
- If d > log_b(a): T(n) = O(nᵈ)

**Example:** Merge sort: T(n) = 2T(n/2) + O(n). Here a=2, b=2, d=1. Since d = log₂2 = 1, T(n) = O(n log n).`,
          },
        ],
      },
      {
        id: 'ch2',
        title: 'Sorting Algorithms',
        sections: [
          {
            id: 'sec2-1',
            title: 'Comparison-Based Sorting',
            content: `**Merge Sort:** Divide array in half, recursively sort each half, merge results. O(n log n) time, O(n) space.

**Quick Sort:** Pick a pivot, partition array into elements < pivot and ≥ pivot, recurse. Average O(n log n), worst O(n²).

**Heap Sort:** Build a max-heap, repeatedly extract the maximum. O(n log n) time, O(1) extra space.

**Lower bound:** Any comparison-based sorting algorithm requires Ω(n log n) comparisons in the worst case.`,
          },
          {
            id: 'sec2-2',
            title: 'Non-Comparison Sorting',
            content: `These achieve O(n) time by not comparing elements directly:

**Counting Sort:** Count occurrences of each value. Works when the range of values k is small. O(n + k) time.

**Radix Sort:** Sort by each digit from least to most significant. O(d(n + k)) where d = number of digits.

**Bucket Sort:** Distribute elements into buckets, sort each bucket. Average O(n) when input is uniformly distributed.`,
          },
        ],
      },
      {
        id: 'ch3',
        title: 'Graph Algorithms',
        sections: [
          {
            id: 'sec3-1',
            title: 'BFS and DFS',
            content: `**Breadth-First Search (BFS):** Explores all neighbors before going deeper. Uses a queue.
- Time: O(V + E)
- Finds shortest path in unweighted graphs

**Depth-First Search (DFS):** Explores as far as possible before backtracking. Uses a stack (or recursion).
- Time: O(V + E)
- Applications: cycle detection, topological sorting, connected components

**Topological Sort:** Linear ordering of vertices in a DAG such that for every directed edge u → v, u appears before v.`,
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-algo-1',
        courseId: 'algo',
        chapterId: 'ch1',
        title: 'Analyze nested loop complexity',
        difficulty: 'easy',
        prerequisites: [
          { sectionId: 'sec1-1', chapterId: 'ch1', label: 'Big-O Notation' },
        ],
        problem:
          'What is the time complexity of: for i = 1 to n: for j = 1 to i: print(i, j)?',
        steps: [
          'Step 1: The inner loop runs i times for each value of i from 1 to n.',
          'Step 2: Total iterations = 1 + 2 + 3 + … + n = n(n+1)/2.',
          'Step 3: n(n+1)/2 = (n² + n)/2.',
          'Step 4: Drop constants and lower-order terms.',
          'Final Answer: O(n²).',
        ],
        solved: false,
      },
      {
        id: 'ex-algo-2',
        courseId: 'algo',
        chapterId: 'ch1',
        title: 'Apply the Master Theorem',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec1-2', chapterId: 'ch1', label: 'Recurrence Relations' },
        ],
        problem: 'Solve the recurrence T(n) = 4T(n/2) + O(n) using the Master Theorem.',
        steps: [
          'Step 1: Identify a = 4, b = 2, d = 1.',
          'Step 2: Compute log_b(a) = log₂(4) = 2.',
          'Step 3: Compare d with log_b(a): d = 1 < 2 = log₂4.',
          'Step 4: By Master Theorem Case 1: T(n) = O(n^(log_b a)) = O(n²).',
          'Final Answer: T(n) = O(n²).',
        ],
        solved: false,
      },
      {
        id: 'ex-algo-3',
        courseId: 'algo',
        chapterId: 'ch3',
        title: 'Trace BFS on a graph',
        difficulty: 'medium',
        prerequisites: [
          { sectionId: 'sec3-1', chapterId: 'ch3', label: 'BFS and DFS' },
        ],
        problem:
          'Run BFS starting from vertex A on the graph: A—B, A—C, B—D, C—D, C—E, D—E. Give the visit order.',
        steps: [
          'Step 1: Initialize queue with A. Visited = {A}. Queue = [A].',
          'Step 2: Dequeue A. Neighbors: B, C. Enqueue both. Visited = {A, B, C}. Queue = [B, C].',
          'Step 3: Dequeue B. Neighbors: A (visited), D. Enqueue D. Visited = {A, B, C, D}. Queue = [C, D].',
          'Step 4: Dequeue C. Neighbors: A (visited), D (visited), E. Enqueue E. Visited = {A, B, C, D, E}. Queue = [D, E].',
          'Step 5: Dequeue D. Neighbors: B (visited), C (visited), E (visited). Nothing new.',
          'Step 6: Dequeue E. Neighbors: C (visited), D (visited). Nothing new. Queue empty.',
          'Final Answer: BFS visit order: A → B → C → D → E.',
        ],
        solved: false,
      },
    ],
  },
}
