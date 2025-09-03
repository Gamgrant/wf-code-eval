import { SnippetMetrics } from './ranking.js';
import { SnippetResult } from '../runner/jsSandbox.js';
import fs from 'fs/promises';
import path from 'path';

export interface TaskReport {
  taskName: string;
  winner: string;
  snippetMetrics: SnippetMetrics[];
  averagePassRate: number;
  diversityScore?: number;
}

export interface GlobalReport {
  totalTasks: number;
  totalSnippets: number;
  meanPassAt1: number;
  averageDiversity: number;
  tasksWithFailures: string[];
  timestamp: string;
}

/**
 * TODO: Implement this function
 * 
 * Generate a JSON report with all evaluation results
 * 
 * @param taskReports - Reports for each task
 * @param globalMetrics - Overall metrics across all tasks
 * @param outputPath - Path to write the JSON file
 */
export async function generateJsonReport(
  taskReports: TaskReport[],
  globalMetrics: GlobalReport,
  outputPath: string
): Promise<void> {
  // TODO: Implement
  const out = path.resolve(outputPath);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const payload = { tasks: taskReports, global: globalMetrics };
  await fs.writeFile(out, JSON.stringify(payload, null, 2), 'utf-8');

  // throw new Error('generateJsonReport not implemented');
}

/**
 * TODO: Implement this function
 * 
 * Generate a Markdown report with evaluation results
 * 
 * @param taskReports - Reports for each task
 * @param globalMetrics - Overall metrics across all tasks
 * @param outputPath - Path to write the markdown file
 */
export async function generateMarkdownReport(
  taskReports: TaskReport[],
  globalMetrics: GlobalReport,
  outputPath: string
): Promise<void> {
  // TODO: Implement
  // throw new Error('generateMarkdownReport not implemented');
  const out = path.resolve(outputPath);
  await fs.mkdir(path.dirname(out), { recursive: true });

  const lines: string[] = [];
  lines.push(`# Codegen Evaluation Report`);
  lines.push(`Generated: ${globalMetrics.timestamp}`);
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(`- Tasks: **${globalMetrics.totalTasks}**`);
  lines.push(`- Snippets: **${globalMetrics.totalSnippets}**`);
  lines.push(`- Mean pass@1: **${(globalMetrics.meanPassAt1 * 100).toFixed(1)}%**`);
  lines.push(`- Avg diversity: **${globalMetrics.averageDiversity.toFixed(3)}**`);
  if (globalMetrics.tasksWithFailures.length) {
    lines.push(`- Tasks with failures: ${globalMetrics.tasksWithFailures.join(', ')}`);
  }
  lines.push(``);

  for (const task of taskReports) {
    lines.push(`## ${task.taskName}`);
    lines.push(`Winner: \`${task.winner}\``);
    lines.push(`Average pass rate: ${(task.averagePassRate * 100).toFixed(1)}%`);
    if (typeof task.diversityScore === 'number') {
      lines.push(`Task diversity (uniqueness): ${task.diversityScore.toFixed(3)}`);
    }
    lines.push(``);
    lines.push(`| Rank | Snippet | Score | Pass% | LOC | RuntimeErr | Diversity | Consistency |`);
    lines.push(`|----:|:-------|-----:|----:|----:|----------:|---------:|-----------:|`);
    task.snippetMetrics
      .slice()
      .sort((a, b) => b.finalScore - a.finalScore)
      .forEach((m, i) => {
        lines.push(
          `| ${i + 1} | \`${m.snippetId}\` | ${m.finalScore.toFixed(3)} | ${(m.passRate * 100).toFixed(1)} | ${m.lineCount} | ${m.hadRuntimeError ? 1 : 0} | ${(m.diversityScore ?? 0).toFixed(3)} | ${(m.consistencyScore ?? 0).toFixed(3)} |`
        );
      });
    lines.push(``);
  }

  await fs.writeFile(out, lines.join('\n'), 'utf-8');
}

