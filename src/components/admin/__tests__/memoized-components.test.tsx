/**
 * Tests for the memoized components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubmissionRow } from '../submission-row';
import { StatsCard } from '../stats-card';
import { Pagination } from '../pagination';
import { PageSizeSelector } from '../page-size-selector';
import { SearchForm } from '../search-form';

describe('SubmissionRow', () => {
  const mockSubmission = {
    $id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
  };
  
  it('renders correctly with all props', () => {
    const mockOnView = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(
      <table>
        <tbody>
          <SubmissionRow
            submission={mockSubmission}
            onView={mockOnView}
            onDelete={mockOnDelete}
            isDeleting={false}
          />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });
  
  it('calls onView when view button is clicked', () => {
    const mockOnView = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(
      <table>
        <tbody>
          <SubmissionRow
            submission={mockSubmission}
            onView={mockOnView}
            onDelete={mockOnDelete}
            isDeleting={false}
          />
        </tbody>
      </table>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith(mockSubmission);
  });
});

describe('StatsCard', () => {
  it('renders correctly with all props', () => {
    render(
      <StatsCard
        title="Test Title"
        value={42}
        description="Test Description"
        icon={<span data-testid="test-icon" />}
        loading={false}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('shows loading spinner when loading is true', () => {
    render(
      <StatsCard
        title="Test Title"
        value={42}
        description="Test Description"
        icon={<span data-testid="test-icon" />}
        loading={true}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('renders correctly with all props', () => {
    const mockOnPageChange = jest.fn();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        loading={false}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
  
  it('calls onPageChange when page buttons are clicked', () => {
    const mockOnPageChange = jest.fn();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        loading={false}
        onPageChange={mockOnPageChange}
      />
    );
    
    fireEvent.click(screen.getByText('Next'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
    
    fireEvent.click(screen.getByText('Previous'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });
  
  it('disables buttons appropriately', () => {
    const mockOnPageChange = jest.fn();
    
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        loading={false}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('Previous').closest('button')).toBeDisabled();
    expect(screen.getByText('Next').closest('button')).not.toBeDisabled();
  });
});

describe('PageSizeSelector', () => {
  it('renders correctly with all props', () => {
    const mockOnPageSizeChange = jest.fn();
    
    render(
      <PageSizeSelector
        pageSize={10}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

describe('SearchForm', () => {
  it('renders correctly with all props', () => {
    const mockOnSearchChange = jest.fn();
    const mockOnSearch = jest.fn();
    const mockOnReset = jest.fn();
    const mockGetTimeRemaining = jest.fn().mockReturnValue({ hours: 1, minutes: 30, seconds: 0 });
    
    render(
      <SearchForm
        searchQuery="test query"
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
        onReset={mockOnReset}
        loading={false}
        lastSaved={new Date()}
        getTimeRemaining={mockGetTimeRemaining}
      />
    );
    
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search submissions...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
  
  it('calls onSearch when form is submitted', () => {
    const mockOnSearchChange = jest.fn();
    const mockOnSearch = jest.fn(e => e.preventDefault());
    const mockOnReset = jest.fn();
    const mockGetTimeRemaining = jest.fn().mockReturnValue({ hours: 1, minutes: 30, seconds: 0 });
    
    render(
      <SearchForm
        searchQuery="test query"
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
        onReset={mockOnReset}
        loading={false}
        lastSaved={new Date()}
        getTimeRemaining={mockGetTimeRemaining}
      />
    );
    
    fireEvent.submit(screen.getByRole('button', { name: /search/i }));
    expect(mockOnSearch).toHaveBeenCalled();
  });
});
