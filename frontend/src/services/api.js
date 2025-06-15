import { itemCache, priceCache, generateItemCacheKey, generatePriceCacheKey } from './cache';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export async function fetchItems(params) {
  const { page, pageSize, ...restParams } = params;
  
  // Convert page/pageSize to offset/limit
  const queryParams = new URLSearchParams({
    offset: page * pageSize,
    limit: pageSize,
    ...restParams
  });

  // Remove undefined values
  Object.entries(restParams).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      queryParams.delete(key);
    }
  });

  const cacheKey = generateItemCacheKey(params);
  const cachedData = itemCache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(`${API_BASE_URL}/items-prices?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }

  const data = await response.json();
  itemCache.set(cacheKey, data);
  return data;
}

export async function fetchItemDetails(itemId) {
  const cacheKey = generatePriceCacheKey(itemId);
  const cachedData = priceCache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch item details: ${response.statusText}`);
  }

  const data = await response.json();
  priceCache.set(cacheKey, data);
  return data;
}

export function clearItemCache() {
  itemCache.clear();
}

export function clearPriceCache() {
  priceCache.clear();
}

export function clearAllCaches() {
  itemCache.clear();
  priceCache.clear();
} 