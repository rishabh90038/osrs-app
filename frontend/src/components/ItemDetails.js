import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import { formatPrice, formatDateTime } from '../utils/formatters';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function ItemDetails({ item, open, onClose }) {
  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="item-details-modal"
    >
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {item.icon && (
            <img
              src={item.icon}
              alt={item.name}
              style={{ width: 32, height: 32, marginRight: 8 }}
            />
          )}
          <Typography variant="h6" component="h2">
            {item.name}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={item.members === 'true' ? 'Members Only' : 'Free to Play'}
            color={item.members === 'true' ? 'primary' : 'default'}
            size="small"
            onClick={() => {
                onClose();
              }}          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {item.examine}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Prices
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Sell Price:</Typography>
            <Typography variant="body2" color="primary">
              {formatPrice(item.high)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Buy Price:</Typography>
            <Typography variant="body2" color="secondary">
              {formatPrice(item.low)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Last Updated
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Sell Price:</Typography>
            <Typography variant="body2">
              {formatDateTime(item.highTime)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Buy Price:</Typography>
            <Typography variant="body2">
              {formatDateTime(item.lowTime)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
} 