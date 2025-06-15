import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useItemsData } from './useItemsData';
import { fetchItems } from '../services/api';

jest.mock('../services/api');

describe('useItemsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches items and updates state', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1', high: 100, low: 50 },
      { id: 2, name: 'Item 2', high: 200, low: 150 },
    ];

    fetchItems.mockResolvedValue({ results: mockItems, total: 2 });

    const { result } = renderHook(() => useItemsData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rows).toEqual(mockItems);
    expect(result.current.error).toBe(null);
  });

  it('handles errors when fetching items', async () => {
    const errorMessage = 'Failed to fetch items';
    fetchItems.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useItemsData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });
}); 