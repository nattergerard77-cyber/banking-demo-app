export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'courant' | 'epargne' | 'joint';
}
