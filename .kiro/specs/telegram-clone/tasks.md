# Implementatsiya Rejasi (Implementation Plan)

- [x] 1. Loyiha strukturasini sozlash
  - Backend va frontend uchun alohida papkalar yaratish
  - Package.json fayllarini sozlash
  - TypeScript konfiguratsiyasini o'rnatish
  - _Requirements: 1.1, 9.1_

- [x] 2. Ma'lumotlar bazasi va modellarni sozlash
- [x] 2.1 PostgreSQL va Prisma ORM ni o'rnatish
  - Prisma schema faylini yaratish
  - User, Chat, Message, ChatMember, MessageStatus modellarini aniqlash
  - Migration yaratish va ishga tushirish
  - _Requirements: 1.1, 2.2, 3.5_

- [ ] 2.2 Repository pattern implementatsiyasi
  - UserRepository: CRUD operatsiyalar
  - ChatRepository: chat yaratish, a'zolarni boshqarish
  - MessageRepository: xabar CRUD, qidiruv
  - _Requirements: 1.1, 2.2, 3.1_

- [ ] 2.3 Property test: Foydalanuvchi ro'yxatdan o'tish
  - **Property 1: Foydalanuvchi ro'yxatdan o'tish**
  - **Validates: Requirements 1.1**

- [ ] 2.4 Property test: Parol hash qilingan holda saqlanadi
  - **Property 4: Parol hash qilingan holda saqlanadi**
  - **Validates: Requirements 1.5, 10.1**

- [x] 3. Autentifikatsiya tizimini yaratish
- [x] 3.1 AuthService implementatsiyasi
  - register() funksiyasi: email, parol validatsiya, bcrypt hash
  - login() funksiyasi: parol tekshirish, JWT token yaratish
  - verifyToken() funksiyasi: token validatsiya
  - logout() funksiyasi: sessiyani tugatish
  - _Requirements: 1.1, 1.2, 1.4, 10.1, 10.3_

- [x] 3.2 JWT token middleware
  - Token validatsiya middleware yaratish
  - Request obyektiga user ma'lumotlarini qo'shish
  - _Requirements: 1.2, 10.3, 10.4_

- [x] 3.3 Auth API endpointlari
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - GET /auth/me
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 3.4 Property test: Login va token yaratish
  - **Property 2: Login va token yaratish**
  - **Validates: Requirements 1.2**

- [ ] 3.5 Property test: Logout sessiyani tugatadi
  - **Property 3: Logout sessiyani tugatadi**
  - **Validates: Requirements 1.4**

- [ ] 3.6 Property test: Autentifikatsiyasiz so'rovlar rad etiladi
  - **Property 35: Autentifikatsiyasiz so'rovlar rad etiladi**
  - **Validates: Requirements 10.4**

- [ ] 3.7 Unit testlar: Autentifikatsiya edge caselari
  - Bo'sh email bilan ro'yxatdan o'tishni rad etish
  - Noto'g'ri parol bilan loginni rad etish
  - Yaroqsiz token bilan so'rovni rad etish
  - _Requirements: 1.3_

- [ ] 4. Xabar yuborish tizimini yaratish
- [ ] 4.1 MessageService implementatsiyasi
  - sendMessage() funksiyasi: xabar yaratish va saqlash
  - getMessages() funksiyasi: chat xabarlarini olish
  - editMessage() funksiyasi: xabarni tahrirlash
  - deleteMessage() funksiyasi: xabarni o'chirish
  - searchMessages() funksiyasi: xabarlarni qidirish
  - markAsRead() funksiyasi: xabarni o'qilgan deb belgilash
  - _Requirements: 2.1, 2.2, 6.1, 7.1, 7.2, 8.3_

- [ ] 4.2 Message API endpointlari
  - POST /messages: xabar yuborish
  - GET /messages/:chatId: chat xabarlarini olish
  - PUT /messages/:id: xabarni tahrirlash
  - DELETE /messages/:id: xabarni o'chirish
  - GET /messages/search: xabarlarni qidirish
  - POST /messages/:id/read: xabarni o'qilgan deb belgilash
  - _Requirements: 2.1, 6.1, 7.1, 7.2_

- [ ] 4.3 Property test: Xabar yuborish va saqlash
  - **Property 5: Xabar yuborish va saqlash**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 4.4 Property test: Xabarni tahrirlash va belgilash
  - **Property 24: Xabarni tahrirlash va belgilash**
  - **Validates: Requirements 7.1**

