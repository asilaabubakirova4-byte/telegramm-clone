# Dizayn Hujjati (Design Document)

## Umumiy Ko'rinish (Overview)

Telegram Clone - bu zamonaviy real vaqtda xabar almashish ilovasi bo'lib, client-server arxitekturasiga asoslangan. Tizim ikki asosiy qismdan iborat:

1. **Frontend**: React + TypeScript asosida qurilgan SPA (Single Page Application)
2. **Backend**: Node.js + Express + Socket.io server

Tizim RESTful API va WebSocket protokollarini birlashtirib, real vaqtda ma'lumot almashish va an'anaviy HTTP so'rovlarini qo'llab-quvvatlaydi.

## Arxitektura (Architecture)

### Yuqori Darajali Arxitektura

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (UI)                                │   │
│  │  - Chat Interface                                     │   │
│  │  - Message List                                       │   │
│  │  - User Profile                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  State Management (Redux/Zustand)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Client (Axios) + WebSocket Client (Socket.io)   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Server Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (Express)                                 │   │
│  │  - /auth (login, register)                           │   │
│  │  - /users (profile, contacts)                        │   │
│  │  - /chats (create, list)                             │   │
│  │  - /messages (send, history)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebSocket Server (Socket.io)                        │   │
│  │  - Real-time message delivery                        │   │
│  │  - Online status updates                             │   │
│  │  - Typing indicators                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Logic Layer                                │   │
│  │  - Authentication Service                            │   │
│  │  - Message Service                                   │   │
│  │  - Chat Service                                      │   │
│  │  - File Service                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (Repositories)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   PostgreSQL     │  │   File Storage   │                │
│  │   (Messages,     │  │   (Media Files)  │                │
│  │    Users, Chats) │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Texnologiya Stack

**Frontend:**
- React 18+ (UI framework)
- TypeScript (type safety)
- Zustand (state management)
- Socket.io-client (WebSocket client)
- Axios (HTTP client)
- TailwindCSS (styling)
- Vite (build tool)

**Backend:**
- Node.js 18+ (runtime)
- Express (web framework)
- Socket.io (WebSocket server)
- TypeScript (type safety)
- PostgreSQL (database)
- Prisma (ORM)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- multer (file upload)

## Komponentlar va Interfeyslar (Components and Interfaces)

### Backend Komponentlar

#### 1. Authentication Service
```typescript
interface AuthService {
  register(email: string, password: string, username: string): Promise<User>
  login(email: string, password: string): Promise<{ user: User, token: string }>
  verifyToken(token: string): Promise<User>
  logout(userId: string): Promise<void>
}
```

#### 2. Message Service
```typescript
interface MessageService {
  sendMessage(senderId: string, chatId: string, content: string, type: MessageType): Promise<Message>
  getMessages(chatId: string, limit: number, offset: number): Promise<Message[]>
  editMessage(messageId: string, newContent: string): Promise<Message>
  deleteMessage(messageId: string): Promise<void>
  searchMessages(userId: string, query: string): Promise<Message[]>
  markAsRead(messageId: string, userId: string): Promise<void>
}
```

#### 3. Chat Service
```typescript
interface ChatService {
  createDirectChat(userId1: string, userId2: string): Promise<Chat>
  createGroupChat(creatorId: string, name: string, memberIds: string[]): Promise<Chat>
  addMember(chatId: string, userId: string): Promise<void>
  removeMember(chatId: string, userId: string): Promise<void>
  getUserChats(userId: string): Promise<Chat[]>
  getChatMembers(chatId: string): Promise<User[]>
}
```

#### 4. File Service
```typescript
interface FileService {
  uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string>
  deleteFile(fileUrl: string): Promise<void>
  generateThumbnail(imageUrl: string): Promise<string>
}
```

#### 5. WebSocket Event Handler
```typescript
interface WebSocketHandler {
  handleConnection(socket: Socket): void
  handleDisconnection(socket: Socket): void
  handleMessageSend(socket: Socket, data: MessageData): void
  handleTypingStart(socket: Socket, chatId: string): void
  handleTypingStop(socket: Socket, chatId: string): void
  broadcastToChat(chatId: string, event: string, data: any): void
}
```

