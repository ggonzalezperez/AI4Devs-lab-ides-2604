import { Prisma } from '@prisma/client';
import { Candidate, CandidateData } from '../../domain/models/Candidate';
import { validateCandidateData, CandidateDto } from '../validator';

export interface CreateCandidateInput extends CandidateDto {
  cvUrl?: string;
  cvFileName?: string;
}

export async function getCandidateCount(): Promise<number> {
  return Candidate.count();
}

export async function getSuggestions(
  field: 'education' | 'workExperience',
  query: string
): Promise<string[]> {
  return Candidate.findSuggestions(field, query);
}

export async function addCandidate(input: CreateCandidateInput): Promise<Candidate> {
  const validationError = validateCandidateData(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await Candidate.findByEmail(input.email.trim());
  if (existing) {
    throw new Error(`Ya existe un candidato con el email ${input.email.trim()}`);
  }

  const candidateData: CandidateData = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    education: input.education?.trim() || null,
    workExperience: input.workExperience?.trim() || null,
    cvUrl: input.cvUrl || null,
    cvFileName: input.cvFileName || null,
  };

  const candidate = new Candidate(candidateData);
  try {
    return await candidate.save();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`Ya existe un candidato con el email ${candidateData.email}`);
    }
    throw error;
  }
}
