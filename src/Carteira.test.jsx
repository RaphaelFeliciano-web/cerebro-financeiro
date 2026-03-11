import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Carteira from './Carteira.jsx';

describe('Carteira Component', () => {
  const mockCarteira = [
    { ticker: 'PETR4', qtd: 100, precoMedio: 30.00 }, // Ação, Total: 3000
    { ticker: 'MXRF11', qtd: 50, precoMedio: 10.50 },  // FII, Total: 525
  ];
  const mockSaldo = 1000;
  const mockTotalInvestido = 3525; // 3000 + 525

  it('should render the total equity value correctly', () => {
    render(<Carteira minhaCarteira={mockCarteira} totalInvestido={mockTotalInvestido} saldo={mockSaldo} />);

    // Patrimônio Total = 1000 (saldo) + 3525 (investido) = 4525
    const patrimonioElement = screen.getByText(/4,525\.00/);
    expect(patrimonioElement).toBeInTheDocument();
  });

  it('should render the correct number of asset cards', () => {
    render(<Carteira minhaCarteira={mockCarteira} totalInvestido={mockTotalInvestido} saldo={mockSaldo} />);

    const acaoCard = screen.getByText('PETR4');
    const fiiCard = screen.getByText('MXRF11');
    expect(acaoCard).toBeInTheDocument();
    expect(fiiCard).toBeInTheDocument();
  });

  it('should display the total number of assets in the donut chart center', () => {
    render(<Carteira minhaCarteira={mockCarteira} totalInvestido={mockTotalInvestido} saldo={mockSaldo} />);
    
    // The text "Total" is above the number
    const totalLabel = screen.getByText('Total');
    // The number of assets is inside the donut
    const totalAssets = totalLabel.nextElementSibling;

    expect(totalAssets).toHaveTextContent(String(mockCarteira.length));
  });

  it('should hide and show values when the toggle button is clicked', () => {
    render(<Carteira minhaCarteira={mockCarteira} totalInvestido={mockTotalInvestido} saldo={mockSaldo} />);

    const toggleButton = screen.getByRole('button', { name: /Ocultar Patrimônio/i });
    
    // Initially, value is visible
    expect(screen.getByText(/4,525\.00/)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(toggleButton);

    // Now, values should be hidden
    expect(screen.queryByText(/4,525\.00/)).not.toBeInTheDocument();
    expect(screen.getByText('••••••')).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Exibir Patrimônio/i);

    // The list of assets should still be visible, but with hidden values
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getAllByText('R$ •••')).toHaveLength(1); // For Preço Médio
    expect(screen.getAllByText('R$ ••••••')).toHaveLength(1); // For Posição Atual

    // Click to show again
    fireEvent.click(toggleButton);
    expect(screen.getByText(/4,525\.00/)).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Ocultar Patrimônio/i);
  });
});