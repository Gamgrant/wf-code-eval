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
  throw new Error('generateJsonReport not implemented');
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
  throw new Error('generateMarkdownReport not implemented');
}

