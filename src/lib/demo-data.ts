import type { ProblemDetail, ProblemSummary } from "@/types";

export const DEMO_MODE = process.env.DEMO_MODE === "true";

const BOOK = {
  id: "demo-book-1",
  title: "Principles of Mathematical Analysis",
  author: "Walter Rudin",
  slug: "rudin-pma",
};

const CHAPTERS = {
  ch1: { id: "demo-ch-1", number: 1, title: "The Real and Complex Number Systems", book: BOOK },
  ch2: { id: "demo-ch-2", number: 2, title: "Basic Topology", book: BOOK },
  ch3: { id: "demo-ch-3", number: 3, title: "Numerical Sequences and Series", book: BOOK },
  ch4: { id: "demo-ch-4", number: 4, title: "Continuity", book: BOOK },
  ch5: { id: "demo-ch-5", number: 5, title: "Differentiation", book: BOOK },
  ch6: { id: "demo-ch-6", number: 6, title: "The Riemann-Stieltjes Integral", book: BOOK },
  ch7: { id: "demo-ch-7", number: 7, title: "Sequences and Series of Functions", book: BOOK },
};

// Single source of truth for tags so DEMO_TAGS stays in sync with the problems.
const T = (id: string, name: string) => ({ tag: { id, name } });
const TAGS = {
  orderedFields: T("t-ordered-fields", "ordered fields"),
  realNumbers: T("t-real-numbers", "real numbers"),
  supInf: T("t-sup-inf", "supremum and infimum"),
  inequalities: T("t-inequalities", "inequalities"),
  countability: T("t-countability", "countability"),
  metricSpaces: T("t-metric-spaces", "metric spaces"),
  openClosed: T("t-open-closed", "open and closed sets"),
  compactness: T("t-compactness", "compactness"),
  connectedness: T("t-connectedness", "connectedness"),
  sequences: T("t-sequences", "sequences"),
  limits: T("t-limits", "limits"),
  cauchy: T("t-cauchy", "Cauchy sequences"),
  series: T("t-series", "series"),
  convergenceTests: T("t-convergence-tests", "convergence tests"),
  continuity: T("t-continuity", "continuity"),
  uniformContinuity: T("t-uniform-continuity", "uniform continuity"),
  ivt: T("t-ivt", "intermediate value theorem"),
  differentiation: T("t-differentiation", "differentiation"),
  mvt: T("t-mvt", "mean value theorem"),
  taylor: T("t-taylor", "Taylor's theorem"),
  riemann: T("t-riemann", "Riemann-Stieltjes integral"),
  integration: T("t-integration", "integration"),
  uniformConvergence: T("t-uniform-convergence", "uniform convergence"),
  equicontinuity: T("t-equicontinuity", "equicontinuity"),
};

