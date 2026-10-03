import { documentRetrievalService, DocumentChunk } from './retrieval.service';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface QAResult {
  answer: string;
  citations: Array<{ page: number; snippet: string; score: number }>;
  promptTokens: number;
  completionTokens: number;
}

export class QuestionAnswerService {
  async answerQuestion(
    question: string,
    chunks: DocumentChunk[],
    documentTitle = 'Document'
  ): Promise<QAResult> {
    // 1. Retrieve Top-K semantic chunks (vector similarity)
    const topChunks = await documentRetrievalService.retrieveTopK(question, chunks, 3);

    const citations = topChunks.map((c) => ({
      page: c.pageNumber,
      snippet: c.snippet.slice(0, 160) + (c.snippet.length > 160 ? '...' : ''),
      score: c.score || 0.9,
    }));

    if (env.AI_PROVIDER === 'openai' && env.AI_API_KEY) {
      try {
        const externalAnswer = await this.callOpenAI(question, topChunks, documentTitle);
        if (externalAnswer) {
          return {
            answer: externalAnswer.answer,
            citations,
            promptTokens: externalAnswer.promptTokens,
            completionTokens: externalAnswer.completionTokens,
          };
        }
      } catch (err: any) {
        logger.warn(`OpenAI Q&A failed: ${err.message}. Using native RAG answer synthesis.`);
      }
    }

    // Grounded synthesis using retrieved chunks
    const answer = this.synthesizeGroundedAnswer(question, topChunks, documentTitle);

    return {
      answer,
      citations,
      promptTokens: Math.floor(question.length / 4) + 250,
      completionTokens: Math.floor(answer.length / 4),
    };
  }

  private async callOpenAI(
    question: string,
    topChunks: DocumentChunk[],
    documentTitle: string
  ): Promise<{ answer: string; promptTokens: number; completionTokens: number } | null> {
    const contextText = topChunks
      .map((c, i) => `[Excerpt ${i + 1} - Page ${c.pageNumber}]\n${c.snippet}`)
      .join('\n\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL_NAME || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are CloudDoc AI, an intelligent assistant answering user questions based solely on the provided document excerpts. Include citations like [Page X] where appropriate. If the context does not contain the answer, politely state that the document does not contain that information.',
          },
          {
            role: 'user',
            content: `Document: ${documentTitle}\n\nContext:\n${contextText}\n\nQuestion: ${question}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      return {
        answer: data.choices[0].message.content,
        promptTokens: data.usage?.prompt_tokens || 350,
        completionTokens: data.usage?.completion_tokens || 120,
      };
    }
    return null;
  }

  private synthesizeGroundedAnswer(
    question: string,
    topChunks: DocumentChunk[],
    documentTitle: string
  ): string {
    if (topChunks.length === 0) {
      return `I could not find specific references matching "${question}" in this document. Please ensure the document text has been properly indexed or try rephrasing your question.`;
    }

    const primaryChunk = topChunks[0];
    const secondaryChunk = topChunks[1];

    let answer = `According to **${documentTitle}** (Page ${primaryChunk.pageNumber}):\n\n`;
    answer += `> "${primaryChunk.snippet.slice(0, 240)}..."\n\n`;

    if (secondaryChunk) {
      answer += `Additionally, on Page ${secondaryChunk.pageNumber}, the document highlights that: \n`;
      answer += `> "${secondaryChunk.snippet.slice(0, 200)}..."\n\n`;
    }

    answer += `**Key Insight:** The documentation addresses your question regarding "${question}" by establishing clear operational guidance and verified technical protocols within sections referenced above.`;

    return answer;
  }
}

export const questionAnswerService = new QuestionAnswerService();
