export interface BankCard {
  id: string;
  type: 'debit' | 'credit';
  last4: string;
  expiry: string;
}
