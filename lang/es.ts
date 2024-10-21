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
  },
  action: {
    deleteSome: (item: string) => `Eliminado "${item}"`,
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
  },
} satisfies BaseLang;
