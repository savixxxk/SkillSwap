/**
 * University-style subjects and entrance exam items for tutor certification.
 * correctIndex is 0-based; stripped before sending to the client.
 */

export const TUTOR_EXAM_SUBJECTS = [
  { id: "mathematics", name: "Mathematics" },
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "computer-science", name: "Computer Science" },
  { id: "data-structures-algorithms", name: "Data Structures & Algorithms" },
  { id: "databases", name: "Databases" },
  { id: "linear-algebra", name: "Linear Algebra" },
  { id: "probability-statistics", name: "Probability & Statistics" },
];

const Q = (question, options, correctIndex) => ({
  question,
  options,
  correctIndex,
});

export const TUTOR_EXAM_QUESTIONS = {
  mathematics: [
    Q("What is the derivative of x² with respect to x?", ["x", "2x", "x²", "2"], 1),
    Q("∫₀¹ 2x dx equals:", ["0", "1", "2", "½"], 1),
    Q("The limit of (sin x)/x as x → 0 is:", ["0", "1", "∞", "undefined"], 1),
    Q("A solution to x² − 5x + 6 = 0 is:", ["1", "2", "4", "5"], 1),
    Q("The sum of angles in a Euclidean triangle is:", ["90°", "180°", "270°", "360°"], 1),
  ],
  physics: [
    Q("SI unit of force is:", ["Joule", "Newton", "Watt", "Pascal"], 1),
    Q("Acceleration due to gravity on Earth is approximately:", ["9.8 m/s²", "98 m/s²", "0.98 m/s²", "1 m/s²"], 0),
    Q("Kinetic energy is proportional to:", ["velocity", "velocity squared", "mass squared", "time"], 1),
    Q("Ohm’s law relates voltage, current, and:", ["capacitance", "resistance", "inductance", "power"], 1),
    Q("Light travels fastest in:", ["water", "glass", "vacuum", "air"], 2),
  ],
  chemistry: [
    Q("The atomic number of carbon is:", ["4", "6", "8", "12"], 1),
    Q("pH 7 indicates a solution that is:", ["strongly acidic", "neutral", "strongly basic", "undefined"], 1),
    Q("Avogadro’s number is on the order of:", ["10²³ mol⁻¹", "10³ mol⁻¹", "10⁶ mol⁻¹", "10¹⁰ mol⁻¹"], 0),
    Q("An isotope differs in number of:", ["protons", "electrons", "neutrons", "none"], 2),
    Q("Oxidation is best described as:", ["gain of electrons", "loss of electrons", "gain of protons", "no change"], 1),
  ],
  "computer-science": [
    Q("Binary 1010 in decimal is:", ["8", "10", "12", "14"], 1),
    Q("HTTP 404 typically means:", ["success", "redirect", "not found", "server error"], 2),
    Q("Big-O for binary search on a sorted array is:", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1),
    Q("A stack is typically:", ["FIFO", "LIFO", "random access", "priority-based"], 1),
    Q("IPv4 addresses are commonly:", ["32 bits", "64 bits", "128 bits", "16 bits"], 0),
  ],
  "data-structures-algorithms": [
    Q("Worst-case time to search an unsorted array of n elements is:", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 2),
    Q("A balanced BST search is typically:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1),
    Q("Quicksort average time complexity is:", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 1),
    Q("A hash table offers average-case lookup of:", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2),
    Q("DFS uses which structure internally (recursive or explicit)?", ["queue", "stack", "heap", "deque"], 1),
  ],
  databases: [
    Q("SQL stands for:", ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], 0),
    Q("A primary key must be:", ["nullable", "unique per row", "always a string", "composite only"], 1),
    Q("Normalization primarily reduces:", ["storage only", "redundancy and anomalies", "query speed always", "indexes"], 1),
    Q("ACID in transactions includes:", ["Atomicity", "Aggregation", "Acceleration", "Allocation"], 0),
    Q("A foreign key references:", ["a local temporary table", "another table’s key", "only integers", "indexes only"], 1),
  ],
  "linear-algebra": [
    Q("Two vectors are orthogonal if their dot product is:", ["1", "0", "−1", "undefined"], 1),
    Q("The identity matrix I satisfies AI =", ["0", "A", "I", "Aᵀ"], 1),
    Q("Eigenvalues are associated with:", ["matrix determinant only", "linear transformations / matrices", "integrals", "derivatives only"], 1),
    Q("Rank of a matrix is the dimension of its:", ["null space", "column space (image)", "kernel only", "diagonal"], 1),
    Q("If det(A) ≠ 0 for square A, then A is:", ["singular", "invertible", "orthogonal", "symmetric"], 1),
  ],
  "probability-statistics": [
    Q("Probability of an impossible event is:", ["0", "1", "½", "undefined"], 0),
    Q("For a fair die, P(rolling 3) is:", ["⅙", "⅓", "½", "1"], 0),
    Q("Expected value is a type of:", ["variance", "mean (average) under distribution", "median always", "mode only"], 1),
    Q("Independent events satisfy P(A∩B) =", ["P(A)+P(B)", "P(A)P(B)", "P(A)/P(B)", "1"], 1),
    Q("Standard deviation is the square root of:", ["mean", "variance", "median", "range"], 1),
  ],
};

export const PASS_PERCENT = 70;

export function isValidSubjectId(id) {
  return Boolean(TUTOR_EXAM_QUESTIONS[id]);
}

export function sanitizeQuestions(subjectId) {
  const list = TUTOR_EXAM_QUESTIONS[subjectId];
  if (!list) return null;
  return list.map((q, i) => ({
    id: `${subjectId}-${i}`,
    question: q.question,
    options: q.options,
  }));
}

export function scoreAnswers(subjectId, answerIndices) {
  const list = TUTOR_EXAM_QUESTIONS[subjectId];
  if (!list) return null;
  if (!Array.isArray(answerIndices) || answerIndices.length !== list.length) {
    return { error: "invalid_answers" };
  }
  let correct = 0;
  for (let i = 0; i < list.length; i++) {
    const a = answerIndices[i];
    if (typeof a !== "number" || a < 0 || a >= list[i].options.length) {
      return { error: "invalid_answers" };
    }
    if (a === list[i].correctIndex) correct += 1;
  }
  const percent = Math.round((correct / list.length) * 100);
  const passed = percent >= PASS_PERCENT;
  return { correct, total: list.length, percent, passed };
}
