export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' GP';
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPriceChange = (oldPrice, newPrice) => {
  if (oldPrice === null || newPrice === null) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

export const getPriceChangeColor = (change) => {
  if (change > 0) return 'success.main';
  if (change < 0) return 'error.main';
  return 'text.primary';
}; 