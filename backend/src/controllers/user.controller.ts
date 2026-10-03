import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { recordAuditLog } from '../middleware/auditLog.middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateProfileSchema.parse(req.body);
      const updated = await userService.updateProfile(req.user!.id, data);
      await recordAuditLog(req, 'USER_UPDATE_PROFILE', 'USER', req.user!.id);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const result = await userService.changePassword(req.user!.id, currentPassword, newPassword);
      await recordAuditLog(req, 'USER_CHANGE_PASSWORD', 'USER', req.user!.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