- [ ] 4.5 Property test: Xabarni o'chirish
  - **Property 25: Xabarni o'chirish**
  - **Validates: Requirements 7.2**

- [ ] 4.6 Property test: Faqat egasi tahrirlashi mumkin
  - **Property 27: Faqat egasi tahrirlashi mumkin**
  - **Validates: Requirements 7.4**

- [ ] 4.7 Property test: Xabar qidirish
  - **Property 22: Xabar qidirish**
  - **Validates: Requirements 6.1**

- [ ] 4.8 Property test: Qidiruv natijalari to'liq ma'lumot bilan
  - **Property 23: Qidiruv natijalari to'liq ma'lumot bilan**
  - **Validates: Requirements 6.2**

- [ ] 5. Chat tizimini yaratish
- [ ] 5.1 ChatService implementatsiyasi
  - createDirectChat() funksiyasi: ikki foydalanuvchi o'rtasida chat yaratish
  - createGroupChat() funksiyasi: guruh chat yaratish
  - addMember() funksiyasi: guruhga a'zo qo'shish
  - removeMember() funksiyasi: guruhdan a'zoni chiqarish
  - getUserChats() funksiyasi: foydalanuvchi chatlarini olish
  - getChatMembers() funksiyasi: chat a'zolarini olish
  - _Requirements: 2.1, 3.1, 3.2, 3.4, 3.5_

- [ ] 5.2 Chat API endpointlari
  - POST /chats/direct: shaxsiy chat yaratish
  - POST /chats/group: guruh chat yaratish
  - POST /chats/:id/members: a'zo qo'shish
  - DELETE /chats/:id/members/:userId: a'zoni chiqarish
  - GET /chats: foydalanuvchi chatlarini olish
  - GET /chats/:id/members: chat a'zolarini olish
  - _Requirements: 2.1, 3.1, 3.2, 3.4, 3.5_

- [ ] 5.3 Property test: Guruh yaratish va admin tayinlash
  - **Property 9: Guruh yaratish va admin tayinlash**
  - **Validates: Requirements 3.1**

- [ ] 5.4 Property test: Guruhga a'zo qo'shish
  - **Property 10: Guruhga a'zo qo'shish**
  - **Validates: Requirements 3.2**

- [ ] 5.5 Property test: Guruhdan chiqarish
  - **Property 12: Guruhdan chiqarish**
  - **Validates: Requirements 3.4**

- [ ] 5.6 Property test: Guruh a'zolari ro'yxati
  - **Property 13: Guruh a'zolari ro'yxati**
  - **Validates: Requirements 3.5**

- [ ] 6. Checkpoint - Barcha testlar o'tishini ta'minlash
  - Barcha testlar o'tishini ta'minlang, savollar tug'ilsa foydalanuvchidan so'rang.

- [ ] 7. WebSocket server va real-time funksiyalarni yaratish
- [ ] 7.1 Socket.io server sozlash
  - Socket.io ni Express bilan integratsiya qilish
  - JWT autentifikatsiya middleware qo'shish
  - Connection va disconnection handlerlarini yaratish
  - _Requirements: 9.1, 9.2_

- [ ] 7.2 WebSocket event handlerlarini yaratish
  - 'send_message' eventi: xabar yuborish va broadcast qilish
  - 'typing_start' eventi: typing indikatorini yuborish
  - 'typing_stop' eventi: typing indikatorini to'xtatish
  - 'message_read' eventi: xabar o'qilganligini bildirish
  - _Requirements: 2.1, 2.3, 5.3, 5.4, 8.3_

- [ ] 7.3 Online status boshqarish
  - Connection vaqtida statusni "online" ga o'zgartirish
  - Disconnection vaqtida statusni "offline" ga o'zgartirish va lastSeen yangilash
  - Status o'zgarishlarini kontaktlarga broadcast qilish
  - _Requirements: 5.1, 5.2_

- [ ] 7.4 Xabar yetkazilganlik statusini boshqarish
  - MessageStatus modelidan foydalanish
  - 'sent', 'delivered', 'read' statuslarini kuzatish
  - Status o'zgarishlarini yuboruvchiga bildirish
  - _Requirements: 2.5, 9.5_

- [ ] 7.5 Property test: Online foydalanuvchiga real-time yetkazish
  - **Property 6: Online foydalanuvchiga real-time yetkazish**
  - **Validates: Requirements 2.3**

