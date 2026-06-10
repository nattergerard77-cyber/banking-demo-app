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

function maskIban(iban: string): string {
  const c = iban.replace(/\s+/g, "");
  if (c.length < 10) return iban;
  return `${c.slice(0, 4)} **** **** ${c.slice(-4)}`;
}

export function buildBeneficiaryTransferText(
  payload: BeneficiaryTransferEmailPayload,
): string {
  const beneficiaryName = payload.beneficiaryName;
  const amount = payload.amount;
  const ordererName = payload.ordererName;
  const executionDate = payload.executionDate;
  const reference = payload.reference;
  const reason = payload.reason;

  const lines = [
    "AVIS DE VIREMENT",
    "",
    `Bonjour ${beneficiaryName},`,
    "",
    "Un virement a ete emis en votre faveur.",
    "",
    `Montant : ${amount}`,
    `Reference : ${reference}`,
    `Date d'execution prevue : ${executionDate}`,
    `Donneur d'ordre : ${ordererName}`,
  ];

  if (reason) {
    lines.push(`Motif : ${reason}`);
  }

  lines.push(
    "",
    "Le justificatif detaille est joint a cet email au format PDF.",
    "",
    "Aucune action n'est requise de votre part.",
    "",
    "Cordialement,",
    "Service Operations Raiffeisen",
    "",
    "---",
    "Cet email a ete genere automatiquement. Merci de ne pas y repondre.",
    "Besoin d'aide ? Contactez le support a l'adresse indiquee par votre banque.",
  );

  return lines.join("\n");
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
    ? maskIban(escapeHtml(payload.beneficiaryIban))
    : "";
  const reason = payload.reason ? escapeHtml(payload.reason) : "";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Avis de virement en votre faveur</title>
    <style>
      @media (max-width: 600px) {
        .container { max-width: 100% !important; width: 100% !important; }
        .header-cell { padding: 24px 16px !important; }
        .content-cell { padding: 20px 16px !important; }
        .amount-text { font-size: 32px !important; }
        .card-inner { padding: 14px !important; }
        .card-row { flex-direction: column !important; gap: 6px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .body-bg { background-color: #0f172a !important; }
        .card-bg { background-color: #1e293b !important; }
        .card-text { color: #f1f5f9 !important; }
        .card-muted { color: #cbd5e1 !important; }
        .card-border { border-color: #334155 !important; }
        .content-bg { background-color: #0f172a !important; }
        .security-bg { background-color: #422006 !important; border-color: #d97706 !important; }
        .security-text { color: #fbbf24 !important; }
        .footer-bg { background-color: #1e293b !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#f3f6fb;color:#1f2937;font-family:Arial,Helvetica,sans-serif;" class="body-bg">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 16px;" class="body-bg">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);" class="container card-bg">
            <tr>
              <td style="background:linear-gradient(135deg,#0b1f3a,#1a3a52);padding:40px 32px;text-align:center;" class="header-cell">
                <div style="font-size:24px;font-weight:700;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">RAIFFEISEN</div>
                <div style="margin-top:20px;height:2px;width:60px;background:#d4af37;margin-left:auto;margin-right:auto;"></div>
                <div style="margin-top:16px;font-size:14px;font-weight:400;color:#94a3b8;letter-spacing:0.5px;">Service Opérations Bancaires</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:16px;background:#f0f4f9;border-radius:10px;border-left:4px solid #7aa600;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="70" valign="top" style="font-size:11px;font-weight:700;color:#7aa600;text-transform:uppercase;letter-spacing:0.5px;">CONFIRMÉ</td>
                          <td style="font-size:14px;line-height:1.6;color:#334155;">
                            Un virement en votre faveur a été <strong>enregistré avec succès</strong> et est actuellement en cours de traitement.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 4px;font-size:15px;line-height:1.7;color:#334155;" class="content-cell card-text">
                <p style="margin:0 0 4px;font-weight:700;color:#0b1f3a;font-size:16px;">Bonjour ${beneficiaryName},</p>
                <p style="margin:12px 0 0;color:#475569;" class="card-muted">Un virement en votre faveur a été enregistré avec succès. Cette opération est actuellement en cours de traitement et s'affichera sur votre compte dans les délais habituels.</p>
                <p style="margin:12px 0 0;color:#475569;" class="card-muted">Consultez ci-dessous les détails de ce virement pour référence.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 14px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);" class="card-border">
                  <tr>
                    <td width="12" style="background:#7aa600;width:12px;padding:0;font-size:1px;line-height:1px;">&nbsp;</td>
                    <td style="padding:24px 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:6px;">Montant reçu</td>
                        </tr>
                        <tr>
                          <td style="font-size:42px;font-weight:700;color:#0b1f3a;line-height:1.1;padding-bottom:4px;" class="amount-text card-text">${amount}</td>
                        </tr>
                        <tr>
                          <td style="font-size:12px;color:#94a3b8;">Devise : EUR</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 14px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#ffffff;" class="card-border card-bg">
                  <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;font-weight:700;color:#0b1f3a;" class="card-border">
                      Informations du bénéficiaire
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="40%" style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;" class="card-muted">Bénéficiaire</td>
                          <td width="60%" style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;" class="card-text">${beneficiaryName}</td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-muted card-border">IBAN bénéficiaire</td>
                          <td style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;font-family:monospace;border-top:1px solid #f1f5f9;" class="card-text card-border">${beneficiaryIban || "-"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 14px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#ffffff;" class="card-border card-bg">
                  <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;font-weight:700;color:#0b1f3a;" class="card-border">
                      Informations du donneur d'ordre
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="40%" style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;" class="card-muted">Donneur d'ordre</td>
                          <td width="60%" style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;" class="card-text">${ordererName}</td>
                        </tr>
                        ${reason ? `
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-muted card-border">Raison</td>
                          <td style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-text card-border">${reason}</td>
                        </tr>` : ""}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 14px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#ffffff;" class="card-border card-bg">
                  <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;font-weight:700;color:#0b1f3a;" class="card-border">
                      Informations opération
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="40%" style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;" class="card-muted">Référence</td>
                          <td width="60%" style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;font-family:monospace;" class="card-text">${reference}</td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-muted card-border">Date d'exécution prévue</td>
                          <td style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-text card-border">${executionDate}</td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-muted card-border">Statut</td>
                          <td style="font-size:14px;color:#7aa600;font-weight:700;text-align:right;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-border">Virement en cours de traitement</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 20px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#ffffff;" class="card-border card-bg">
                  <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:14px;font-weight:700;color:#0b1f3a;" class="card-border">
                      Montants
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="40%" style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;" class="card-muted">Montant virement</td>
                          <td width="60%" style="font-size:14px;color:#0b1f3a;font-weight:600;text-align:right;padding:6px 0;" class="card-text">${amount}</td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-muted card-border">Frais</td>
                          <td style="font-size:14px;color:#7aa600;font-weight:600;text-align:right;padding:6px 0;border-top:1px solid #f1f5f9;" class="card-border">0,00 EUR</td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#64748b;vertical-align:top;padding:8px 0;border-top:2px solid #e2e8f0;" class="card-muted card-border">Total</td>
                          <td style="font-size:16px;color:#0b1f3a;font-weight:700;text-align:right;padding:8px 0;border-top:2px solid #e2e8f0;" class="card-text card-border">${amount}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 4px;font-size:14px;line-height:1.6;color:#475569;" class="content-cell card-muted">
                <p style="margin:0;">Aucune action n'est requise de votre part à ce stade. Vous trouverez en pièce jointe un avis de virement reprenant l'ensemble des détails de l'opération.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;" class="content-cell">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                  <tr>
                    <td style="padding:14px;font-size:13px;line-height:1.5;color:#64748b;">
                      Pour votre sécurité, vérifiez toujours l'origine des messages reçus et contactez le support en cas de doute.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;font-size:14px;line-height:1.7;color:#475569;" class="content-cell card-muted">
                <p style="margin:0 0 8px;font-weight:700;color:#0b1f3a;" class="card-text">Cordialement,</p>
                <p style="margin:0 0 2px;">Service Opérations Raiffeisen</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;" class="footer-bg card-border">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:12px;color:#94a3b8;line-height:1.6;">
                      <p style="margin:0 0 4px;">Raiffeisen Bank — Service Opérations Bancaires</p>
                      <p style="margin:0 0 4px;">Cet email a été généré automatiquement. Merci de ne pas y répondre.</p>
                      <p style="margin:0;">Besoin d'aide ? Contactez notre support : <a href="mailto:support@raiffeisen.com" style="color:#7aa600;text-decoration:underline;">support@raiffeisen.com</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;font-size:11px;color:#cbd5e1;border-top:1px solid #e2e8f0;margin-top:12px;">
                      © 2026 Raiffeisen. Tous droits réservés.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
