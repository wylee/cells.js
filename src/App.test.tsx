import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders canvas', () => {
  const { getByText } = render(<App />);
  const canvasElement = getByText(/<canvas>/i);
  expect(canvasElement).toBeInTheDocument();
});
