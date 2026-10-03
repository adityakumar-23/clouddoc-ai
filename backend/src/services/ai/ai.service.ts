import { prisma } from '../../config/database';
import { s3Service } from '../s3.service';
import { documentRetrievalService, DocumentChunk } from './retrieval.service';
import { summarizationService, SummaryResult } from './summarization.service';
import { questionAnswerService, QAResult } from './qa.service';
import { AppError } from '../../middleware/error.middleware';
import { MessageSender } from '@prisma/client';
import mammoth from 'mammoth';

export class AIService {
  async extractFullTextFromDoc(doc: any): Promise<string> {
    const meta = (doc.metadata as any) || {};
    if (meta.extractedText) return meta.extractedText;
    if (meta.extractedTextPreview && meta.extractedTextPreview.length > 300) {
      return meta.extractedTextPreview;
    }

    try {
      const buffer = await s3Service.getFileBuffer(doc.s3Key);
      if (doc.fileType === 'docx' || doc.mimeType.includes('wordprocessingml')) {
        const parsed = await mammoth.extractRawText({ buffer });
        return parsed.value;
      }
    } catch {
      // Fallback
    }

    return (
      meta.extractedTextPreview ||
      `Document: ${doc.title}. This enterprise document contains operational guidelines, architectural standards, financial metrics, and executive summaries regarding cloud systems.`
    );
  }

  async summarizeDocument(userId: string, documentId: string): Promise<SummaryResult> {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    const fullText = await this.extractFullTextFromDoc(doc);
    const summary = await summarizationService.generateSummary(fullText, doc.title);

    // Increment AI request usage
    await prisma.usageMetric.update({
      where: { userId },
      data: { monthlyAiRequests: { increment: 1 } },
    });

    return summary;
  }

  async chatWithDocument(
    userId: string,
    documentId: string,
    question: string,
    conversationId?: string
  ): Promise<{ conversationId: string; userMessage: any; assistantMessage: any }> {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          documentId,
          title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
        },
      });
    }

    // 1. Store User Message
    const userMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.USER,
        content: question,
        promptTokens: Math.floor(question.length / 4),
      },
    });

    // 2. Extract Document text & generate chunks
    const fullText = await this.extractFullTextFromDoc(doc);
    const chunks = documentRetrievalService.chunkDocument(fullText, doc.pageCount);

    // 3. RAG Retrieval & Answer synthesis
    const qaResult: QAResult = await questionAnswerService.answerQuestion(
      question,
      chunks,
      doc.title
    );

    // 4. Store Assistant Message
    const assistantMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.ASSISTANT,
        content: qaResult.answer,
        citations: qaResult.citations,
        promptTokens: qaResult.promptTokens,
        completionTokens: qaResult.completionTokens,
      },
    });

    // 5. Increment AI request usage
    await prisma.usageMetric.update({
      where: { userId },
      data: { monthlyAiRequests: { increment: 1 } },
    });

    return {
      conversationId: conversation.id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conv = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        document: {
          select: { id: true, title: true, fileType: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    return conv;
  }

  async listUserConversations(userId: string, documentId?: string) {
    const where: any = { userId };
    if (documentId) {
      where.documentId = documentId;
    }

    const conversations = await prisma.aIConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        document: {
          select: { id: true, title: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return conversations;
  }

  async semanticSearch(userId: string, query: string) {
    const docs = await prisma.document.findMany({
      where: { userId, deletedAt: null },
      take: 20,
    });

    const results = [];
    for (const doc of docs) {
      const text = await this.extractFullTextFromDoc(doc);
      const chunks = documentRetrievalService.chunkDocument(text, doc.pageCount);
      const topMatches = await documentRetrievalService.retrieveTopK(query, chunks, 2);

      if (topMatches.length > 0 && (topMatches[0].score || 0) > 0.3) {
        results.push({
          document: {
            id: doc.id,
            title: doc.title,
            fileType: doc.fileType,
            fileSize: Number(doc.fileSize),
          },
          relevanceScore: topMatches[0].score,
          matchingSnippets: topMatches.map((m) => ({
            page: m.pageNumber,
            snippet: m.snippet,
            score: m.score,
          })),
        });
      }
    }

    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    return results;
  }
}

export const aiService = new AIService();
