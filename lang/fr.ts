import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "Discussion",
    setting: "Paramètres",
    module: "Module",
    model: "Modèle",
    name: "Nom",
    edit: "Éditer",
    cancel: "Annuler",
    submit: "Soumettre",
    allModules: "Tous les Modules",
    allModels: "Tous les Modèles",
    update: "Mettre à jour",
    delete: "Supprimer",
    create: "Créer",
    moreOptions: "Plus d'options",
    close: "Fermer",
    language: "Langue",
    notEnoughSpace: "Pas assez d'espace",
  },
  aria: {
    sideNav: "Navigation Latérale",
    chatHistory: "Historique des Discussions",
  },
  chat: {
    stop: "Arrêter la Discussion",
    splitRight: "Séparer la Discussion à Droite",
    splitDown: "Séparer la Discussion en Bas",
    download: "Télécharger la Discussion Actuelle",
    new: "Nouvelle Discussion",
    untitled: "Sans Titre",
    send: "Envoyer",
    inputTips: "Entrez votre question ici",
    scrollToBottom: "Défiler vers le bas",
  },
  setting: {
    apiUrl: "URL du Fournisseur de Services",
    noBotTitle: "Rien ici",
    botShowArea: "Après avoir ajouté un modèle, il sera affiché ici",
    switchTheme: "Changer de Thème Clair/Foncé",
    defaultModule: "Modèle par Défaut",
    setDefault: "Définir par Défaut",
    addModel: "Ajouter un Modèle",
    editModule: {
      press: "Appuyer sur",
      enter: "Entrer",
      toAdd: "pour en créer un nouveau",
      noData:
        "Aucune donnée disponible. Essayez de récupérer des données ou d'en ajouter manuellement.",
      fetch: "Récupérer le Modèle",
    },
  },
  module: {
    config: "Configurer le Module",
    secretKey: "Clé Secrète",
  },
} as I18nLang;
