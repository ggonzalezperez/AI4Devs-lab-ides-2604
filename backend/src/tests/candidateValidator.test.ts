import { validateCandidateData } from '../application/validator';

describe('validateCandidateData', () => {
  const validData = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    phone: '+34 612345678',
  };

  describe('when data is valid', () => {
    it('should_return_null_when_all_required_fields_are_valid', () => {
      expect(validateCandidateData(validData)).toBeNull();
    });

    it('should_return_null_when_optional_fields_are_missing', () => {
      const { firstName, lastName, email } = validData;
      expect(validateCandidateData({ firstName, lastName, email })).toBeNull();
    });
  });

  describe('when firstName is invalid', () => {
    it('should_return_error_when_firstName_is_missing', () => {
      const result = validateCandidateData({ ...validData, firstName: '' });
      expect(result).toContain('obligatori');
    });

    it('should_return_error_when_firstName_exceeds_100_characters', () => {
      const result = validateCandidateData({ ...validData, firstName: 'A'.repeat(101) });
      expect(result).toContain('superar');
    });
  });

  describe('when lastName is invalid', () => {
    it('should_return_error_when_lastName_is_missing', () => {
      const result = validateCandidateData({ ...validData, lastName: '' });
      expect(result).toContain('obligatori');
    });

    it('should_return_error_when_lastName_exceeds_100_characters', () => {
      const result = validateCandidateData({ ...validData, lastName: 'B'.repeat(101) });
      expect(result).toContain('superar');
    });
  });

  describe('when email is invalid', () => {
    it('should_return_error_when_email_is_missing', () => {
      const result = validateCandidateData({ ...validData, email: '' });
      expect(result).toContain('obligatori');
    });

    it('should_return_error_when_email_has_invalid_format', () => {
      const result = validateCandidateData({ ...validData, email: 'not-an-email' });
      expect(result).toContain('inválid');
    });

    it('should_return_error_when_email_exceeds_255_characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = validateCandidateData({ ...validData, email: longEmail });
      expect(result).toContain('superar');
    });
  });

  describe('when phone is invalid', () => {
    it('should_return_error_when_phone_has_letters', () => {
      const result = validateCandidateData({ ...validData, phone: 'abc' });
      expect(result).toContain('inválid');
    });

    it('should_return_error_when_phone_has_too_few_digits', () => {
      const result = validateCandidateData({ ...validData, phone: '+34 123' });
      expect(result).toContain('inválid');
    });

    it('should_return_error_when_phone_has_too_many_digits', () => {
      const result = validateCandidateData({ ...validData, phone: '+34 1234567890123456' });
      expect(result).toContain('inválid');
    });

    it('should_return_null_when_phone_is_empty_string', () => {
      const result = validateCandidateData({ ...validData, phone: '' });
      expect(result).toBeNull();
    });

    it('should_return_null_when_phone_is_international_format', () => {
      const result = validateCandidateData({ ...validData, phone: '+34 612345678' });
      expect(result).toBeNull();
    });

    it('should_return_null_when_phone_is_us_format', () => {
      const result = validateCandidateData({ ...validData, phone: '+1 555-123-4567' });
      expect(result).toBeNull();
    });

    it('should_return_null_when_phone_is_uk_format', () => {
      const result = validateCandidateData({ ...validData, phone: '+44 7911 123456' });
      expect(result).toBeNull();
    });
  });

  describe('when address is invalid', () => {
    it('should_return_error_when_address_exceeds_500_characters', () => {
      const result = validateCandidateData({ ...validData, address: 'X'.repeat(501) });
      expect(result).toContain('superar');
    });
  });
});
