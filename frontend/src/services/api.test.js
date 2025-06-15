import { fetchItems } from './api';

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches items successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1', high: 100, low: 50 },
      { id: 2, name: 'Item 2', high: 200, low: 150 },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockItems, total: 2 }),
    });

    const result = await fetchItems({ page: 0, pageSize: 10 });

    expect(result).toEqual({ results: mockItems, total: 2 });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/items-prices'));
  });

  it('handles errors when fetching items', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(fetchItems({ page: 0, pageSize: 10 })).rejects.toThrow('Failed to fetch');
  });
}); 