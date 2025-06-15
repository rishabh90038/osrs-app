import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the OSRS header', () => {
  render(<App />);
  const heading = screen.getByText(/OSRS Item Prices \(Live\)/i);
  expect(heading).toBeInTheDocument();
});

test('renders search input', () => {
  render(<App />);
  const input = screen.getByLabelText(/Search by item name/i);
  expect(input).toBeInTheDocument();
});
