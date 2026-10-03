import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai/ai.service';
import { recordAuditLog } from '../middleware/auditLog.middleware';
import { AppError } from '../middleware/error.middleware';

export class AIController {
  async summarize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.body;
      if (!documentId) {
        throw new AppError('documentId is required for summarization', 400);
      }

      const summary = await aiService.summarizeDocument(req.user!.id, documentId);

      await recordAuditLog(req, 'AI_SUMMARIZE', 'DOCUMENT', documentId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, question, conversationId } = req.body;
      if (!documentId || !question) {
        throw new AppError('documentId and question are required', 400);
      }

      const result = await aiService.chatWithDocument(
        req.user!.id,
        documentId,
        question,
        conversationId
      );

      await recordAuditLog(req, 'AI_CHAT_MESSAGE', 'AI_CONVERSATION', result.conversationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conv = await aiService.getConversationMessages(req.user!.id, req.params.id);
      res.json({
        success: true,
        data: conv,
      });
    } catch (err) {
      next(err);
    }
  }

  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docId = req.query.documentId as string | undefined;
      const convs = await aiService.listUserConversations(req.user!.id, docId);
      res.json({
        success: true,
        data: convs,
      });
    } catch (err) {
      next(err);
    }
  }

  async extractEntities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.body;
      if (!documentId) {
        throw new AppError('documentId is required', 400);
      }

      const summary = await aiService.summarizeDocument(req.user!.id, documentId);

      res.json({
        success: true,
        data: {
          classification: summary.classification,
          entities: summary.entities,
          keyPoints: summary.keyPoints,
          actionItems: summary.actionItems,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async semanticSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;
      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const results = await aiService.semanticSearch(req.user!.id, query);

      res.json({
        success: true,
        data: {
          query,
          results,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
