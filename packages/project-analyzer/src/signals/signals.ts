import { RawMetrics } from '../metrics/metrics';

export interface StructuralSignals {
    has_frontend: boolean;
    has_backend: boolean;
    has_database: boolean;
    has_tests: boolean;
    has_ci: boolean;
    has_deployment_config: boolean;
    is_monorepo: boolean;
    has_documentation: boolean;
    is_short_timeline: boolean;
    has_heavy_framework: boolean;
    // Doc-required signals
    has_ml_components: boolean;  // ML/AI/data science dependency detected
    has_notebooks: boolean;       // .ipynb files or notebooks/ folder present
    is_minimal: boolean;          // file_count <= 50 AND total_loc <= 5000
}

export function deriveSignals(metrics: RawMetrics): StructuralSignals {
    const dependencies = metrics?.dependencies || [];
    const languages = metrics?.languages || {};
    const folder_structure = metrics?.folder_structure || [];
    const deploy_config_types = metrics?.deploy_config_types || [];

    const hasDependency = (deps: string[]) => deps.some(d => dependencies.includes(d));

    // --- Existing signals ---
    const htmlLoc = languages['.html'] || 0;
    const cssLoc = languages['.css'] || 0;
    const has_frontend = hasDependency(['react', 'vue', 'next', 'next.js', 'svelte', 'angular', 'nuxt', 'gatsby', 'vite', 'redux', 'solid-js']) || (htmlLoc + cssLoc) > 200;

    const has_backend = hasDependency([
        'express', 'nestjs', '@nestjs/core', 'fastify', 'koa',
        'django', 'flask', 'fastapi', 'tornado', 'aiohttp', 'bottle',
        'spring', 'gin', 'echo', 'fiber', 'gorilla',
        'actix-web', 'rocket', 'axum', 'rails', 'sinatra'
    ]);

    const sqlLoc = languages['.sql'] || 0;
    const prismaLoc = languages['.prisma'] || 0;
    const has_database = hasDependency([
        'prisma', 'mongoose', 'typeorm', 'pg', 'sequelize', 'knex',
        'sqlalchemy', 'peewee', 'tortoise-orm', 'pymongo', 'redis',
        'psycopg2', 'mysql-connector-python', 'pymysql',
        'hibernate', 'mybatis', 'gorm', 'ent'
    ]) || sqlLoc > 0 || prismaLoc > 0;

    const test_file_count = metrics?.test_file_count || 0;
    const has_tests = (test_file_count > 0) || hasDependency([
        'jest', 'mocha', 'vitest', 'cypress', 'playwright', 'puppeteer', 'jasmine', 'ava',
        'pytest', 'unittest', 'nose', 'hypothesis',
        'junit', 'testng', 'mockito',
        'go-test', 'testing'
    ]);

    const has_ci = metrics?.ci_config_present === true;

    const has_deployment_config = metrics?.deploy_config_present === true;

    const is_monorepo = (folder_structure.includes('apps') && folder_structure.includes('packages')) || hasDependency(['lerna', 'turbo', 'nx', 'rush']);

    const mdLoc = languages['.md'] || 0;
    const has_documentation = mdLoc > 50 || folder_structure.includes('docs') || folder_structure.includes('doc');

    const commit_span_days = metrics?.commit_span_days || 0;
    const is_short_timeline = commit_span_days < 7;

    const has_heavy_framework = hasDependency(['next', '@nestjs/core', 'angular', 'django', 'spring', 'nuxt', 'gatsby']);

    // --- New doc-required signals ---

    // has_ml_components: any serious ML/AI/data science dependency
    const has_ml_components = hasDependency([
        // Python ML core
        'torch', 'pytorch', 'tensorflow', 'tf', 'keras', 'jax', 'flax',
        'scikit-learn', 'sklearn', 'xgboost', 'lightgbm', 'catboost',
        'numpy', 'pandas', 'scipy', 'statsmodels',
        // Viz & notebooks
        'matplotlib', 'seaborn', 'plotly', 'bokeh', 'altair',
        // NLP / LLM
        'transformers', 'huggingface', 'openai', 'langchain', 'langchain-core',
        'nltk', 'spacy', 'gensim', 'sentence-transformers',
        // CV
        'cv2', 'opencv-python', 'Pillow', 'albumentations',
        // Data tooling
        'dask', 'polars', 'pyarrow', 'h5py', 'datasets',
        // MLOps
        'mlflow', 'wandb', 'optuna', 'ray', 'celery',
        // JS ML
        '@tensorflow/tfjs', 'brain.js', 'synaptic', 'ml5',
    ]);

    // has_notebooks: .ipynb files or a notebooks folder
    const notebookLoc = languages['.ipynb'] || 0;
    const has_notebooks = notebookLoc > 0 ||
        folder_structure.some(f => f === 'notebooks' || f === 'notebook' || f === 'nbs');

    // is_minimal: small project by file count and LOC (typical for CLI tools, libraries)
    const file_count = metrics?.file_count || 0;
    const total_loc = metrics?.total_loc || 0;
    const is_minimal = file_count <= 50 && total_loc <= 5000;

    return {
        has_frontend,
        has_backend,
        has_database,
        has_tests,
        has_ci,
        has_deployment_config,
        is_monorepo,
        has_documentation,
        is_short_timeline,
        has_heavy_framework,
        has_ml_components,
        has_notebooks,
        is_minimal
    };
}
