import axios from 'axios';
import { Candidate, CreateCandidateDto } from '../types/candidate';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export async function getCandidateCount(): Promise<number> {
  const response = await axios.get<{ success: boolean; data: { count: number } }>(
    `${API_URL}/api/candidates/count`
  );
  return response.data.data.count;
}

export async function getSuggestions(
  field: 'education' | 'workExperience',
  query: string
): Promise<string[]> {
  const response = await axios.get<{ success: boolean; data: string[] }>(
    `${API_URL}/api/candidates/suggestions`,
    { params: { field, q: query } }
  );
  return response.data.data;
}

export async function addCandidate(
  data: CreateCandidateDto,
  cvFile?: File | null
): Promise<Candidate> {
  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
  if (data.address) formData.append('address', data.address);
  if (data.education) formData.append('education', data.education);
  if (data.workExperience) formData.append('workExperience', data.workExperience);
  if (cvFile) formData.append('cv', cvFile);

  const response = await axios.post<{ success: boolean; data: Candidate }>(
    `${API_URL}/api/candidates`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
}
