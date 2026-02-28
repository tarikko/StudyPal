export interface Chapter {
  id: string
  title: string
  sections: Section[]
}

export interface Section {
  id: string
  title: string
  content: string
  /** IDs of other sections that are referenced within this section */
  references: { label: string; targetSectionId: string }[]
}

export interface Exercise {
  id: string
  courseId: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  /** Section IDs that are prerequisites for this exercise */
  prerequisiteIds: string[]
  problem: string
  /** Ordered hint/step reveals leading to the solution */
  steps: string[]
  solved: boolean
}

/**
 * Course material keyed by courseId.
 * Each course has an array of chapters.
 */
export const courseContent: Record<string, Chapter[]> = {
  calc101: [
    {
      id: 'calc-ch1',
      title: 'Chapter 1: Limits & Continuity',
      sections: [
        {
          id: 'calc-s1',
          title: '1.1 The Concept of a Limit',
          content:
            'The **limit** of a function f(x) as x approaches a value c is the value that f(x) gets closer to as x gets closer to c.\n\n$$\\lim_{x \\to c} f(x) = L$$\n\nInformally, we say that f(x) → L as x → c if we can make f(x) as close to L as we want by making x sufficiently close (but not equal) to c.',
          references: [],
        },
        {
          id: 'calc-s2',
          title: '1.2 Epsilon-Delta Definition',
          content:
            'For every **ε > 0**, there exists a **δ > 0** such that if **0 < |x − c| < δ**, then **|f(x) − L| < ε**.\n\nThis formalizes the intuitive notion from the concept of a limit.',
          references: [
            { label: 'concept of a limit', targetSectionId: 'calc-s1' },
          ],
        },
        {
          id: 'calc-s3',
          title: '1.3 Continuity',
          content:
            'A function f is **continuous** at a point c if:\n1. f(c) is defined\n2. $\\lim_{x \\to c} f(x)$ exists\n3. $\\lim_{x \\to c} f(x) = f(c)$\n\nIf any of these conditions fails, f has a **discontinuity** at c.',
          references: [
            { label: 'limit exists', targetSectionId: 'calc-s1' },
            { label: 'epsilon-delta', targetSectionId: 'calc-s2' },
          ],
        },
      ],
    },
    {
      id: 'calc-ch2',
      title: 'Chapter 2: Derivatives',
      sections: [
        {
          id: 'calc-s4',
          title: '2.1 Definition of the Derivative',
          content:
            "The **derivative** of f at x is defined as:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\nprovided this limit exists. The derivative measures the instantaneous rate of change of f.",
          references: [
            { label: 'limit', targetSectionId: 'calc-s1' },
          ],
        },
        {
          id: 'calc-s5',
          title: '2.2 Differentiation Rules',
          content:
            "Key rules:\n- **Power Rule:** $(x^n)' = nx^{n-1}$\n- **Product Rule:** $(fg)' = f'g + fg'$\n- **Chain Rule:** $(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)$\n\nThese rules follow from the definition of the derivative.",
          references: [
            { label: 'definition of the derivative', targetSectionId: 'calc-s4' },
          ],
        },
        {
          id: 'calc-s6',
          title: '2.3 Applications of Derivatives',
          content:
            "Applications include:\n- **Finding extrema** via f'(x) = 0\n- **Optimization problems**\n- **Related rates**\n- **Linear approximation:** $f(x) \\approx f(a) + f'(a)(x-a)$",
          references: [
            { label: 'differentiation rules', targetSectionId: 'calc-s5' },
          ],
        },
      ],
    },
    {
      id: 'calc-ch3',
      title: 'Chapter 3: Integration',
      sections: [
        {
          id: 'calc-s7',
          title: '3.1 The Definite Integral',
          content:
            'The **definite integral** of f from a to b is:\n\n$$\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*)\\Delta x$$\n\nGeometrically, it represents the signed area under the curve.',
          references: [
            { label: 'limits', targetSectionId: 'calc-s1' },
          ],
        },
        {
          id: 'calc-s8',
          title: '3.2 Fundamental Theorem of Calculus',
          content:
            "The **Fundamental Theorem of Calculus** connects differentiation and integration:\n\n$$\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$$\n\nand\n\n$$\\int_a^b f'(x)\\,dx = f(b) - f(a)$$",
          references: [
            { label: 'definite integral', targetSectionId: 'calc-s7' },
            { label: 'derivative', targetSectionId: 'calc-s4' },
          ],
        },
      ],
    },
  ],
  thermo: [
    {
      id: 'thermo-ch1',
      title: 'Chapter 1: Fundamental Concepts',
      sections: [
        {
          id: 'thermo-s1',
          title: '1.1 Systems and Surroundings',
          content:
            'A **thermodynamic system** is a quantity of matter or region in space chosen for study. Everything external to it is the **surroundings**.\n\nSystems can be:\n- **Open:** exchanges mass and energy\n- **Closed:** exchanges energy only\n- **Isolated:** exchanges neither',
          references: [],
        },
        {
          id: 'thermo-s2',
          title: '1.2 State Properties',
          content:
            '**State properties** (or state functions) depend only on the current state, not on the path taken. Examples: temperature (T), pressure (P), volume (V), internal energy (U), entropy (S).',
          references: [
            { label: 'thermodynamic system', targetSectionId: 'thermo-s1' },
          ],
        },
      ],
    },
    {
      id: 'thermo-ch2',
      title: 'Chapter 2: Laws of Thermodynamics',
      sections: [
        {
          id: 'thermo-s3',
          title: '2.1 First Law',
          content:
            'The **First Law of Thermodynamics** states that energy is conserved:\n\n$$\\Delta U = Q - W$$\n\nwhere ΔU is the change in internal energy, Q is heat added, and W is work done by the system.',
          references: [
            { label: 'internal energy', targetSectionId: 'thermo-s2' },
          ],
        },
        {
          id: 'thermo-s4',
          title: '2.2 Second Law & Entropy',
          content:
            'The **Second Law** states that the total entropy of an isolated system can never decrease:\n\n$$\\Delta S_{total} \\geq 0$$\n\nThis defines the direction of natural processes and introduces the concept of **irreversibility**.',
          references: [
            { label: 'isolated system', targetSectionId: 'thermo-s1' },
            { label: 'first law', targetSectionId: 'thermo-s3' },
          ],
        },
        {
          id: 'thermo-s5',
          title: '2.3 Carnot Cycle',
          content:
            'The **Carnot cycle** is the most efficient heat engine cycle. Its efficiency is:\n\n$$\\eta = 1 - \\frac{T_C}{T_H}$$\n\nwhere $T_H$ and $T_C$ are the temperatures of the hot and cold reservoirs.',
          references: [
            { label: 'second law', targetSectionId: 'thermo-s4' },
          ],
        },
      ],
    },
  ],
  linalg: [
    {
      id: 'linalg-ch1',
      title: 'Chapter 1: Vectors & Spaces',
      sections: [
        {
          id: 'linalg-s1',
          title: '1.1 Vector Spaces',
          content:
            'A **vector space** V over a field F is a set equipped with **addition** and **scalar multiplication** satisfying eight axioms (closure, associativity, commutativity, identity, inverse, compatibility, distributivity).',
          references: [],
        },
        {
          id: 'linalg-s2',
          title: '1.2 Linear Independence',
          content:
            'Vectors $\\{v_1, \\ldots, v_n\\}$ are **linearly independent** if:\n\n$$c_1 v_1 + c_2 v_2 + \\cdots + c_n v_n = 0 \\implies c_1 = c_2 = \\cdots = c_n = 0$$',
          references: [
            { label: 'vector space', targetSectionId: 'linalg-s1' },
          ],
        },
        {
          id: 'linalg-s3',
          title: '1.3 Basis & Dimension',
          content:
            'A **basis** of V is a linearly independent spanning set. The number of vectors in a basis is the **dimension** of V, denoted dim(V).',
          references: [
            { label: 'linear independence', targetSectionId: 'linalg-s2' },
          ],
        },
      ],
    },
    {
      id: 'linalg-ch2',
      title: 'Chapter 2: Linear Transformations',
      sections: [
        {
          id: 'linalg-s4',
          title: '2.1 Matrix Representations',
          content:
            'Every **linear transformation** T: V → W can be represented by a matrix A relative to chosen bases of V and W. T(v) = Av.',
          references: [
            { label: 'basis', targetSectionId: 'linalg-s3' },
          ],
        },
        {
          id: 'linalg-s5',
          title: '2.2 Eigenvalues & Eigenvectors',
          content:
            'A scalar λ is an **eigenvalue** of A if there exists a nonzero vector v such that:\n\n$$Av = \\lambda v$$\n\nThe vector v is the corresponding **eigenvector**. Eigenvalues are found via det(A − λI) = 0.',
          references: [
            { label: 'matrix representation', targetSectionId: 'linalg-s4' },
          ],
        },
      ],
    },
  ],
  algo: [
    {
      id: 'algo-ch1',
      title: 'Chapter 1: Algorithm Analysis',
      sections: [
        {
          id: 'algo-s1',
          title: '1.1 Big-O Notation',
          content:
            '**Big-O notation** describes the upper bound of an algorithm\'s time complexity.\n\n$f(n) = O(g(n))$ means there exist constants c > 0 and $n_0$ such that $f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$.',
          references: [],
        },
        {
          id: 'algo-s2',
          title: '1.2 Recurrence Relations',
          content:
            'Many divide-and-conquer algorithms have running times described by **recurrence relations**:\n\n$$T(n) = aT(n/b) + f(n)$$\n\nThe **Master Theorem** provides solutions for common forms.',
          references: [
            { label: 'Big-O notation', targetSectionId: 'algo-s1' },
          ],
        },
      ],
    },
    {
      id: 'algo-ch2',
      title: 'Chapter 2: Sorting & Searching',
      sections: [
        {
          id: 'algo-s3',
          title: '2.1 Comparison-Based Sorting',
          content:
            'Key comparison sorts:\n- **Merge Sort:** O(n log n), stable, divide-and-conquer\n- **Quick Sort:** O(n log n) average, in-place, not stable\n- **Heap Sort:** O(n log n), in-place, not stable\n\nLower bound for comparison sorting is **Ω(n log n)**.',
          references: [
            { label: 'recurrence relations', targetSectionId: 'algo-s2' },
            { label: 'Big-O', targetSectionId: 'algo-s1' },
          ],
        },
        {
          id: 'algo-s4',
          title: '2.2 Binary Search',
          content:
            '**Binary search** finds an element in a sorted array in O(log n) time by repeatedly halving the search space.',
          references: [
            { label: 'Big-O notation', targetSectionId: 'algo-s1' },
          ],
        },
      ],
    },
    {
      id: 'algo-ch3',
      title: 'Chapter 3: Graph Algorithms',
      sections: [
        {
          id: 'algo-s5',
          title: '3.1 BFS & DFS',
          content:
            '**Breadth-First Search (BFS)** explores neighbors first (queue-based, O(V+E)).\n**Depth-First Search (DFS)** explores as deep as possible first (stack/recursion, O(V+E)).',
          references: [],
        },
        {
          id: 'algo-s6',
          title: '3.2 Shortest Paths',
          content:
            "**Dijkstra's algorithm** finds shortest paths from a single source in O((V+E) log V) with a min-heap. Requires non-negative edge weights.",
          references: [
            { label: 'BFS', targetSectionId: 'algo-s5' },
          ],
        },
      ],
    },
  ],
  signals: [
    {
      id: 'signals-ch1',
      title: 'Chapter 1: Signal Fundamentals',
      sections: [
        {
          id: 'signals-s1',
          title: '1.1 Continuous vs. Discrete Signals',
          content:
            'A **continuous-time signal** x(t) is defined for all t ∈ ℝ. A **discrete-time signal** x[n] is defined only for integer values of n.',
          references: [],
        },
        {
          id: 'signals-s2',
          title: '1.2 Signal Properties',
          content:
            'Key properties:\n- **Periodicity:** x(t) = x(t + T) for all t\n- **Even/Odd:** x(t) = x(−t) or x(t) = −x(−t)\n- **Energy & Power** signals classification',
          references: [
            { label: 'continuous vs discrete', targetSectionId: 'signals-s1' },
          ],
        },
      ],
    },
    {
      id: 'signals-ch2',
      title: 'Chapter 2: Fourier Analysis',
      sections: [
        {
          id: 'signals-s3',
          title: '2.1 Fourier Series',
          content:
            'A periodic signal can be decomposed into a sum of sinusoids:\n\n$$x(t) = \\sum_{k=-\\infty}^{\\infty} c_k e^{jk\\omega_0 t}$$\n\nwhere $c_k$ are the **Fourier coefficients**.',
          references: [
            { label: 'periodic signals', targetSectionId: 'signals-s2' },
          ],
        },
        {
          id: 'signals-s4',
          title: '2.2 Fourier Transform',
          content:
            'The **Fourier Transform** generalizes the Fourier Series to non-periodic signals:\n\n$$X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t}\\,dt$$\n\nInverse: $x(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} X(\\omega) e^{j\\omega t}\\,d\\omega$',
          references: [
            { label: 'Fourier series', targetSectionId: 'signals-s3' },
          ],
        },
      ],
    },
  ],
}

