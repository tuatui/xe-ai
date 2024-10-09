import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "Чат",
    setting: "Настройки",
    module: "Модуль",
    model: "Модель",
    name: "Имя",
    edit: "Редактировать",
    cancel: "Отмена",
    submit: "Отправить",
    allModules: "Все Модули",
    allModels: "Все Модели",
    update: "Обновить",
    delete: "Удалить",
    create: "Создать",
    moreOptions: "Больше Опций",
    close: "Закрыть",
    language: "Язык",
    notEnoughSpace: "Недостаточно места",
  },
  aria: {
    sideNav: "Боковая Навигация",
    chatHistory: "История Чата",
  },
  chat: {
    stop: "Остановить Чат",
    splitRight: "Разделить Чат Справа",
    splitDown: "Разделить Чат Снизу",
    download: "Скачать Текущий Чат",
    new: "Новый Чат",
    untitled: "Без Названия",
    send: "Отправить",
    inputTips: "Введите ваш вопрос здесь",
    scrollToBottom: "Прокрутить вниз",
  },
  setting: {
    apiUrl: "URL Провайдера",
    noBotTitle: "Ничего здесь нет",
    botShowArea: "После добавления модели, она будет отображена здесь",
    switchTheme: "Переключить Светлую/Темную Тему",
    defaultModule: "Модель по Умолчанию",
    setDefault: "Установить по Умолчанию",
    addModel: "Добавить Модель",
    editModule: {
      press: "Нажмите",
      enter: "Ввод",
      toAdd: "для создания новой",
      noData: "Нет данных. Попробуйте загрузить данные или добавить вручную.",
      fetch: "Загрузить Модель",
    },
  },
  module: {
    config: "Настройка Модуля",
    secretKey: "Секретный Ключ",
  },
} as I18nLang;
