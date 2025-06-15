import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { websocketService } from '../services/websocket';
import { fetchItems } from '../services/api';
import debounce from 'lodash/debounce';

export function useItemsData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [sortModel, setSortModel] = useState([]);
  const [minHigh, setMinHigh] = useState('');
  const [maxHigh, setMaxHigh] = useState('');
  const [minLow, setMinLow] = useState('');
  const [maxLow, setMaxLow] = useState('');
  const [membership, setMembership] = useState('');
  
  // Use a ref to store old prices
  const oldPricesRef = useRef(new Map());

  // Create a memoized version of the search parameters
  const searchParams = useMemo(() => ({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    search: searchInput,
    sort_by: sortModel[0]?.field || 'name',
    sort_order: sortModel[0]?.sort || 'asc',
    min_high: minHigh || undefined,
    max_high: maxHigh || undefined,
    min_low: minLow || undefined,
    max_low: maxLow || undefined,
    membership: membership || undefined,
  }), [
    paginationModel.page,
    paginationModel.pageSize,
    searchInput,
    sortModel,
    minHigh,
    maxHigh,
    minLow,
    maxLow,
    membership,
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchItems(searchParams);

      // Store old prices for comparison
      const updatedRows = response.results.map(item => {
        const oldHigh = oldPricesRef.current.get(item.id)?.high;
        const oldLow = oldPricesRef.current.get(item.id)?.low;
        
        // Update the ref with new prices
        oldPricesRef.current.set(item.id, {
          high: item.high,
          low: item.low
        });

        return {
          ...item,
          id: item.id.toString(),
          oldHigh,
          oldLow,
          members: item.members?.toString() || 'false',
        };
      });

      setRows(updatedRows);
      setTotal(response.total);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Create a debounced version of fetchData for search and filter changes
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 1000), // Increased to 1 second
    [fetchData]
  );

  // Handle pagination and sorting changes immediately
  useEffect(() => {
    if (searchParams.page !== undefined || searchParams.sort_by || searchParams.sort_order) {
      fetchData();
    }
  }, [searchParams.page, searchParams.sort_by, searchParams.sort_order, fetchData]);

  // Handle search and filter changes with debounce
  useEffect(() => {
    if (searchInput || minHigh || maxHigh || minLow || maxLow || membership) {
      debouncedFetchData();
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [searchInput, minHigh, maxHigh, minLow, maxLow, membership, debouncedFetchData]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    const unsubscribe = websocketService.subscribe((data) => {
      console.log('WebSocket message received:', data);
      
      if (data.type === 'price_update') {
        console.log('Processing price update for item:', data.item_id);
        setRows(currentRows => {
          console.log('Current rows count:', currentRows.length);
          const updatedRows = currentRows.map(row => {
            // Convert both IDs to strings for comparison since row.id is a string
            if (row.id === String(data.item_id)) {
              console.log('Updating item:', row.name, 'with new prices:', data.high, data.low);
              // Store old prices in ref
              oldPricesRef.current.set(data.item_id, {
                high: row.high,
                low: row.low
              });

              return {
                ...row,
                oldHigh: row.high,
                oldLow: row.low,
                high: data.high,
                low: data.low,
                highTime: data.highTime,
                lowTime: data.lowTime,
              };
            }
            return row;
          });
          console.log('Updated rows count:', updatedRows.length);
          return updatedRows;
        });
      } else if (data.type === 'connection_status') {
        console.log('WebSocket connection status:', data.status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
  }, []);

  return {
    rows,
    loading,
    error,
    paginationModel,
    total,
    searchInput,
    setSearchInput,
    sortModel,
    setSortModel,
    minHigh,
    setMinHigh,
    maxHigh,
    setMaxHigh,
    minLow,
    setMinLow,
    maxLow,
    setMaxLow,
    membership,
    setMembership,
    handlePaginationModelChange,
    setError,
  };
} 