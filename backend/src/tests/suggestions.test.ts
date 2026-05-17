import request from 'supertest';
import { app } from '../index';
import { Candidate } from '../domain/models/Candidate';

jest.mock('../domain/models/Candidate');

const MockedCandidate = Candidate as jest.MockedClass<typeof Candidate>;

describe('GET /api/candidates/suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when field and query are valid', () => {
    it('should_return_200_with_education_suggestions', async () => {
      MockedCandidate.findSuggestions = jest
        .fn()
        .mockResolvedValue(['Grado en Informática – UPM (2018–2022)']);

      const response = await request(app)
        .get('/api/candidates/suggestions?field=education&q=grado');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toContain('Grado en Informática – UPM (2018–2022)');
    });

    it('should_return_200_with_workExperience_suggestions', async () => {
      MockedCandidate.findSuggestions = jest
        .fn()
        .mockResolvedValue(['Desarrollador Full Stack – Empresa XYZ (2020–2023)']);

      const response = await request(app)
        .get('/api/candidates/suggestions?field=workExperience&q=desarrollo');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should_return_empty_array_when_no_matches', async () => {
      MockedCandidate.findSuggestions = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/api/candidates/suggestions?field=education&q=xyz');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('when field is invalid', () => {
    it('should_return_400_when_field_is_missing', async () => {
      const response = await request(app)
        .get('/api/candidates/suggestions?q=test');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should_return_400_when_field_is_not_allowed', async () => {
      const response = await request(app)
        .get('/api/candidates/suggestions?field=email&q=test');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('field');
    });
  });

  describe('when server error occurs', () => {
    it('should_return_500_when_service_throws', async () => {
      MockedCandidate.findSuggestions = jest
        .fn()
        .mockRejectedValue(new Error('DB connection lost'));

      const response = await request(app)
        .get('/api/candidates/suggestions?field=education&q=test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('GET /api/candidates/count', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should_return_200_with_candidate_count', async () => {
    MockedCandidate.count = jest.fn().mockResolvedValue(7);

    const response = await request(app).get('/api/candidates/count');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.count).toBe(7);
  });

  it('should_return_500_when_service_throws', async () => {
    MockedCandidate.count = jest.fn().mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/api/candidates/count');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
