const CANON: Record<string, string> = {
  'react.js': 'React', 'reactjs': 'React',
  'node': 'Node.js', 'nodejs': 'Node.js', 'node js': 'Node.js',
  'js': 'JavaScript', 'javascript': 'JavaScript',
  'ts': 'TypeScript', 'typescript': 'TypeScript',
  'py': 'Python', 'python3': 'Python',
  'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB', 'mongodb': 'MongoDB',
  'k8s': 'Kubernetes', 'kube': 'Kubernetes',
  'aws': 'AWS', 'amazon web services': 'AWS',
  'gcp': 'GCP', 'google cloud': 'GCP',
  'azure': 'Azure', 'microsoft azure': 'Azure',
  'vue': 'Vue.js', 'vuejs': 'Vue.js',
  'angular': 'Angular', 'angularjs': 'Angular',
  'next': 'Next.js', 'nextjs': 'Next.js',
  'express': 'Express.js', 'expressjs': 'Express.js',
  'fastapi': 'FastAPI', 'fast api': 'FastAPI',
  'django': 'Django',
  'spring boot': 'Spring Boot', 'springboot': 'Spring Boot',
  'docker': 'Docker',
  'git': 'Git',
  'ci/cd': 'CI/CD', 'cicd': 'CI/CD',
  'rest': 'REST APIs', 'rest api': 'REST APIs', 'restful': 'REST APIs',
  'graphql': 'GraphQL',
  'redis': 'Redis',
  'kafka': 'Apache Kafka', 'apache kafka': 'Apache Kafka',
  'elasticsearch': 'Elasticsearch',
  'terraform': 'Terraform',
  'linux': 'Linux',
};

export function canonicalize(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return CANON[lower] ?? raw.trim();
}