/**
 * Exercises keyed by courseId.
 */
export const courseExercises: Record<string, Exercise[]> = {
  calc101: [
    {
      id: 'calc-ex1',
      courseId: 'calc101',
      title: 'Evaluate a Limit',
      difficulty: 'easy',
      prerequisiteIds: ['calc-s1', 'calc-s2'],
      problem: 'Evaluate $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$.',
      steps: [
        'Step 1: Factor the numerator. $x^2 - 4 = (x-2)(x+2)$.',
        'Step 2: Cancel the common factor $(x-2)$: $\\frac{(x-2)(x+2)}{x-2} = x + 2$ for $x \\neq 2$.',
        'Step 3: Evaluate the limit: $\\lim_{x \\to 2}(x+2) = 4$.',
      ],
      solved: false,
    },
    {
      id: 'calc-ex2',
      courseId: 'calc101',
      title: 'Derivative using the Power Rule',
      difficulty: 'easy',
      prerequisiteIds: ['calc-s4', 'calc-s5'],
      problem: 'Find $f\'(x)$ if $f(x) = 3x^4 - 2x^2 + 7x - 1$.',
      steps: [
        'Step 1: Apply the power rule term by term.',
        'Step 2: $(3x^4)\' = 12x^3$, $(-2x^2)\' = -4x$, $(7x)\' = 7$, $(-1)\' = 0$.',
        'Step 3: $f\'(x) = 12x^3 - 4x + 7$.',
      ],
      solved: false,
    },
    {
      id: 'calc-ex3',
      courseId: 'calc101',
      title: 'Definite Integral',
      difficulty: 'medium',
      prerequisiteIds: ['calc-s7', 'calc-s8'],
      problem: 'Evaluate $\\int_0^3 (2x + 1)\\,dx$.',
      steps: [
        'Step 1: Find the antiderivative: $F(x) = x^2 + x$.',
        'Step 2: Apply the Fundamental Theorem: $F(3) - F(0) = (9 + 3) - (0 + 0) = 12$.',
        'Step 3: The definite integral equals **12**.',
      ],
      solved: false,
    },
    {
      id: 'calc-ex4',
      courseId: 'calc101',
      title: 'Chain Rule Application',
      difficulty: 'hard',
      prerequisiteIds: ['calc-s5'],
      problem: 'Find $\\frac{d}{dx}\\left[\\sin(x^3 + 2x)\\right]$.',
      steps: [
        'Step 1: Identify the outer function $\\sin(u)$ and inner function $u = x^3 + 2x$.',
        'Step 2: Derivative of outer: $\\cos(u)$. Derivative of inner: $3x^2 + 2$.',
        'Step 3: Apply the chain rule: $\\cos(x^3 + 2x) \\cdot (3x^2 + 2)$.',
      ],
      solved: false,
    },
  ],
  thermo: [
    {
      id: 'thermo-ex1',
      courseId: 'thermo',
      title: 'System Classification',
      difficulty: 'easy',
      prerequisiteIds: ['thermo-s1'],
      problem:
        'Classify the following: (a) a sealed thermos, (b) a boiling pot without a lid, (c) a pressurized gas cylinder.',
      steps: [
        'Step 1: A sealed thermos minimizes heat and mass transfer → approximately an **isolated** system.',
        'Step 2: A boiling pot without a lid allows steam (mass) and heat to escape → **open** system.',
        'Step 3: A pressurized gas cylinder has fixed mass but can exchange heat through walls → **closed** system.',
      ],
      solved: false,
    },
    {
      id: 'thermo-ex2',
      courseId: 'thermo',
      title: 'First Law Calculation',
      difficulty: 'medium',
      prerequisiteIds: ['thermo-s2', 'thermo-s3'],
      problem:
        'A system absorbs 500 J of heat and does 200 J of work. Find the change in internal energy.',
      steps: [
        'Step 1: Apply the first law: $\\Delta U = Q - W$.',
        'Step 2: Substitute: $\\Delta U = 500\\,J - 200\\,J$.',
        'Step 3: $\\Delta U = 300\\,J$.',
      ],
      solved: false,
    },
    {
      id: 'thermo-ex3',
      courseId: 'thermo',
      title: 'Carnot Efficiency',
      difficulty: 'medium',
      prerequisiteIds: ['thermo-s4', 'thermo-s5'],
      problem:
        'Calculate the efficiency of a Carnot engine operating between $T_H = 600\\,K$ and $T_C = 300\\,K$.',
      steps: [
        'Step 1: Use the Carnot efficiency formula: $\\eta = 1 - T_C/T_H$.',
        'Step 2: $\\eta = 1 - 300/600 = 1 - 0.5$.',
        'Step 3: $\\eta = 0.5$ or **50%**.',
      ],
      solved: false,
    },
  ],
  linalg: [
    {
      id: 'linalg-ex1',
      courseId: 'linalg',
      title: 'Linear Independence Check',
      difficulty: 'easy',
      prerequisiteIds: ['linalg-s1', 'linalg-s2'],
      problem:
        'Are the vectors $v_1 = (1, 0, 0)$, $v_2 = (0, 1, 0)$, $v_3 = (1, 1, 0)$ linearly independent?',
      steps: [
        'Step 1: Set up $c_1 v_1 + c_2 v_2 + c_3 v_3 = 0$.',
        'Step 2: This gives $c_1 + c_3 = 0$, $c_2 + c_3 = 0$, $0 = 0$.',
        'Step 3: $c_3$ is free, so e.g. $c_3 = 1, c_1 = -1, c_2 = -1$. They are **linearly dependent**.',
      ],
      solved: false,
    },
    {
      id: 'linalg-ex2',
      courseId: 'linalg',
      title: 'Find Eigenvalues',
      difficulty: 'hard',
      prerequisiteIds: ['linalg-s4', 'linalg-s5'],
      problem:
        'Find the eigenvalues of $A = \\begin{pmatrix} 3 & 1 \\\\ 0 & 2 \\end{pmatrix}$.',
      steps: [
        'Step 1: Compute $\\det(A - \\lambda I) = 0$.',
        'Step 2: $(3 - \\lambda)(2 - \\lambda) - 0 = 0$.',
        'Step 3: $\\lambda_1 = 3,\\; \\lambda_2 = 2$.',
      ],
      solved: false,
    },
  ],
  algo: [
    {
      id: 'algo-ex1',
      courseId: 'algo',
      title: 'Complexity Analysis',
      difficulty: 'easy',
      prerequisiteIds: ['algo-s1'],
      problem:
        'What is the time complexity of a nested loop where the outer loop runs n times and the inner loop runs n times?',
      steps: [
        'Step 1: The inner loop does O(n) work for each iteration of the outer loop.',
        'Step 2: The outer loop runs n times.',
        'Step 3: Total: $O(n) \\times O(n) = O(n^2)$.',
      ],
      solved: false,
    },
    {
      id: 'algo-ex2',
      courseId: 'algo',
      title: 'Master Theorem Application',
      difficulty: 'medium',
      prerequisiteIds: ['algo-s1', 'algo-s2'],
      problem: 'Solve $T(n) = 2T(n/2) + O(n)$ using the Master Theorem.',
      steps: [
        'Step 1: Identify $a = 2$, $b = 2$, $f(n) = O(n)$.',
        'Step 2: $\\log_b a = \\log_2 2 = 1$, and $f(n) = O(n^1)$.',
        'Step 3: Case 2 of Master Theorem: $T(n) = O(n \\log n)$.',
      ],
      solved: false,
    },
    {
      id: 'algo-ex3',
      courseId: 'algo',
      title: 'Graph Traversal',
      difficulty: 'medium',
      prerequisiteIds: ['algo-s5'],
      problem:
        'Given a graph with 5 nodes (1→2, 1→3, 2→4, 3→4, 4→5), what is the BFS traversal order starting from node 1?',
      steps: [
        'Step 1: Start at node 1. Queue: [1]. Visit: {1}.',
        'Step 2: Dequeue 1, enqueue neighbors 2 and 3. Queue: [2, 3]. Visit: {1, 2, 3}.',
        'Step 3: Dequeue 2, enqueue 4. Dequeue 3 (4 already visited). Dequeue 4, enqueue 5. Order: **1, 2, 3, 4, 5**.',
      ],
      solved: false,
    },
  ],
  signals: [
    {
      id: 'signals-ex1',
      courseId: 'signals',
      title: 'Signal Classification',
      difficulty: 'easy',
      prerequisiteIds: ['signals-s1', 'signals-s2'],
      problem:
        'Classify $x(t) = \\cos(2\\pi t)$ as periodic or aperiodic. If periodic, find the period.',
      steps: [
        'Step 1: Check if $x(t + T) = x(t)$ for some T > 0.',
        'Step 2: $\\cos(2\\pi(t + T)) = \\cos(2\\pi t + 2\\pi T) = \\cos(2\\pi t)$ when $T = 1$.',
        'Step 3: The signal is **periodic** with fundamental period $T = 1$ second.',
      ],
      solved: false,
    },
    {
      id: 'signals-ex2',
      courseId: 'signals',
      title: 'Fourier Coefficient',
      difficulty: 'hard',
      prerequisiteIds: ['signals-s2', 'signals-s3'],
      problem:
        'Find the Fourier coefficients $c_k$ for the signal $x(t) = \\cos(4\\pi t)$.',
      steps: [
        'Step 1: Express using Euler\'s formula: $\\cos(4\\pi t) = \\frac{1}{2}e^{j4\\pi t} + \\frac{1}{2}e^{-j4\\pi t}$.',
        'Step 2: Compare with $x(t) = \\sum c_k e^{jk\\omega_0 t}$ where $\\omega_0 = 4\\pi$.',
        'Step 3: $c_1 = 1/2$, $c_{-1} = 1/2$, and $c_k = 0$ for all other k.',
      ],
      solved: false,
    },
  ],
}
