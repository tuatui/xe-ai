import type { BaseLang } from "./primary";

export default {
  common: {
    chat: "Chat",
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
    notEnoughSpace: "Espace insuffisant",
    password: "Mot de passe",
    account: "Compte",
    login: "Connexion",
    logout: "Déconnexion",
    repeatPwd: "Répéter le mot de passe",
    back: "Retour",
    register: "S'inscrire",
    low: "Bas",
    middle: "Moyen",
    hight: "Élevé",
    strength: "Force",
    revocation: "Révocation",
    notSelected: "Non sélectionné",
    save: "Sauvegarder",
    layouts: "Dispositions",
    use: "Utiliser",
    copy: "Copier",
    options: "Options",
    lineBreak: "Saut de ligne",
    about: "À propos",
    input: "Entrée",
    enable: "Activer",
    disable: "Désactiver",
    retry: "Réessayer",
  },
  action: {
    deleteSome: (item) => `Supprimé "${item}"`,
    ask: (name) => `Demander à ${name || "AI"}`,
  },
  aria: {
    sideNav: "Navigation latérale",
    chatHistory: "Historique des chats",
  },
  chat: {
    collapse: "Réduire l'entrée",
    setting: "Paramètres de chat",
    stop: "Arrêter le chat",
    splitRight: "Diviser à droite",
    splitDown: "Diviser en bas",
    download: "Télécharger le chat",
    new: "Nouveau chat",
    untitled: "Sans titre",
    send: "Envoyer",
    inputTips: "Tapez votre question ici",
    scrollToBottom: "Défiler vers le bas",
    memo: "Mémoire de conversation",
    prompt: "Mot-clé",
    noVerLimit: "Pas de limite sur la largeur du contenu",
    verLimit: "Limite de la largeur du contenu",
    reasoningDetail: [
      "Raisonnement en cours...",
      "Voir le brouillon",
      "Masquer le brouillon",
    ],
    role: "Rôle",
    reasoningContent: "Contenu de raisonnement",
    content: "Contenu",
    noMarkdownRender: "Désactiver la syntaxe Markdown",
    toolCallWith: (name) => `Appel d'outil : ${name}`,
    noWrap: "Pas de retour",
    wrap: "Envelopper",
    raw: "Contenu brut",
  },
  tools: {
    js: {
      runTimeLimit: (s) => `Limite de temps d'exécution : ${s} secondes`,
    },
  },
  setting: {
    apiUrl: "Adresse du fournisseur",
    noBotTitle: "Aucun modèle",
    botShowArea: "Les modèles s'afficheront ici après ajout",
    switchTheme: "Basculer entre thème clair/sombre",
    defaultModule: "Modèle par défaut",
    setDefault: "Définir par défaut",
    addModel: "Ajouter un nouveau modèle",
    useDefault: "Utiliser l'invite par défaut",
    noPrompt: "Aucune invite",
    custom: "Personnalisé",
    showSysCtx: "Afficher l'invite dans le chat",
    useSysCtxEveryTime: "Utiliser l'invite à chaque tour",
    round: "Tour",
    editModule: {
      press: "Appuyez",
      enter: "Entrer",
      toAdd: "pour créer un nouveau",
      noData: "Pas de données, essayez de récupérer ou de créer manuellement",
      fetch: "Récupérer modèle",
      preferredModel: "Modèle préféré",
    },
    botGroup: "Groupe de Modèles",
    exSessionConf: "Configuration supplémentaire (JSON)",
    exSessionConfDocs: "Voir documentation",
    topic: {
      title: "Paramètres du sujet",
      tip: "Les modifications ici affectent uniquement le sujet actuel",
    },
    user: "Utilisateur",
    layouts: {
      name: "Sélection de disposition",
      all: "Toutes les dispositions",
      new: "Nouvelle disposition",
      empTitle: "Pas de dispositions",
      dataShowArea: "S'affichera ici après ajout d'une disposition",
      setAsDefault: "Définir par défaut",
      memo: "Se souvenir de la disposition à la fermeture",
    },
    shortcut: {
      sendImm:
        "Avez-vous appuyé sur Entrée pour envoyer la conversation immédiatement?",
      send: "Méthode d'envoi",
    },
    mdInput:
      "Activer la syntaxe MARKDOWN complète pour le contenu que vous saisissez",
  },
  model: {
    config: "Configurer le modèle",
    secretKey: "Clé secrète",
    provider: "Fournisseur de modèles",
  },
  tips: {
    newChatLong: "Nouvelle",
    collapseMenu: "Réduire le menu",
    expandMenu: "Étendre le menu",
    loginFail: "Échec de connexion, mauvais compte ou mot de passe",
    hidePwd: "Afficher/Cacher mot de passe",
    loginAndSync:
      "Après connexion, vos modèles et clés seront synchronisés automatiquement. Les clés sont chiffrées avant le téléchargement.",
    regAndSync:
      "Après inscription, modèles et clés sont synchronisés automatiquement. Les clés sont chiffrées avant le téléchargement.",
    syncTmpChatLabel: "Synchroniser les chats temporaires",
    syncTmpChat:
      "Les chats temporaires actuels ne seront pas téléchargés mais resteront dans votre navigateur. Déconnectez-vous pour les voir.",
    mustExist: "Obligatoire",
    nameAlreadyUse: "Ce nom est déjà utilisé",
    pwdTooShort: "Le mot de passe doit contenir au moins 6 caractères",
    pwdTooLooong: "Mot de passe trop long",
    pwdIsDiff: "Les mots de passe ne correspondent pas",
    doubleToRestore: "Double-cliquez pour restaurer",
    copySuccess: "Copié avec succès",
    nodata: "Aucune donnée",
    botsEmp: "Aucune donnée, créez au moins un bot",
    primaryModelEmp: "Aucune donnée, ajoutez au moins un modèle",
    botModulesEmp:
      "Aucune donnée, essayez de récupérer un modèle dans l'interface d'édition",
    addBotAndSelect: "Veuillez ajouter un bot et sélectionner un modèle",
    chooseModel: "Veuillez sélectionner un modèle pour la conversation",
    needToAddModel:
      "Vous devez ajouter un modèle pour commencer la conversation",
    pwdOrAddrErr: "Adresse ou clé incorrecte",
    notMemo: "Oublier la conversation ci-dessus prochaine fois",
    markdownCode:
      "Une fois activé, le code XML doit être enveloppé dans des blocs de code ou des blocs de code en ligne, par exemple `<script>a = 1</script>`",
    noChatCtx: "Veuillez d'abord démarrer une conversation",
  },
  theme: {
    switchTo: (mod) =>
      `Passer en mode ${["Automatique", "Clair", "Sombre"][mod]}`,
  },
} satisfies BaseLang;
