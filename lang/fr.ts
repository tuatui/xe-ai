import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "Chat",
    setting: "Paramètres",
    module: "Module",
    name: "Nom",
    edit: "Éditer",
    cancel: "Annuler",
    submit: "Soumettre",
  },
  chat: {
    new: "Nouveau chat",
    untitled: "Sans titre",
    send: "Envoyer",
    inputTips: "Entrez votre question ici",
  },
  setting: {
    defaultModule: "Défaut",
    setDefault: "Par défaut",
    editModule: {
      press: "Appuyez sur",
      enter: "Entrée",
      toAdd: "pour créer un nouveau",
      noData:
        "Aucune donnée disponible. Veuillez essayer de récupérer des données ou d'en ajouter manuellement.",
      fetch: "Récupérer le modèle",
    },
  },
  module: {
    config: "Configurer le module",
    secretKey: "Clé secrète",
  },
} as I18nLang;
