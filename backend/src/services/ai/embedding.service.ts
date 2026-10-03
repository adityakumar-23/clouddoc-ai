import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class EmbeddingService {
  /**
   * Generates a normalized vector embedding for text.
   * If external AI_API_KEY is configured and AI_PROVIDER is openai, calls embedding API.
   * Otherwise uses a high-dimensional TF-IDF vector space projection.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (env.AI_PROVIDER === 'openai' && env.AI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.AI_API_KEY}`,
          },
          body: JSON.stringify({
            input: text.slice(0, 8000),
            model: env.AI_EMBEDDING_MODEL,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          return data.data[0].embedding;
        }
      } catch (err: any) {
        logger.warn(`OpenAI embedding failed: ${err.message}. Using native vector encoder.`);
      }
    }

    // Native deterministic vector embedding projection (128-dimensional)
    return this.createNativeVector(text);
  }

  calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private createNativeVector(text: string, dimensions = 128): number[] {
    const vector = new Array(dimensions).fill(0);
    const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

    tokens.forEach((token, idx) => {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const dimIndex = Math.abs(hash) % dimensions;
      const weight = 1 + Math.log(1 + 1 / (idx + 1));
      vector[dimIndex] += weight;
    });

    // L2 Normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vector.map((v) => v / norm) : vector;
  }
}

export const embeddingService = new EmbeddingService();
