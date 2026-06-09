import { Beneficiary } from '@/types/beneficiary';
export const mockBeneficiaries: Beneficiary[] = [
  { id: 'luca', name: 'Luca Romano', iban: 'LU28 0019 1111 2222 3333', bank: 'Banque Raiffeisen Luxembourg', email: 'luca.romano@example.com', phone: '+39 345 812 4470' },
  { id: 'sofia', name: 'Sofia Bianchi', iban: 'LU55 0019 4444 5555 6666', bank: 'Banque de Luxembourg', email: 'sofia.bianchi@example.com', phone: '+39 333 604 2198' },
  { id: 'marco', name: 'Marco Conti', iban: 'LU82 0019 7777 8888 9999', bank: 'Banque Internationale à Luxembourg', email: 'marco.conti@example.com', phone: '+39 347 920 1186' }
];
