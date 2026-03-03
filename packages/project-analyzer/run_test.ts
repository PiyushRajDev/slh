import { detectGaming } from './src/anti-gaming/anti-gaming';
const metrics = { total_loc: 5_000_000, complexity_avg: 0.00001, commit_count: 200, commit_span_days: 2 };
const report = detectGaming(metrics as any, {} as any, 'generic');
console.log(report.flags);
