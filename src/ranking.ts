import { SnippetResult } from '../runner/jsSandbox.js';
import { DiversityMetrics, ConsistencyMetrics, computePassRate, computePerSnippetUniqueness} from './scoring.js';

export interface SnippetMetrics {
  snippetId: string;
  passRate: number;
  diversityScore?: number;
  consistencyScore?: number;
  lineCount: number;
  hadRuntimeError: boolean;
  finalScore: number;
}

export interface RankingWeights {
  passRate: number;
  diversity: number;
  consistency?: number;
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  passRate: 0.8,
  diversity: 0.2,
  consistency: 0.0
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function getId(r: SnippetResult): string {
  const any = r as any;
  return (
    any.id ??
    any.snippetId ??
    any.name ??
    'unknown'
  );
}

function getHadRuntimeError(r: SnippetResult): boolean {
  const any = r as any;
  return Boolean(
    any.runtimeErrors > 0 ||
    any.totalRuntimeErrors > 0 ||
    any.error === true ||
    typeof any.error === 'string'
  );
}

function countLines(src: string | undefined): number {
  if (!src) return 0;
  return src.replace(/\r\n/g, '\n').split('\n').length;
}

/**
 * TODO: Implement this function
 * 
 * Rank snippets based on their metrics using weighted scoring
 * 
 * @param snippetResults - Array of snippet test results
 * @param codeSnippets - Map of snippet IDs to their source code
 * @param diversityMetrics - Optional diversity metrics for all snippets
 * @param consistencyMetrics - Optional consistency metrics
 * @param weights - Weights for different metrics (default: 80% pass rate, 20% diversity)
 * @returns Sorted array of snippet metrics (best first)
 */
export function rankSnippets(
  snippetResults: SnippetResult[],
  codeSnippets: Map<string, string>,
  diversityMetrics?: DiversityMetrics,
  consistencyMetrics?: ConsistencyMetrics,
  weights: RankingWeights = DEFAULT_WEIGHTS
): SnippetMetrics[] {
  // TODO: Implement ranking logic
  // throw new Error('rankSnippets not implemented');
  const { passRate: wPass, diversity: wDiv, consistency: wCons = 0 } = weights;
  const cohortConsistency = clamp01(consistencyMetrics?.agreementRate ?? 0);
  const uniq = computePerSnippetUniqueness(codeSnippets);

  const items: SnippetMetrics[] = snippetResults.map((res) => {
    
    const snippetId = getId(res);
    const passRate = clamp01(computePassRate(res));

    const diversityScore = clamp01(uniq.get(snippetId) ?? 0); 

    const consistencyScore = wCons ? cohortConsistency : undefined;
    
    const src = codeSnippets.get(snippetId);
    const lineCount = countLines(src);
    const hadRuntimeError = getHadRuntimeError(res);

    const finalScore =
      wPass * passRate +
      wDiv  * diversityScore +
      (wCons ? wCons * (consistencyScore ?? 0) : 0);

    return {
      snippetId,
      passRate,
      diversityScore,
      consistencyScore,
      lineCount,
      hadRuntimeError,
      finalScore
    };
  });

  items.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.passRate !== a.passRate) return b.passRate - a.passRate;
    if (a.hadRuntimeError !== b.hadRuntimeError) return (a.hadRuntimeError ? 1 : -1);
    if (a.lineCount !== b.lineCount) return a.lineCount - b.lineCount;
    return a.snippetId.localeCompare(b.snippetId);
  });

  return items;
}
/**
 * TODO: Implement this function
 * 
 * Select the best snippet based on ranking
 * 
 * @param rankedSnippets - Array of snippets sorted by score
 * @returns The ID of the winning snippet
 */
export function selectWinner(rankedSnippets: SnippetMetrics[]): string {
  // TODO: Implement
  if (!rankedSnippets || rankedSnippets.length === 0) return '';
  return rankedSnippets[0].snippetId ?? '';
  // throw new Error('selectWinner not implemented');
}

