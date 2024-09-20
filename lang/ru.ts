import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "Чат",
    setting: "Настройки",
    module: "Модуль",
    name: "Имя",
    edit: "Редактировать",
    cancel: "Отменить",
    submit: "Отправить",
  },
  chat: {
    new: "Новый чат",
    untitled: "Без названия",
    send: "Отправить",
    inputTips: "Введите ваш вопрос здесь",
  },
  setting: {
    defaultModule: "По умолчанию",
    setDefault: "По умолчанию",
    editModule: {
      press: "Нажмите",
      enter: "Enter",
      toAdd: "чтобы создать новый",
      noData:
        "Нет доступных данных. Пожалуйста, попробуйте получить данные или добавьте вручную.",
      fetch: "Получить модель",
    },
  },
  module: {
    config: "Настроить модуль",
    secretKey: "Секретный ключ",
  },
} as I18nLang;
