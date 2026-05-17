export interface CandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
}

export function validateCandidateData(data: Partial<CandidateDto>): string | null {
  if (typeof data.firstName !== 'string' || !data.firstName.trim()) {
    return 'El nombre es obligatorio';
  }
  if (data.firstName.trim().length > 100) {
    return 'El nombre no puede superar los 100 caracteres';
  }

  if (typeof data.lastName !== 'string' || !data.lastName.trim()) {
    return 'El apellido es obligatorio';
  }
  if (data.lastName.trim().length > 100) {
    return 'El apellido no puede superar los 100 caracteres';
  }

  if (typeof data.email !== 'string' || !data.email.trim()) {
    return 'El email es obligatorio';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    return 'El email tiene un formato inválido';
  }
  if (data.email.trim().length > 255) {
    return 'El email no puede superar los 255 caracteres';
  }

  if (typeof data.phone === 'string' && data.phone.trim()) {
    const phone = data.phone.trim();
    if (!phone.startsWith('+')) {
      return 'El teléfono tiene un formato inválido';
    }
    if (/[^\d\s\+\-\(\)]/.test(phone)) {
      return 'El teléfono tiene un formato inválido';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      return 'El teléfono tiene un formato inválido';
    }
  }

  if (typeof data.address === 'string' && data.address.trim().length > 500) {
    return 'La dirección no puede superar los 500 caracteres';
  }

  return null;
}
