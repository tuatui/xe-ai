import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "Charlar",
    setting: "Configuraciones",
    module: "Módulo",
    name: "Nombre",
    edit: "Editar",
    cancel: "Cancelar",
    submit: "Enviar",
  },
  chat: {
    new: "Nuevo chat",
    untitled: "Sin título",
    send: "Enviar",
    inputTips: "Ingresa tu pregunta aquí",
  },
  setting: {
    defaultModule: "Predeterminado",
    setDefault: "Predeterminado",
    editModule: {
      press: "Presiona",
      enter: "Entrar",
      toAdd: "para crear uno nuevo",
      noData:
        "No hay datos disponibles. Intenta obtener datos o agrégalo manualmente.",
      fetch: "Obtener módulo",
    },
  },
  module: {
    config: "Configurar módulo",
    secretKey: "Clave secreta",
  },
} as I18nLang;
