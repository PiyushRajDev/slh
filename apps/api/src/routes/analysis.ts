import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { analysisController } from '../controllers/analysisController';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticate);

// POST   /api/projects/analyze
router.post('/analyze', analysisController.analyze);

// GET    /api/projects/analyses
router.get('/analyses', analysisController.getAnalyses);

// GET    /api/projects/analyses/latest
// MUST mount before /:id to prevent "latest" being evaluated as an ID
router.get('/analyses/latest', analysisController.getLatestAnalysis);

// GET    /api/projects/analyses/:id
router.get('/analyses/:id', analysisController.getAnalysisById);

// GET    /api/projects/analyses/:id/verify
router.get('/analyses/:id/verify', analysisController.verifyAnalysisIntegrity);

export default router;
