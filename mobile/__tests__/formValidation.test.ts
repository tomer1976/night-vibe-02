import {
  normalizePreferredGenders,
  validateAdultDateOfBirth,
  validateAgeRange,
  validateBioLength,
  validateDeletionConfirmationToken,
  validateMinLength,
  validatePreferredGenders,
} from '../src/validation/formValidation';

describe('form validation helpers', () => {
  it('validates minimum length fields', () => {
    expect(validateMinLength('A', 2, 'Too short')).toBe('Too short');
    expect(validateMinLength('Alex', 2, 'Too short')).toBeUndefined();
  });

  it('validates age-gate date of birth', () => {
    expect(validateAdultDateOfBirth('2012-01-01')).toBe('You must be at least 18 years old. Use YYYY-MM-DD format.');
    expect(validateAdultDateOfBirth('1998-01-01')).toBeUndefined();
  });

  it('validates bio boundaries', () => {
    expect(validateBioLength('short')).toBe('Bio must be between 10 and 300 characters.');
    expect(validateBioLength('This is a valid profile bio for tests.')).toBeUndefined();
  });

  it('validates preference age ranges', () => {
    expect(validateAgeRange('17', '24')).toBe('Use valid ages where min is at least 18 and max is not lower than min.');
    expect(validateAgeRange('24', '20')).toBe('Use valid ages where min is at least 18 and max is not lower than min.');
    expect(validateAgeRange('24', '32')).toBeUndefined();
  });

  it('normalizes and validates preferred genders', () => {
    expect(normalizePreferredGenders('female, male , ')).toEqual(['female', 'male']);
    expect(validatePreferredGenders('   ')).toBe('Provide at least one preferred gender.');
    expect(validatePreferredGenders('female, male')).toBeUndefined();
  });

  it('validates deletion confirmation token case-insensitively', () => {
    expect(validateDeletionConfirmationToken('remove', 'DELETE')).toBe('Type DELETE to confirm account deletion request.');
    expect(validateDeletionConfirmationToken('delete', 'DELETE')).toBeUndefined();
  });
});