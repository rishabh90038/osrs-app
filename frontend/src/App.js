import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { darkTheme } from './constants/theme';
import { useItemsData } from './hooks/useItemsData';
import { GRID_COLUMNS, GRID_PAGE_SIZE_OPTIONS } from './constants/gridConfig';
import ItemsTable from './components/ItemsTable';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function AppContent() {
  const {
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
    retryCount,
  } = useItemsData();

  // Reset filters
  const handleResetFilters = () => {
    setMinHigh('');
    setMaxHigh('');
    setMinLow('');
    setMaxLow('');
    setMembership('');
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: 40 }}>
      <Typography variant="h4" gutterBottom>
        OSRS Item Prices (Live)
      </Typography>

      <Box mb={2} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField
          data-testid="search-input"
          fullWidth
          variant="outlined"
          label="Search by item name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
          placeholder="Type to filter items..."
        />
        <TextField
          data-testid="min-high-input"
          label="Min Sell Price"
          type="number"
          value={minHigh}
          onChange={e => setMinHigh(e.target.value)}
          size="small"
        />
        <TextField
          data-testid="max-high-input"
          label="Max Sell Price"
          type="number"
          value={maxHigh}
          onChange={e => setMaxHigh(e.target.value)}
          size="small"
        />
        <TextField
          data-testid="min-low-input"
          label="Min Buy Price"
          type="number"
          value={minLow}
          onChange={e => setMinLow(e.target.value)}
          size="small"
        />
        <TextField
          data-testid="max-low-input"
          label="Max Buy Price"
          type="number"
          value={maxLow}
          onChange={e => setMaxLow(e.target.value)}
          size="small"
        />
        <TextField
          data-testid="membership-select"
          select
          label="Membership"
          value={membership}
          onChange={e => setMembership(e.target.value)}
          size="small"
          style={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Members</MenuItem>
          <MenuItem value="false">Free to Play</MenuItem>
        </TextField>
        <Button
          data-testid="reset-filters-button"
          variant="outlined"
          onClick={handleResetFilters}
          size="small"
        >
          Reset Filters
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <ItemsTable
        columns={GRID_COLUMNS}
        rows={rows}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={GRID_PAGE_SIZE_OPTIONS}
        rowCount={total}
        error={error}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        retryCount={retryCount}
      />
    </Container>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
