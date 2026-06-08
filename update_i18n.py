import json
import os
import re

FR_PATH = "src/i18n/fr.ts"
EN_PATH = "src/i18n/en.ts"

fr_content = """export default {
  common: {
    today: "Aujourd'hui",
    yesterday: "Hier",
    pdf: "PDF",
    seeAll: "Voir tout",
    monthMay: "Mai 2024",
    monthApril: "Avril 2024",
    monthMarch: "Mars 2024",
    close: "Fermer",
    back: "Retour",
    validate: "Valider",
    continueBtn: "Continuer",
    enable: "Activer",
    disable: "Désactiver",
    save: "Enregistrer",
    cancel: "Annuler",
    amount: "Montant",
    reason: "Motif",
    date: "Date",
    status: "Statut",
    reference: "Référence",
    type: "Type",
    bank: "Banque"
  },
  accounts: {
    title: "Mes comptes",
    subtitle: "Consultez vos soldes et vos dernières opérations.",
    availableBalance: "Solde disponible",
    inflows: "Encaissements",
    outflows: "Décaissements",
    netBalance: "Solde net",
    variation: "Variation",
    current: "Compte courant",
    savings: "Compte épargne",
    joint: "Compte joint",
    history: "Historique des opérations",
    statements: "Relevés de compte",
    allStatements: "Voir tous les relevés",
    details: "Détails du compte"
  },
  transactions: {
    received: "Virement reçu",
    sent: "Virement émis",
    salary: "Salaire",
    groceries: "Courses",
    transfers: "Transferts",
    bills: "Factures",
    health: "Santé",
    salaryLabel: "Salaire — Entreprise SA",
    supermarketLabel: "Supermarché Auchan",
    transferToJulie: "Virement à Julie Dupont",
    electricity: "Électricité de Luxembourg",
    healthRefund: "Remboursement mutuelle",
    restaurant: "Remboursement restaurant",
    gift: "Participation cadeau",
    invoice: "Facture prestation",
    executed: "Exécuté",
    planned: "Planifié"
  },
  transfers: {
    title: "Virements",
    newBeneficiary: "Nouveau bénéficiaire",
    directTransfer: "Virement direct",
    debitAccount: "Compte à débiter",
    recurring: "Virement récurrent",
    beneficiary: "Bénéficiaire",
    recent: "Virements récents",
    tempRef: "Référence provisoire",
    successMsg: "Virement effectué avec succès.",
    downloadReceipt: "Télécharger le reçu",
    chooseAccount: "Choisir le compte à débiter",
    types: {
      instant: "Virement immédiat",
      instantDesc: "Exécution rapide",
      scheduled: "Virement différé",
      scheduledDesc: "Exécution à une date choisie",
      permanent: "Virement permanent",
      permanentDesc: "Répétition automatique"
    }
  },
  cards: {
    title: "Mes cartes",
    subtitle: "Gérez vos plafonds et options de sécurité.",
    freeze: "Verrouiller",
    unfreeze: "Déverrouiller",
    limits: "Plafonds",
    pin: "Code PIN",
    details: "Détails",
    online: "Paiements en ligne",
    abroad: "Paiements à l'étranger",
    contactless: "Sans contact",
    replace: "Remplacer la carte"
  },
  savings: {
    title: "Mon épargne",
    subtitle: "Suivez l'évolution de vos projets.",
    goals: "Mes objectifs",
    newGoal: "Nouveau projet",
    vacations: "Vacances été 2024",
    car: "Nouvelle voiture",
    tax: "Impôts",
    deadline: "Échéance",
    reached: "Atteint",
    addMoney: "Alimenter"
  },
  beneficiaries: {
    title: "Bénéficiaires",
    subtitle: "Gérez vos contacts pour vos virements.",
    add: "Ajouter un bénéficiaire",
    search: "Rechercher...",
    particulier: "Particulier",
    professionnel: "Professionnel"
  },
  messages: {
    title: "Messagerie",
    subtitle: "Échangez avec votre conseiller.",
    newMessage: "Nouveau message",
    advisor: "Votre conseiller",
    advisorName: "Thomas Leroy"
  },
  notifications: {
    title: "Notifications",
    subtitle: "Vos alertes et informations récentes.",
    markAllRead: "Tout marquer comme lu",
    authSuccess: "Authentification réussie",
    authDesc: "Connexion depuis un nouvel appareil",
    transferReceived: "Nouveau virement reçu",
    transferDesc: "Vous avez reçu un virement de Jean Martin"
  },
  settings: {
    title: "Paramètres",
    subtitle: "Configurez votre application.",
    profile: "Profil",
    security: "Sécurité",
    notifications: "Préférences de notifications",
    language: "Langue",
    theme: "Thème",
    logout: "Se déconnecter",
    about: "À propos",
    help: "Aide & Contact",
    version: "Version"
  },
  dashboard: {
    title: "Bonjour Marie,",
    subtitle: "Voici un aperçu de vos comptes et de votre activité.",
    lastLogin: "Dernière connexion : aujourd’hui à 09:15",
    totalBalance: "Solde total de vos comptes",
    encours: "Encours à date",
    currentAccount: "Compte courant",
    savingsAccount: "Compte épargne",
    available: "Disponible",
    balanceEvolution: "Évolution du solde",
    last30Days: "(30 derniers jours)",
    quickActions: "Actions rapides",
    quickActionTransfer: "Virement",
    quickActionAddBeneficiary: "Ajouter un bénéficiaire",
    quickActionDownloadRIB: "Télécharger mon RIB",
    latestOperations: "Dernières opérations",
    seeAll: "Voir toutes",
    savingsGoal: "Objectif d’épargne",
    vacations: "Vacances été 2024",
    deadline: "Échéance : 31 juillet 2024",
    manageGoals: "Gérer mes objectifs",
    notifications: "Notifications",
    markAllRead: "Tout marquer comme lu",
    authSuccess: "Authentification réussie",
    authSuccessTime: "il y a 2 h",
    authSuccessDesc1: "Connexion depuis un nouvel appareil",
    authSuccessDesc2: "Chrome sur Windows — Luxembourg",
    seeAllNotifications: "Voir toutes les notifications",
    operations: {
      transferReceived: "Virement reçu",
      salary: "Salaire — Entreprise SA",
      cardPayment: "Paiement carte",
      supermarket: "Supermarché Auchan",
      transferSent: "Virement émis",
      rent: "Loyer — Mai 2024",
      gasStation: "Station Total",
      healthInsurance: "Remboursement mutuelle"
    },
    mobile: {
      totalBalance: "Solde total",
      allAccounts: "Tous comptes confondus",
      jointAccount: "Compte joint",
      cards: "Cartes",
      savings: "Épargne",
      statements: "Relevés",
      latestTransactions: "Dernières transactions",
      seeAll: "Voir tout",
      carrefour: "Carrefour Bertrange",
      luxair: "Luxair",
      salary: "Salaire",
      projectSavings: "Mon épargne projet",
      newFeature: "Nouvelle fonctionnalité disponible",
      newFeatureDesc: "Activez les notifications pour suivre vos opérations en temps réel."
    },
    topbar: {
      searchPlaceholder: "Rechercher une opération, un bénéficiaire...",
      clientSince: "Client depuis 2021",
      profile: "Profil"
    },
    sidebar: {
      nav: {
        'dashboard': 'Tableau de bord',
        'comptes': 'Comptes',
        'virements': 'Virements',
        'cartes': 'Cartes',
        'epargne': 'Épargne',
        'beneficiaires': 'Bénéficiaires',
        'messagerie': 'Messagerie',
        'notifications': 'Notifications',
        'parametres': 'Paramètres'
      },
      help: {
        title: "Besoin d'aide ?",
        subtitle: "Contactez notre helpdesk"
      }
    }
  }
};
"""

