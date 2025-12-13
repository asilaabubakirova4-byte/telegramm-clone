# Talablar Hujjati (Requirements Document)

## Kirish (Introduction)

Telegram Clone - bu real vaqtda xabar almashish imkonini beruvchi messaging ilovasi. Foydalanuvchilar bir-biriga xabar yuborishi, guruh chatlari yaratishi, media fayllar almashishi va real vaqtda muloqot qilishi mumkin. Tizim zamonaviy web texnologiyalari asosida quriladi va kengaytiriladigan arxitekturaga ega bo'ladi.

## Lug'at (Glossary)

- **System**: Telegram Clone messaging ilovasi
- **User**: Tizimga ro'yxatdan o'tgan va autentifikatsiya qilingan foydalanuvchi
- **Message**: Foydalanuvchilar o'rtasida almashiladigan matn yoki media kontent
- **Chat**: Ikki yoki undan ortiq foydalanuvchilar o'rtasidagi xabar almashinuv sessiyasi
- **Group Chat**: Bir nechta foydalanuvchilar ishtirok etadigan chat
- **Direct Message**: Ikki foydalanuvchi o'rtasidagi shaxsiy chat
- **Online Status**: Foydalanuvchining hozirgi faollik holati
- **Media File**: Rasm, video, audio yoki hujjat fayli
- **Real-time**: Darhol, kechikishsiz ma'lumot uzatish
- **WebSocket Connection**: Ikki tomonlama real vaqt aloqa kanali

## Talablar (Requirements)

### Talab 1: Foydalanuvchi Ro'yxatdan O'tishi va Autentifikatsiya

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men tizimga xavfsiz kirish uchun ro'yxatdan o'tishim va login qilishim kerak.

#### Qabul Mezonlari (Acceptance Criteria)

1. WHEN foydalanuvchi email va parol bilan ro'yxatdan o'tishni boshlasa, THEN THE System SHALL yangi foydalanuvchi akkauntini yaratishi va ma'lumotlarni xavfsiz saqlashi kerak
2. WHEN foydalanuvchi to'g'ri login ma'lumotlarini kiritsa, THEN THE System SHALL foydalanuvchini autentifikatsiya qilishi va sessiya tokenini yaratishi kerak
3. WHEN foydalanuvchi noto'g'ri login ma'lumotlarini kiritsa, THEN THE System SHALL kirishni rad etishi va xatolik xabarini ko'rsatishi kerak
4. WHEN foydalanuvchi tizimdan chiqsa, THEN THE System SHALL sessiyani tugatishi va tokenni bekor qilishi kerak
5. THE System SHALL parollarni hash qilib saqlashi va ochiq ko'rinishda saqlamasligi kerak

### Talab 2: Shaxsiy Xabar Yuborish (Direct Messaging)

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men boshqa foydalanuvchilarga shaxsiy xabar yuborishim va real vaqtda javob olishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi boshqa foydalanuvchiga xabar yozib yuborganda, THEN THE System SHALL xabarni darhol qabul qiluvchiga yetkazishi kerak
2. WHEN xabar yuborilganda, THEN THE System SHALL xabarni ma'lumotlar bazasida saqlab qolishi kerak
3. WHEN qabul qiluvchi online bo'lsa, THEN THE System SHALL xabarni real vaqtda WebSocket orqali yetkazishi kerak
4. WHEN qabul qiluvchi offline bo'lsa, THEN THE System SHALL xabarni saqlab qolishi va foydalanuvchi online bo'lganda yetkazishi kerak
5. WHEN xabar yuborilganda, THEN THE System SHALL yuboruvchiga xabar yuborilganlik tasdiqini ko'rsatishi kerak

### Talab 3: Guruh Chatlari

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men bir nechta odamlar bilan guruh chatlarida muloqot qilishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi yangi guruh yaratsa, THEN THE System SHALL guruhni yaratishi va yaratuvchini administrator qilib belgilashi kerak
2. WHEN administrator guruhga yangi a'zolarni qo'shsa, THEN THE System SHALL a'zolarni guruhga qo'shishi va ularga xabarnoma yuborishi kerak
3. WHEN guruh a'zosi xabar yuborganda, THEN THE System SHALL xabarni barcha guruh a'zolariga yetkazishi kerak
4. WHEN administrator a'zoni guruhdan chiqarsa, THEN THE System SHALL a'zoni guruhdan olib tashlashi va unga guruh xabarlarini ko'rsatmasligi kerak
5. THE System SHALL guruh a'zolari ro'yxatini saqlashi va ko'rsatishi kerak

