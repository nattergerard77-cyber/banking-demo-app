export type TransferReceiptData = {
  beneficiaryName: string;
  beneficiaryIban: string;
  donorName: string;
  amount: number;
  currency: string;
  reference: string;
  date: string;
  status: string;
};

export function generateTransferReceiptHTML(data: TransferReceiptData) {
  const { beneficiaryName, beneficiaryIban, donorName, amount, currency, reference, date, status } = data;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Times New Roman', serif; color: #1a1a1a; background: white; }
.container { max-width: 700px; margin: 0 auto; border: 1px solid #999; }
.header { padding: 1.5rem; border-bottom: 2px solid #003DA5; display: flex; align-items: center; gap: 1rem; }
.logo { width: 45px; height: 45px; }
.header-text h1 { font-size: 16px; font-weight: 700; color: #003DA5; letter-spacing: 2px; }
.header-text p { font-size: 10px; color: #666; letter-spacing: 1px; }
.title { padding: 1.5rem; text-align: center; border-bottom: 1px solid #ddd; }
.title h2 { font-size: 18px; font-weight: 700; color: #003DA5; letter-spacing: 1px; margin: 0; }
.title p { font-size: 12px; color: #666; margin: 0.5rem 0 0; }
.content { padding: 2rem 1.5rem; }
.amount-section { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid #C8E700; }
.amount-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
.amount-value { font-size: 40px; font-weight: 700; color: #003DA5; }
.details { font-size: 12px; line-height: 2.2; margin-bottom: 1.5rem; }
.detail-row { display: flex; margin-bottom: 0.75rem; }
.detail-label { width: 140px; font-weight: 700; color: #003DA5; }
.detail-value { flex: 1; }
.monospace { font-family: monospace; }
.summary { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd; font-size: 12px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.summary-total { display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 0.75rem; font-size: 13px; font-weight: 700; }
.total-label { color: #003DA5; }
.total-value { color: #C8E700; }
.footer { padding: 1.5rem; border-top: 2px solid #003DA5; text-align: center; font-size: 11px; color: #666; }
.footer p { margin: 0; line-height: 1.6; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<svg class="logo" viewBox="0 0 100 100">
<path d="M 15 25 Q 30 15 42 30 Q 38 48 22 52 Q 12 48 15 25" fill="#C8E700"/>
<rect x="48" y="32" width="35" height="35" fill="#003DA5" rx="2"/>
</svg>
<div class="header-text">
<h1>RAIFFEISEN</h1>
<p>BANQUE</p>
</div>
</div>
<div class="title">
<h2>AVIS DE VIREMENT</h2>
<p>Virement enregistr\u00e9 \u2014 En cours de traitement</p>
</div>
<div class="content">
<div class="amount-section">
<p class="amount-label">Montant</p>
<p class="amount-value">${amount.toFixed(2)} ${currency}</p>
</div>
<div class="details">
<div class="detail-row">
<span class="detail-label">B\u00e9n\u00e9ficiaire :</span>
<span class="detail-value">${beneficiaryName}</span>
</div>
<div class="detail-row">
<span class="detail-label">IBAN :</span>
<span class="detail-value monospace">${beneficiaryIban}</span>
</div>
<div class="detail-row">
<span class="detail-label">Donneur d'ordre :</span>
<span class="detail-value">${donorName}</span>
</div>
<div class="detail-row">
<span class="detail-label">Raison :</span>
<span class="detail-value">Virement</span>
</div>
<div class="detail-row">
<span class="detail-label">R\u00e9f\u00e9rence :</span>
<span class="detail-value monospace">${reference}</span>
</div>
<div class="detail-row">
<span class="detail-label">Date d'ex\u00e9cution :</span>
<span class="detail-value">${date}</span>
</div>
<div class="detail-row">
<span class="detail-label">Statut :</span>
<span class="detail-value" style="color: #C8E700; font-weight: 700;">\u2713 ${status}</span>
</div>
</div>
<div class="summary">
<div class="summary-row">
<span style="font-weight: 700; color: #003DA5;">Montant virement :</span>
<span>${amount.toFixed(2)} ${currency}</span>
</div>
<div class="summary-row">
<span style="font-weight: 700; color: #003DA5;">Frais :</span>
<span>0,00 ${currency}</span>
</div>
<div class="summary-total">
<span class="total-label">TOTAL :</span>
<span class="total-value">${amount.toFixed(2)} ${currency}</span>
</div>
</div>
</div>
<div class="footer">
<p><strong>S\u00e9curit\u00e9 :</strong> Raiffeisen ne vous demandera jamais vos identifiants par email.</p>
<p style="margin-top: 0.75rem;">Avis g\u00e9n\u00e9r\u00e9 automatiquement \u2014 Aucune signature requise</p>
<p style="margin-top: 0.5rem; color: #999;">Raiffeisen Bank \u2014 Service Op\u00e9rations Bancaires</p>
</div>
</div>
</body>
</html>`;
}