### Frontend Komponentlar

#### 1. Chat Interface Component
```typescript
interface ChatInterfaceProps {
  currentChat: Chat | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onTyping: () => void
}
```

#### 2. Message List Component
```typescript
interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onEditMessage: (messageId: string, newContent: string) => void
  onDeleteMessage: (messageId: string) => void
}
```

#### 3. Chat List Component
```typescript
interface ChatListProps {
  chats: Chat[]
  onSelectChat: (chatId: string) => void
  selectedChatId: string | null
}
```

## Ma'lumotlar Modellari (Data Models)

### User Model
```typescript
interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  avatarUrl?: string
  onlineStatus: 'online' | 'offline'
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}
```

### Chat Model
```typescript
interface Chat {
  id: string
  type: 'direct' | 'group'
  name?: string  // faqat guruh chatlari uchun
  creatorId?: string  // faqat guruh chatlari uchun
  createdAt: Date
  updatedAt: Date
}
```

### Message Model
```typescript
interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  fileUrl?: string
  thumbnailUrl?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

### ChatMember Model
```typescript
interface ChatMember {
  id: string
  chatId: string
  userId: string
  role: 'admin' | 'member'
  joinedAt: Date
  lastReadMessageId?: string
}
```

### MessageStatus Model
```typescript
interface MessageStatus {
  id: string
  messageId: string
  userId: string
  status: 'sent' | 'delivered' | 'read'
  timestamp: Date
}
```

## To'g'rilik Xususiyatlari (Correctness Properties)

*Property - bu tizimning barcha to'g'ri bajarilishlarida saqlanishi kerak bo'lgan xususiyat yoki xatti-harakat. Propertylar inson o'qiy oladigan spetsifikatsiyalar va mashina tekshira oladigan to'g'rilik kafolatlari o'rtasidagi ko'prik vazifasini bajaradi.*


### Property Reflection

Prework tahlilidan keyin, ortiqcha propertylarni aniqlash uchun reflection o'tkazdim:

**Redundant Properties:**
- Property 10.1 (parol hash qilish) va Property 1.5 bir xil funksionallikni tekshiradi - bitta propertyga birlashtiriladi
- Property 2.2 (xabarni saqlash) va Property 2.1 (xabarni yetkazish) birlashtirilishi mumkin - xabar yuborish avtomatik ravishda saqlashni o'z ichiga oladi

**Testable Properties:** 35 ta property
**Edge Cases:** 3 ta
**Examples:** 1 ta
**Non-testable:** 8 ta (UI, arxitektura, performance)

### Correctness Properties

**Property 1: Foydalanuvchi ro'yxatdan o'tish**
*Har qanday* to'g'ri email va parol uchun, ro'yxatdan o'tish yangi foydalanuvchi yaratishi va ma'lumotlar bazasida saqlanishi kerak
**Validates: Requirements 1.1**

**Property 2: Login va token yaratish**
*Har qanday* mavjud foydalanuvchi uchun, to'g'ri parol bilan login qilish JWT token qaytarishi kerak
**Validates: Requirements 1.2**

**Property 3: Logout sessiyani tugatadi**
*Har qanday* login qilingan foydalanuvchi uchun, logout qilish tokenni bekor qilishi va qayta ishlatib bo'lmasligi kerak
**Validates: Requirements 1.4**

**Property 4: Parol hash qilingan holda saqlanadi**
*Har qanday* yangi foydalanuvchi uchun, ma'lumotlar bazasida saqlangan parol asl paroldan farq qilishi va hash algoritmi orqali o'tgan bo'lishi kerak
**Validates: Requirements 1.5, 10.1**

**Property 5: Xabar yuborish va saqlash**
*Har qanday* to'g'ri xabar uchun, yuborish operatsiyasi xabarni ma'lumotlar bazasida saqlab qolishi va qabul qiluvchiga yetkazishi kerak
**Validates: Requirements 2.1, 2.2**

**Property 6: Online foydalanuvchiga real-time yetkazish**
*Har qanday* online foydalanuvchiga yuborilgan xabar uchun, xabar WebSocket orqali darhol yetkazilishi kerak
**Validates: Requirements 2.3**

**Property 7: Offline xabarlarni saqlash**
*Har qanday* offline foydalanuvchiga yuborilgan xabar uchun, xabar saqlanishi va foydalanuvchi online bo'lganda yetkazilishi kerak
**Validates: Requirements 2.4**

**Property 8: Xabar yuborilganlik tasdiq**
*Har qanday* yuborilgan xabar uchun, yuboruvchi tasdiq olishi va xabar statusi "sent" bo'lishi kerak
**Validates: Requirements 2.5**

**Property 9: Guruh yaratish va admin tayinlash**
*Har qanday* yangi guruh uchun, yaratuvchi avtomatik ravishda admin rolini olishi kerak
**Validates: Requirements 3.1**

**Property 10: Guruhga a'zo qo'shish**
*Har qanday* guruh va foydalanuvchi uchun, admin a'zo qo'shganda, foydalanuvchi guruh a'zolari ro'yxatida paydo bo'lishi kerak
**Validates: Requirements 3.2**

**Property 11: Guruh xabarlarini barcha a'zolarga yetkazish**
*Har qanday* guruh xabari uchun, xabar barcha guruh a'zolariga yetkazilishi kerak
**Validates: Requirements 3.3**

**Property 12: Guruhdan chiqarish**
*Har qanday* guruh a'zosi uchun, admin chiqarganda, foydalanuvchi guruh a'zolari ro'yxatidan o'chirilishi va yangi xabarlarni olmasligi kerak
**Validates: Requirements 3.4**

**Property 13: Guruh a'zolari ro'yxati**
*Har qanday* guruh uchun, a'zolar ro'yxatini olish barcha qo'shilgan a'zolarni qaytarishi kerak
**Validates: Requirements 3.5**

**Property 14: Media fayl yuklash va saqlash round-trip**
*Har qanday* to'g'ri media fayl uchun, yuklash va keyin yuklab olish asl faylni qaytarishi kerak
**Validates: Requirements 4.1, 4.4**

**Property 15: Media xabar URL bilan yuboriladi**
*Har qanday* media xabar uchun, xabar fayl URL manzilini o'z ichiga olishi kerak
**Validates: Requirements 4.3**

**Property 16: Rasm uchun thumbnail yaratish**
*Har qanday* rasm fayl uchun, yuklash thumbnail URL yaratishi kerak
**Validates: Requirements 4.5**

**Property 17: Login qilganda online status**
*Har qanday* foydalanuvchi uchun, login qilish statusni "online" ga o'zgartirishi kerak
**Validates: Requirements 5.1**

**Property 18: Logout qilganda offline status**
*Har qanday* foydalanuvchi uchun, logout qilish statusni "offline" ga o'zgartirishi va lastSeen vaqtini yangilashi kerak
**Validates: Requirements 5.2**

**Property 19: Typing indikatori ko'rsatish**
*Har qanday* chat uchun, typing event yuborish suhbatdoshiga typing indikatorini ko'rsatishi kerak
**Validates: Requirements 5.3**

**Property 20: Typing indikatorini olib tashlash**
*Har qanday* chat uchun, typing stop event yuborish indikatorini olib tashlashi kerak
**Validates: Requirements 5.4**

**Property 21: Online status real-time yangilanishi**
*Har qanday* foydalanuvchi uchun, status o'zgarishi WebSocket orqali barcha kontaktlarga darhol yetkazilishi kerak
**Validates: Requirements 5.5**

**Property 22: Xabar qidirish**
*Har qanday* qidiruv so'zi uchun, qidiruv natijasi faqat o'sha so'zni o'z ichiga olgan xabarlarni qaytarishi kerak
**Validates: Requirements 6.1**

**Property 23: Qidiruv natijalari to'liq ma'lumot bilan**
*Har qanday* qidiruv natijasi uchun, har bir xabar matni, yuboruvchi va sana ma'lumotlarini o'z ichiga olishi kerak
**Validates: Requirements 6.2**

**Property 24: Xabarni tahrirlash va belgilash**
*Har qanday* xabar uchun, tahrirlash yangilangan matnni saqlashi va isEdited flagini true qilishi kerak
**Validates: Requirements 7.1**

**Property 25: Xabarni o'chirish**
*Har qanday* xabar uchun, o'chirish xabarni ma'lumotlar bazasidan olib tashlashi yoki isDeleted flagini true qilishi kerak
**Validates: Requirements 7.2**

**Property 26: Tahrirlangan xabar real-time yangilanishi**
*Har qanday* tahrirlangan xabar uchun, yangilanish barcha chat ishtirokchilariga WebSocket orqali yetkazilishi kerak
**Validates: Requirements 7.3**

**Property 27: Faqat egasi tahrirlashi mumkin**
*Har qanday* xabar uchun, faqat yuboruvchi tahrirlash yoki o'chirish huquqiga ega bo'lishi kerak, boshqa foydalanuvchilar rad etilishi kerak
**Validates: Requirements 7.4**

**Property 28: Media faylni xabar bilan o'chirish**
*Har qanday* media xabar uchun, xabarni o'chirish fayl ham serverdan o'chirilishiga olib kelishi kerak
**Validates: Requirements 7.5**

**Property 29: O'qilmagan xabarlar soni**
*Har qanday* yangi xabar uchun, qabul qiluvchining o'qilmagan xabarlar soni 1 ga oshishi kerak
**Validates: Requirements 8.2**

**Property 30: Xabarlarni o'qish unread countni nolga tushiradi**
*Har qanday* chat uchun, xabarlarni o'qish o'qilmagan xabarlar sonini 0 ga tushirishi kerak
**Validates: Requirements 8.3**

**Property 31: Guruh xabarida guruh nomi**
*Har qanday* guruh xabari uchun, xabarnoma guruh nomini o'z ichiga olishi kerak
**Validates: Requirements 8.5**

**Property 32: WebSocket qayta ulanish**
*Har qanday* WebSocket uzilishi uchun, tizim avtomatik ravishda qayta ulanishni amalga oshirishi kerak
**Validates: Requirements 9.2**

**Property 33: Xabarlar ketma-ket tartibda**
*Har qanday* xabarlar ketma-ketligi uchun, qabul qiluvchi tomonida xabarlar yuborilgan tartibda kelishi kerak
**Validates: Requirements 9.3**

**Property 34: Xabar yetkazilganlik statuslari**
*Har qanday* xabar uchun, status "sent" -> "delivered" -> "read" tartibida o'zgarishi kerak
**Validates: Requirements 9.5**

**Property 35: Autentifikatsiyasiz so'rovlar rad etiladi**
*Har qanday* himoyalangan endpoint uchun, to'g'ri JWT tokensiz so'rov 401 Unauthorized xatoligini qaytarishi kerak
**Validates: Requirements 10.4**

## Xatoliklarni Boshqarish (Error Handling)

### Xatolik Turlari

#### 1. Autentifikatsiya Xatoliklari
```typescript
class AuthenticationError extends Error {
  statusCode = 401
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// Foydalanish:
// - Noto'g'ri login ma'lumotlari
// - Yaroqsiz yoki muddati o'tgan token
// - Token mavjud emas
```

#### 2. Avtorizatsiya Xatoliklari
```typescript
class AuthorizationError extends Error {
  statusCode = 403
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// Foydalanish:
// - Boshqa foydalanuvchi xabarini tahrirlashga urinish
// - Admin bo'lmagan foydalanuvchi guruhdan chiqarishga urinish
```

#### 3. Validatsiya Xatoliklari
```typescript
class ValidationError extends Error {
  statusCode = 400
  constructor(public fields: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

// Foydalanish:
// - Bo'sh email yoki parol
// - Noto'g'ri email formati
// - Juda katta fayl hajmi
// - Bo'sh xabar matni
```

#### 4. Topilmadi Xatoliklari
```typescript
class NotFoundError extends Error {
  statusCode = 404
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

// Foydalanish:
// - Mavjud bo'lmagan foydalanuvchi
// - Mavjud bo'lmagan chat
// - Mavjud bo'lmagan xabar
```

#### 5. WebSocket Xatoliklari
```typescript
interface WebSocketError {
  type: 'connection' | 'message' | 'timeout'
  message: string
  retryable: boolean
}

// Foydalanish:
// - Aloqa uzilishi
// - Xabar yuborishda xatolik
// - Timeout
```

### Xatoliklarni Qayta Ishlash Strategiyasi

#### Backend Error Middleware
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthenticationError) {
    return res.status(401).json({ error: err.message })
  }
  
  if (err instanceof AuthorizationError) {
    return res.status(403).json({ error: err.message })
  }
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, fields: err.fields })
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message })
  }
  
  // Kutilmagan xatoliklar
  console.error('Unexpected error:', err)
  return res.status(500).json({ error: 'Internal server error' })
})
```

#### Frontend Error Handling
```typescript
// API xatoliklarini qayta ishlash
try {
  await api.sendMessage(chatId, content)
} catch (error) {
  if (error.status === 401) {
    // Token muddati o'tgan, qayta login qilish
    redirectToLogin()
  } else if (error.status === 403) {
    // Ruxsat yo'q
    showError('You do not have permission')
  } else if (error.status === 400) {
    // Validatsiya xatoligi
    showValidationErrors(error.fields)
  } else {
    // Umumiy xatolik
    showError('Something went wrong')
  }
}

// WebSocket xatoliklarini qayta ishlash
socket.on('error', (error: WebSocketError) => {
  if (error.retryable) {
    // Qayta urinish
    setTimeout(() => socket.connect(), 1000)
  } else {
    showError(error.message)
  }
})
```

### Xatoliklarni Logging

```typescript
// Winston logger konfiguratsiyasi
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Xatoliklarni log qilish
logger.error('Message send failed', {
  userId: user.id,
  chatId: chat.id,
  error: error.message,
  stack: error.stack
})
```

## Test Strategiyasi (Testing Strategy)

### Property-Based Testing

Tizimning to'g'riligini tekshirish uchun property-based testing (PBT) dan foydalanamiz. PBT universal xususiyatlarni ko'plab tasodifiy kiritmalarda tekshiradi.

**PBT Library:** fast-check (JavaScript/TypeScript uchun)

**Konfiguratsiya:**
- Har bir property test kamida 100 marta bajarilishi kerak
- Har bir test dizayn hujjatidagi property raqami bilan izohlanishi kerak
- Format: `// Feature: telegram-clone, Property {number}: {property_text}`

**Property Test Misoli:**

```typescript
import fc from 'fast-check'

// Property 1: Foydalanuvchi ro'yxatdan o'tish
// Feature: telegram-clone, Property 1: Foydalanuvchi ro'yxatdan o'tish
test('user registration creates new user in database', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.emailAddress(),
      fc.string({ minLength: 8 }),
      fc.string({ minLength: 3 }),
      async (email, password, username) => {
        const user = await authService.register(email, password, username)
        expect(user).toBeDefined()
        expect(user.email).toBe(email)
        
        const dbUser = await userRepository.findByEmail(email)
        expect(dbUser).toBeDefined()
        expect(dbUser.id).toBe(user.id)
      }
    ),
    { numRuns: 100 }
  )
})

// Property 4: Parol hash qilingan holda saqlanadi
// Feature: telegram-clone, Property 4: Parol hash qilingan holda saqlanadi
test('passwords are hashed in database', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.emailAddress(),
      fc.string({ minLength: 8 }),
      fc.string({ minLength: 3 }),
      async (email, password, username) => {
        await authService.register(email, password, username)
        
        const dbUser = await userRepository.findByEmail(email)
        expect(dbUser.passwordHash).not.toBe(password)
        expect(dbUser.passwordHash.length).toBeGreaterThan(20)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Testing

Unit testlar aniq misollar, edge caselar va xatolik holatlarini tekshiradi.

**Test Framework:** Jest (JavaScript/TypeScript uchun)

**Unit Test Misollari:**

```typescript
describe('AuthService', () => {
  test('should reject registration with empty email', async () => {
    await expect(
      authService.register('', 'password123', 'user')
    ).rejects.toThrow(ValidationError)
  })
  
  test('should reject login with wrong password', async () => {
    await authService.register('test@example.com', 'correct', 'user')
    
    await expect(
      authService.login('test@example.com', 'wrong')
    ).rejects.toThrow(AuthenticationError)
  })
  
  test('should reject file upload exceeding size limit', async () => {
    const largeFile = Buffer.alloc(11 * 1024 * 1024) // 11MB
    
    await expect(
      fileService.uploadFile(largeFile, 'large.jpg', 'image/jpeg')
    ).rejects.toThrow(ValidationError)
  })
})

describe('MessageService', () => {
  test('should mark message as edited after edit', async () => {
    const message = await messageService.sendMessage(
      'user1',
      'chat1',
      'original',
      'text'
    )
    
    const edited = await messageService.editMessage(
      message.id,
      'edited content'
    )
    
    expect(edited.content).toBe('edited content')
    expect(edited.isEdited).toBe(true)
  })
})
```

### Integration Testing

Integration testlar komponentlar o'rtasidagi o'zaro ta'sirni tekshiradi.

```typescript
describe('Real-time messaging integration', () => {
  test('online user receives message via WebSocket', async () => {
    const sender = await createTestUser()
    const receiver = await createTestUser()
    const chat = await chatService.createDirectChat(sender.id, receiver.id)
    
    // Receiver WebSocket ulanishi
    const receiverSocket = await connectWebSocket(receiver.token)
    const messagePromise = new Promise(resolve => {
      receiverSocket.on('new_message', resolve)
    })
    
    // Sender xabar yuboradi
    await messageService.sendMessage(sender.id, chat.id, 'Hello', 'text')
    
    // Receiver xabarni olishini kutamiz
    const receivedMessage = await messagePromise
    expect(receivedMessage.content).toBe('Hello')
  })
})
```

### Test Coverage Maqsadlari

- **Unit Tests:** 80%+ code coverage
- **Property Tests:** Barcha 35 ta property uchun testlar
- **Integration Tests:** Asosiy user flowlar (login, messaging, groups)
- **Edge Cases:** Validatsiya, xatolik holatlari, chegaraviy qiymatlar

### Test Ma'lumotlari (Test Data)

```typescript
// Test uchun generator funksiyalar
const generators = {
  user: () => ({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    username: fc.string({ minLength: 3, maxLength: 30 })
  }),
  
  message: () => ({
    content: fc.string({ minLength: 1, maxLength: 5000 }),
    type: fc.constantFrom('text', 'image', 'video', 'audio', 'file')
  }),
  
  chat: () => ({
    type: fc.constantFrom('direct', 'group'),
    name: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
  })
}
```

### Continuous Integration

```yaml
# GitHub Actions yoki shunga o'xshash CI/CD
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm test
      - name: Run property tests
        run: npm run test:property
      - name: Run integration tests
        run: npm run test:integration
      - name: Check coverage
        run: npm run test:coverage
```

## Xulosa

Ushbu dizayn hujjati Telegram Clone ilovasining to'liq arxitekturasini, komponentlarini, ma'lumotlar modellarini va 35 ta to'g'rilik xususiyatini belgilaydi. Tizim zamonaviy texnologiyalar (React, Node.js, PostgreSQL, WebSocket) asosida quriladi va property-based testing orqali to'g'riligi tekshiriladi.
