import { Router } from 'express';
import {
  authenticate,
  Permission,
  requireAnyPermission
} from '../middleware/auth.middleware';
import { analysisController } from '../controllers/analysisController';

const router = Router();

router.use(authenticate);

router.post(
  '/analyze',
  requireAnyPermission(
    Permission.ANALYSIS_SUBMIT_SELF,
    Permission.ANALYSIS_SUBMIT_ANY
  ),
  analysisController.analyze
);

router.get(
  '/analyses',
  requireAnyPermission(
    Permission.ANALYSIS_READ_SELF,
    Permission.ANALYSIS_READ_ANY
  ),
  analysisController.getAnalyses
);

router.get(
  '/analyses/latest',
  requireAnyPermission(
    Permission.ANALYSIS_READ_SELF,
    Permission.ANALYSIS_READ_ANY
  ),
  analysisController.getLatestAnalysis
);

router.get(
  '/analyses/:id',
  requireAnyPermission(
    Permission.ANALYSIS_READ_SELF,
    Permission.ANALYSIS_READ_ANY
  ),
  analysisController.getAnalysisById
);

router.get(
  '/analyses/:id/verify',
  requireAnyPermission(
    Permission.ANALYSIS_READ_SELF,
    Permission.ANALYSIS_READ_ANY
  ),
  analysisController.verifyAnalysisIntegrity
);

export default router;
