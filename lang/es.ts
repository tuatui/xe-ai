import type { BaseLang } from "./primary";
export default {
  common: {
    chat: "Chat",
    setting: "Configuración",
    module: "Módulo",
    model: "Modelo",
    name: "Nombre",
    edit: "Editar",
    cancel: "Cancelar",
    submit: "Enviar",
    allModules: "Todos los módulos",
    allModels: "Todos los modelos",
    update: "Actualizar",
    delete: "Eliminar",
    create: "Crear",
    moreOptions: "Más opciones",
    close: "Cerrar",
    language: "Idioma",
    notEnoughSpace: "Espacio insuficiente",
    password: "Contraseña",
    account: "Cuenta",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    repeatPwd: "Repetir contraseña",
    back: "Volver",
    register: "Registrarse",
    low: "Bajo",
    middle: "Medio",
    hight: "Alto",
    strength: "Fuerza",
    revocation: "Revocar",
    notSelected: "No seleccionado",
    save: "Guardar",
    layouts: "Diseños",
    use: "Usar",
    copy: "Copiar",
    options: "Opciones",
    lineBreak: "Salto de línea",
    about: "Acerca de",
    input: "Entrada",
  },
  action: {
    deleteSome: (item) => `Eliminado "${item}"`,
    ask: (name) => `Pregunta a ${name || "AI"}`,
  },
  aria: {
    sideNav: "Barra lateral de navegación",
    chatHistory: "Historial de chat",
  },
  chat: {
    collapse: "Colapsar entrada",
    setting: "Configuración del chat",
    stop: "Detener conversación",
    splitRight: "Dividir a la derecha",
    splitDown: "Dividir hacia abajo",
    download: "Descargar chat actual",
    new: "Nuevo chat",
    untitled: "Sin título",
    send: "Enviar",
    inputTips: "Escribe tu pregunta aquí",
    scrollToBottom: "Desplazar al final",
    memo: "Memoria de conversación",
    prompt: "Palabra clave",
    noVerLimit: "Sin límite en el ancho del contenido",
    verLimit: "Límite en el ancho del contenido",
    reasoningDetail: ["Razonando...", "Ver borrador", "Ocultar borrador"],
  },
  setting: {
    apiUrl: "URL del proveedor",
    noBotTitle: "No hay modelos",
    botShowArea: "Se mostrarán aquí después de agregar modelos",
    switchTheme: "Cambiar entre modo claro/oscuro",
    defaultModule: "Modelo por defecto",
    setDefault: "Establecer como predeterminado",
    addModel: "Añadir modelo",
    editModule: {
      press: "Presiona",
      enter: "Enter",
      toAdd: "para crear uno nuevo",
      noData: "No hay datos, intenta obtenerlos o créalos manualmente",
      fetch: "Obtener modelos",
      preferredModel: "Modelo preferido",
    },
    topic: {
      title: "Configuración de temas",
      tip: "Estos cambios solo afectarán el tema actual",
    },
    user: "Usuario",
    layouts: {
      name: "Selección de diseño",
      all: "Todos los diseños",
      new: "Nuevo diseño",
      empTitle: "No hay diseños",
      dataShowArea: "Después de añadir un diseño, aparecerá aquí",
      setAsDefault: "Establecer como predeterminado",
      memo: "Recordar el diseño al cerrar",
    },
    shortcut: {
      sendImm: "¿Presionaste Enter para enviar el diálogo inmediatamente?",
      send: "Método de envío",
    },
    mdInput:
      "Habilitar sintaxis completa de MARKDOWN para el contenido que ingresas",
  },
  model: {
    config: "Configurar modelo",
    secretKey: "Clave secreta",
    provider: "Proveedor de modelos",
  },
  tips: {
    newChatLong: "Nuevo",
    collapseMenu: "Ocultar menú",
    expandMenu: "Expandir menú",
    loginFail: "Error al iniciar sesión, cuenta o contraseña incorrecta",
    hidePwd: "Mostrar/Ocultar contraseña",
    loginAndSync:
      "Al iniciar sesión, se sincronizarán automáticamente tus modelos y claves. Las claves se encriptarán antes de subirse.",
    regAndSync:
      "Al registrarte, se sincronizarán automáticamente tus modelos y claves. Las claves se encriptarán antes de subirse.",
    syncTmpChatLabel: "Sincronizar chat temporal actual",
    syncTmpChat:
      "El chat temporal no se subirá, pero se guardará en tu navegador. Solo cierra sesión para ver.",
    mustExist: "Requerido",
    nameAlreadyUse: "Este nombre ya está en uso",
    pwdTooShort: "La contraseña debe tener al menos seis caracteres",
    pwdTooLooong: "Contraseña demasiado larga",
    pwdIsDiff: "Las contraseñas no coinciden",
    doubleToRestore: "Doble clic para restaurar",
    copySuccess: "Copiado con éxito",
    nodata: "Sin datos",
    botsEmp: "Sin datos, cree al menos un bot",
    primaryModelEmp: "Sin datos, añada al menos un modelo",
    botModulesEmp:
      "Sin datos, intente obtener un modelo en la interfaz de edición",
    addBotAndSelect: "Por favor, añade un bot y selecciona un modelo",
    chooseModel: "Por favor, selecciona el modelo para la conversación",
    needToAddModel: "Necesitas añadir un modelo para comenzar la conversación",
    pwdOrAddrErr: "Dirección o clave incorrecta",
    notMemo: "El modelo no recordará la conversación anterior",
    markdownCode:
      "Al habilitarlo, el código XML debe estar entre bloques de código o bloques en línea, por ejemplo, `<script>a = 1</script>`",
  },
  theme: {
    switchTo: (mod) =>
      `Cambiar a modo ${["Automático", "Claro", "Oscuro"][mod]}`,
  },
} satisfies BaseLang;
