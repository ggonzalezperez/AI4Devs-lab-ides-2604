import { Candidate } from '../domain/models/Candidate';

jest.mock('../infrastructure/prismaClient', () => ({
  getPrismaClient: jest.fn().mockReturnValue({
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  }),
}));

import { getPrismaClient } from '../infrastructure/prismaClient';

const mockPrisma = getPrismaClient() as any;

describe('Candidate domain model', () => {
  const baseData = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@test.com',
    phone: '612345678',
    address: 'Calle Mayor 1',
    education: 'Ingeniería Informática',
    workExperience: '3 años en startup',
    cvUrl: '/uploads/cv.pdf',
    cvFileName: 'cv.pdf',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should_set_all_properties_when_constructed', () => {
      const candidate = new Candidate({ id: 1, ...baseData });
      expect(candidate.id).toBe(1);
      expect(candidate.firstName).toBe('Ana');
      expect(candidate.email).toBe('ana@test.com');
      expect(candidate.cvUrl).toBe('/uploads/cv.pdf');
    });
  });

  describe('save', () => {
    it('should_create_candidate_in_database_and_return_candidate_instance', async () => {
      mockPrisma.candidate.create.mockResolvedValue({ id: 1, ...baseData });

      const candidate = new Candidate(baseData);
      const result = await candidate.save();

      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Ana',
          lastName: 'García',
          email: 'ana@test.com',
          phone: '612345678',
        }),
      });
      expect(result).toBeInstanceOf(Candidate);
      expect(result.id).toBe(1);
    });

    it('should_persist_optional_fields_when_present', async () => {
      mockPrisma.candidate.create.mockResolvedValue({ id: 2, ...baseData });

      const candidate = new Candidate(baseData);
      await candidate.save();

      const callArg = mockPrisma.candidate.create.mock.calls[0][0].data;
      expect(callArg.education).toBe('Ingeniería Informática');
      expect(callArg.workExperience).toBe('3 años en startup');
      expect(callArg.cvUrl).toBe('/uploads/cv.pdf');
      expect(callArg.cvFileName).toBe('cv.pdf');
    });
  });

  describe('findByEmail', () => {
    it('should_return_candidate_instance_when_email_exists', async () => {
      mockPrisma.candidate.findUnique.mockResolvedValue({ id: 1, ...baseData });

      const result = await Candidate.findByEmail('ana@test.com');

      expect(result).toBeInstanceOf(Candidate);
      expect(result?.email).toBe('ana@test.com');
      expect(result?.id).toBe(1);
    });

    it('should_return_null_when_email_does_not_exist', async () => {
      mockPrisma.candidate.findUnique.mockResolvedValue(null);

      const result = await Candidate.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findSuggestions', () => {
    it('should_return_education_suggestions_matching_query', async () => {
      mockPrisma.candidate.findMany.mockResolvedValue([
        { education: 'Grado en Informática – UPM (2018–2022)' },
        { education: 'Grado en ADE – UCM (2019–2023)' },
      ]);

      const result = await Candidate.findSuggestions('education', 'grado');

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Grado en Informática – UPM (2018–2022)');
    });

    it('should_return_workExperience_suggestions_matching_query', async () => {
      mockPrisma.candidate.findMany.mockResolvedValue([
        { workExperience: 'Desarrollador Backend – Empresa XYZ (2020–2023)' },
      ]);

      const result = await Candidate.findSuggestions('workExperience', 'develop');

      expect(result).toHaveLength(1);
    });

    it('should_filter_out_null_and_empty_values', async () => {
      mockPrisma.candidate.findMany.mockResolvedValue([
        { education: 'Grado en Informática' },
        { education: null },
        { education: '   ' },
      ]);

      const result = await Candidate.findSuggestions('education', '');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Grado en Informática');
    });
  });

  describe('count', () => {
    it('should_return_total_number_of_candidates', async () => {
      mockPrisma.candidate.count.mockResolvedValue(5);

      const result = await Candidate.count();

      expect(mockPrisma.candidate.count).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });
});
