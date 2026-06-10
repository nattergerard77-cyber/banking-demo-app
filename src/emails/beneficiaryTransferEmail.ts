export type BeneficiaryTransferEmailPayload = {
  beneficiaryName: string;
  amount: string;
  ordererName: string;
  executionDate: string;
  reference: string;
  beneficiaryIban?: string;
  reason?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildBeneficiaryTransferHtml(
  payload: BeneficiaryTransferEmailPayload,
): string {
  const beneficiaryName = escapeHtml(payload.beneficiaryName);
  const amount = escapeHtml(payload.amount);
  const ordererName = escapeHtml(payload.ordererName);
  const executionDate = escapeHtml(payload.executionDate);
  const reference = escapeHtml(payload.reference);
  const beneficiaryIban = payload.beneficiaryIban
    ? escapeHtml(payload.beneficiaryIban)
    : "";
  const reason = payload.reason ? escapeHtml(payload.reason) : "";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Avis de virement en votre faveur</title>
  </head>
  <body style="margin:0;background:#f3f6fb;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:#0b1f3a;color:#ffffff;padding:28px 32px;text-align:center;font-size:20px;font-weight:700;letter-spacing:1.5px;">
                RAIFFEISEN
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 10px;">
                <h1 style="margin:0;color:#0b1f3a;font-size:26px;line-height:1.25;font-weight:700;">
                  Avis de virement en votre faveur
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0;font-size:15px;line-height:1.7;color:#334155;">
                <p style="margin:0 0 16px;">Bonjour ${beneficiaryName},</p>
                <p style="margin:0 0 14px;">Nous vous informons qu’un virement a été initié en votre faveur.</p>
                <p style="margin:0 0 14px;">Cette opération a été enregistrée avec succès et se trouve actuellement en cours de traitement. Les délais de crédit peuvent varier selon les établissements bancaires impliqués et les contrôles habituels applicables aux opérations de paiement.</p>
                <p style="margin:0;">Vous trouverez en pièce jointe un avis de virement reprenant les détails de l’opération.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #d8e0ec;border-radius:14px;background:#f8fbff;overflow:hidden;">
                  <tr>
                    <td style="padding:18px 20px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">
                      Montant reçu
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 22px;color:#0b1f3a;font-size:32px;line-height:1.15;font-weight:700;">
                      ${amount}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                  <tr>
                    <td colspan="2" style="background:#f8fafc;padding:16px 20px;color:#0b1f3a;font-size:15px;font-weight:700;">
                      Récapitulatif de l’opération
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Montant reçu</td>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#0b1f3a;font-size:14px;font-weight:700;text-align:right;">${amount}</td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Donneur d’ordre</td>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${ordererName}</td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Date d’exécution prévue</td>
                    <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${executionDate}</td>
                  </tr>
                   <tr>
                     <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Référence</td>
                     <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${reference}</td>
                   </tr>
                  ${beneficiaryIban ? `
                    <tr>
                      <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">IBAN bénéficiaire</td>
                      <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${beneficiaryIban}</td>
                    </tr>
                  ` : ""}
                  ${reason ? `
                    <tr>
                      <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Motif</td>
                      <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#1f2937;font-size:14px;font-weight:600;text-align:right;">${reason}</td>
                    </tr>
                  ` : ""}
                   <tr>
                     <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#64748b;font-size:14px;">Statut</td>
                     <td style="border-top:1px solid #e2e8f0;padding:13px 20px;color:#0b1f3a;font-size:14px;font-weight:700;text-align:right;">Virement en cours de traitement</td>
                   </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 18px;font-size:15px;line-height:1.7;color:#334155;">
                <p style="margin:0;">Aucune action n’est requise de votre part à ce stade.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #d8e0ec;border-radius:12px;background:#f8fafc;">
                  <tr>
                    <td style="padding:16px 18px;color:#475569;font-size:13px;line-height:1.6;">
                      Par mesure de sécurité, nous ne vous demanderons jamais de communiquer vos identifiants, mots de passe ou codes confidentiels par email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 34px;font-size:15px;line-height:1.7;color:#334155;">
                <p style="margin:0 0 4px;">Cordialement,</p>
                <p style="margin:0;">Service Opérations<br />Raiffeisen</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 32px;color:#64748b;font-size:13px;">
                Service Opérations — Raiffeisen
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
