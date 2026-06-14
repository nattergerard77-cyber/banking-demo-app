import { createServerSupabaseClient } from "./supabase/server";
import { sendEmail } from "./emailClient";

export async function rejectTransfersAfter2Days() {
  const supabase = createServerSupabaseClient();

  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: transfers, error } = await supabase
      .from("transfers")
      .select("id, amount, currency, created_at, reference, beneficiary_name, beneficiary_email, status")
      .eq("status", "processing")
      .lt("created_at", twoDaysAgo.toISOString())
      .is("rejected_at", null);

    if (error) throw error;

    console.log(`[REJECT] Traitement de ${transfers?.length || 0} virements à rejeter`);

    for (const transfer of transfers || []) {
      try {
        const { error: updateError } = await supabase
          .from("transfers")
          .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
          })
          .eq("id", transfer.id);

        if (updateError) {
          console.error(`[REJECT] Erreur rejet virement ${transfer.id}:`, updateError);
          continue;
        }

        console.log(`[REJECT] Virement ${transfer.id} marqué comme rejeté`);

        const emissionDate = new Date(transfer.created_at).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const recipientEmail = transfer.beneficiary_email;

        if (!recipientEmail) {
          console.warn(`[REJECT] Pas d'email pour le bénéficiaire du virement ${transfer.id}`);
          continue;
        }

        await sendEmail({
          to: recipientEmail,
          subject: "Notification — Virement rejeté",
          html: `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 2rem; }
h2 { color: #003DA5; font-weight: 700; font-size: 18px; margin: 1rem 0; }
hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
.footer { font-size: 12px; color: #666; }
.security-note { font-size: 11px; color: #999; margin-top: 1rem; }
</style>
</head>
<body>
<div class="container">
<p>Madame, Monsieur,</p>
<br/>
<h2>VIREMENT REJET\u00c9</h2>
<p>Votre virement de <strong>${Number(transfer.amount).toFixed(2)} ${transfer.currency}</strong>
\u00e9mis le <strong>${emissionDate}</strong> a \u00e9t\u00e9 rejet\u00e9 lors du traitement.</p>
<p>Une anomalie a \u00e9t\u00e9 d\u00e9tect\u00e9e au cours de l'op\u00e9ration.</p>
<br/>
<p>Pour relancer ce virement, veuillez contacter l'exp\u00e9diteur afin qu'il
v\u00e9rifie les informations et r\u00e9it\u00e8re l'op\u00e9ration.</p>
<br/>
<hr/>
<p class="footer">
Raiffeisen<br/>
Service Op\u00e9rations Bancaires<br/>
support@raiffeisen-lu.com
</p>
<p class="security-note">
Par mesure de s\u00e9curit\u00e9, Raiffeisen ne vous demandera jamais vos
identifiants ou codes de s\u00e9curit\u00e9 par email.
</p>
</div>
</body>
</html>`,
        });

        console.log(`[REJECT] Email rejet envoyé pour virement ${transfer.id} à ${recipientEmail}`);
      } catch (transferError) {
        console.error(`[REJECT] Erreur traitement virement ${transfer.id}:`, transferError);
      }
    }

    return {
      success: true,
      processed: transfers?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[REJECT] Erreur rejection transfers:", error);
    throw error;
  }
}
