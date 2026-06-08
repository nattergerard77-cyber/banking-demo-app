import { Transaction } from '@/types/transaction';
export const mockTransactions: Transaction[] = [
  { id: '1', date: '2023-10-01', amount: 18750, description: 'Virement reçu — Compte italien', category: 'Virement international' },
  { id: '2', date: '2023-10-02', amount: -150.20, description: 'Supermarché', category: 'Alimentation' },
  { id: '3', date: '2023-10-03', amount: -850, description: 'Loyer', category: 'Logement' },
  { id: '4', date: '2023-10-04', amount: -45, description: 'Paiement Carte', category: 'Dépenses' },
  { id: '5', date: '2023-10-05', amount: 25, description: 'Remboursement', category: 'Revenus' }
];