export const DEMO_PROBLEMS: ProblemDetail[] = [
  // ── Chapter 1: The Real and Complex Number Systems ──────────────────────────
  {
    id: "demo-1-1",
    number: "1",
    statement:
      "If $r$ is rational ($r \\neq 0$) and $x$ is irrational, prove that $r + x$ and $rx$ are irrational.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 21",
    chapter: CHAPTERS.ch1,
    tags: [TAGS.orderedFields],
    hints: [
      { id: "h-1-1-1", order: 1, content: "Suppose for contradiction that $r + x$ is rational." },
      {
        id: "h-1-1-2",
        order: 2,
        content:
          "Since $r$ is rational and (by assumption) $r + x$ is rational, what can you say about $(r + x) - r$? The rationals are closed under subtraction.",
      },
      {
        id: "h-1-1-3",
        order: 3,
        content:
          "For the $rx$ case: since $r \\neq 0$, the rational $1/r$ exists. If $rx$ were rational, then $(rx)(1/r) = x$ would be rational — contradiction.",
      },
    ],
  },
  {
    id: "demo-1-2",
    number: "2",
    statement: "Prove that there is no rational number $p$ such that $p^2 = 12$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 22",
    chapter: CHAPTERS.ch1,
    tags: [TAGS.orderedFields, TAGS.realNumbers],
    hints: [
      {
        id: "h-1-2-1",
        order: 1,
        content: "Write $p = m/n$ where $m, n \\in \\mathbb{Z}$, $n > 0$, and $\\gcd(m, n) = 1$.",
      },
      {
        id: "h-1-2-2",
        order: 2,
        content:
          "From $m^2 = 12 n^2 = 4 \\cdot 3 n^2$, conclude $4 \\mid m^2$, hence $2 \\mid m$. Write $m = 2k$.",
      },
      {
        id: "h-1-2-3",
        order: 3,
        content:
          "Substitute $m = 2k$: you get $k^2 = 3 n^2$, so $3 \\mid k^2$ and thus $3 \\mid k$. Then $3 \\mid m$ and $3 \\mid n$, contradicting $\\gcd(m, n) = 1$.",
      },
    ],
  },
  {
    id: "demo-1-5",
    number: "5",
    statement:
      "Let $A$ be a nonempty set of real numbers which is bounded below. Let $-A$ be the set of all numbers $-x$, where $x \\in A$. Prove that $\\inf A = -\\sup(-A)$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 22",
    chapter: CHAPTERS.ch1,
    tags: [TAGS.supInf, TAGS.realNumbers],
    hints: [
      {
        id: "h-1-5-1",
        order: 1,
        content:
          "First show $-A$ is bounded above, so that $\\sup(-A)$ exists by the least-upper-bound property.",
      },
      {
        id: "h-1-5-2",
        order: 2,
        content:
          "If $L$ is a lower bound for $A$, show $-L$ is an upper bound for $-A$, and vice versa. Lower bounds of $A$ correspond bijectively to upper bounds of $-A$ via negation.",
      },
      {
        id: "h-1-5-3",
        order: 3,
        content:
          "Let $\\beta = \\sup(-A)$. Show $-\\beta$ is a lower bound of $A$ and that no larger number is a lower bound, which is exactly the definition of $\\inf A = -\\beta$.",
      },
    ],
  },
  {
    id: "demo-1-8",
    number: "8",
    statement:
      "Prove that no order can be defined in the complex field that turns it into an ordered field. (Hint: $-1$ is a square.)",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 22",
    chapter: CHAPTERS.ch1,
    tags: [TAGS.orderedFields, TAGS.inequalities],
    hints: [
      {
        id: "h-1-8-1",
        order: 1,
        content:
          "In any ordered field, recall that the square of every nonzero element is positive: $x^2 > 0$ for $x \\neq 0$.",
      },
      {
        id: "h-1-8-2",
        order: 2,
        content: "In particular $1 = 1^2 > 0$. What does that force about the sign of $-1$?",
      },
      {
        id: "h-1-8-3",
        order: 3,
        content:
          "In $\\mathbb{C}$ we have $i^2 = -1$, so $-1$ would have to be positive (a square). But $1 > 0$ forces $-1 < 0$. These contradict, so no such order exists.",
      },
    ],
  },

  // ── Chapter 2: Basic Topology ────────────────────────────────────────────────
  {
    id: "demo-2-2",
    number: "2",
    statement:
      "A complex number $z$ is said to be algebraic if there are integers $a_0, \\dots, a_n$, not all zero, such that $a_0 z^n + a_1 z^{n-1} + \\cdots + a_{n-1} z + a_n = 0$. Prove that the set of all algebraic numbers is countable.",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 43",
    chapter: CHAPTERS.ch2,
    tags: [TAGS.countability],
    hints: [
      {
        id: "h-2-2-1",
        order: 1,
        content:
          "For each integer $N \\geq 1$, consider polynomials of height $n + |a_0| + \\cdots + |a_n| = N$. How many such integer polynomials are there?",
      },
      {
        id: "h-2-2-2",
        order: 2,
        content:
          "For fixed $N$ there are only finitely many such equations, and each polynomial of degree $n$ has at most $n$ roots — so each $N$ contributes finitely many algebraic numbers.",
      },
      {
        id: "h-2-2-3",
        order: 3,
        content:
          "The algebraic numbers are a countable union (over $N = 1, 2, 3, \\dots$) of finite sets. A countable union of finite (or countable) sets is countable.",
      },
    ],
  },
  {
    id: "demo-2-7",
    number: "7",
    statement:
      "Let $A_1, A_2, A_3, \\dots$ be subsets of a metric space. If $B_n = \\bigcup_{i=1}^{n} A_i$, prove that $\\overline{B_n} = \\bigcup_{i=1}^{n} \\overline{A_i}$. If $B = \\bigcup_{i=1}^{\\infty} A_i$, prove that $\\overline{B} \\supset \\bigcup_{i=1}^{\\infty} \\overline{A_i}$, and show by an example that this inclusion can be proper.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 43",
    chapter: CHAPTERS.ch2,
    tags: [TAGS.metricSpaces, TAGS.openClosed],
    hints: [
      {
        id: "h-2-7-1",
        order: 1,
        content:
          "Use that the closure of a set is the union of the set with its limit points, and that $E \\subset F$ implies $\\overline{E} \\subset \\overline{F}$.",
      },
      {
        id: "h-2-7-2",
        order: 2,
        content:
          "For the finite case, a finite union of closed sets is closed, and $\\overline{B_n}$ is the smallest closed set containing $B_n$. Both inclusions $\\subset$ and $\\supset$ are short.",
      },
      {
        id: "h-2-7-3",
        order: 3,
        content:
          "For a proper inclusion in the infinite case, let $A_i = \\{r_i\\}$ enumerate the rationals in $[0,1]$. Each $\\overline{A_i} = A_i$, but $\\overline{B} = [0,1] \\neq \\bigcup \\overline{A_i} = \\mathbb{Q} \\cap [0,1]$.",
      },
    ],
  },
  {
    id: "demo-2-9b",
    number: "9",
    statement:
      "Let $E^\\circ$ denote the set of all interior points of a set $E$ (the interior of $E$). Prove that $E^\\circ$ is always open, and prove that $E$ is open if and only if $E^\\circ = E$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 43",
    chapter: CHAPTERS.ch2,
    tags: [TAGS.openClosed, TAGS.metricSpaces],
    hints: [
      {
        id: "h-2-9-1",
        order: 1,
        content:
          "Recall $p \\in E^\\circ$ means there is a neighborhood $N_r(p) \\subset E$. You must show every point of $E^\\circ$ is itself an interior point of $E^\\circ$.",
      },
      {
        id: "h-2-9-2",
        order: 2,
        content:
          "Take $p \\in E^\\circ$ with $N_r(p) \\subset E$. Every point $q \\in N_r(p)$ has a smaller neighborhood inside $N_r(p) \\subset E$, so $q \\in E^\\circ$ too; hence $N_r(p) \\subset E^\\circ$.",
      },
      {
        id: "h-2-9-3",
        order: 3,
        content:
          "For the equivalence: $E^\\circ \\subset E$ always. If $E$ is open every point is interior, so $E \\subset E^\\circ$. Conversely if $E^\\circ = E$ then $E$ equals an open set, hence is open.",
      },
    ],
  },
  {
    id: "demo-2-11",
    number: "11",
    statement:
      "For $x, y \\in \\mathbb{R}^1$, define $d_2(x,y) = |x - y|^2$, $d_4(x,y) = |x - y|^{1/2}$, and $d_5(x,y) = \\dfrac{|x-y|}{1 + |x-y|}$. Determine, for each of these, whether it is a metric.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 44",
    chapter: CHAPTERS.ch2,
    tags: [TAGS.metricSpaces],
    hints: [
      {
        id: "h-2-11-1",
        order: 1,
        content:
          "Check the three metric axioms: positivity/identity, symmetry, and the triangle inequality. Symmetry and positivity are easy; the triangle inequality is the discriminating one.",
      },
      {
        id: "h-2-11-2",
        order: 2,
        content:
          "For $d_2$, test the triangle inequality on $x = 0, y = 1, z = 2$: is $|0-2|^2 \\le |0-1|^2 + |1-2|^2$? This rules $d_2$ out.",
      },
      {
        id: "h-2-11-3",
        order: 3,
        content:
          "$d_4$ and $d_5$ are metrics: for $d_5$, the function $f(t) = t/(1+t)$ is increasing and subadditive for $t \\ge 0$, so $f(|x-z|) \\le f(|x-y| + |y-z|) \\le f(|x-y|) + f(|y-z|)$.",
      },
    ],
  },
  {
    id: "demo-2-16",
    number: "16",
    statement:
      "Consider $\\mathbb{Q}$, the rationals, with the usual metric $d(p,q) = |p - q|$. Let $E$ be the set of all $p \\in \\mathbb{Q}$ such that $2 < p^2 < 3$. Show that $E$ is closed and bounded in $\\mathbb{Q}$, but that $E$ is not compact. Is $E$ open in $\\mathbb{Q}$?",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 44",
    chapter: CHAPTERS.ch2,
    tags: [TAGS.compactness, TAGS.openClosed, TAGS.metricSpaces],
    hints: [
      {
        id: "h-2-16-1",
        order: 1,
        content:
          "Work entirely inside $\\mathbb{Q}$ as the ambient metric space. The boundary values $\\sqrt{2}$ and $\\sqrt{3}$ are irrational, so they are not points of $\\mathbb{Q}$.",
      },
      {
        id: "h-2-16-2",
        order: 2,
        content:
          "Because $\\sqrt 2, \\sqrt 3 \\notin \\mathbb{Q}$, the set $E$ has no limit points in $\\mathbb{Q}$ outside $E$, making it closed; and it is clearly bounded. The same gap argument shows $E$ is also open in $\\mathbb{Q}$.",
      },
      {
        id: "h-2-16-3",
        order: 3,
        content:
          "To defeat compactness, build a sequence in $E$ of rationals approaching $\\sqrt 3$; it is Cauchy with no limit in $E$. Equivalently exhibit an open cover with no finite subcover by shrinking toward the irrational endpoints.",
      },
    ],
  },

  // ── Chapter 3: Numerical Sequences and Series ───────────────────────────────
  {
    id: "demo-3-1",
    number: "1",
    statement:
      "Prove that convergence of $\\{s_n\\}$ implies convergence of $\\{|s_n|\\}$. Is the converse true?",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.sequences, TAGS.limits],
    hints: [
      {
        id: "h-3-1-1",
        order: 1,
        content: "Use the reverse triangle inequality: $\\big| |a| - |b| \\big| \\le |a - b|$.",
      },
      {
        id: "h-3-1-2",
        order: 2,
        content:
          "If $s_n \\to s$, then $\\big| |s_n| - |s| \\big| \\le |s_n - s| \\to 0$, so $|s_n| \\to |s|$.",
      },
      {
        id: "h-3-1-3",
        order: 3,
        content:
          "The converse is false: take $s_n = (-1)^n$. Then $|s_n| = 1$ converges but $\\{s_n\\}$ does not.",
      },
    ],
  },
  {
    id: "demo-3-2",
    number: "2",
    statement: "Calculate $\\lim_{n \\to \\infty} \\left( \\sqrt{n^2 + n} - n \\right)$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.sequences, TAGS.limits],
    hints: [
      {
        id: "h-3-2-1",
        order: 1,
        content: "Multiply and divide by the conjugate $\\sqrt{n^2 + n} + n$.",
      },
      {
        id: "h-3-2-2",
        order: 2,
        content:
          "This gives $\\dfrac{(n^2 + n) - n^2}{\\sqrt{n^2 + n} + n} = \\dfrac{n}{\\sqrt{n^2 + n} + n}$.",
      },
      {
        id: "h-3-2-3",
        order: 3,
        content:
          "Divide numerator and denominator by $n$: $\\dfrac{1}{\\sqrt{1 + 1/n} + 1} \\to \\dfrac{1}{2}$.",
      },
    ],
  },
  {
    id: "demo-3-3",
    number: "3",
    statement:
      "If $s_1 = \\sqrt{2}$, and $s_{n+1} = \\sqrt{2 + \\sqrt{s_n}}$ for $n = 1, 2, 3, \\dots$, prove that $\\{s_n\\}$ converges, and that $s_n < 2$ for $n = 1, 2, 3, \\dots$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.sequences, TAGS.limits],
    hints: [
      {
        id: "h-3-3-1",
        order: 1,
        content:
          "Use the monotone convergence theorem: show $\\{s_n\\}$ is increasing and bounded above by $2$.",
      },
      {
        id: "h-3-3-2",
        order: 2,
        content:
          "Prove $s_n < 2$ by induction: if $s_n < 2$ then $s_{n+1} = \\sqrt{2 + \\sqrt{s_n}} < \\sqrt{2 + \\sqrt 2} < \\sqrt{4} = 2$.",
      },
      {
        id: "h-3-3-3",
        order: 3,
        content:
          "Show monotonicity ($s_{n+1} > s_n$) by induction as well. A bounded monotone sequence converges; the inductive bound $s_n < 2$ gives both halves.",
      },
    ],
  },
  {
    id: "demo-3-5",
    number: "5",
    statement:
      "For any two real sequences $\\{a_n\\}, \\{b_n\\}$, prove that $\\limsup_{n \\to \\infty} (a_n + b_n) \\le \\limsup_{n \\to \\infty} a_n + \\limsup_{n \\to \\infty} b_n$, provided the sum on the right is not of the form $\\infty - \\infty$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.sequences, TAGS.limits],
    hints: [
      {
        id: "h-3-5-1",
        order: 1,
        content:
          "Recall $\\limsup a_n = \\lim_{N \\to \\infty} \\sup_{n \\ge N} a_n$. Work with the tail suprema.",
      },
      {
        id: "h-3-5-2",
        order: 2,
        content:
          "For each $N$, $\\sup_{n \\ge N}(a_n + b_n) \\le \\sup_{n \\ge N} a_n + \\sup_{n \\ge N} b_n$, since the sup of a sum is at most the sum of the sups.",
      },
      {
        id: "h-3-5-3",
        order: 3,
        content:
          "Let $N \\to \\infty$ on both sides. The left side tends to $\\limsup(a_n + b_n)$ and the right to $\\limsup a_n + \\limsup b_n$; limits preserve $\\le$.",
      },
    ],
  },
  {
    id: "demo-3-6d",
    number: "6",
    statement:
      "Investigate the behavior (convergence or divergence) of $\\sum a_n$ when $a_n = \\dfrac{1}{1 + z^n}$ for various complex $z$ (consider $|z| < 1$, $|z| = 1$, and $|z| > 1$).",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.series, TAGS.convergenceTests],
    hints: [
      {
        id: "h-3-6-1",
        order: 1,
        content:
          "Start with the necessary condition for convergence: a series can only converge if its terms tend to $0$.",
      },
      {
        id: "h-3-6-2",
        order: 2,
        content:
          "If $|z| \\le 1$ the terms $1/(1 + z^n)$ do not tend to $0$ (for $|z| < 1$ they tend to $1$), so the series diverges. The interesting case is $|z| > 1$.",
      },
      {
        id: "h-3-6-3",
        order: 3,
        content:
          "For $|z| > 1$, compare with $\\sum |z|^{-n}$: $\\left| \\dfrac{1}{1 + z^n} \\right| \\le \\dfrac{1}{|z|^n - 1}$, a convergent geometric-type series, so $\\sum a_n$ converges absolutely.",
      },
    ],
  },
  {
    id: "demo-3-7",
    number: "7",
    statement:
      "Prove that the convergence of $\\sum a_n$ (with $a_n \\ge 0$) implies the convergence of $\\sum \\dfrac{\\sqrt{a_n}}{n}$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.series, TAGS.convergenceTests, TAGS.inequalities],
    hints: [
      {
        id: "h-3-7-1",
        order: 1,
        content:
          "You want to dominate $\\dfrac{\\sqrt{a_n}}{n}$ by something you already know converges. Think about the AM-GM / Cauchy-Schwarz style inequality $2xy \\le x^2 + y^2$.",
      },
      {
        id: "h-3-7-2",
        order: 2,
        content:
          "Apply $xy \\le \\tfrac12(x^2 + y^2)$ with $x = \\sqrt{a_n}$ and $y = 1/n$: $\\dfrac{\\sqrt{a_n}}{n} \\le \\tfrac{1}{2}\\left( a_n + \\dfrac{1}{n^2} \\right)$.",
      },
      {
        id: "h-3-7-3",
        order: 3,
        content:
          "Both $\\sum a_n$ (given) and $\\sum 1/n^2$ (a convergent $p$-series) converge, so by the comparison test $\\sum \\dfrac{\\sqrt{a_n}}{n}$ converges.",
      },
    ],
  },
  {
    id: "demo-3-20",
    number: "20",
    statement:
      "Suppose $\\{p_n\\}$ is a Cauchy sequence in a metric space $X$, and some subsequence $\\{p_{n_i}\\}$ converges to a point $p \\in X$. Prove that the full sequence $\\{p_n\\}$ converges to $p$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 82",
    chapter: CHAPTERS.ch3,
    tags: [TAGS.cauchy, TAGS.sequences, TAGS.metricSpaces],
    hints: [
      {
        id: "h-3-20-1",
        order: 1,
        content:
          "Given $\\varepsilon > 0$, use the Cauchy property to get $N$ with $d(p_n, p_m) < \\varepsilon/2$ for all $n, m \\ge N$.",
      },
      {
        id: "h-3-20-2",
        order: 2,
        content:
          "Use subsequence convergence to pick an index $n_i \\ge N$ with $d(p_{n_i}, p) < \\varepsilon/2$.",
      },
      {
        id: "h-3-20-3",
        order: 3,
        content:
          "For $n \\ge N$, the triangle inequality gives $d(p_n, p) \\le d(p_n, p_{n_i}) + d(p_{n_i}, p) < \\varepsilon/2 + \\varepsilon/2 = \\varepsilon$.",
      },
    ],
  },

  // ── Chapter 4: Continuity ────────────────────────────────────────────────────
  {
    id: "demo-4-1",
    number: "1",
    statement:
      "Suppose $f$ is a real function defined on $\\mathbb{R}^1$ which satisfies $\\lim_{h \\to 0} [f(x + h) - f(x - h)] = 0$ for every $x \\in \\mathbb{R}^1$. Does this imply that $f$ is continuous?",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 98",
    chapter: CHAPTERS.ch4,
    tags: [TAGS.continuity],
    hints: [
      {
        id: "h-4-1-1",
        order: 1,
        content:
          "The condition is symmetric in $h \\to \\pm h$, so it cannot detect a jump that is symmetric about $x$. Look for a counterexample.",
      },
      {
        id: "h-4-1-2",
        order: 2,
        content:
          "Try a function that is $0$ everywhere except at a single point. The symmetric difference $f(x+h) - f(x-h)$ may still tend to $0$.",
      },
      {
        id: "h-4-1-3",
        order: 3,
        content:
          "Let $f(0) = 1$ and $f(x) = 0$ for $x \\neq 0$. Then $f(x+h) - f(x-h) \\to 0$ for every $x$, yet $f$ is discontinuous at $0$. So the answer is no.",
      },
    ],
  },
  {
    id: "demo-4-2",
    number: "2",
    statement:
      "If $f$ is a continuous mapping of a metric space $X$ into a metric space $Y$, prove that $f(\\overline{E}) \\subset \\overline{f(E)}$ for every set $E \\subset X$. Show, by an example, that $f(\\overline{E})$ can be a proper subset of $\\overline{f(E)}$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 98",
    chapter: CHAPTERS.ch4,
    tags: [TAGS.continuity, TAGS.metricSpaces],
    hints: [
      {
        id: "h-4-2-1",
        order: 1,
        content:
          "Take $p \\in \\overline{E}$; there is a sequence $x_n \\in E$ with $x_n \\to p$. Use the sequential characterization of continuity.",
      },
      {
        id: "h-4-2-2",
        order: 2,
        content:
          "By continuity $f(x_n) \\to f(p)$, and each $f(x_n) \\in f(E)$, so $f(p)$ is a limit point (or member) of $f(E)$, i.e. $f(p) \\in \\overline{f(E)}$.",
      },
      {
        id: "h-4-2-3",
        order: 3,
        content:
          "For proper inclusion, let $f(x) = 1/(1 + x^2)$ on $X = \\mathbb{R}$ with $E = \\mathbb{R}$. Then $\\overline{E} = \\mathbb{R}$, $f(\\overline E) = (0, 1]$, but $\\overline{f(E)} = [0, 1]$.",
      },
    ],
  },
  {
    id: "demo-4-4",
    number: "4",
    statement:
      "Let $f$ and $g$ be continuous mappings of a metric space $X$ into a metric space $Y$, and let $E$ be a dense subset of $X$. Prove that if $f(p) = g(p)$ for all $p \\in E$, then $f(p) = g(p)$ for all $p \\in X$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 98",
    chapter: CHAPTERS.ch4,
    tags: [TAGS.continuity, TAGS.metricSpaces],
    hints: [
      {
        id: "h-4-4-1",
        order: 1,
        content:
          "Take any $p \\in X$. Since $E$ is dense, there is a sequence $x_n \\in E$ with $x_n \\to p$.",
      },
      {
        id: "h-4-4-2",
        order: 2,
        content:
          "Continuity gives $f(x_n) \\to f(p)$ and $g(x_n) \\to g(p)$. But $f(x_n) = g(x_n)$ for all $n$ because $x_n \\in E$.",
      },
      {
        id: "h-4-4-3",
        order: 3,
        content:
          "Two sequences that are equal term-by-term have the same limit (limits are unique in a metric space), so $f(p) = g(p)$.",
      },
    ],
  },
  {
    id: "demo-4-8",
    number: "8",
    statement:
      "Let $f$ be a real uniformly continuous function on the bounded set $E$ in $\\mathbb{R}^1$. Prove that $f$ is bounded on $E$. Show that the conclusion is false if boundedness of $E$ is omitted from the hypothesis.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 99",
    chapter: CHAPTERS.ch4,
    tags: [TAGS.uniformContinuity, TAGS.continuity],
    hints: [
      {
        id: "h-4-8-1",
        order: 1,
        content:
          "Fix $\\varepsilon = 1$ in the definition of uniform continuity to get a single $\\delta > 0$ that works everywhere on $E$.",
      },
      {
        id: "h-4-8-2",
        order: 2,
        content:
          "Since $E$ is bounded, it can be covered by finitely many intervals of length $\\delta$. On each such interval $f$ varies by less than $1$.",
      },
      {
        id: "h-4-8-3",
        order: 3,
        content:
          "Chaining across the finitely many intervals bounds $f$. For the counterexample on an unbounded set, take $f(x) = x$ on $E = \\mathbb{R}$: uniformly continuous but unbounded.",
      },
    ],
  },
  {
    id: "demo-4-14",
    number: "14",
    statement:
      "Let $I = [0, 1]$ be the closed unit interval. Suppose $f$ is a continuous mapping of $I$ into $I$. Prove that $f(x) = x$ for at least one $x \\in I$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 100",
    chapter: CHAPTERS.ch4,
    tags: [TAGS.ivt, TAGS.continuity],
    hints: [
      {
        id: "h-4-14-1",
        order: 1,
        content: "Define the auxiliary function $g(x) = f(x) - x$ and apply the intermediate value theorem to $g$.",
      },
      {
        id: "h-4-14-2",
        order: 2,
        content:
          "Since $f$ maps into $[0,1]$, we have $g(0) = f(0) - 0 \\ge 0$ and $g(1) = f(1) - 1 \\le 0$.",
      },
      {
        id: "h-4-14-3",
        order: 3,
        content:
          "If either endpoint gives $g = 0$ you are done; otherwise $g(0) > 0 > g(1)$ and the IVT yields some $x$ with $g(x) = 0$, i.e. $f(x) = x$.",
      },
    ],
  },

  // ── Chapter 5: Differentiation ──────────────────────────────────────────────
  {
    id: "demo-5-1",
    number: "1",
    statement:
      "Let $f$ be defined for all real $x$, and suppose that $|f(x) - f(y)| \\le (x - y)^2$ for all real $x$ and $y$. Prove that $f$ is constant.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 114",
    chapter: CHAPTERS.ch5,
    tags: [TAGS.differentiation],
    hints: [
      {
        id: "h-5-1-1",
        order: 1,
        content:
          "Look at the difference quotient: divide the hypothesis by $|x - y|$ for $x \\neq y$.",
      },
      {
        id: "h-5-1-2",
        order: 2,
        content:
          "You get $\\left| \\dfrac{f(x) - f(y)}{x - y} \\right| \\le |x - y|$. Let $y \\to x$ to conclude $f'(x) = 0$ everywhere.",
      },
      {
        id: "h-5-1-3",
        order: 3,
        content:
          "A function with $f' \\equiv 0$ on $\\mathbb{R}$ is constant (by the mean value theorem applied on any interval).",
      },
    ],
  },
  {
    id: "demo-5-2",
    number: "2",
    statement:
      "Suppose $f'(x) > 0$ in $(a, b)$. Prove that $f$ is strictly increasing in $(a, b)$, and let $g$ be its inverse function. Prove that $g$ is differentiable, and that $g'(f(x)) = \\dfrac{1}{f'(x)}$ for $a < x < b$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 114",
    chapter: CHAPTERS.ch5,
    tags: [TAGS.differentiation, TAGS.mvt],
    hints: [
      {
        id: "h-5-2-1",
        order: 1,
        content:
          "For strict monotonicity, apply the mean value theorem on $[x_1, x_2]$: $f(x_2) - f(x_1) = f'(c)(x_2 - x_1) > 0$.",
      },
      {
        id: "h-5-2-2",
        order: 2,
        content:
          "Strict monotonicity and continuity give a continuous inverse $g$. Write the difference quotient for $g$ at $y = f(x)$ in terms of the difference quotient for $f$.",
      },
      {
        id: "h-5-2-3",
        order: 3,
        content:
          "As $y \\to f(x)$, the corresponding $g(y) \\to x$ by continuity of $g$, and the reciprocal difference quotient tends to $1/f'(x)$; this is the inverse function theorem in one variable.",
      },
    ],
  },
  {
    id: "demo-5-3",
    number: "3",
    statement:
      "Suppose $g$ is a real function on $\\mathbb{R}^1$, with bounded derivative (say $|g'| \\le M$). Fix $\\varepsilon > 0$, and define $f(x) = x + \\varepsilon g(x)$. Prove that $f$ is one-to-one if $\\varepsilon$ is small enough.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 114",
    chapter: CHAPTERS.ch5,
    tags: [TAGS.differentiation, TAGS.mvt],
    hints: [
      {
        id: "h-5-3-1",
        order: 1,
        content:
          "Compute $f'(x) = 1 + \\varepsilon g'(x)$ and find a condition on $\\varepsilon$ making $f' > 0$ everywhere.",
      },
      {
        id: "h-5-3-2",
        order: 2,
        content:
          "If $\\varepsilon M < 1$, then $f'(x) = 1 + \\varepsilon g'(x) \\ge 1 - \\varepsilon M > 0$ for all $x$.",
      },
      {
        id: "h-5-3-3",
        order: 3,
        content:
          "A function with strictly positive derivative is strictly increasing (mean value theorem), hence one-to-one. So any $\\varepsilon < 1/M$ works.",
      },
    ],
  },
  {
    id: "demo-5-4",
    number: "4",
    statement:
      "If $C_0 + \\dfrac{C_1}{2} + \\cdots + \\dfrac{C_{n-1}}{n} + \\dfrac{C_n}{n+1} = 0$, where $C_0, \\dots, C_n$ are real constants, prove that the equation $C_0 + C_1 x + \\cdots + C_n x^n = 0$ has at least one real root between $0$ and $1$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 114",
    chapter: CHAPTERS.ch5,
    tags: [TAGS.mvt, TAGS.differentiation],
    hints: [
      {
        id: "h-5-4-1",
        order: 1,
        content:
          "Define $F(x) = C_0 x + \\dfrac{C_1}{2} x^2 + \\cdots + \\dfrac{C_n}{n+1} x^{n+1}$ and compute $F'(x)$.",
      },
      {
        id: "h-5-4-2",
        order: 2,
        content:
          "Note $F(0) = 0$ and $F(1) = C_0 + \\dfrac{C_1}{2} + \\cdots + \\dfrac{C_n}{n+1} = 0$ by hypothesis.",
      },
      {
        id: "h-5-4-3",
        order: 3,
        content:
          "Apply Rolle's theorem to $F$ on $[0,1]$: there is $x \\in (0,1)$ with $F'(x) = 0$. But $F'(x) = C_0 + C_1 x + \\cdots + C_n x^n$, which is the desired root.",
      },
    ],
  },
  {
    id: "demo-5-15",
    number: "15",
    statement:
      "Suppose $a \\in \\mathbb{R}^1$, $f$ is a twice-differentiable real function on $(a, \\infty)$, and $M_0, M_1, M_2$ are the least upper bounds of $|f(x)|, |f'(x)|, |f''(x)|$ respectively on $(a, \\infty)$. Prove that $M_1^2 \\le 4 M_0 M_2$.",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 115",
    chapter: CHAPTERS.ch5,
    tags: [TAGS.taylor, TAGS.differentiation, TAGS.inequalities],
    hints: [
      {
        id: "h-5-15-1",
        order: 1,
        content:
          "Use Taylor's theorem with remainder: for $h > 0$, $f(x + 2h) = f(x) + 2h f'(x) + 2 h^2 f''(\\xi)$ for some $\\xi \\in (x, x + 2h)$.",
      },
      {
        id: "h-5-15-2",
        order: 2,
        content:
          "Solve for $f'(x)$: $f'(x) = \\dfrac{1}{2h}\\big[ f(x + 2h) - f(x) \\big] - h f''(\\xi)$, then bound each piece by $M_0$ and $M_2$ to get $|f'(x)| \\le \\dfrac{M_0}{h} + h M_2$.",
      },
      {
        id: "h-5-15-3",
        order: 3,
        content:
          "Minimize the right side over $h > 0$. The minimum is at $h = \\sqrt{M_0/M_2}$, giving $|f'(x)| \\le 2\\sqrt{M_0 M_2}$; squaring yields $M_1^2 \\le 4 M_0 M_2$.",
      },
    ],
  },

  // ── Chapter 6: The Riemann-Stieltjes Integral ───────────────────────────────
  {
    id: "demo-6-1",
    number: "1",
    statement:
      "Suppose $\\alpha$ increases on $[a, b]$, $a \\le x_0 \\le b$, $\\alpha$ is continuous at $x_0$, $f(x_0) = 1$, and $f(x) = 0$ if $x \\neq x_0$. Prove that $f \\in \\mathscr{R}(\\alpha)$ and that $\\int f \\, d\\alpha = 0$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 138",
    chapter: CHAPTERS.ch6,
    tags: [TAGS.riemann, TAGS.integration],
    hints: [
      {
        id: "h-6-1-1",
        order: 1,
        content:
          "Use the Riemann criterion: $f \\in \\mathscr{R}(\\alpha)$ iff for every $\\varepsilon > 0$ there is a partition $P$ with $U(P, f, \\alpha) - L(P, f, \\alpha) < \\varepsilon$.",
      },
      {
        id: "h-6-1-2",
        order: 2,
        content:
          "Only the subinterval(s) containing $x_0$ contribute to the upper sum, since $f = 0$ elsewhere. On those, $\\sup f = 1$ and $\\inf f = 0$.",
      },
      {
        id: "h-6-1-3",
        order: 3,
        content:
          "Because $\\alpha$ is continuous at $x_0$, choose the partition so the $\\alpha$-increment across $x_0$ is $< \\varepsilon$. Then $U(P,f,\\alpha) < \\varepsilon$ and $L = 0$, forcing the integral to be $0$.",
      },
    ],
  },
  {
    id: "demo-6-2",
    number: "2",
    statement:
      "Suppose $f \\ge 0$, $f$ is continuous on $[a, b]$, and $\\int_a^b f(x)\\, dx = 0$. Prove that $f(x) = 0$ for all $x \\in [a, b]$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 138",
    chapter: CHAPTERS.ch6,
    tags: [TAGS.integration, TAGS.continuity],
    hints: [
      {
        id: "h-6-2-1",
        order: 1,
        content:
          "Argue by contradiction: suppose $f(x_0) > 0$ for some $x_0 \\in [a, b]$.",
      },
      {
        id: "h-6-2-2",
        order: 2,
        content:
          "By continuity there is an interval around $x_0$ on which $f(x) > f(x_0)/2 > 0$.",
      },
      {
        id: "h-6-2-3",
        order: 3,
        content:
          "The integral over that subinterval is at least (length) $\\times f(x_0)/2 > 0$, and since $f \\ge 0$ elsewhere, $\\int_a^b f > 0$ — contradicting the hypothesis.",
      },
    ],
  },
  {
    id: "demo-6-4",
    number: "4",
    statement:
      "If $f(x) = 0$ for all irrational $x$, $f(x) = 1$ for all rational $x$, prove that $f \\notin \\mathscr{R}$ on $[a, b]$ for any $a < b$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 138",
    chapter: CHAPTERS.ch6,
    tags: [TAGS.riemann, TAGS.integration],
    hints: [
      {
        id: "h-6-4-1",
        order: 1,
        content:
          "Consider any partition $P$ and compute the upper and lower Riemann sums separately on each subinterval.",
      },
      {
        id: "h-6-4-2",
        order: 2,
        content:
          "Every subinterval contains both rationals and irrationals (both are dense), so on each one $\\sup f = 1$ and $\\inf f = 0$.",
      },
      {
        id: "h-6-4-3",
        order: 3,
        content:
          "Hence $U(P, f) = b - a$ and $L(P, f) = 0$ for every partition, so the upper and lower integrals are $b - a$ and $0$. They never agree, so $f \\notin \\mathscr{R}$.",
      },
    ],
  },
  {
    id: "demo-6-7a",
    number: "7",
    statement:
      "Suppose $f$ is a real function on $(0, 1]$ and $f \\in \\mathscr{R}$ on $[c, 1]$ for every $c > 0$. Define $\\int_0^1 f(x)\\, dx = \\lim_{c \\to 0} \\int_c^1 f(x)\\, dx$ if this limit exists and is finite. Show that if $f \\in \\mathscr{R}$ on $[0,1]$ (in the proper sense), then this definition of the integral agrees with the usual one.",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 138",
    chapter: CHAPTERS.ch6,
    tags: [TAGS.riemann, TAGS.integration],
    hints: [
      {
        id: "h-6-7-1",
        order: 1,
        content:
          "Use additivity of the integral over adjacent intervals: $\\int_0^1 f = \\int_0^c f + \\int_c^1 f$ when $f$ is properly integrable on $[0,1]$.",
      },
      {
        id: "h-6-7-2",
        order: 2,
        content:
          "Since $f \\in \\mathscr{R}[0,1]$ it is bounded, say $|f| \\le M$, so $\\left| \\int_0^c f \\right| \\le M c$.",
      },
      {
        id: "h-6-7-3",
        order: 3,
        content:
          "Therefore $\\int_c^1 f = \\int_0^1 f - \\int_0^c f \\to \\int_0^1 f$ as $c \\to 0$, since the tail term is bounded by $Mc \\to 0$. The two definitions coincide.",
      },
    ],
  },

  // ── Chapter 7: Sequences and Series of Functions ────────────────────────────
  {
    id: "demo-7-1",
    number: "1",
    statement:
      "Prove that every uniformly convergent sequence of bounded functions is uniformly bounded.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 165",
    chapter: CHAPTERS.ch7,
    tags: [TAGS.uniformConvergence],
    hints: [
      {
        id: "h-7-1-1",
        order: 1,
        content:
          "Apply the definition of uniform convergence with $\\varepsilon = 1$: there is $N$ with $|f_n(x) - f_N(x)| < 1$ for all $n \\ge N$ and all $x$.",
      },
      {
        id: "h-7-1-2",
        order: 2,
        content:
          "For $n \\ge N$, $|f_n(x)| \\le |f_N(x)| + 1 \\le M_N + 1$, where $M_N$ bounds the (bounded) function $f_N$.",
      },
      {
        id: "h-7-1-3",
        order: 3,
        content:
          "The finitely many functions $f_1, \\dots, f_{N-1}$ each have their own bound $M_k$. Take $M = \\max\\{M_1, \\dots, M_{N-1}, M_N + 1\\}$ to bound the whole sequence uniformly.",
      },
    ],
  },
  {
    id: "demo-7-2",
    number: "2",
    statement:
      "If $\\{f_n\\}$ and $\\{g_n\\}$ converge uniformly on a set $E$, prove that $\\{f_n + g_n\\}$ converges uniformly on $E$. If, in addition, $\\{f_n\\}$ and $\\{g_n\\}$ are sequences of bounded functions, prove that $\\{f_n g_n\\}$ converges uniformly on $E$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 165",
    chapter: CHAPTERS.ch7,
    tags: [TAGS.uniformConvergence],
    hints: [
      {
        id: "h-7-2-1",
        order: 1,
        content:
          "For the sum, use $|(f_n + g_n) - (f + g)| \\le |f_n - f| + |g_n - g|$ and choose $N$ large for both.",
      },
      {
        id: "h-7-2-2",
        order: 2,
        content:
          "For the product, add and subtract a cross term: $f_n g_n - f g = f_n (g_n - g) + g (f_n - f)$.",
      },
      {
        id: "h-7-2-3",
        order: 3,
        content:
          "Boundedness (Exercise 1 makes $\\{f_n\\}$ uniformly bounded, and $g$ is bounded) lets you dominate each term by a constant times a uniformly small quantity, giving uniform convergence of the product.",
      },
    ],
  },
  {
    id: "demo-7-9",
    number: "9",
    statement:
      "Let $\\{f_n\\}$ be a sequence of continuous functions which converges uniformly to a function $f$ on a set $E$. Prove that $\\lim_{n \\to \\infty} f_n(x_n) = f(x)$ for every sequence of points $x_n \\in E$ such that $x_n \\to x$, and $x \\in E$. Is the converse of this true?",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 166",
    chapter: CHAPTERS.ch7,
    tags: [TAGS.uniformConvergence, TAGS.continuity],
    hints: [
      {
        id: "h-7-9-1",
        order: 1,
        content:
          "Split using the triangle inequality: $|f_n(x_n) - f(x)| \\le |f_n(x_n) - f(x_n)| + |f(x_n) - f(x)|$.",
      },
      {
        id: "h-7-9-2",
        order: 2,
        content:
          "The first term is controlled by uniform convergence (uniform in the point, so it works at $x_n$); the second by continuity of $f$, which is continuous as a uniform limit of continuous functions.",
      },
      {
        id: "h-7-9-3",
        order: 3,
        content:
          "Both terms $\\to 0$ as $n \\to \\infty$, giving $f_n(x_n) \\to f(x)$. The converse fails: this conclusion can hold even without uniform convergence; consider sequences where pointwise convergence plus equicontinuity suffices.",
      },
    ],
  },
  {
    id: "demo-7-16",
    number: "16",
    statement:
      "Suppose $\\{f_n\\}$ is an equicontinuous sequence of functions on a compact set $K$, and $\\{f_n\\}$ converges pointwise on $K$. Prove that $\\{f_n\\}$ converges uniformly on $K$.",
    difficulty: "HARD",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 168",
    chapter: CHAPTERS.ch7,
    tags: [TAGS.equicontinuity, TAGS.uniformConvergence, TAGS.compactness],
    hints: [
      {
        id: "h-7-16-1",
        order: 1,
        content:
          "Fix $\\varepsilon > 0$. Equicontinuity gives a single $\\delta > 0$ such that $d(x, y) < \\delta$ implies $|f_n(x) - f_n(y)| < \\varepsilon$ for all $n$.",
      },
      {
        id: "h-7-16-2",
        order: 2,
        content:
          "Cover $K$ by finitely many $\\delta$-balls (compactness) centered at points $p_1, \\dots, p_m$. Pointwise convergence gives an $N$ that works simultaneously at all $m$ centers.",
      },
      {
        id: "h-7-16-3",
        order: 3,
        content:
          "For any $x$, pick a center $p_j$ within $\\delta$. Then bound $|f_n(x) - f_m(x)|$ by routing through $p_j$ using equicontinuity at both $n$ and $m$ plus the Cauchy estimate at $p_j$ — a $3\\varepsilon$ argument giving uniform Cauchy, hence uniform convergence.",
      },
    ],
  },
];

export const DEMO_BOOKS = [
  { slug: "rudin-pma", title: "Principles of Mathematical Analysis" },
];

export const DEMO_TAGS = Object.values(TAGS).map(({ tag }) => ({ name: tag.name }));

export function getDemoProblem(id: string): ProblemDetail | undefined {
  return DEMO_PROBLEMS.find((p) => p.id === id);
}

export function getDemoProblems(filters: {
  book?: string;
  difficulty?: string;
  tag?: string;
} = {}): ProblemSummary[] {
  return DEMO_PROBLEMS.filter(
    (p) =>
      (!filters.book || p.chapter.book.slug === filters.book) &&
      (!filters.difficulty || p.difficulty === filters.difficulty) &&
      (!filters.tag || p.tags.some(({ tag }) => tag.name === filters.tag))
  ).map(({ hints: _hints, ...rest }) => rest);
}
