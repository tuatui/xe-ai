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
    allModules: "Все модули",
    allModels: "Все модели",
    update: "Обновить",
    delete: "Удалить",
    create: "Создать",
    moreOptions: "Больше опций",
    close: "Закрыть",
    language: "Язык",
    notEnoughSpace: "Недостаточно места",
    password: "Пароль",
    account: "Аккаунт",
    login: "Войти",
    logout: "Выйти",
    repeatPwd: "Повторите пароль",
    back: "Назад",
    register: "Регистрация",
    low: "Низкий",
    middle: "Средний",
    hight: "Высокий",
    strength: "Сила",
    revocation: "Отмена",
    notSelected: "Не выбрано",
    save: "Сохранить",
  },
  action: {
    deleteSome: 'Удалено "{item}"',
  },
  aria: {
    sideNav: "Боковая панель навигации",
    chatHistory: "История чатов",
  },
  chat: {
    collapse: "Свернуть поле ввода",
    setting: "Настройки чата",
    stop: "Остановить чат",
    splitRight: "Разделить чат вправо",
    splitDown: "Разделить чат вниз",
    download: "Скачать текущий чат",
    new: "Новый чат",
    untitled: "Без названия",
    send: "Отправить",
    inputTips: "Введите ваш вопрос здесь",
    scrollToBottom: "Прокрутить вниз",
  },
  setting: {
    apiUrl: "URL поставщика",
    noBotTitle: "Модели ещё нет",
    botShowArea: "Будет показано здесь после добавления модели",
    switchTheme: "Переключить светлую/тёмную тему",
    defaultModule: "Модель по умолчанию",
    setDefault: "Установить по умолчанию",
    addModel: "Добавить новую модель",
    editModule: {
      press: "Нажмите",
      enter: "Ввод",
      toAdd: "Создать новый",
      noData: "Нет данных, попробуйте загрузить или создать вручную",
      fetch: "Загрузить модель",
    },
    topic: {
      title: "Настройки темы",
      tip: "Изменения здесь влияют только на текущую тему",
    },
    user: "Пользователь",
  },
  model: {
    config: "Настроить модель",
    secretKey: "Секретный ключ",
    provider: "Поставщик модели",
  },
  tips: {
    newChatLong: "новый",
    collapseMenu: "Свернуть меню",
    expandMenu: "Развернуть меню",
    loginFail: "Ошибка входа, неверный логин или пароль",
    hidePwd: "Показать/Скрыть пароль",
    loginAndSync:
      "Модели и ключи будут автоматически синхронизированы после входа.",
    regAndSync:
      "Модели и ключи будут автоматически синхронизированы после регистрации.",
    syncTmpChatLabel: "Синхронизировать временные чаты",
    syncTmpChat:
      "Временные чаты не будут загружены, но останутся в браузере. Просто выйдите для просмотра.",
    mustExist: "Обязательно к заполнению",
    nameAlreadyUse: "Это имя уже используется",
    pwdTooShort: "Пароль слишком короткий",
    pwdTooLooong: "Пароль слишком длинный",
    pwdIsDiff: "Пароли не совпадают",
  },
} as I18nLang;
