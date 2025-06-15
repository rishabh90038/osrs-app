import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemsTable from './ItemsTable';

const mockColumns = [
  { field: 'name', headerName: 'Item Name', flex: 1 },
  { field: 'high', headerName: 'Sell Price', width: 150 },
  { field: 'low', headerName: 'Buy Price', width: 150 },
];

const mockRows = [
  {
    id: 1,
    name: 'Abyssal whip',
    high: 100000,
    low: 95000,
    highTime: '2024-03-20T12:00:00Z',
    lowTime: '2024-03-20T12:00:00Z',
  },
  {
    id: 2,
    name: 'Dragon bones',
    high: 5000,
    low: 4500,
    highTime: '2024-03-20T12:00:00Z',
    lowTime: '2024-03-20T12:00:00Z',
  },
];

describe('ItemsTable', () => {
  const defaultProps = {
    columns: mockColumns,
    rows: mockRows,
    loading: false,
    paginationModel: { page: 0, pageSize: 10 },
    onPaginationModelChange: jest.fn(),
    pageSizeOptions: [10, 25, 50],
    rowCount: 2,
    error: null,
    sortingMode: 'server',
    sortModel: [],
    onSortModelChange: jest.fn(),
  };

  it('renders the table with correct headers', () => {
    render(<ItemsTable {...defaultProps} />);
    
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Sell Price')).toBeInTheDocument();
    expect(screen.getByText('Buy Price')).toBeInTheDocument();
  });

  it('renders the correct number of rows', () => {
    render(<ItemsTable {...defaultProps} />);
    
    expect(screen.getByText('Abyssal whip')).toBeInTheDocument();
    expect(screen.getByText('Dragon bones')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<ItemsTable {...defaultProps} loading={true} />);
    
    // Material-UI DataGrid shows a loading overlay when loading is true
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles row click correctly', () => {
    render(<ItemsTable {...defaultProps} />);
    
    const firstRow = screen.getByText('Abyssal whip');
    fireEvent.click(firstRow);
    
    // Check if ItemDetails component is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('formats prices correctly', () => {
    render(<ItemsTable {...defaultProps} />);
    
    // Check if prices are formatted with commas
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByText('95,000')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('4,500')).toBeInTheDocument();
  });

  it('handles empty data correctly', () => {
    render(<ItemsTable {...defaultProps} rows={[]} rowCount={0} />);
    
    // Check if "No rows" message is shown
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  it('handles error state correctly', () => {
    const errorMessage = 'Failed to fetch data';
    render(<ItemsTable {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
}); 