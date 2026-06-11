# Guide de Délivrabilité Email

## Vérification SPF/DKIM/DMARC

Utiliser ces outils gratuits pour tester :

### 1. MXToolbox (https://mxtoolbox.com)

```
Recherche : raiffeisne-lu.xyz
Vérifie : SPF, DKIM, DMARC, MX records
```

### 2. Mail-tester (https://www.mail-tester.com)

```
1. Aller sur https://www.mail-tester.com
2. Copier l'adresse email générée
3. Envoyer un virement test depuis l'app
4. Vérifier le score (viser 8+/10)
5. Lire les recommandations
```

### 3. MailGenius (https://www.mailgenius.com)

```
Teste aussi le contenu HTML et le spam score
```

## Checklist SPF/DKIM/DMARC

- [ ] SPF record configuré sur Namecheap
- [ ] DKIM record configuré (clé depuis PrivateEmail)
- [ ] DMARC record configuré
- [ ] TTL attendu (3-24h pour la propagation DNS)
- [ ] Vérifier avec MXToolbox
- [ ] Envoyer un email de test à mail-tester.com
- [ ] Score > 8/10

## Troubleshooting

### Les emails vont toujours en spam ?

1. Vérifier que les records DNS sont propagés (wait 24h)
2. Vérifier avec MXToolbox que SPF/DKIM/DMARC passent
3. Tester avec Mail-tester pour spam score
4. Vérifier que l'email a un List-Unsubscribe header
5. Envisager Resend ou SendGrid pour meilleure réputation
6. Ajouter un lien "Voir dans le navigateur" dans le template HTML (optionnel mais recommandé par les filtres Gmail/Outlook)

### DKIM fail ?

- Vérifier que la clé DKIM de PrivateEmail est correctement copiée
- Pas d'espaces extra ou caractères cassés
- Le sélecteur doit correspondre exactement (généralement `default._domainkey`)

### SPF fail ?

- Vérifier que `mail.privateemail.com` est inclus correctement
- Format : `v=spf1 include:mail.privateemail.com ~all`
- Attention à la limite de 10 lookups DNS pour SPF

### DMARC fail ?

- Vérifier le format : `v=DMARC1; p=quarantine; rua=mailto:noreply@raiffeisne-lu.xyz`
- Commencer par `p=none` en test, puis `p=quarantine`, puis `p=reject`

## Configurations DNS Namecheap

| Type | Host | Value | TTL |
|---|---|---|---|
| TXT | @ | `v=spf1 include:mail.privateemail.com ~all` | 3600 |
| TXT | default._domainkey | (clé DKIM depuis PrivateEmail) | 3600 |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:noreply@raiffeisne-lu.xyz; ruf=mailto:noreply@raiffeisne-lu.xyz; fo=1` | 3600 |

## Améliorations futures possibles

- Ajouter un lien "Voir dans le navigateur" dans l'email HTML (nécessite une route API dédiée)
- Passer à un service transactionnel (Resend, SendGrid, AWS SES) si PrivateEmail ne suffit pas
- Ajouter un webhook de retour de bounce pour tracker les rejets
- Configurer un sous-domaine dédié (mail.raiffeisne-lu.xyz) pour isoler la réputation d'envoi