- [ ] 7.6 Property test: Offline xabarlarni saqlash
  - **Property 7: Offline xabarlarni saqlash**
  - **Validates: Requirements 2.4**

- [ ] 7.7 Property test: Xabar yuborilganlik tasdiq
  - **Property 8: Xabar yuborilganlik tasdiq**
  - **Validates: Requirements 2.5**

- [ ] 7.8 Property test: Guruh xabarlarini barcha a'zolarga yetkazish
  - **Property 11: Guruh xabarlarini barcha a'zolarga yetkazish**
  - **Validates: Requirements 3.3**

- [ ] 7.9 Property test: Login qilganda online status
  - **Property 17: Login qilganda online status**
  - **Validates: Requirements 5.1**

- [ ] 7.10 Property test: Logout qilganda offline status
  - **Property 18: Logout qilganda offline status**
  - **Validates: Requirements 5.2**

- [ ] 7.11 Property test: Typing indikatori ko'rsatish
  - **Property 19: Typing indikatori ko'rsatish**
  - **Validates: Requirements 5.3**

- [ ] 7.12 Property test: Typing indikatorini olib tashlash
  - **Property 20: Typing indikatorini olib tashlash**
  - **Validates: Requirements 5.4**

- [ ] 7.13 Property test: Online status real-time yangilanishi
  - **Property 21: Online status real-time yangilanishi**
  - **Validates: Requirements 5.5**

- [ ] 7.14 Property test: Tahrirlangan xabar real-time yangilanishi
  - **Property 26: Tahrirlangan xabar real-time yangilanishi**
  - **Validates: Requirements 7.3**

- [ ] 7.15 Property test: WebSocket qayta ulanish
  - **Property 32: WebSocket qayta ulanish**
  - **Validates: Requirements 9.2**

- [ ] 7.16 Property test: Xabarlar ketma-ket tartibda
  - **Property 33: Xabarlar ketma-ket tartibda**
  - **Validates: Requirements 9.3**

- [ ] 7.17 Property test: Xabar yetkazilganlik statuslari
  - **Property 34: Xabar yetkazilganlik statuslari**
  - **Validates: Requirements 9.5**

- [ ] 8. Media fayl yuklash tizimini yaratish
- [ ] 8.1 FileService implementatsiyasi
  - uploadFile() funksiyasi: faylni serverga saqlash
  - deleteFile() funksiyasi: faylni o'chirish
  - generateThumbnail() funksiyasi: rasm uchun thumbnail yaratish (sharp library)
  - Fayl hajmini validatsiya qilish (max 10MB)
  - _Requirements: 4.1, 4.2, 4.5, 7.5_

- [ ] 8.2 File upload API endpointlari
  - POST /files/upload: fayl yuklash (multer middleware)
  - DELETE /files/:filename: faylni o'chirish
  - GET /files/:filename: faylni yuklab olish
  - _Requirements: 4.1, 4.4_

- [ ] 8.3 Media xabarlarni yuborish integratsiyasi
  - MessageService bilan FileService ni bog'lash
  - Media xabar yuborishda fayl URL ni saqlash
  - Xabar o'chirilganda faylni ham o'chirish
  - _Requirements: 4.3, 7.5_

- [ ] 8.4 Property test: Media fayl yuklash va saqlash round-trip
  - **Property 14: Media fayl yuklash va saqlash round-trip**
  - **Validates: Requirements 4.1, 4.4**

- [ ] 8.5 Property test: Media xabar URL bilan yuboriladi
  - **Property 15: Media xabar URL bilan yuboriladi**
  - **Validates: Requirements 4.3**

- [ ] 8.6 Property test: Rasm uchun thumbnail yaratish
  - **Property 16: Rasm uchun thumbnail yaratish**
  - **Validates: Requirements 4.5**

- [ ] 8.7 Property test: Media faylni xabar bilan o'chirish
  - **Property 28: Media faylni xabar bilan o'chirish**
  - **Validates: Requirements 7.5**

- [ ] 8.8 Unit test: Fayl hajmi validatsiyasi
  - Maksimal hajmdan oshgan faylni rad etish
  - _Requirements: 4.2_

- [ ] 9. Xabarnomalar tizimini yaratish
- [ ] 9.1 Notification service implementatsiyasi
  - O'qilmagan xabarlar sonini hisoblash
  - Yangi xabar kelganda unread count oshirish
  - Xabarlarni o'qiganda unread count nolga tushirish
  - _Requirements: 8.2, 8.3_

