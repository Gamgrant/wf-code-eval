# Codegen Evaluator

Evaluate multiple code generation candidates: run tests, compute metrics, select winners.

## Quick Start (3-hour take-home)

```bash
npm install
npm run eval  # Runs partially - you implement the core logic
```

## Your Task

Given several implementations of small coding problems (e.g., twoSum), build an evaluator that:
1. Runs each snippet against tests (✅ provided)
2. Computes pass rates and diversity metrics (❌ you implement)  
3. Ranks implementations using weighted scoring (❌ you implement)
4. Generates evaluation reports (❌ you implement)

## Project Structure

```
├── tasks/              # 3 coding problems with tests
├── candidates/         # 4-5 solutions per problem (varying quality)
├── runner/            
│   └── jsSandbox.ts   # ✅ Sandboxed execution (provided)
├── src/
│   ├── evaluate.ts    # ✅ Main CLI (provided)
│   ├── scoring.ts     # ❌ TODO: Implement
│   ├── ranking.ts     # ❌ TODO: Implement
│   └── report.ts      # ❌ TODO: Implement
```

## Implementation Requirements

### 1. `scoring.ts`
- `computePassRate()` - Calculate test pass percentage
- `computeDiversity()` - Measure code differences (e.g., edit distance, token similarity)
- `computeConsistency()` - (Optional) Check output agreement across implementations

### 2. `ranking.ts`  
- `rankSnippets()` - Combine metrics: 80% pass rate + 20% diversity
- `selectWinner()` - Return best snippet ID
- Handle tie-breakers (line count, runtime errors)

### 3. `report.ts`
- `generateJsonReport()` - Full results to JSON
- `generateMarkdownReport()` - Human-readable summary with tables

## Evaluation Criteria

- **Correctness (40%)** - Does it work?
- **Signal Quality (30%)** - Are metrics meaningful?  
- **Code Quality (20%)** - Clean, readable code
- **Reporting (10%)** - Clear, actionable output

## Deliverables

1. Implemented modules
2. `results/report.md` from a full run
3. `NOTES.md` (300 words max): approach, trade-offs, future improvements

## Tips

- Start simple: get pass rates working first
- For diversity: consider string distance, token counts, or line differences
- Normalize scores (e.g., z-score) for fair weighting
- Test incrementally - the CLI shows what's working/missing

Time suggestion: 45min scoring, 45min ranking, 45min reporting, 45min testing/polish.