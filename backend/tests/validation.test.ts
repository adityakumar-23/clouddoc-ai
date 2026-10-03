import { sanitizeFilename } from '../src/middleware/fileValidation.middleware';

describe('Validation Middleware Unit Tests', () => {
  it('sanitizeFilename should remove directory traversal attacks and dangerous chars', () => {
    const maliciousName = '../../../../etc/passwd%00.pdf';
    const sanitized = sanitizeFilename(maliciousName);

    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
    expect(sanitized.endsWith('.pdf')).toBe(true);
  });

  it('sanitizeFilename should clean spaces and special symbols', () => {
    const dirtyName = 'My Quarterly Report (v2) [FINAL]! @#$.docx';
    const sanitized = sanitizeFilename(dirtyName);

    expect(sanitized).toMatch(/^[a-zA-Z0-9_-]+\.docx$/);
  });
});
