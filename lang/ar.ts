import type { I18nLang } from "./helper";

export default {
  common: {
    chat: "دردشة",
    setting: "الإعدادات",
    module: "وحدة",
    name: "اسم",
    edit: "تعديل",
    cancel: "إلغاء",
    submit: "إرسال",
  },
  chat: {
    new: "دردشة جديدة",
    untitled: "без عنوان",
    send: "إرسال",
    inputTips: "أدخل سؤالك هنا",
  },
  setting: {
    defaultModule: "النموذج الافتراضي",
    setDefault: "تعيين كافتراضي",
    editModule: {
      press: "اضغط",
      enter: "ادخل",
      toAdd: "لإنشاء واحد جديد",
      noData:
        "لا توجد بيانات متاحة. يرجى محاولة الحصول على البيانات أو إضافتها يدويًا.",
      fetch: "استرداد الوحدة",
    },
  },
  module: {
    config: "تكوين الوحدة",
    secretKey: "المفتاح السري",
  },
} as I18nLang;
