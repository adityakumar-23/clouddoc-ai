import { embeddingService } from './embedding.service';

export interface DocumentChunk {
  id: string;
  pageNumber: number;
  snippet: string;
  embedding?: number[];
  score?: number;
}

export class DocumentRetrievalService {
  chunkDocument(fullText: string, approximatePages = 1): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const chunkSize = 600;
    const overlap = 120;

    const cleanText = fullText.replace(/\r\n/g, '\n').trim();
    if (!cleanText) {
      return [
        {
          id: 'chunk-1',
          pageNumber: 1,
          snippet: 'Empty document content.',
        },
      ];
    }

    const totalLength = cleanText.length;
    const charsPerPage = Math.max(1, Math.floor(totalLength / Math.max(1, approximatePages)));

    let start = 0;
    let chunkIndex = 1;

    while (start < totalLength) {
      const end = Math.min(start + chunkSize, totalLength);
      const snippet = cleanText.substring(start, end).trim();

      const approximatePage = Math.min(
        approximatePages,
        Math.max(1, Math.floor(start / charsPerPage) + 1)
      );

      if (snippet.length > 20) {
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          pageNumber: approximatePage,
          snippet,
        });
      }

      start += chunkSize - overlap;
    }

    return chunks;
  }

  async retrieveTopK(
    query: string,
    chunks: DocumentChunk[],
    topK = 4
  ): Promise<DocumentChunk[]> {
    if (chunks.length === 0) return [];

    const queryEmbedding = await embeddingService.generateEmbedding(query);

    const scoredChunks = await Promise.all(
      chunks.map(async (chunk) => {
        const chunkEmbedding =
          chunk.embedding || (await embeddingService.generateEmbedding(chunk.snippet));
        const score = embeddingService.calculateCosineSimilarity(queryEmbedding, chunkEmbedding);
        return {
          ...chunk,
          embedding: chunkEmbedding,
          score: Math.round(score * 100) / 100,
        };
      })
    );

    // Sort by highest cosine similarity score
    scoredChunks.sort((a, b) => (b.score || 0) - (a.score || 0));

    return scoredChunks.slice(0, topK);
  }
}

export const documentRetrievalService = new DocumentRetrievalService();
