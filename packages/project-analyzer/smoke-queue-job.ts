import { Queue } from 'bullmq';

async function main() {
  const queue = new Queue('jobs', { 
    connection: { host: 'localhost', port: 6379 } 
  });

  await queue.add('ANALYZE_PROJECT', {
    studentId: 'cmm8aobon0001eiuplvy7atoi',
    repoUrl: 'https://github.com/PiyushRajDev/slh'
  });

  console.log('✅ Job queued');
  await queue.close();
}

main();