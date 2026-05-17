import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AddCandidateForm } from '../components/AddCandidateForm/AddCandidateForm';
import * as candidateService from '../services/candidateService';

jest.mock('../services/candidateService');

const mockAddCandidate = candidateService.addCandidate as jest.Mock;

const renderForm = () =>
  render(
    <MemoryRouter>
      <AddCandidateForm />
    </MemoryRouter>
  );

const fillRequiredFields = () => {
  fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Ana', name: 'firstName' } });
  fireEvent.change(screen.getByTestId('input-lastName'), { target: { value: 'García', name: 'lastName' } });
  fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'ana@example.com', name: 'email' } });
};

describe('AddCandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    renderForm();
  });

  describe('when form is rendered', () => {
    it('should_render_form_with_all_required_fields', () => {
      expect(screen.getByTestId('add-candidate-form')).toBeInTheDocument();
      expect(screen.getByTestId('input-firstName')).toBeInTheDocument();
      expect(screen.getByTestId('input-lastName')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('when form is submitted with invalid data', () => {
    it('should_show_error_when_firstName_is_empty', async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      });
    });

    it('should_show_error_when_email_has_invalid_format', async () => {
      fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Ana', name: 'firstName' } });
      fireEvent.change(screen.getByTestId('input-lastName'), { target: { value: 'García', name: 'lastName' } });
      fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'not-an-email', name: 'email' } });
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByText('El email tiene un formato inválido')).toBeInTheDocument();
      });
    });

    it('should_show_error_when_phone_has_too_few_digits', async () => {
      fillRequiredFields();
      fireEvent.change(screen.getByTestId('input-phone'), { target: { value: '123' } });
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByText('El teléfono debe tener entre 7 y 15 dígitos')).toBeInTheDocument();
      });
    });

    it('should_not_call_api_when_validation_fails', async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(mockAddCandidate).not.toHaveBeenCalled();
      });
    });
  });

  describe('when form is submitted successfully', () => {
    it('should_show_success_message_when_candidate_is_created', async () => {
      mockAddCandidate.mockResolvedValue({ id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });
      fillRequiredFields();
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('should_reset_form_after_successful_submission', async () => {
      mockAddCandidate.mockResolvedValue({ id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@example.com' });
      fillRequiredFields();
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByTestId('input-firstName')).toHaveValue('');
      });
    });
  });

  describe('when api returns an error', () => {
    it('should_show_error_message_when_api_returns_conflict', async () => {
      mockAddCandidate.mockRejectedValue({
        response: { data: { error: 'Ya existe un candidato con el email ana@example.com' } },
      });
      fillRequiredFields();
      fireEvent.click(screen.getByTestId('submit-button'));
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent('Ya existe');
      });
    });
  });
});
