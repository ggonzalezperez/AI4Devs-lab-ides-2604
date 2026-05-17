import { Request, Response } from 'express';
import { addCandidate, getCandidateCount, getSuggestions } from '../../application/services/candidateService';

const ALLOWED_SUGGESTION_FIELDS = ['education', 'workExperience'] as const;
type SuggestionField = typeof ALLOWED_SUGGESTION_FIELDS[number];

export async function getCandidateCountHandler(_req: Request, res: Response): Promise<void> {
  try {
    const count = await getCandidateCount();
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

export async function getSuggestionsHandler(req: Request, res: Response): Promise<void> {
  const { field, q = '' } = req.query as { field?: string; q?: string };

  if (!field || !ALLOWED_SUGGESTION_FIELDS.includes(field as SuggestionField)) {
    res.status(400).json({
      success: false,
      error: 'El parámetro field debe ser "education" o "workExperience"',
    });
    return;
  }

  try {
    const suggestions = await getSuggestions(field as SuggestionField, q);
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

export async function addCandidateHandler(req: Request, res: Response): Promise<void> {
  try {
    const cvFile = req.file;
    const input = {
      ...req.body,
      cvUrl: cvFile ? `/uploads/${cvFile.filename}` : undefined,
      cvFileName: cvFile ? cvFile.originalname : undefined,
    };

    const candidate = await addCandidate(input);
    res.status(201).json({ success: true, data: candidate });
  } catch (error: any) {
    const message: string = error.message || '';

    if (
      message.includes('obligatori') ||
      message.includes('inválid') ||
      message.includes('superar')
    ) {
      res.status(400).json({ success: false, error: message });
      return;
    }

    if (message.toLowerCase().includes('ya existe')) {
      res.status(409).json({ success: false, error: message });
      return;
    }

    console.error(error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}
