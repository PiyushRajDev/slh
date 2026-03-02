import { Queue } from 'bullmq';

async function main() {
  const queue = new Queue('jobs', { 
    connection: { host: 'localhost', port: 6379 } 
  });

  await queue.add('ANALYZE_PROJECT', {
    studentId: 'cmm8aobon0001eiuplvy7atoi',
    repoUrl: 'https://github.com/PiyushRajDev/this-repo-does-not-exist-xyz'
  });

  console.log('✅ Failure job queued');
  await queue.close();
}

main();
