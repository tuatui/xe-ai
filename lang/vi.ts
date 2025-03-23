import type { BaseLang } from "./primary";
export default {
  common: {
    chat: "Trò chuyện",
    setting: "Cài đặt",
    module: "Module",
    model: "Mô hình",
    name: "Tên",
    edit: "Chỉnh sửa",
    cancel: "Hủy",
    submit: "Gửi",
    allModules: "Tất cả Modules",
    allModels: "Tất cả Mô hình",
    update: "Cập nhật",
    delete: "Xóa",
    create: "Tạo mới",
    moreOptions: "Thêm tùy chọn",
    close: "Đóng",
    language: "Ngôn ngữ",
    notEnoughSpace: "Không đủ dung lượng",
    password: "Mật khẩu",
    account: "Tài khoản",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    repeatPwd: "Nhập lại mật khẩu",
    back: "Quay lại",
    register: "Đăng ký",
    low: "Thấp",
    middle: "Trung bình",
    hight: "Cao",
    strength: "Độ mạnh",
    revocation: "Thu hồi",
    notSelected: "Chưa chọn",
    save: "Lưu",
    layouts: "Bố cục",
    use: "Sử dụng",
    copy: "Sao chép",
    options: "Tùy chọn",
    lineBreak: "Ngắt dòng",
    about: "Về chúng tôi",
    input: "Nhập",
    enable: "Bật",
    disable: "Tắt",
    retry: "Thử lại",
  },
  action: {
    deleteSome: (item) => `Đã xóa "${item}"`,
    ask: (name) => `Hỏi ${name || "AI"}`,
  },
  aria: {
    sideNav: "Thanh điều hướng bên",
    chatHistory: "Lịch sử trò chuyện",
  },
  chat: {
    noCollapse: "Khôi phục hộp nhập",
    collapse: "Thu gọn nhập liệu",
    setting: "Cài đặt trò chuyện",
    stop: "Dừng trò chuyện",
    splitRight: "Chia trò chuyện sang phải",
    splitDown: "Chia trò chuyện xuống dưới",
    download: "Tải xuống cuộc trò chuyện",
    new: "Cuộc trò chuyện mới",
    untitled: "Không tiêu đề",
    send: "Gửi",
    inputTips: "Nhập câu hỏi của bạn tại đây",
    scrollToBottom: "Cuộn xuống cuối",
    memo: "Ghi nhớ cuộc trò chuyện",
    prompt: "Nhắc nhở",
    noVerLimit: "Không giới hạn độ rộng nội dung",
    verLimit: "Giới hạn độ rộng nội dung",
    reasoningDetail: ["Đang suy luận...", "Xem bản nháp", "Ẩn bản nháp"],
    role: "Vai trò",
    reasoningContent: "Nội dung lập luận",
    content: "Nội dung",
    noMarkdownRender: "Tắt cú pháp Markdown",
    toolCallWith: (name) => `Gọi công cụ: ${name}`,
    noWrap: "Không ngắt dòng",
    wrap: "Ngắt dòng",
    raw: "Nội dung thô",
  },
  tools: {
    js: {
      runTimeLimit: (s) => `Giới hạn thời gian thực thi: ${s} giây`,
    },
  },
  setting: {
    apiUrl: "URL của nhà cung cấp",
    noBotTitle: "Chưa có mô hình",
    botShowArea: "Mô hình sẽ hiển thị ở đây sau khi thêm",
    switchTheme: "Chuyển đổi Chế độ Sáng/Tối",
    defaultModule: "Mô hình mặc định",
    setDefault: "Đặt làm mặc định",
    addModel: "Thêm mô hình mới",
    useDefault: "Sử dụng gợi ý mặc định",
    noPrompt: "Không có gợi ý",
    custom: "Tùy chỉnh",
    showSysCtx: "Hiển thị gợi ý trong trò chuyện",
    useSysCtxEveryTime: "Sử dụng gợi ý mỗi lượt",
    round: "Lượt",
    editModule: {
      press: "Nhấn",
      enter: "Nhập",
      toAdd: "để tạo một mô hình mới",
      noData: "Không có dữ liệu, thử tải hoặc tạo mới",
      fetch: "Tải mô hình",
      preferredModel: "Mô hình ưu tiên",
    },
    topic: {
      title: "Cài đặt chủ đề",
      tip: "Thay đổi ở đây chỉ ảnh hưởng đến chủ đề hiện tại",
    },
    exSessionConf: "Cấu hình bổ sung (JSON)",
    exSessionConfDocs: "Xem tài liệu",
    user: "Người dùng",
    botGroup: "Nhóm mô hình",
    layouts: {
      name: "Chọn bố cục",
      all: "Tất cả bố cục",
      new: "Bố cục mới",
      empTitle: "Chưa có bố cục",
      dataShowArea: "Sẽ hiển thị ở đây sau khi thêm bố cục",
      setAsDefault: "Đặt làm mặc định",
      memo: "Nhớ bố cục khi đóng",
    },
    shortcut: {
      sendImm: "Bạn có nhấn Enter để gửi cuộc trò chuyện ngay lập tức không?",
      send: "Phương thức gửi",
    },
    mdInput: "Bật cú pháp MARKDOWN đầy đủ cho nội dung bạn nhập",
  },
  model: {
    config: "Cấu hình mô hình",
    secretKey: "Khóa bí mật",
    provider: "Nhà cung cấp mô hình",
  },
  tips: {
    newChatLong: "Tạo mới",
    collapseMenu: "Thu gọn Menu",
    expandMenu: "Mở rộng Menu",
    loginFail: "Đăng nhập thất bại, sai tài khoản hoặc mật khẩu",
    hidePwd: "Hiển thị/Ẩn mật khẩu",
    loginAndSync:
      "Sau khi đăng nhập, mô hình và khóa của bạn sẽ đồng bộ tự động. Khóa được mã hóa trước khi tải lên.",
    regAndSync:
      "Sau khi đăng ký, mô hình và khóa sẽ được đồng bộ tự động. Khóa được mã hóa trước khi tải lên.",
    syncTmpChatLabel: "Đồng bộ cuộc trò chuyện tạm thời",
    syncTmpChat:
      "Các cuộc trò chuyện tạm thời hiện tại sẽ không được tải lên mà sẽ lưu trữ trong trình duyệt của bạn. Đăng xuất để xem.",
    mustExist: "Bắt buộc",
    nameAlreadyUse: "Tên này đã được sử dụng",
    pwdTooShort: "Mật khẩu phải dài ít nhất 6 ký tự",
    pwdTooLooong: "Mật khẩu quá dài",
    pwdIsDiff: "Mật khẩu không khớp",
    doubleToRestore: "Nhấp đúp để khôi phục",
    copySuccess: "Sao chép thành công",
    nodata: "Không có dữ liệu",
    botsEmp: "Không có dữ liệu, vui lòng tạo ít nhất một bot",
    primaryModelEmp: "Không có dữ liệu, vui lòng thêm ít nhất một mô hình",
    botModulesEmp:
      "Không có dữ liệu, thử tải một mô hình trong giao diện chỉnh sửa mô hình",
    addBotAndSelect: "Vui lòng thêm bot và chọn mô hình",
    chooseModel: "Vui lòng chọn một mô hình cho cuộc trò chuyện",
    needToAddModel: "Bạn cần thêm mô hình để bắt đầu cuộc trò chuyện",
    pwdOrAddrErr: "Địa chỉ hoặc khóa không chính xác",
    notMemo: "Quên cuộc trò chuyện trên lần sau",
    markdownCode:
      "Khi bật, mã XML nên được bao bọc trong khối mã hoặc mã nội tuyến, ví dụ: `<script>a = 1</script>`",
    noChatCtx: "Vui lòng bắt đầu cuộc trò chuyện trước",
  },
  theme: {
    switchTo: (mod) => `Chuyển sang chế độ ${["Tự động", "Sáng", "Tối"][mod]}`,
  },
} satisfies BaseLang;
