import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function AppContent() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const offset = page * pageSize;
      const res = await fetch(`http://localhost:8000/api/items-prices?limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
  
      console.log("Raw backend data:", data);
  
      const results = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
  
      const filtered = results.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
      console.log("Filtered rows:", filtered,search,"234234324324",results);
  
      setRows(filtered);
      setTotal(typeof data.total === 'number' ? data.total : results.length);
    } catch (e) {
      console.error("Failed to fetch", e);
      setRows([]);
      setTotal(0);
    }
    setLoading(false);
  };
  
  console.log('One row sample:', rows[0]);


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
    // {
    //   field: 'margin',
    //   headerName: 'Margin',
    //   width: 130,
    //   type: 'number',
    //   valueGetter: (params) => {
    //     console.log("Margin params:", params);
    //     const high = Number(params?.row?.high ?? 0);
    //     const low = Number(params?.row?.low ?? 0);
    //     return high - low;
    //   },
    //   renderCell: (params) => {
    //     console.log("Margin params:", params);
    //     const value = Number(params?.value ?? 0);
    //     const color = value > 0 ? 'lightgreen' : value < 0 ? 'red' : '#aaa';
    //     return <span style={{ color }}>{value.toLocaleString()}</span>;
    //   },
    // },
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
            setPage(0); // reset to first page on search
          }}
        />
      </Box>

      <div style={{ height: 700, width: '100%' }}>
        <DataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          pagination
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={total}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          autoHeight
          density="comfortable"
          localeText={{
            noRowsLabel: loading ? "Loading..." : "No items found",
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
