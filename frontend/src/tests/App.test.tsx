import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import * as candidateService from '../services/candidateService';

jest.mock('../services/candidateService');

beforeEach(() => {
  (candidateService.getCandidateCount as jest.Mock).mockResolvedValue(3);
});

test('should_render_dashboard_hero_on_root_route', () => {
  render(<App />);
  expect(screen.getByText('Panel de Reclutamiento')).toBeInTheDocument();
});

test('should_render_add_candidate_navigation_links', () => {
  render(<App />);
  const links = screen.getAllByText('Añadir candidato');
  expect(links.length).toBeGreaterThan(0);
});

test('should_display_candidate_count_from_api', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByTestId('stat-total-candidates')).toHaveTextContent('3');
  });
});
