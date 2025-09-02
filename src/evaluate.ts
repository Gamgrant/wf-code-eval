#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { runSnippet, SnippetResult } from '../runner/jsSandbox.js';
import { computePassRate, computeDiversity, computeConsistency } from './scoring.js';
import { rankSnippets, selectWinner } from './ranking.js';
import { generateJsonReport, generateMarkdownReport, TaskReport, GlobalReport } from './report.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TaskConfig {
  name: string;
  path: string;
  functionName: string;
  testCases: any[];
}

/**
 * Load test cases for a task
 */
async function loadTaskConfig(taskPath: string): Promise<TaskConfig> {
  const taskName = path.basename(taskPath);
  const testsPath = path.join(taskPath, 'tests.spec.js');
  const signaturePath = path.join(taskPath, 'signature.js');
  
  // Import test cases
  const { testCases } = await import(testsPath);
  
  // Extract function name from signature file
  const signatureCode = await fs.readFile(signaturePath, 'utf-8');
  const functionMatch = signatureCode.match(/function\s+(\w+)/);
  const functionName = functionMatch ? functionMatch[1] : 'unknown';
  
  return {
    name: taskName,
    path: taskPath,
    functionName,
    testCases
  };
}

/**
 * Get all candidate files for a task
 */
async function getCandidateFiles(candidatesDir: string, taskName: string): Promise<string[]> {
  const taskCandidatesDir = path.join(candidatesDir, taskName);
  
  try {
    const files = await fs.readdir(taskCandidatesDir);
    return files
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(taskCandidatesDir, f));
  } catch (error) {
    console.warn(`No candidates found for task: ${taskName}`);
    return [];
  }
}

/**
 * Main evaluation function
 */
async function evaluate(tasksDir: string, candidatesDir: string, outputDir: string) {
  console.log('🚀 Starting code generation evaluation...\n');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all tasks
  const taskDirs = await fs.readdir(tasksDir);
  const taskReports: TaskReport[] = [];
  let totalSnippetCount = 0;
  let totalPassRateSum = 0;
  
  for (const taskName of taskDirs) {
    const taskPath = path.join(tasksDir, taskName);
    const stat = await fs.stat(taskPath);
    
    if (!stat.isDirectory()) continue;
    
    console.log(`\n📝 Evaluating task: ${taskName}`);
    console.log('─'.repeat(40));
    
    try {
      // Load task configuration
      const taskConfig = await loadTaskConfig(taskPath);
      
      // Get candidate files
      const candidateFiles = await getCandidateFiles(candidatesDir, taskName);
      console.log(`  Found ${candidateFiles.length} candidates`);
      
      if (candidateFiles.length === 0) {
        console.log(`  ⚠️  Skipping task - no candidates found`);
        continue;
      }
      
      // Run each candidate
      const results: SnippetResult[] = [];
      const codeSnippets = new Map<string, string>();
      
      for (const candidatePath of candidateFiles) {
        console.log(`  Testing ${path.basename(candidatePath)}...`);
        
        const code = await fs.readFile(candidatePath, 'utf-8');
        const result = await runSnippet(
          candidatePath,
          taskConfig.testCases,
          taskConfig.functionName
        );
        
        results.push(result);
        codeSnippets.set(result.snippetId, code);
        
        console.log(`    ✓ Passed: ${result.totalPassed}/${result.totalTests} tests`);
      }
      
      // TODO: Call scoring functions here
      // const diversity = computeDiversity(Array.from(codeSnippets.values()));
      // const consistency = computeConsistency(results);
      
      // TODO: Call ranking function here
      // const rankedSnippets = rankSnippets(results, codeSnippets, diversity, consistency);
      // const winner = selectWinner(rankedSnippets);
      
      // For now, just pick the one with highest pass rate as a placeholder
      const bestResult = results.reduce((best, current) => 
        current.passRate > best.passRate ? current : best
      );
      
      // Create task report (simplified for now)
      const taskReport: TaskReport = {
        taskName,
        winner: bestResult.snippetId,
        snippetMetrics: results.map(r => ({
          snippetId: r.snippetId,
          passRate: r.passRate,
          lineCount: codeSnippets.get(r.snippetId)?.split('\n').length || 0,
          hadRuntimeError: r.hadRuntimeError,
          finalScore: r.passRate // Placeholder
        })),
        averagePassRate: results.reduce((sum, r) => sum + r.passRate, 0) / results.length
      };
      
      taskReports.push(taskReport);
      totalSnippetCount += results.length;
      totalPassRateSum += taskReport.averagePassRate;
      
      console.log(`  🏆 Winner: ${bestResult.snippetId} (${(bestResult.passRate * 100).toFixed(1)}% pass rate)`);
      
    } catch (error) {
      console.error(`  ❌ Error evaluating task ${taskName}:`, error);
    }
  }
  
  // Generate global report
  const globalReport: GlobalReport = {
    totalTasks: taskReports.length,
    totalSnippets: totalSnippetCount,
    meanPassAt1: taskReports.length > 0 ? totalPassRateSum / taskReports.length : 0,
    averageDiversity: 0, // TODO: Calculate when diversity is implemented
    tasksWithFailures: taskReports
      .filter(t => t.averagePassRate < 1.0)
      .map(t => t.taskName),
    timestamp: new Date().toISOString()
  };
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 EVALUATION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`  Total tasks evaluated: ${globalReport.totalTasks}`);
  console.log(`  Total snippets tested: ${globalReport.totalSnippets}`);
  console.log(`  Mean pass@1: ${(globalReport.meanPassAt1 * 100).toFixed(1)}%`);
  
  // TODO: Generate reports when functions are implemented
  console.log('\n⚠️  Note: Full reporting not yet implemented');
  console.log('   Candidates should implement:');
  console.log('   - computePassRate, computeDiversity in scoring.ts');
  console.log('   - rankSnippets, selectWinner in ranking.ts');
  console.log('   - generateJsonReport, generateMarkdownReport in report.ts');
  
  // For now, save a simple results file
  const simpleResults = {
    tasks: taskReports,
    global: globalReport
  };
  
  await fs.writeFile(
    path.join(outputDir, 'results.json'),
    JSON.stringify(simpleResults, null, 2)
  );
  
  console.log(`\n✅ Results saved to ${outputDir}/results.json`);
}

// CLI setup
const program = new Command();

program
  .name('codegen-evaluator')
  .description('Evaluate code generation snippets')
  .version('1.0.0')
  .option('-t, --tasks <path>', 'Path to tasks directory', './tasks')
  .option('-c, --candidates <path>', 'Path to candidates directory', './candidates')
  .option('-o, --out <path>', 'Output directory for results', './results')
  .action(async (options) => {
    try {
      await evaluate(options.tasks, options.candidates, options.out);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  });

program.parse();