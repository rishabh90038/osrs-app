class Cache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const item = {
      value,
      timestamp: Date.now(),
    };
    this.cache.set(key, item);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Create cache instances for different types of data
export const itemCache = new Cache(5 * 60 * 1000); // 5 minutes for item data
export const priceCache = new Cache(30 * 1000); // 30 seconds for price data

// Cache key generators
export const generateItemCacheKey = (params) => {
  const { page, pageSize, search, sort_by, sort_order, min_high, max_high, min_low, max_low, membership } = params;
  return `items:${JSON.stringify({ page, pageSize, search, sort_by, sort_order, min_high, max_high, min_low, max_low, membership })}`;
};

export const generatePriceCacheKey = (itemId) => `price:${itemId}`; 