### Talab 4: Media Fayl Yuborish

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men chatda rasm, video va boshqa fayllarni yuborishim va qabul qilishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi media fayl yuklasa, THEN THE System SHALL faylni qabul qilishi va serverda xavfsiz saqlashi kerak
2. WHEN fayl yuklanganda, THEN THE System SHALL fayl hajmini tekshirishi va maksimal hajmdan oshmaganligini ta'minlashi kerak
3. WHEN media fayl xabar sifatida yuborilganda, THEN THE System SHALL fayl URL manzilini xabar bilan birga yuborishi kerak
4. WHEN qabul qiluvchi media xabarni ochsa, THEN THE System SHALL faylni yuklab olish imkonini berishi kerak
5. THE System SHALL rasm fayllar uchun thumbnail (kichik ko'rinish) yaratishi kerak

### Talab 5: Online Status va Typing Indikatori

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men suhbatdoshimning online yoki offline ekanligini va yozayotganini bilishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi tizimga kirsa, THEN THE System SHALL foydalanuvchi statusini "online" ga o'zgartirishi va kontaktlariga ko'rsatishi kerak
2. WHEN foydalanuvchi tizimdan chiqsa yoki faol bo'lmasa, THEN THE System SHALL statusni "offline" ga o'zgartirishi va oxirgi faollik vaqtini ko'rsatishi kerak
3. WHEN foydalanuvchi chatda yozayotgan bo'lsa, THEN THE System SHALL suhbatdoshiga "typing..." indikatorini ko'rsatishi kerak
4. WHEN foydalanuvchi yozishni to'xtatsa, THEN THE System SHALL typing indikatorini olib tashlashi kerak
5. THE System SHALL online statusni real vaqtda WebSocket orqali yangilashi kerak

### Talab 6: Xabar Qidirish

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men eski xabarlarni tezda topish uchun qidiruv funksiyasidan foydalanishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi qidiruv so'zini kiritsa, THEN THE System SHALL barcha chatlardan mos keladigan xabarlarni topishi kerak
2. WHEN qidiruv natijalari ko'rsatilganda, THEN THE System SHALL xabar matnini, yuboruvchini va sanani ko'rsatishi kerak
3. WHEN foydalanuvchi qidiruv natijasini tanlasa, THEN THE System SHALL foydalanuvchini o'sha xabar joylashgan chatga olib borishi kerak
4. THE System SHALL qidiruv natijalarini relevantlik bo'yicha tartiblashi kerak
5. THE System SHALL qidiruv so'zini xabar matnida highlight qilib ko'rsatishi kerak

### Talab 7: Xabarlarni O'chirish va Tahrirlash

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men yuborgan xabarlarimni tahrirlashim yoki o'chirishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchi o'z xabarini tahrirlaganda, THEN THE System SHALL xabarni yangilashi va "tahrirlangan" belgisini qo'shishi kerak
2. WHEN foydalanuvchi xabarni o'chirganda, THEN THE System SHALL xabarni o'chirishi va barcha ishtirokchilarga yangilanishni yuborishi kerak
3. WHEN xabar tahrirlanganida, THEN THE System SHALL yangilangan xabarni real vaqtda barcha ishtirokchilarga ko'rsatishi kerak
4. THE System SHALL faqat xabar egasiga tahrirlash va o'chirish imkonini berishi kerak
5. WHEN xabar o'chirilganda, THEN THE System SHALL media fayllarni ham serverdan o'chirishi kerak

### Talab 8: Xabarnomalar (Notifications)

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men yangi xabarlar haqida xabarnoma olishim kerak.

#### Qabul Mezonlari

1. WHEN foydalanuvchiga yangi xabar kelganda va u boshqa sahifada bo'lsa, THEN THE System SHALL brauzer xabarnomasi yuborishi kerak
2. WHEN yangi xabar kelganda, THEN THE System SHALL o'qilmagan xabarlar sonini ko'rsatishi kerak
3. WHEN foydalanuvchi chatni ochib xabarlarni o'qisa, THEN THE System SHALL o'qilmagan xabarlar sonini nolga tushirishi kerak
4. THE System SHALL foydalanuvchiga xabarnomalarni yoqish yoki o'chirish imkonini berishi kerak
5. WHEN guruh chatida xabar kelganda, THEN THE System SHALL guruh nomini xabarnomada ko'rsatishi kerak

### Talab 9: Real-time Aloqa Arxitekturasi

**Foydalanuvchi Hikoyasi:** Tizim arxitekti sifatida, men barcha real vaqt funksiyalari ishonchli va tezkor ishlashini ta'minlashim kerak.

#### Qabul Mezonlari

1. THE System SHALL WebSocket protokolidan real vaqt aloqa uchun foydalanishi kerak
2. WHEN WebSocket aloqasi uzilsa, THEN THE System SHALL avtomatik qayta ulanishni amalga oshirishi kerak
3. THE System SHALL xabarlarni ketma-ket tartibda yetkazishni ta'minlashi kerak
4. WHEN server yuklanishi yuqori bo'lsa, THEN THE System SHALL barcha foydalanuvchilarga xizmat ko'rsatishni davom ettirishi kerak
5. THE System SHALL xabar yetkazilganlik statusini (yuborildi, yetkazildi, o'qildi) kuzatishi kerak

### Talab 10: Ma'lumotlar Xavfsizligi

**Foydalanuvchi Hikoyasi:** Foydalanuvchi sifatida, men shaxsiy ma'lumotlarim va xabarlarim xavfsiz saqlanishiga ishonchim komil bo'lishi kerak.

#### Qabul Mezonlari

1. THE System SHALL barcha parollarni bcrypt yoki shunga o'xshash algoritm bilan hash qilib saqlashi kerak
2. THE System SHALL HTTPS protokolidan foydalanishi va barcha ma'lumotlarni shifrlangan holda uzatishi kerak
3. THE System SHALL foydalanuvchi sessiyalarini JWT token orqali boshqarishi kerak
4. THE System SHALL foydalanuvchi ma'lumotlariga faqat autentifikatsiya qilingan so'rovlar orqali kirish imkonini berishi kerak
5. THE System SHALL SQL injection va XSS hujumlaridan himoyalanishi kerak
