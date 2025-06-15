import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        cell: {
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },
  },
}); 