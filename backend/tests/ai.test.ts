import { documentRetrievalService } from '../src/services/ai/retrieval.service';
import { summarizationService } from '../src/services/ai/summarization.service';
import { embeddingService } from '../src/services/ai/embedding.service';

describe('AI & Retrieval Engine Unit Tests', () => {
  const sampleDocText = `
  AWS Architecture Guidelines for Production Systems.
  Amazon EC2 Graviton3 instances provide up to 25% better compute performance for 20% lower cost.
  S3 Intelligent-Tiering automatically monitors and moves objects between frequent and infrequent access tiers without retrieval fees.
  Database reliability is guaranteed through Amazon RDS Multi-AZ deployments with automatic failover in under 60 seconds.
  All data must be encrypted with AWS KMS using AES-256 cipher keys.
  `;

  it('documentRetrievalService should properly chunk document text and calculate page numbers', () => {
    const chunks = documentRetrievalService.chunkDocument(sampleDocText, 3);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toHaveProperty('pageNumber');
    expect(chunks[0]).toHaveProperty('snippet');
  });

  it('embeddingService should calculate cosine similarity accurately', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    const simIdentical = embeddingService.calculateCosineSimilarity(vecA, vecB);
    const simOrthogonal = embeddingService.calculateCosineSimilarity(vecA, vecC);

    expect(simIdentical).toBeCloseTo(1.0);
    expect(simOrthogonal).toBeCloseTo(0.0);
  });

  it('summarizationService should extract key points and classify document type', async () => {
    const summary = await summarizationService.generateSummary(sampleDocText, 'AWS Architecture Spec');
    expect(summary).toHaveProperty('executiveSummary');
    expect(summary.keyPoints.length).toBeGreaterThan(0);
    expect(summary.entities).toHaveProperty('monetaryValues');
    expect(summary.classification).toContain('Technical');
  });
});
