import request from 'supertest';
import { app } from '../index';
import * as candidateService from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';

jest.mock('../application/services/candidateService');

const mockedAddCandidate = candidateService.addCandidate as jest.Mock;

describe('POST /api/candidates', () => {
  const validBody = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    phone: '612345678',
  };

  const mockCandidate = new Candidate({ id: 1, ...validBody });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when request is valid', () => {
    it('should_return_201_when_candidate_is_created_successfully', async () => {
      mockedAddCandidate.mockResolvedValue(mockCandidate);

      const response = await request(app).post('/api/candidates').send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('when validation fails', () => {
    it('should_return_400_when_firstName_is_missing', async () => {
      mockedAddCandidate.mockRejectedValue(new Error('El nombre es obligatorio'));

      const response = await request(app)
        .post('/api/candidates')
        .send({ ...validBody, firstName: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('obligatori');
    });

    it('should_return_400_when_email_has_invalid_format', async () => {
      mockedAddCandidate.mockRejectedValue(new Error('El email tiene un formato inválido'));

      const response = await request(app)
        .post('/api/candidates')
        .send({ ...validBody, email: 'bad-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválid');
    });
  });

  describe('when email already exists', () => {
    it('should_return_409_when_email_is_already_registered', async () => {
      mockedAddCandidate.mockRejectedValue(
        new Error('Ya existe un candidato con el email ana@example.com')
      );

      const response = await request(app).post('/api/candidates').send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Ya existe');
    });
  });

  describe('when server error occurs', () => {
    it('should_return_500_when_unexpected_error_occurs', async () => {
      mockedAddCandidate.mockRejectedValue(new Error('Unexpected DB failure'));

      const response = await request(app).post('/api/candidates').send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('when a CV file is included', () => {
    it('should_pass_cv_url_and_filename_to_service_when_file_is_uploaded', async () => {
      mockedAddCandidate.mockResolvedValue(mockCandidate);

      await request(app)
        .post('/api/candidates')
        .field('firstName', 'Ana')
        .field('lastName', 'García')
        .field('email', 'ana@example.com')
        .attach('cv', Buffer.from('%PDF-1.4 test content'), {
          filename: 'cv.pdf',
          contentType: 'application/pdf',
        });

      expect(mockedAddCandidate).toHaveBeenCalledWith(
        expect.objectContaining({
          cvFileName: 'cv.pdf',
          cvUrl: expect.stringContaining('/uploads/'),
        })
      );
    });
  });
});