- [ ] 9.2 Notification API endpointlari
  - GET /notifications/unread: o'qilmagan xabarlar soni
  - POST /notifications/settings: xabarnoma sozlamalarini saqlash
  - GET /notifications/settings: xabarnoma sozlamalarini olish
  - _Requirements: 8.2, 8.4_

- [ ] 9.3 Property test: O'qilmagan xabarlar soni
  - **Property 29: O'qilmagan xabarlar soni**
  - **Validates: Requirements 8.2**

- [ ] 9.4 Property test: Xabarlarni o'qish unread countni nolga tushiradi
  - **Property 30: Xabarlarni o'qish unread countni nolga tushiradi**
  - **Validates: Requirements 8.3**

- [ ] 9.5 Property test: Guruh xabarida guruh nomi
  - **Property 31: Guruh xabarida guruh nomi**
  - **Validates: Requirements 8.5**

- [ ] 10. Checkpoint - Barcha backend testlar o'tishini ta'minlash
  - Barcha testlar o'tishini ta'minlang, savollar tug'ilsa foydalanuvchidan so'rang.

- [x] 11. Frontend loyiha strukturasini sozlash
- [x] 11.1 React + Vite loyihasini yaratish
  - Vite bilan React TypeScript loyihasini yaratish
  - TailwindCSS ni o'rnatish va sozlash
  - Papka strukturasini yaratish (components, pages, services, store)
  - _Requirements: 1.1_

- [x] 11.2 State management sozlash
  - Zustand ni o'rnatish
  - Auth store yaratish (user, token, login, logout)
  - Chat store yaratish (chats, selectedChat, messages)
  - Notification store yaratish (unreadCount)
  - _Requirements: 1.2, 2.1, 8.2_

- [x] 11.3 API client sozlash
  - Axios instance yaratish
  - JWT token interceptor qo'shish
  - Error handling interceptor qo'shish
  - API service funksiyalarini yaratish
  - _Requirements: 1.2, 10.4_

- [x] 12. Autentifikatsiya UI yaratish
- [x] 12.1 Login va Register sahifalarini yaratish
  - LoginPage komponenti: email, parol input, submit
  - RegisterPage komponenti: email, parol, username input, submit
  - Form validatsiya (react-hook-form)
  - Xatolik xabarlarini ko'rsatish
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 12.2 Auth routing va protected routes
  - React Router sozlash
  - ProtectedRoute komponenti yaratish
  - Login/Register sahifalariga yo'naltirish
  - _Requirements: 1.2, 10.4_

- [ ] 13. Chat interfeysi yaratish
- [ ] 13.1 Chat list komponenti
  - ChatList komponenti: chatlar ro'yxatini ko'rsatish
  - ChatItem komponenti: chat nomi, oxirgi xabar, unread count
  - Chat tanlash funksiyasi
  - _Requirements: 2.1, 8.2_

- [ ] 13.2 Message list komponenti
  - MessageList komponenti: xabarlar ro'yxatini ko'rsatish
  - MessageItem komponenti: xabar matni, vaqt, yuboruvchi
  - O'z xabarlari va boshqalarning xabarlarini farqlash
  - Tahrirlangan belgisini ko'rsatish
  - _Requirements: 2.1, 7.1_

- [ ] 13.3 Message input komponenti
  - MessageInput komponenti: xabar yozish input
  - Yuborish tugmasi
  - Media fayl yuklash tugmasi
  - Typing event yuborish
  - _Requirements: 2.1, 4.1, 5.3_

- [ ] 13.4 Message actions (edit, delete)
  - Xabar ustiga hover qilganda edit/delete tugmalarini ko'rsatish
  - Edit modal yoki inline editing
  - Delete confirmation dialog
  - _Requirements: 7.1, 7.2_

- [ ] 14. WebSocket client integratsiyasi
- [ ] 14.1 Socket.io client sozlash
  - Socket.io-client ni o'rnatish
  - JWT token bilan ulanish
  - Connection va disconnection handlerlarini yaratish
  - Qayta ulanish logikasi
  - _Requirements: 9.1, 9.2_

