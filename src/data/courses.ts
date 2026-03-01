export interface Chapter {
	id: string;
	title: string;
	sections: Section[];
}

export interface Section {
	id: string;
	title: string;
	content: string;
}

export interface Exercise {
	id: string;
	courseId: string;
	chapterId: string;
	title: string;
	difficulty: "easy" | "medium" | "hard";
	prerequisites: { sectionId: string; chapterId: string; label: string }[];
	problem: string;
	steps: string[];
	solved: boolean;
}

export interface CourseContent {
	courseId: string;
	chapters: Chapter[];
	exercises: Exercise[];
}

export const courseContents: Record<string, CourseContent> = {
	calc101: {
		courseId: "calc101",
		chapters: [
			{
				id: "ch1",
				title: "Limits and Continuity",
				sections: [
					{
						id: "sec1-1",
						title: "Definition of a Limit",
						content: `The **limit** of a function $f(x)$ as $x$ approaches a value $c$ is the value that $f(x)$ gets closer to as $x$ gets closer to $c$.

**Formal ($\\varepsilon$-$\\delta$) Definition:** For every $\\varepsilon > 0$ there exists a $\\delta > 0$ such that if $0 < |x - c| < \\delta$, then $|f(x) - L| < \\varepsilon$.

We write: $\lim_{x \\to c} f(x) = L$   

**Example:** $\lim_{x \\to 2} (3x + 1) = 7$, because as $x$ approaches $2$, $3x + 1$ approaches $7$.

**Key Properties:**
- Sum Rule: $\lim_{x \to c} [f(x) + g(x)] = \lim_{x \to c} f(x) + \lim_{x \to c} g(x)$
- Product Rule: $\lim_{x \to c} [f(x) \cdot g(x)] = \lim_{x \to c} f(x) \cdot \lim_{x \to c} g(x)$
- Quotient Rule: $\lim_{x \to c} [f(x)/g(x)] = \lim_{x \to c} f(x) / \lim_{x \to c} g(x)$, provided $\lim_{x \to c} g(x) \neq 0$`,
					},
					{
						id: "sec1-2",
						title: "One-Sided Limits",
						content: `A **one-sided limit** considers the behavior of $f(x)$ as $x$ approaches $c$ from only one direction.

**Left-hand limit:** $\lim_{x \to c^-} f(x)$ — $x$ approaches $c$ from values less than $c$.
**Right-hand limit:** $\lim_{x \to c^+} f(x)$ — $x$ approaches $c$ from values greater than $c$.

**Theorem:** $\lim_{x \to c} f(x) = L$ if and only if $\lim_{x \to c^-} f(x) = L$ and $\lim_{x \to c^+} f(x) = L$.

**Example:** For $f(x) = |x|/x$:
- $\lim_{x \to 0^+} f(x) = 1$
- $\lim_{x \to 0^-} f(x) = -1$
- Therefore $\lim_{x \to 0} f(x)$ does not exist.`,
					},
					{
						id: "sec1-3",
						title: "Continuity",
						content: `A function $f$ is **continuous at a point $c$** if:
1. $f(c)$ is defined
2. $\lim_{x \to c} f(x)$ exists
3. $\lim_{x \to c} f(x) = f(c)$

**Types of Discontinuity:**
- **Removable:** The limit exists but $f(c) \neq \lim_{x \to c} f(x)$
- **Jump:** Left and right limits exist but are not equal
- **Infinite:** The function approaches $\pm\infty$

**Intermediate Value Theorem (IVT):** If $f$ is continuous on $[a, b]$ and $N$ is between $f(a)$ and $f(b)$, then there exists a $c$ in $(a, b)$ such that $f(c) = N$.`,
					},
				],
			},
			{
				id: "ch2",
				title: "Derivatives",
				sections: [
					{
						id: "sec2-1",
						title: "Definition of the Derivative",
						content: `The **derivative** of $f$ at $x$ is defined as:

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$

This represents the instantaneous rate of change (slope of the tangent line) at point $x$.

**Notation:** $f'(x)$, $\frac{dy}{dx}$, $Df(x)$, $\dot{y}$

**Basic Derivatives:**
- $\frac{d}{dx} [x^n] = nx^{n-1}$ (Power Rule)
- $\frac{d}{dx} [e^x] = e^x$
- $\frac{d}{dx} [\ln x] = \frac{1}{x}$
- $\frac{d}{dx} [\sin x] = \cos x$
- $\frac{d}{dx} [\cos x] = -\sin x$`,
					},
					{
						id: "sec2-2",
						title: "Differentiation Rules",
						content: `**Sum Rule:** $(f + g)' = f' + g'$

**Product Rule:** $(fg)' = f'g + fg'$

**Quotient Rule:** $(f/g)' = \frac{f'g - fg'}{g^2}$

**Chain Rule:** If $y = f(g(x))$, then $\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$

**Example:** $\frac{d}{dx} [\sin(x^2)] = \cos(x^2) \cdot 2x$ (Chain Rule applied)`,
					},
					{
						id: "sec2-3",
						title: "Applications of Derivatives",
						content: `**Critical Points:** Points where $f'(x) = 0$ or $f'(x)$ is undefined.

**First Derivative Test:**
- If $f'$ changes from $+$ to $-$ at $c$, then $f$ has a local maximum at $c$
- If $f'$ changes from $-$ to $+$ at $c$, then $f$ has a local minimum at $c$

**Second Derivative Test:**
- If $f'(c) = 0$ and $f''(c) > 0$, then $f$ has a local minimum at $c$
- If $f'(c) = 0$ and $f''(c) < 0$, then $f$ has a local maximum at $c$

**L'H\u00f4pital's Rule:** If $\lim \frac{f(x)}{g(x)}$ gives $\frac{0}{0}$ or $\frac{\infty}{\infty}$, then $\lim \frac{f(x)}{g(x)} = \lim \frac{f'(x)}{g'(x)}$.`,
					},
				],
			},
			{
				id: "ch3",
				title: "Integration",
				sections: [
					{
						id: "sec3-1",
						title: "Antiderivatives and Indefinite Integrals",
						content: `An **antiderivative** of $f(x)$ is a function $F(x)$ such that $F'(x) = f(x)$.

**Indefinite Integral:** $\int f(x)dx = F(x) + C$

**Basic Integrals:**
- $\int x^n dx = \frac{x^{n+1}}{n+1} + C$, $n \neq -1$
- $\int \frac{1}{x} dx = \ln|x| + C$
- $\int e^x dx = e^x + C$
- $\int \sin x \, dx = -\cos x + C$
- $\int \cos x \, dx = \sin x + C$`,
					},
					{
						id: "sec3-2",
						title: "Definite Integrals and the Fundamental Theorem",
						content: `**Fundamental Theorem of Calculus (Part 1):**
If $f$ is continuous on $[a, b]$ and $F$ is an antiderivative of $f$, then:
$$\int_a^b f(x)dx = F(b) - F(a)$$

**Fundamental Theorem of Calculus (Part 2):**
If $f$ is continuous on $[a, b]$, then:
$$\frac{d}{dx} \left[\int_a^x f(t)dt\right] = f(x)$$

**Properties:**
- $\int_a^b [f(x) + g(x)]dx = \int_a^b f(x)dx + \int_a^b g(x)dx$
- $\int_a^b cf(x)dx = c\int_a^b f(x)dx$
- $\int_a^b f(x)dx = -\int_b^a f(x)dx$`,
					},
				],
			},
		],
		exercises: [
			{
				id: "ex-calc-1",
				courseId: "calc101",
				chapterId: "ch1",
				title: "Evaluate a limit using limit laws",
				difficulty: "easy",
				prerequisites: [
					{
						sectionId: "sec1-1",
						chapterId: "ch1",
						label: "Definition of a Limit",
					},
				],
				problem: "Evaluate: $\lim_{x \to 3} (2x^2 - 5x + 1)$",
				steps: [
					"Step 1: Since $f(x) = 2x^2 - 5x + 1$ is a polynomial, it is continuous everywhere. We can evaluate by direct substitution.",
					"Step 2: Substitute $x = 3$: $2(3)^2 - 5(3) + 1$",
					"Step 3: Calculate: $2(9) - 15 + 1 = 18 - 15 + 1 = 4$",
					"Final Answer: $\lim_{x \to 3} (2x^2 - 5x + 1) = 4$",
				],
				solved: false,
			},
			{
				id: "ex-calc-2",
				courseId: "calc101",
				chapterId: "ch1",
				title: "Determine continuity of a piecewise function",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec1-2",
						chapterId: "ch1",
						label: "One-Sided Limits",
					},
					{
						sectionId: "sec1-3",
						chapterId: "ch1",
						label: "Continuity",
					},
				],
				problem:
					"Is $f(x) = \begin{cases} x^2 & \text{if } x < 1 \\ 2x - 1 & \text{if } x \geq 1 \end{cases}$ continuous at $x = 1$?",
				steps: [
					"Step 1: Check if $f(1)$ is defined. $f(1) = 2(1) - 1 = 1$. ✓",
					"Step 2: Find the left-hand limit: $\lim_{x \to 1^-} x^2 = 1^2 = 1$.",
					"Step 3: Find the right-hand limit: $\lim_{x \to 1^+} (2x - 1) = 2(1) - 1 = 1$.",
					"Step 4: Since $\lim_{x \to 1^-} = \lim_{x \to 1^+} = 1$, the two-sided limit exists and equals 1.",
					"Step 5: Check: $f(1) = 1 = \lim_{x \to 1} f(x)$. All three conditions hold.",
					"Final Answer: Yes, $f$ is continuous at $x = 1$.",
				],
				solved: false,
			},
			{
				id: "ex-calc-3",
				courseId: "calc101",
				chapterId: "ch2",
				title: "Apply the chain rule",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec2-1",
						chapterId: "ch2",
						label: "Definition of the Derivative",
					},
					{
						sectionId: "sec2-2",
						chapterId: "ch2",
						label: "Differentiation Rules",
					},
				],
				problem: "Find the derivative of $f(x) = (3x^2 + 2)^5$.",
				steps: [
					"Step 1: Identify the outer function $u^5$ and inner function $u = 3x^2 + 2$.",
					"Step 2: Apply the chain rule: $f'(x) = 5(3x^2 + 2)^4 \cdot \frac{d}{dx}(3x^2 + 2)$.",
					"Step 3: Compute the inner derivative: $\frac{d}{dx}(3x^2 + 2) = 6x$.",
					"Final Answer: $f'(x) = 30x(3x^2 + 2)^4$",
				],
				solved: false,
			},
			{
				id: "ex-calc-4",
				courseId: "calc101",
				chapterId: "ch2",
				title: "Find critical points and classify extrema",
				difficulty: "hard",
				prerequisites: [
					{
						sectionId: "sec2-2",
						chapterId: "ch2",
						label: "Differentiation Rules",
					},
					{
						sectionId: "sec2-3",
						chapterId: "ch2",
						label: "Applications of Derivatives",
					},
				],
				problem:
					"Find and classify all critical points of $f(x) = x^3 - 6x^2 + 9x + 1$.",
				steps: [
					"Step 1: Find $f'(x) = 3x^2 - 12x + 9$.",
					"Step 2: Set $f'(x) = 0$: $3x^2 - 12x + 9 = 0 \\Rightarrow 3(x^2 - 4x + 3) = 0 \\Rightarrow 3(x - 1)(x - 3) = 0$.",
					"Step 3: Critical points at $x = 1$ and $x = 3$.",
					"Step 4: Find $f''(x) = 6x - 12$.",
					"Step 5: $f''(1) = 6(1) - 12 = -6 < 0$ \u2192 local maximum at $x = 1$. $f(1) = 1 - 6 + 9 + 1 = 5$.",
					"Step 6: $f''(3) = 6(3) - 12 = 6 > 0$ \u2192 local minimum at $x = 3$. $f(3) = 27 - 54 + 27 + 1 = 1$.",
					"Final Answer: Local maximum at $(1, 5)$; Local minimum at $(3, 1)$.",
				],
				solved: false,
			},
			{
				id: "ex-calc-5",
				courseId: "calc101",
				chapterId: "ch3",
				title: "Evaluate a definite integral",
				difficulty: "easy",
				prerequisites: [
					{
						sectionId: "sec3-1",
						chapterId: "ch3",
						label: "Antiderivatives and Indefinite Integrals",
					},
					{
						sectionId: "sec3-2",
						chapterId: "ch3",
						label: "Definite Integrals and the Fundamental Theorem",
					},
				],
				problem: "Evaluate: $\int_1^3 (2x + 1) \, dx$",
				steps: [
					"Step 1: Find the antiderivative: $F(x) = x^2 + x$.",
					"Step 2: Apply FTC: $F(3) - F(1) = (9 + 3) - (1 + 1) = 12 - 2$.",
					"Final Answer: $\int_1^3 (2x + 1) \, dx = 10$",
				],
				solved: false,
			},
		],
	},
	thermo: {
		courseId: "thermo",
		chapters: [
			{
				id: "ch1",
				title: "Fundamental Concepts",
				sections: [
					{
						id: "sec1-1",
						title: "Systems and Surroundings",
						content: `A **thermodynamic system** is a quantity of matter or a region in space chosen for study.

**Types of Systems:**
- **Open system:** Mass and energy can cross the boundary
- **Closed system:** Only energy crosses the boundary (mass is fixed)
- **Isolated system:** Neither mass nor energy crosses the boundary

**State variables:** Properties that define the condition of a system ($P$, $V$, $T$, $U$, $S$, $H$).

**Equation of State:** $PV = nRT$ (ideal gas law) relates pressure, volume, and temperature.`,
					},
					{
						id: "sec1-2",
						title: "Temperature and Zeroth Law",
						content: `The **Zeroth Law of Thermodynamics:** If system A is in thermal equilibrium with system C, and system B is also in thermal equilibrium with system C, then A and B are in thermal equilibrium with each other.

This law provides the basis for temperature measurement.

**Temperature Scales:**
- Kelvin: $T(K) = T(\u00b0C) + 273.15$
- Celsius: $T(\u00b0C) = T(K) - 273.15$
- Fahrenheit: $T(\u00b0F) = \frac{9}{5}T(\u00b0C) + 32$`,
					},
				],
			},
			{
				id: "ch2",
				title: "First Law of Thermodynamics",
				sections: [
					{
						id: "sec2-1",
						title: "Internal Energy and Heat",
						content: `The **First Law of Thermodynamics** is a statement of energy conservation:

$$\Delta U = Q - W$$

Where:
- $\Delta U$ = change in internal energy
- $Q$ = heat added to the system
- $W$ = work done by the system

**Sign Convention:**
- $Q > 0$: heat flows into the system
- $W > 0$: work is done by the system on surroundings
- $\Delta U > 0$: internal energy increases`,
					},
					{
						id: "sec2-2",
						title: "Work and PV Diagrams",
						content: `**Work done by a gas:** $W = \int P \, dV$

**Special Processes:**
- **Isobaric** (constant $P$): $W = P\Delta V$
- **Isochoric** (constant $V$): $W = 0$
- **Isothermal** (constant $T$): $W = nRT \ln(V_2/V_1)$
- **Adiabatic** ($Q = 0$): $PV^\gamma = \text{constant}$, where $\gamma = C_p/C_v$

Work equals the area under the curve on a $P$-$V$ diagram.`,
					},
				],
			},
			{
				id: "ch3",
				title: "Second Law and Entropy",
				sections: [
					{
						id: "sec3-1",
						title: "Entropy and the Second Law",
						content: `**Second Law of Thermodynamics:** The total entropy of an isolated system can never decrease over time.

**Entropy:** $dS = \frac{\delta Q_{\text{rev}}}{T}$

For an irreversible process: $\Delta S_{\text{total}} > 0$
For a reversible process: $\Delta S_{\text{total}} = 0$

**Clausius Inequality:** $\oint \frac{\delta Q}{T} \leq 0$

Entropy is a measure of the number of microscopic configurations (disorder): $S = k_B \ln \Omega$`,
					},
				],
			},
		],
		exercises: [
			{
				id: "ex-thermo-1",
				courseId: "thermo",
				chapterId: "ch1",
				title: "Classify thermodynamic systems",
				difficulty: "easy",
				prerequisites: [
					{
						sectionId: "sec1-1",
						chapterId: "ch1",
						label: "Systems and Surroundings",
					},
				],
				problem:
					"Classify each as open, closed, or isolated: (a) a sealed insulated thermos, (b) a boiling pot without a lid, (c) a sealed balloon.",
				steps: [
					"Step 1: (a) Sealed insulated thermos \u2014 no mass transfer (sealed), no significant heat transfer (insulated). $\\Rightarrow$ Isolated system.",
					"Step 2: (b) Boiling pot without lid \u2014 steam escapes (mass transfer) and heat enters from stove. $\\Rightarrow$ Open system.",
					"Step 3: (c) Sealed balloon \u2014 no mass transfer, but heat can pass through the balloon wall. $\\Rightarrow$ Closed system.",
					"Final Answer: (a) Isolated, (b) Open, (c) Closed.",
				],
				solved: false,
			},
			{
				id: "ex-thermo-2",
				courseId: "thermo",
				chapterId: "ch2",
				title: "Apply the first law to an isobaric process",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec2-1",
						chapterId: "ch2",
						label: "Internal Energy and Heat",
					},
					{
						sectionId: "sec2-2",
						chapterId: "ch2",
						label: "Work and PV Diagrams",
					},
				],
				problem:
					"A gas expands isobarically at $P = 2$ atm from $V_1 = 3$ L to $V_2 = 8$ L. If $Q = 1200$ J, find $\Delta U$. ($1$ atm$\cdot$L = $101.325$ J)",
				steps: [
					"Step 1: Calculate work: $W = P\Delta V = 2 \text{ atm} \times (8 - 3) \text{ L} = 10 \text{ atm}\cdot\text{L}$.",
					"Step 2: Convert: $W = 10 \times 101.325 \text{ J} = 1013.25 \text{ J}$.",
					"Step 3: Apply first law: $\Delta U = Q - W = 1200 - 1013.25 = 186.75 \text{ J}$.",
					"Final Answer: $\Delta U \approx 186.8$ J.",
				],
				solved: false,
			},
			{
				id: "ex-thermo-3",
				courseId: "thermo",
				chapterId: "ch3",
				title: "Calculate entropy change for reversible heating",
				difficulty: "hard",
				prerequisites: [
					{
						sectionId: "sec3-1",
						chapterId: "ch3",
						label: "Entropy and the Second Law",
					},
				],
				problem:
					"Calculate the entropy change when $2$ mol of an ideal gas $(C_v = 3R/2)$ is heated reversibly at constant volume from $300$ K to $600$ K.",
				steps: [
					"Step 1: At constant volume, $\delta Q = nC_v \, dT$.",
					"Step 2: $\Delta S = \int \frac{\delta Q}{T} = \int_{300}^{600} nC_v \frac{dT}{T} = nC_v \ln(T_2/T_1)$.",
					"Step 3: $\Delta S = 2 \times \frac{3}{2}(8.314) \times \ln(600/300)$.",
					"Step 4: $\Delta S = 2 \times 12.471 \times \ln(2) = 24.942 \times 0.6931$.",
					"Final Answer: $\Delta S \approx 17.29$ J/K.",
				],
				solved: false,
			},
		],
	},
	linalg: {
		courseId: "linalg",
		chapters: [
			{
				id: "ch1",
				title: "Vectors and Vector Spaces",
				sections: [
					{
						id: "sec1-1",
						title: "Vectors in $\mathbb{R}^n$",
						content: `A **vector** in $\mathbb{R}^n$ is an ordered $n$-tuple of real numbers: $\mathbf{v} = (v_1, v_2, \ldots, v_n)$.

**Operations:**
- Addition: $\mathbf{u} + \mathbf{v} = (u_1 + v_1, u_2 + v_2, \ldots, u_n + v_n)$
- Scalar multiplication: $c\mathbf{v} = (cv_1, cv_2, \ldots, cv_n)$

**Dot product:** $\mathbf{u} \cdot \mathbf{v} = u_1v_1 + u_2v_2 + \ldots + u_nv_n$

**Norm (length):** $\|\mathbf{v}\| = \sqrt{\mathbf{v} \cdot \mathbf{v}}$

Two vectors are **orthogonal** if $\mathbf{u} \cdot \mathbf{v} = 0$.`,
					},
					{
						id: "sec1-2",
						title: "Linear Independence and Span",
						content: `Vectors $\mathbf{v}_1, \mathbf{v}_2, \ldots, \mathbf{v}_k$ are **linearly independent** if the only solution to $c_1\mathbf{v}_1 + c_2\mathbf{v}_2 + \ldots + c_k\mathbf{v}_k = \mathbf{0}$ is $c_1 = c_2 = \ldots = c_k = 0$.

The **span** of a set of vectors is the set of all linear combinations: $\text{Span}\{\mathbf{v}_1, \ldots, \mathbf{v}_k\} = \{c_1\mathbf{v}_1 + \ldots + c_k\mathbf{v}_k : c_i \in \mathbb{R}\}$.

A **basis** for a vector space $V$ is a linearly independent set that spans $V$.

The **dimension** of $V$ is the number of vectors in any basis for $V$.`,
					},
				],
			},
			{
				id: "ch2",
				title: "Matrices and Linear Transformations",
				sections: [
					{
						id: "sec2-1",
						title: "Matrix Operations",
						content: `An **$m \\times n$ matrix** $A$ has $m$ rows and $n$ columns. Entry $a_{ij}$ is in row $i$, column $j$.

**Matrix multiplication:** If $A$ is $m \\times n$ and $B$ is $n \\times p$, then $AB$ is $m \\times p$ with $(AB)_{ij} = \\sum_k a_{ik}b_{kj}$.

**Properties:**
- $AB \\neq BA$ in general (not commutative)
- $A(BC) = (AB)C$ (associative)
- $A(B + C) = AB + AC$ (distributive)

**Identity matrix:** $I_n$ is the $n \\times n$ matrix with $1$s on the diagonal and $0$s elsewhere. $AI = IA = A$.`,
					},
					{
						id: "sec2-2",
						title: "Determinants",
						content: `The **determinant** of a $2 \\times 2$ matrix: $\\det \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc$.

**Properties:**
- $\\det(AB) = \\det(A) \\cdot \\det(B)$
- $\\det(A^T) = \\det(A)$
- If $\\det(A) = 0$, then $A$ is singular (not invertible)
- Row swapping changes the sign of the determinant
- Multiplying a row by $c$ multiplies $\\det$ by $c$

**Cofactor expansion** can compute the determinant of larger matrices by expanding along a row or column.`,
					},
				],
			},
			{
				id: "ch3",
				title: "Eigenvalues and Eigenvectors",
				sections: [
					{
						id: "sec3-1",
						title: "Eigenvalue Problems",
						content: `An **eigenvalue** $\\lambda$ of matrix $A$ satisfies $A\\mathbf{v} = \\lambda \\mathbf{v}$ for some nonzero vector $\\mathbf{v}$ (the **eigenvector**).

**Finding eigenvalues:** Solve $\\det(A - \\lambda I) = 0$ (the **characteristic equation**).

**Finding eigenvectors:** For each eigenvalue $\\lambda$, solve $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.

**Diagonalization:** If $A$ has $n$ linearly independent eigenvectors, then $A = PDP^{-1}$, where $D$ is diagonal with eigenvalues and $P$ has eigenvectors as columns.`,
					},
				],
			},
		],
		exercises: [
			{
				id: "ex-linalg-1",
				courseId: "linalg",
				chapterId: "ch1",
				title: "Test linear independence",
				difficulty: "easy",
				prerequisites: [
					{
						sectionId: "sec1-2",
						chapterId: "ch1",
						label: "Linear Independence and Span",
					},
				],
				problem:
					"Determine if $\\mathbf{v}_1 = (1, 2, 3)$, $\\mathbf{v}_2 = (4, 5, 6)$, $\\mathbf{v}_3 = (7, 8, 9)$ are linearly independent.",
				steps: [
					"Step 1: Form the matrix with these vectors as rows and row reduce.",
					"Step 2: $\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{bmatrix}$ $\\xrightarrow{R_2 - 4R_1, R_3 - 7R_1}$ $\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & -3 & -6 \\\\ 0 & -6 & -12 \\end{bmatrix}$.",
					"Step 3: $R_3 - 2R_2$ $\\Rightarrow$ $\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & -3 & -6 \\\\ 0 & 0 & 0 \\end{bmatrix}$. The third row is all zeros.",
					"Step 4: Since we get a zero row, the rank is $2 < 3$.",
					"Final Answer: The vectors are linearly dependent ($\\mathbf{v}_3 = 2\\mathbf{v}_2 - \\mathbf{v}_1$).",
				],
				solved: false,
			},
			{
				id: "ex-linalg-2",
				courseId: "linalg",
				chapterId: "ch2",
				title: "Compute a 3×3 determinant",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec2-2",
						chapterId: "ch2",
						label: "Determinants",
					},
				],
				problem:
					"Find $\\det(A)$ where $A = \\begin{bmatrix} 2 & 1 & 3 \\\\ 0 & -1 & 2 \\\\ 1 & 4 & -1 \\end{bmatrix}$.",
				steps: [
					"Step 1: Expand along the first row: $\\det(A) = 2 \\cdot \\det\\begin{bmatrix} -1 & 2 \\\\ 4 & -1 \\end{bmatrix} - 1 \\cdot \\det\\begin{bmatrix} 0 & 2 \\\\ 1 & -1 \\end{bmatrix} + 3 \\cdot \\det\\begin{bmatrix} 0 & -1 \\\\ 1 & 4 \\end{bmatrix}$.",
					"Step 2: Compute minors: $\\det\\begin{bmatrix} -1 & 2 \\\\ 4 & -1 \\end{bmatrix} = (-1)(-1) - (2)(4) = 1 - 8 = -7$.",
					"Step 3: $\\det\\begin{bmatrix} 0 & 2 \\\\ 1 & -1 \\end{bmatrix} = (0)(-1) - (2)(1) = -2$.",
					"Step 4: $\\det\\begin{bmatrix} 0 & -1 \\\\ 1 & 4 \\end{bmatrix} = (0)(4) - (-1)(1) = 1$.",
					"Step 5: $\\det(A) = 2(-7) - 1(-2) + 3(1) = -14 + 2 + 3 = -9$.",
					"Final Answer: $\\det(A) = -9$.",
				],
				solved: false,
			},
			{
				id: "ex-linalg-3",
				courseId: "linalg",
				chapterId: "ch3",
				title: "Find eigenvalues and eigenvectors",
				difficulty: "hard",
				prerequisites: [
					{
						sectionId: "sec2-2",
						chapterId: "ch2",
						label: "Determinants",
					},
					{
						sectionId: "sec3-1",
						chapterId: "ch3",
						label: "Eigenvalue Problems",
					},
				],
				problem:
					"Find the eigenvalues and eigenvectors of $A = \\begin{bmatrix} 4 & 1 \\\\ 2 & 3 \\end{bmatrix}$.",
				steps: [
					"Step 1: Characteristic equation: $\\det(A - \\lambda I) = 0$ $\\Rightarrow$ $\\det\\begin{bmatrix} 4-\\lambda & 1 \\\\ 2 & 3-\\lambda \\end{bmatrix} = 0$.",
					"Step 2: $(4 - \\lambda)(3 - \\lambda) - 2 = 0$ $\\Rightarrow$ $\\lambda^2 - 7\\lambda + 10 = 0$.",
					"Step 3: Factor: $(\\lambda - 5)(\\lambda - 2) = 0$ $\\Rightarrow$ $\\lambda_1 = 5$, $\\lambda_2 = 2$.",
					"Step 4: For $\\lambda_1 = 5$: $(A - 5I)\\mathbf{v} = \\mathbf{0}$ $\\Rightarrow$ $\\begin{bmatrix} -1 & 1 \\\\ 2 & -2 \\end{bmatrix}\\mathbf{v} = \\mathbf{0}$ $\\Rightarrow$ $\\mathbf{v}_1 = t(1, 1)$.",
					"Step 5: For $\\lambda_2 = 2$: $(A - 2I)\\mathbf{v} = \\mathbf{0}$ $\\Rightarrow$ $\\begin{bmatrix} 2 & 1 \\\\ 2 & 1 \\end{bmatrix}\\mathbf{v} = \\mathbf{0}$ $\\Rightarrow$ $\\mathbf{v}_2 = t(1, -2)$.",
					"Final Answer: $\\lambda_1 = 5$ with eigenvector $(1, 1)$; $\\lambda_2 = 2$ with eigenvector $(1, -2)$.",
				],
				solved: false,
			},
		],
	},
	algo: {
		courseId: "algo",
		chapters: [
			{
				id: "ch1",
				title: "Complexity Analysis",
				sections: [
					{
						id: "sec1-1",
						title: "Big-O Notation",
						content: `**Big-O notation** describes an upper bound on the growth rate of a function.

$f(n) = O(g(n))$ if there exist constants $c > 0$ and $n_0$ such that $f(n) \leq c \cdot g(n)$ for all $n \geq n_0$.

**Common complexities (from fastest to slowest):**
- $O(1)$ — constant
- $O(\log n)$ — logarithmic
- $O(n)$ — linear
- $O(n \log n)$ — linearithmic
- $O(n^2)$ — quadratic
- $O(2^n)$ — exponential

**Rules:**
- Drop constants: $O(3n) = O(n)$
- Drop lower-order terms: $O(n^2 + n) = O(n^2)$
- Nested loops multiply: two nested $O(n)$ loops $\\Rightarrow$ $O(n^2)$`,
					},
					{
						id: "sec1-2",
						title: "Recurrence Relations",
						content: `Many divide-and-conquer algorithms are described by **recurrence relations**.

**Master Theorem:** For $T(n) = aT(n/b) + O(n^d)$:
- If $d < \\log_b(a)$: $T(n) = O(n^{\\log_b a})$
- If $d = \\log_b(a)$: $T(n) = O(n^d \\log n)$
- If $d > \\log_b(a)$: $T(n) = O(n^d)$

**Example:** Merge sort: $T(n) = 2T(n/2) + O(n)$. Here $a=2$, $b=2$, $d=1$. Since $d = \\log_2 2 = 1$, $T(n) = O(n \\log n)$.`,
					},
				],
			},
			{
				id: "ch2",
				title: "Sorting Algorithms",
				sections: [
					{
						id: "sec2-1",
						title: "Comparison-Based Sorting",
						content: `**Merge Sort:** Divide array in half, recursively sort each half, merge results. $O(n \\log n)$ time, $O(n)$ space.

**Quick Sort:** Pick a pivot, partition array into elements < pivot and $\\geq$ pivot, recurse. Average $O(n \\log n)$, worst $O(n^2)$.

**Heap Sort:** Build a max-heap, repeatedly extract the maximum. $O(n \\log n)$ time, $O(1)$ extra space.

**Lower bound:** Any comparison-based sorting algorithm requires $\\Omega(n \\log n)$ comparisons in the worst case.`,
					},
					{
						id: "sec2-2",
						title: "Non-Comparison Sorting",
						content: `These achieve $O(n)$ time by not comparing elements directly:

**Counting Sort:** Count occurrences of each value. Works when the range of values $k$ is small. $O(n + k)$ time.

**Radix Sort:** Sort by each digit from least to most significant. $O(d(n + k))$ where $d$ = number of digits.

**Bucket Sort:** Distribute elements into buckets, sort each bucket. Average $O(n)$ when input is uniformly distributed.`,
					},
				],
			},
			{
				id: "ch3",
				title: "Graph Algorithms",
				sections: [
					{
						id: "sec3-1",
						title: "BFS and DFS",
						content: `**Breadth-First Search (BFS):** Explores all neighbors before going deeper. Uses a queue.
- Time: $O(V + E)$
- Finds shortest path in unweighted graphs

**Depth-First Search (DFS):** Explores as far as possible before backtracking. Uses a stack (or recursion).
- Time: $O(V + E)$
- Applications: cycle detection, topological sorting, connected components

**Topological Sort:** Linear ordering of vertices in a DAG such that for every directed edge $u \\to v$, $u$ appears before $v$.`,
					},
				],
			},
		],
		exercises: [
			{
				id: "ex-algo-1",
				courseId: "algo",
				chapterId: "ch1",
				title: "Analyze nested loop complexity",
				difficulty: "easy",
				prerequisites: [
					{
						sectionId: "sec1-1",
						chapterId: "ch1",
						label: "Big-O Notation",
					},
				],
				problem:
					"What is the time complexity of: for i = 1 to n: for j = 1 to i: print(i, j)?",
				steps: [
					"Step 1: The inner loop runs $i$ times for each value of $i$ from 1 to $n$.",
					"Step 2: Total iterations = $1 + 2 + 3 + \\ldots + n = \\frac{n(n+1)}{2}$.",
					"Step 3: $\\frac{n(n+1)}{2} = \\frac{n^2 + n}{2}$.",
					"Step 4: Drop constants and lower-order terms.",
					"Final Answer: $O(n^2)$.",
				],
				solved: false,
			},
			{
				id: "ex-algo-2",
				courseId: "algo",
				chapterId: "ch1",
				title: "Apply the Master Theorem",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec1-2",
						chapterId: "ch1",
						label: "Recurrence Relations",
					},
				],
				problem:
					"Solve the recurrence $T(n) = 4T(n/2) + O(n)$ using the Master Theorem.",
				steps: [
					"Step 1: Identify $a = 4$, $b = 2$, $d = 1$.",
					"Step 2: Compute $\\log_b(a) = \\log_2(4) = 2$.",
					"Step 3: Compare $d$ with $\\log_b(a)$: $d = 1 < 2 = \\log_2 4$.",
					"Step 4: By Master Theorem Case 1: $T(n) = O(n^{\\log_b a}) = O(n^2)$.",
					"Final Answer: $T(n) = O(n^2)$.",
				],
				solved: false,
			},
			{
				id: "ex-algo-3",
				courseId: "algo",
				chapterId: "ch3",
				title: "Trace BFS on a graph",
				difficulty: "medium",
				prerequisites: [
					{
						sectionId: "sec3-1",
						chapterId: "ch3",
						label: "BFS and DFS",
					},
				],
				problem:
					"Run BFS starting from vertex A on the graph: A\u2014B, A\u2014C, B\u2014D, C\u2014D, C\u2014E, D\u2014E. Give the visit order.",
				steps: [
					"Step 1: Initialize queue with A. Visited = {A}. Queue = [A].",
					"Step 2: Dequeue A. Neighbors: B, C. Enqueue both. Visited = {A, B, C}. Queue = [B, C].",
					"Step 3: Dequeue B. Neighbors: A (visited), D. Enqueue D. Visited = {A, B, C, D}. Queue = [C, D].",
					"Step 4: Dequeue C. Neighbors: A (visited), D (visited), E. Enqueue E. Visited = {A, B, C, D, E}. Queue = [D, E].",
					"Step 5: Dequeue D. Neighbors: B (visited), C (visited), E (visited). Nothing new.",
					"Step 6: Dequeue E. Neighbors: C (visited), D (visited). Nothing new. Queue empty.",
					"Final Answer: BFS visit order: A $\\to$ B $\\to$ C $\\to$ D $\\to$ E.",
				],
				solved: false,
			},
		],
	},
};
