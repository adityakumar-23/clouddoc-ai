import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';

export class JobController {
  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, toolType, parameters } = req.body;
      const job = await jobService.createJob({
        userId: req.user!.id,
        documentId,
        toolType,
        parameters,
      });

      res.status(202).json({
        success: true,
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.getJobById(req.user!.id, req.params.id);
      res.json({
        success: true,
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  }

  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await jobService.listUserJobs(req.user!.id, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.cancelJob(req.user!.id, req.params.id);
      res.json({
        success: true,
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const jobController = new JobController();
