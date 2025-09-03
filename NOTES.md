The evaluator was built by starting with correctness. Each snippet is executed in a sandbox and its pass rate is computed as the ratio of tests passed to total tests. This guarantees that functional accuracy is always the primary signal in ranking.

To capture variety among solutions, I implemented diversity at the token level. Snippets are tokenized into identifiers and numbers, converted to sets, and compared using Jaccard distance. From these distances, I calculate an average pairwise diversity score and a per-snippet uniqueness score, ensuring that identical or near-identical solutions are not overvalued. Consistency was also implemented as an optional metric, measuring agreement of outputs across snippets, though it defaults to zero weight.

Ranking combines metrics with weighted scoring: eighty percent pass rate and twenty percent per-snippet diversity. Tie-breaking follows a deterministic sequence: first by pass rate, then by absence of runtime errors, then by shorter line count, and finally by identifier order. This makes rankings both fair and reproducible.

Reports are produced in two formats. JSON provides the full structured data for downstream analysis, while Markdown produces a human-readable summary with tables and global statistics. Together, they support both machine processing and human inspection.

The main trade-off was balancing simplicity and informativeness. Token-level Jaccard distance is efficient and general, but it does not capture deeper structural or semantic differences in code. Consistency metrics are available but not weighted heavily, since correctness already dominates the signal.

Future improvements could include AST-based or semantic diversity metrics for finer-grained analysis, normalization of scores across tasks for fairer comparisons, and richer reporting such as charts or trend summaries. Performance metrics like runtime and memory usage could also be added to reflect efficiency, not just correctness and diversity.