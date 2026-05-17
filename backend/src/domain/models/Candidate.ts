import { getPrismaClient } from '../../infrastructure/prismaClient';

export interface CandidateData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  education?: string | null;
  workExperience?: string | null;
  cvUrl?: string | null;
  cvFileName?: string | null;
}

export class Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  education?: string | null;
  workExperience?: string | null;
  cvUrl?: string | null;
  cvFileName?: string | null;

  constructor(data: CandidateData) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.education = data.education;
    this.workExperience = data.workExperience;
    this.cvUrl = data.cvUrl;
    this.cvFileName = data.cvFileName;
  }

  async save(): Promise<Candidate> {
    const prisma = getPrismaClient();
    const saved = await prisma.candidate.create({
      data: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        address: this.address,
        education: this.education,
        workExperience: this.workExperience,
        cvUrl: this.cvUrl,
        cvFileName: this.cvFileName,
      },
    });
    return new Candidate(saved);
  }

  static async findByEmail(email: string): Promise<Candidate | null> {
    const prisma = getPrismaClient();
    const found = await prisma.candidate.findUnique({ where: { email } });
    return found ? new Candidate(found) : null;
  }

  static async count(): Promise<number> {
    const prisma = getPrismaClient();
    return prisma.candidate.count();
  }

  static async findSuggestions(
    field: 'education' | 'workExperience',
    query: string
  ): Promise<string[]> {
    const prisma = getPrismaClient();
    const containsFilter = query.trim()
      ? { contains: query.trim(), mode: 'insensitive' as const }
      : undefined;

    let rows: Array<{ education?: string | null } | { workExperience?: string | null }>;

    if (field === 'education') {
      rows = await prisma.candidate.findMany({
        where: { education: { not: null, ...containsFilter } },
        select: { education: true },
        distinct: ['education'],
        take: 6,
        orderBy: { education: 'asc' },
      });
    } else {
      rows = await prisma.candidate.findMany({
        where: { workExperience: { not: null, ...containsFilter } },
        select: { workExperience: true },
        distinct: ['workExperience'],
        take: 6,
        orderBy: { workExperience: 'asc' },
      });
    }

    return rows
      .map((r: any) => r[field] as string | null)
      .filter((v): v is string => Boolean(v?.trim()));
  }
}
