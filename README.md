# مذاكرتي — Firebase Integration

## الملفات

| الملف | الوصف |
|---|---|
| `mazakrati.html` | تطبيق مذاكرتي مع Firebase Auth + مزامنة البيانات |
| `sw.js` | Service Worker مع دعم الإشعارات الخلفية |
| `manifest.json` | ملف PWA manifest |
| `icon-192.svg` | أيقونة التطبيق |

## كيف يعمل

### تسجيل الدخول
- عند فتح `mazakrati.html` تظهر شاشة تسجيل الدخول بـ Google
- نفس حساب Google المستخدم في `index.html` (نفس مشروع Firebase)
- بعد الدخول، يُحمَّل التطبيق كاملاً

### مزامنة البيانات
- كل بيانات localStorage تُمرَّر تلقائياً إلى Firebase Realtime Database
- المسار: `users/{uid}/mazakrati/{key}`
- عند تسجيل الدخول: البيانات تُحمَّل من Firebase → localStorage
- عند التعديل: تُحفَظ في localStorage + Firebase في نفس الوقت

### الإشعارات الخلفية
- عند منح إذن الإشعارات، يُجدول Service Worker تذكيراً كل ساعتين
- تعمل الإشعارات حتى عند إغلاق التطبيق (طالما المتصفح مفتوح)
- يمكن استقبال Push Notifications من FCM إذا أُضيف VAPID key

## الرفع على استضافة

الملفات جاهزة للرفع مباشرة على أي استضافة ثابتة (GitHub Pages, Netlify, إلخ).
تأكد أن `mazakrati.html` و `sw.js` و `manifest.json` في نفس المجلد.

## Firebase المستخدم
- Project: `schedule-21d09`
- Auth: Google Sign-In
- Database: Firebase Realtime Database
