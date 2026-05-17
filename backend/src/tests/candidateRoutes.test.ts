import request from 'supertest';
import { app } from '../index';
import * as candidateService from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';

jest.mock('../application/services/candidateService');

const mockedAddCandidate = candidateService.addCandidate as jest.Mock;

describe('POST /api/candidates — multer file handling', () => {
  const mockCandidate = new Candidate({ id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should_return_400_when_file_has_invalid_mime_type', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'García')
      .field('email', 'ana@example.com')
      .attach('cv', Buffer.from('not a pdf'), {
        filename: 'cv.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('PDF');
  });

  it('should_accept_valid_docx_file', async () => {
    mockedAddCandidate.mockResolvedValue(mockCandidate);

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'García')
      .field('email', 'ana@example.com')
      .attach('cv', Buffer.from('PK docx content'), {
        filename: 'cv.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
