import { SnippetResult } from '../runner/jsSandbox.js';

export interface DiversityMetrics {
  averagePairwiseDistance: number;
  uniquenessScore: number;
}

export interface ConsistencyMetrics {
  agreementRate: number;
  consistencyMatrix?: number[][];
}

/**
 * TODO: Implement this function
 * 
 * Compute the pass rate for a snippet based on test results
 * @param result - The snippet result containing test outcomes
 * @returns Pass rate as a number between 0 and 1
 */
export function computePassRate(result: SnippetResult): number {
  // TODO: Implement pass rate calculation
  const passed =
    (result as any).totalPassed ??
    (result as any).passed ??
    0;
    
  const total = 
    (result as any).totalTests ??
    (result as any).total ??
    (((result as any).passed ?? 0) + ((result as any).failed ?? 0));

    if (!total || total <= 0) return 0;
  const rate = passed / total;
  return Math.max(0, Math.min(1, Number.isFinite(rate) ? rate : 0));

  // throw new Error('computePassRate not implemented');
}

/**
 * TODO: Implement this function
 * 
 * Compute diversity metrics across multiple code snippets
 * 
 * @param snippets - Array of code strings
 * @returns Diversity metrics
 */

function tokenize(src: string): string[] {
    return (src.match(/[A-Za-z_]\w*|\d+/g) || []).map(t => t.toLowerCase());
}

function toSet(arr: string[]): Set<string> {
  return new Set(arr);
}

function jaccardDistance(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0; 
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const t of small) if (large.has(t)) inter++;
  const uni = a.size + b.size - inter;
  const sim = uni === 0 ? 1 : inter / uni;
  return 1 - sim;
}

/** Per-snippet nearest-neighbor Jaccard distance (0..1). */
export function computePerSnippetUniqueness(
  codeSnippets: Map<string, string>
): Map<string, number> {
  const ids = Array.from(codeSnippets.keys());
  const sets = ids.map(id => toSet(tokenize(codeSnippets.get(id) ?? "")));
  const n = ids.length;
  const nearest: number[] = Array(n).fill(Number.POSITIVE_INFINITY);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = jaccardDistance(sets[i], sets[j]);
      if (d < nearest[i]) nearest[i] = d;
      if (d < nearest[j]) nearest[j] = d;
    }
  }

  const out = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    out.set(ids[i], Number.isFinite(nearest[i]) ? nearest[i] : 0);
  }
  return out;
}


export function computeDiversity(snippets: string[]): DiversityMetrics {
  // TODO: Implement diversity calculation
  const n = snippets.length;
  if (n <= 1) {
    return { averagePairwiseDistance: 0, uniquenessScore: 0 };
  }

  const tokenSets = snippets.map(s => toSet(tokenize(s)));

  let sumDistances = 0;
  let countPairs = 0;
  const nearest: number[] = Array(n).fill(Number.POSITIVE_INFINITY);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = jaccardDistance(tokenSets[i], tokenSets[j]);
      sumDistances += d;
      countPairs++;

      // update nearest neighbors
      if (d < nearest[i]) nearest[i] = d;
      if (d < nearest[j]) nearest[j] = d;
    }
  }
  const averagePairwiseDistance = countPairs > 0 ? sumDistances / countPairs : 0;

  const uniquenessScore =
    nearest.reduce((acc, v) => acc + (isFinite(v) ? v : 0), 0) / n;

  return { averagePairwiseDistance, uniquenessScore };

  // throw new Error('computeDiversity not implemented');
}


function extractOutputs(result: SnippetResult): unknown[] {
  const arr =
    (result as any).outputs ??
    (result as any).perTestOutputs ??
    (result as any).results ??
    [];
  return Array.isArray(arr) ? arr : [];
}

const MISSING_SENTINEL = "__MISSING__";
const getAt = (arr: unknown[], i: number) => (i < arr.length ? arr[i] : MISSING_SENTINEL);


/**
 * TODO: Implement this function (OPTIONAL)
 * 
 * Compute consistency metrics
 * 
 * @param results - Array of snippet results for the same task
 * @returns Consistency metrics
 */
export function computeConsistency(results: SnippetResult[]): ConsistencyMetrics {
  // TODO: Implement consistency calculation
  const n = results.length;
  if (n === 0) return { agreementRate: 0 };

  const perSnippet = results.map(extractOutputs);
  const numTests = perSnippet.reduce((m, arr) => Math.max(m, arr.length), 0);
  if (numTests === 0) return { agreementRate: 0 };
  // Majority agreement per test
  let agreeSum = 0;
  for (let t = 0; t < numTests; t++) {
    const counts = new Map<string, number>();
    for (let s = 0; s < n; s++) {
      const key = JSON.stringify(getAt(perSnippet[s], t));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const majority = Math.max(...counts.values());
    agreeSum += majority / n;
  }
  const agreementRate = agreeSum / numTests;
  // Optional: pairwise exact-match rate matrix
  const consistencyMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let matches = 0;
      for (let t = 0; t < numTests; t++) {
        const a = JSON.stringify(getAt(perSnippet[i], t));
        const b = JSON.stringify(getAt(perSnippet[j], t));
        if (a === b) matches++;
      }
      const rate = numTests ? matches / numTests : 0;
      consistencyMatrix[i][j] = rate;
      consistencyMatrix[j][i] = rate;
    }
  }

  return { agreementRate, consistencyMatrix };
  // throw new Error('computeConsistency not implemented');
}
  

