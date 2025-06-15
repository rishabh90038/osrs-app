import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function AppContent() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = page * pageSize;
      const url = `http://localhost:8000/api/items-prices?limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
  
      const results = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
  
      setRows(results);
      setTotal(typeof data.total === 'number' ? data.total : results.length);
    } catch (e) {
      setError(e.message || 'Failed to fetch data. Please try again later.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'high',
      headerName: 'Sell Price',
      width: 130,
      type: 'number',
      valueGetter: (params) => {
        const value = params;
        return isFinite(value) ? value : 0;
      },
      valueFormatter: (params) => {
        return Number(params ?? 0).toLocaleString();
      },
    },
    {
      field: 'low',
      headerName: 'Buy Price',
      width: 130,
      type: 'number',
      valueGetter: (params) => {
        const value =params;
        return isFinite(value) ? value : 0;
      },
      valueFormatter: (params) => {
        return Number(params ?? 0).toLocaleString();
      },
    },
  ];
  
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [page, pageSize, search]);

  return (
    <Container maxWidth="lg" style={{ marginTop: 40 }}>
      <Typography variant="h4" gutterBottom>
        OSRS Item Prices (Live)
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search by item name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          disabled={loading}
        />
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <div style={{ height: 700, width: '100%', position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <DataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          pagination
          paginationMode="server"
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          rowCount={total}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          autoHeight
          density="comfortable"
          localeText={{
            noRowsLabel: loading ? "Loading..." : error ? "Error loading data" : "No items found",
            loadingOverlayLabel: "Loading...",
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </div>
    </Container>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AppContent />
    </ThemeProvider>
  );
}
