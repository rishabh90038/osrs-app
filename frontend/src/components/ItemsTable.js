import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import { formatPrice, formatDateTime, formatPriceChange, getPriceChangeColor } from '../utils/formatters';
import ItemDetails from './ItemDetails';

export default function ItemsTable({
  columns,
  rows,
  loading,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions,
  rowCount,
  error,
  sortingMode,
  sortModel,
  onSortModelChange,
  retryCount,
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const enhancedColumns = [
    {
      field: 'name',
      headerName: 'Item Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.row.icon && (
            <img
              src={params.row.icon}
              alt={params.row.name}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
          )}
          <Typography>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'high',
      headerName: 'Sell Price',
      width: 150,
      renderCell: (params) => {
        const change = formatPriceChange(params.row.oldHigh, params.row.high);
        return (
          <Tooltip title={`Last updated: ${formatDateTime(params.row.highTime)}`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ color: getPriceChangeColor(change) }}>
                {formatPrice(params.value)}
              </Typography>
              {change !== 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: getPriceChangeColor(change),
                  }}
                >
                  ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'low',
      headerName: 'Buy Price',
      width: 150,
      renderCell: (params) => {
        const change = formatPriceChange(params.row.oldLow, params.row.low);
        return (
          <Tooltip title={`Last updated: ${formatDateTime(params.row.lowTime)}`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ color: getPriceChangeColor(change) }}>
                {formatPrice(params.value)}
              </Typography>
              {change !== 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: getPriceChangeColor(change),
                  }}
                >
                  ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
      {loading && (
        <LinearProgress
          data-testid="loading-indicator"
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2 }}
        />
      )}
      {retryCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Retrying to fetch data... (Attempt {retryCount})
        </Alert>
      )}
      {error && (
        <Alert data-testid="error-message" severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <DataGrid
        data-testid="items-table"
        rows={rows}
        columns={enhancedColumns}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        rowCount={rowCount}
        sortingMode={sortingMode}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
      {selectedItem && (
        <ItemDetails
          data-testid="item-details-dialog"
          item={selectedItem}
          open={!!selectedItem}
          onClose={handleCloseDetails}
        />
      )}
    </Box>
  );
} 