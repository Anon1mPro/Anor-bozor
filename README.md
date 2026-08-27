# ANOR BOZOR — onlayn bozor

Foydalanuvchilar ro'yxatdan o'tadi, o'z mahsulotlarini qo'yadi, boshqalarnikini sotib
olib chat orqali yozishadi. Admin butun bozorni boshqaradi.

## Firebase sozlash (bir marta)

### 1. Authentication yoqish
Firebase Console → **Build → Authentication → Get started** →
**Sign-in method** → **Email/Password** ni yoqing.

### 2. Firestore Database
**Build → Firestore Database → Create database**. Joylashuv: `asia-southeast1`.
Test rejimda boshlang.

### 3. Realtime Database (chat + admin parol)
**Build → Realtime Database → Create database**. Joylashuv: `asia-southeast1`.
Test rejimda boshlang. So'ng **Data** tabida qo'lda yarating:

```
sozlamalar/
  admin_parol: "sizning_maxfiy_parolingiz"
```

### 4. Ishga tushirish
```bash
cd bozor
python3 -m http.server 5500
# http://localhost:5500
```

## Sahifalar

| Fayl | Kirish talab | Vazifa |
|---|---|---|
| index.html | ❌ | Bosh sahifa, lentada mahsulotlar |
| mahsulotlar.html | ❌ | Katalog: qidiruv, filtr |
| mahsulot.html | ❌ o'qish, ✅ sotib olish/izoh | Bitta mahsulot |
| saqlanganlar.html | ❌ | Yoqtirgan mahsulotlar |
| royxat.html | mehmon | Yangi hisob |
| kirish.html | mehmon | Kirish |
| menikilar.html | ✅ | O'z mahsulotlarim (CRUD) |
| xabarlar.html | ✅ | Chatlar (real vaqtda) |
| aloqa.html | ❌ | Aloqa formasi |
| admin.html | RTDB parol | Butun bozorni moderatsiya |

## Ma'lumotlar tuzilmasi

**Firestore:**
```
mahsulotlar/{id}
  nom, narx, kategoriya, zaxira, rasm, tavsif,
  sotuvchiId, sotuvchiIsmi, createdAt
mahsulotlar/{id}/izohlar/{id}
  muallif, matn, baho, createdAt
```

**Realtime Database:**
```
sozlamalar/
  admin_parol: "..."
foydalanuvchilar/{uid}
  ism, email, telefon, createdAt
chatlar/{cid}
  malumot: { ishtirokchilar, mahsulotId, mahsulotNomi, yangilangan }
  xabarlar/{id}: { yozuvchiUid, yozuvchiIsmi, matn, createdAt }
```
Chat ID = ikkala UID ni alfavitda saralab qo'shish (bir juftlikka bitta chat).

## Xavfsizlik qoidalari

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /mahsulotlar/{id} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.sotuvchiId == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.sotuvchiId == request.auth.uid;
      match /izohlar/{i} {
        allow read: if true;
        allow create: if request.auth != null;
      }
    }
  }
}
```

### Realtime DB Rules
```json
{
  "rules": {
    "sozlamalar":     { ".read": true, ".write": false },
    "foydalanuvchilar": {
      "$uid": { ".read": true, ".write": "$uid === auth.uid" }
    },
    "chatlar": {
      "$cid": {
        ".read":  "auth != null && data.child('malumot/ishtirokchilar').child(auth.uid).val() === true",
        ".write": "auth != null"
      }
    }
  }
}
```

**Muhim eslatma:** `sozlamalar` node'i ochiq o'qiladi — ya'ni admin parolni brauzer
console orqali oʻqib olish mumkin. Bu **himoya emas**, oddiy toʻsiq. Jiddiy loyihada
admin rolini Firebase Custom Claims yoki Cloud Functions bilan qiling.

## Sozlash

- `js/config.js` — telefon, email, kategoriyalar
- `css/base.css` — rang, shrift, o'lchov tokenlari
- Admin parol — RTDB `sozlamalar/admin_parol`
