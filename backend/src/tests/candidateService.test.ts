import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';

jest.mock('../domain/models/Candidate');

const MockedCandidate = Candidate as jest.MockedClass<typeof Candidate>;

describe('candidateService.addCandidate', () => {
  const validInput = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    phone: '+34 612345678',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when data is valid', () => {
    it('should_create_candidate_when_all_required_fields_are_valid', async () => {
      MockedCandidate.findByEmail = jest.fn().mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue(
        new Candidate({ id: 1, ...validInput })
      );
      MockedCandidate.prototype.save = mockSave;

      const result = await addCandidate(validInput);

      expect(MockedCandidate.findByEmail).toHaveBeenCalledWith('ana@example.com');
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Candidate);
    });

    it('should_save_cv_data_when_file_is_provided', async () => {
      MockedCandidate.findByEmail = jest.fn().mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue({ id: 2, ...validInput });
      MockedCandidate.prototype.save = mockSave;

      await addCandidate({ ...validInput, cvUrl: '/uploads/cv.pdf', cvFileName: 'cv.pdf' });

      const constructorArgs = MockedCandidate.mock.calls[0][0];
      expect(constructorArgs.cvUrl).toBe('/uploads/cv.pdf');
      expect(constructorArgs.cvFileName).toBe('cv.pdf');
    });
  });

  describe('when validation fails', () => {
    it('should_throw_error_when_firstName_is_missing', async () => {
      await expect(addCandidate({ ...validInput, firstName: '' })).rejects.toThrow(
        'obligatori'
      );
    });

    it('should_throw_error_when_email_has_invalid_format', async () => {
      await expect(addCandidate({ ...validInput, email: 'invalid' })).rejects.toThrow(
        'inválid'
      );
    });
  });

  describe('when optional fields are missing', () => {
    it('should_set_optional_fields_to_null_when_not_provided', async () => {
      MockedCandidate.findByEmail = jest.fn().mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue({ id: 3, ...validInput });
      MockedCandidate.prototype.save = mockSave;

      await addCandidate({ firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });

      const constructorArgs = MockedCandidate.mock.calls[0][0];
      expect(constructorArgs.phone).toBeNull();
      expect(constructorArgs.address).toBeNull();
      expect(constructorArgs.cvUrl).toBeNull();
    });
  });

  describe('when email already exists', () => {
    it('should_throw_conflict_error_when_email_is_already_registered', async () => {
      MockedCandidate.findByEmail = jest.fn().mockResolvedValue(
        new Candidate({ id: 99, ...validInput })
      );

      await expect(addCandidate(validInput)).rejects.toThrow('Ya existe');
    });
  });
});
