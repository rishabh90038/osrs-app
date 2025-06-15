export const GRID_COLUMNS = [
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
      const value = params;
      return isFinite(value) ? value : 0;
    },
    valueFormatter: (params) => {
      return Number(params ?? 0).toLocaleString();
    },
  },
];

export const GRID_INITIAL_STATE = {
  pagination: {
    paginationModel: { page: 0, pageSize: 50 },
  },
};

export const GRID_PAGE_SIZE_OPTIONS = [25, 50, 100]; 