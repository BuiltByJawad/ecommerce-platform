import { render, screen } from '@testing-library/react';
import React from 'react';

function Hello() {
  return <div>Hello World</div>;
}

describe('Hello component', () => {
  it('renders text', () => {
    render(<Hello />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