- [ ] 14.2 Real-time event listenerlarini qo'shish
  - 'new_message' eventi: yangi xabarni qabul qilish va store ga qo'shish
  - 'message_edited' eventi: tahrirlangan xabarni yangilash
  - 'message_deleted' eventi: o'chirilgan xabarni olib tashlash
  - 'typing_start' eventi: typing indikatorini ko'rsatish
  - 'typing_stop' eventi: typing indikatorini yashirish
  - 'user_online' eventi: foydalanuvchi online statusini yangilash
  - 'user_offline' eventi: foydalanuvchi offline statusini yangilash
  - _Requirements: 2.3, 5.1, 5.2, 5.3, 5.4, 7.3_

- [ ] 14.3 Real-time event emitterlarini qo'shish
  - Xabar yuborishda 'send_message' eventini yuborish
  - Yozishda 'typing_start' eventini yuborish
  - Yozishni to'xtatganda 'typing_stop' eventini yuborish
  - Xabarni o'qiganda 'message_read' eventini yuborish
  - _Requirements: 2.1, 5.3, 5.4, 8.3_

- [ ] 15. Guruh chat funksiyalarini yaratish
- [ ] 15.1 Guruh yaratish UI
  - CreateGroupModal komponenti
  - Guruh nomi input
  - A'zolarni tanlash (checkbox list)
  - Guruh yaratish API chaqiruvi
  - _Requirements: 3.1, 3.2_

- [ ] 15.2 Guruh sozlamalari UI
  - GroupSettingsModal komponenti
  - Guruh a'zolari ro'yxati
  - A'zo qo'shish tugmasi
  - A'zoni chiqarish tugmasi (faqat admin uchun)
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 16. Media fayl yuklash UI
- [ ] 16.1 Fayl yuklash komponenti
  - FileUpload komponenti: fayl tanlash input
  - Fayl preview (rasm uchun)
  - Upload progress bar
  - Fayl hajmi validatsiyasi
  - _Requirements: 4.1, 4.2_

- [ ] 16.2 Media xabarlarni ko'rsatish
  - ImageMessage komponenti: rasm thumbnail va to'liq ko'rinish
  - FileMessage komponenti: fayl nomi va yuklab olish tugmasi
  - Media xabarlarni MessageItem ga integratsiya qilish
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 17. Qidiruv funksiyasini yaratish
- [ ] 17.1 Qidiruv UI
  - SearchBar komponenti: qidiruv input
  - SearchResults komponenti: qidiruv natijalari ro'yxati
  - Qidiruv so'zini highlight qilish
  - Natijani tanlash va chatga o'tish
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 18. Online status va typing indikatorini ko'rsatish
- [ ] 18.1 Online status UI
  - OnlineIndicator komponenti: yashil/kulrang nuqta
  - ChatItem da online statusni ko'rsatish
  - MessageList da online statusni ko'rsatish
  - _Requirements: 5.1, 5.2_

- [ ] 18.2 Typing indikatori UI
  - TypingIndicator komponenti: "typing..." animatsiya
  - MessageList da typing indikatorini ko'rsatish
  - _Requirements: 5.3, 5.4_

- [ ] 19. Xabarnomalar UI
- [ ] 19.1 Brauzer xabarnomalarini sozlash
  - Notification API dan foydalanish
  - Ruxsat so'rash
  - Yangi xabar kelganda xabarnoma ko'rsatish
  - _Requirements: 8.1_

- [ ] 19.2 Unread count badge
  - UnreadBadge komponenti: o'qilmagan xabarlar soni
  - ChatItem da unread count ko'rsatish
  - Tab title da umumiy unread count ko'rsatish
  - _Requirements: 8.2_

- [ ] 19.3 Xabarnoma sozlamalari UI
  - NotificationSettings komponenti
  - Xabarnomalarni yoqish/o'chirish toggle
  - _Requirements: 8.4_

- [ ] 20. Xatoliklarni boshqarish va UI polishing
- [ ] 20.1 Error boundary va error handling
  - ErrorBoundary komponenti yaratish
  - API xatoliklarini toast xabarlari bilan ko'rsatish
  - Loading statelarini ko'rsatish
  - _Requirements: 1.3_

- [ ] 20.2 UI polishing
  - Responsive dizayn (mobile, tablet, desktop)
  - Loading skeletonlar
  - Empty statelar (chatlar yo'q, xabarlar yo'q)
  - Animatsiyalar va transitionlar
  - _Requirements: barcha UI requirements_

- [ ] 21. Final checkpoint - Barcha testlar o'tishini ta'minlash
  - Barcha testlar o'tishini ta'minlang, savollar tug'ilsa foydalanuvchidan so'rang.
