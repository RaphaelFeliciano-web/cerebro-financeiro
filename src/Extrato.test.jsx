import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Extrato from './Extrato.jsx';

describe('Extrato Component', () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mockTransacoes = [
    { id: 1, desc: 'Salário Mensal', valor: 5000, cat: 'Salário', data: today.toLocaleDateString('pt-BR') },
    { id: 2, desc: 'Jantar fora', valor: -150.75, cat: 'Alimentação', data: today.toLocaleDateString('pt-BR') },
    { id: 3, desc: 'Compra Online', valor: -89.90, cat: 'Compras', data: yesterday.toLocaleDateString('pt-BR') },
  ];

  it('should render the empty state when there are no transactions', () => {
    render(<Extrato transacoes={[]} removerTransacao={() => {}} />);
    
    expect(screen.getByText('Nenhuma transação registrada')).toBeInTheDocument();
  });

  it('should group transactions by date', () => {
    render(<Extrato transacoes={mockTransacoes} removerTransacao={() => {}} />);

    // Check for date headers
    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByText('Ontem')).toBeInTheDocument();
  });

  it('should render the correct number of transactions under each date group', () => {
    render(<Extrato transacoes={mockTransacoes} removerTransacao={() => {}} />);

    // "Hoje" group should have 2 items
    const hojeGroup = screen.getByText('Hoje').closest('div');
    const transacoesHoje = hojeGroup.querySelectorAll('li');
    expect(transacoesHoje.length).toBe(2);
    expect(hojeGroup).toHaveTextContent('Salário Mensal');
    expect(hojeGroup).toHaveTextContent('Jantar fora');

    // "Ontem" group should have 1 item
    const ontemGroup = screen.getByText('Ontem').closest('div');
    const transacoesOntem = ontemGroup.querySelectorAll('li');
    expect(transacoesOntem.length).toBe(1);
    expect(ontemGroup).toHaveTextContent('Compra Online');
  });

  it('should call removerTransacao with the correct id when delete button is clicked', () => {
    const removerTransacaoMock = vi.fn();
    render(<Extrato transacoes={mockTransacoes} removerTransacao={removerTransacaoMock} />);

    // Find the transaction for "Jantar fora" and its delete button
    const jantarItem = screen.getByText('Jantar fora').closest('li');
    const deleteButton = jantarItem.querySelector('button');

    fireEvent.click(deleteButton);

    expect(removerTransacaoMock).toHaveBeenCalledTimes(1);
    expect(removerTransacaoMock).toHaveBeenCalledWith(2); // ID of "Jantar fora"
  });
});