en_content = """export default {
  common: {
    today: "Today",
    yesterday: "Yesterday",
    pdf: "PDF",
    seeAll: "See all",
    monthMay: "May 2024",
    monthApril: "April 2024",
    monthMarch: "March 2024",
    close: "Close",
    back: "Back",
    validate: "Validate",
    continueBtn: "Continue",
    enable: "Enable",
    disable: "Disable",
    save: "Save",
    cancel: "Cancel",
    amount: "Amount",
    reason: "Reason",
    date: "Date",
    status: "Status",
    reference: "Reference",
    type: "Type",
    bank: "Bank"
  },
  accounts: {
    title: "My accounts",
    subtitle: "Check your balances and latest operations.",
    availableBalance: "Available balance",
    inflows: "Inflows",
    outflows: "Outflows",
    netBalance: "Net balance",
    variation: "Variation",
    current: "Current account",
    savings: "Savings account",
    joint: "Joint account",
    history: "Operations history",
    statements: "Account statements",
    allStatements: "See all statements",
    details: "Account details"
  },
  transactions: {
    received: "Transfer received",
    sent: "Transfer sent",
    salary: "Salary",
    groceries: "Groceries",
    transfers: "Transfers",
    bills: "Bills",
    health: "Health",
    salaryLabel: "Salary — Company SA",
    supermarketLabel: "Supermarket Auchan",
    transferToJulie: "Transfer to Julie Dupont",
    electricity: "Electricity of Luxembourg",
    healthRefund: "Health insurance refund",
    restaurant: "Restaurant refund",
    gift: "Gift participation",
    invoice: "Service invoice",
    executed: "Executed",
    planned: "Planned"
  },
  transfers: {
    title: "Transfers",
    newBeneficiary: "New beneficiary",
    directTransfer: "Direct transfer",
    debitAccount: "Debit account",
    recurring: "Recurring transfer",
    beneficiary: "Beneficiary",
    recent: "Recent transfers",
    tempRef: "Temporary reference",
    successMsg: "Transfer successfully completed.",
    downloadReceipt: "Download receipt",
    chooseAccount: "Choose account to debit",
    types: {
      instant: "Instant transfer",
      instantDesc: "Fast execution",
      scheduled: "Scheduled transfer",
      scheduledDesc: "Execution at a chosen date",
      permanent: "Standing order",
      permanentDesc: "Automatic repetition"
    }
  },
  cards: {
    title: "My cards",
    subtitle: "Manage your limits and security options.",
    freeze: "Freeze",
    unfreeze: "Unfreeze",
    limits: "Limits",
    pin: "PIN Code",
    details: "Details",
    online: "Online payments",
    abroad: "Payments abroad",
    contactless: "Contactless",
    replace: "Replace card"
  },
  savings: {
    title: "My savings",
    subtitle: "Track your projects' progress.",
    goals: "My goals",
    newGoal: "New goal",
    vacations: "Summer 2024 Vacations",
    car: "New car",
    tax: "Taxes",
    deadline: "Deadline",
    reached: "Reached",
    addMoney: "Add money"
  },
  beneficiaries: {
    title: "Beneficiaries",
    subtitle: "Manage your contacts for transfers.",
    add: "Add beneficiary",
    search: "Search...",
    particulier: "Individual",
    professionnel: "Business"
  },
  messages: {
    title: "Messages",
    subtitle: "Chat with your advisor.",
    newMessage: "New message",
    advisor: "Your advisor",
    advisorName: "Thomas Leroy"
  },
  notifications: {
    title: "Notifications",
    subtitle: "Your alerts and recent info.",
    markAllRead: "Mark all as read",
    authSuccess: "Authentication successful",
    authDesc: "Login from a new device",
    transferReceived: "New transfer received",
    transferDesc: "You received a transfer from Jean Martin"
  },
  settings: {
    title: "Settings",
    subtitle: "Configure your application.",
    profile: "Profile",
    security: "Security",
    notifications: "Notification preferences",
    language: "Language",
    theme: "Theme",
    logout: "Log out",
    about: "About",
    help: "Help & Contact",
    version: "Version"
  },
  dashboard: {
    title: "Good morning Marie,",
    subtitle: "Here is an overview of your accounts and activity.",
    lastLogin: "Last login: today at 09:15",
    totalBalance: "Total balance of your accounts",
    encours: "Outstanding balance",
    currentAccount: "Current account",
    savingsAccount: "Savings account",
    available: "Available",
    balanceEvolution: "Balance evolution",
    last30Days: "(last 30 days)",
    quickActions: "Quick actions",
    quickActionTransfer: "Transfer",
    quickActionAddBeneficiary: "Add a beneficiary",
    quickActionDownloadRIB: "Download my details",
    latestOperations: "Latest operations",
    seeAll: "See all",
    savingsGoal: "Savings goal",
    vacations: "Summer 2024 holidays",
    deadline: "Deadline: July 31, 2024",
    manageGoals: "Manage my goals",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    authSuccess: "Authentication successful",
    authSuccessTime: "2 hours ago",
    authSuccessDesc1: "Login from a new device",
    authSuccessDesc2: "Chrome on Windows — Luxembourg",
    seeAllNotifications: "See all notifications",
    operations: {
      transferReceived: "Transfer received",
      salary: "Salary — Company SA",
      cardPayment: "Card payment",
      supermarket: "Supermarket Auchan",
      transferSent: "Transfer sent",
      rent: "Rent — May 2024",
      gasStation: "Total Station",
      healthInsurance: "Health insurance refund"
    },
    mobile: {
      totalBalance: "Total balance",
      allAccounts: "All accounts included",
      jointAccount: "Joint account",
      cards: "Cards",
      savings: "Savings",
      statements: "Statements",
      latestTransactions: "Latest transactions",
      seeAll: "See all",
      carrefour: "Carrefour Bertrange",
      luxair: "Luxair",
      salary: "Salary",
      projectSavings: "My project savings",
      newFeature: "New feature available",
      newFeatureDesc: "Enable notifications to track your operations in real time."
    },
    topbar: {
      searchPlaceholder: "Search for a transaction, a beneficiary...",
      clientSince: "Client since 2021",
      profile: "Profile"
    },
    sidebar: {
      nav: {
        'dashboard': 'Dashboard',
        'comptes': 'Accounts',
        'virements': 'Transfers',
        'cartes': 'Cards',
        'epargne': 'Savings',
        'beneficiaires': 'Beneficiaries',
        'messagerie': 'Messages',
        'notifications': 'Notifications',
        'parametres': 'Settings'
      },
      help: {
        title: "Need help?",
        subtitle: "Contact our helpdesk"
      }
    }
  }
};
"""

with open(FR_PATH, "w", encoding="utf-8") as f:
    f.write(fr_content)
    
with open(EN_PATH, "w", encoding="utf-8") as f:
    f.write(en_content)
    
print("Updated i18n files")
