<div align="center">
  <img src="public/assets/logo.webp" width="120" alt="Skyline" />
  <h1>Skyline — Global Migration & Visa Experts</h1>
  <p>بوابة هجرة وتأمين فرص عمل متكاملة مع بوابة دفع حقيقية (Stripe).</p>
</div>

---

## ✦ نظرة عامة

موقع متقدم لشركة **Skyline** لخدمات الهجرة وتأمين فرص العمل الدولية، يشمل:

- **واجهة عربية فاخرة (RTL)** مستوحاة من هوية الشعار (كحلي + ذهبي + فضي).
- **كتالوج خدمات** بأسعار شفّافة (استشارة، تأشيرة عمل، Express Entry، تأمين وظيفة، دراسة، لمّ شمل).
- **لوحة وظائف دولية** قابلة للبحث والتصفية مع التقديم المباشر.
- **بوابة دفع حقيقية عبر Stripe Checkout** — تعمل بكروت اختبار فوراً، وتتحول لمدفوعات حقيقية عند إضافة مفاتيحك.
- **حسابات المستخدمين** (تسجيل/دخول آمن بـ JWT + تشفير كلمات المرور bcrypt).
- **لوحة تحكم للمشرف** لإدارة الطلبات والمدفوعات والرسائل والوظائف.
- قاعدة بيانات حقيقية (SQLite) تعمل فوراً بلا إعداد خارجي.

## 🚀 التشغيل المحلي

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد البيئة
cp .env.example .env       # ثم عدّل القيم (JWT_SECRET ومفاتيح Stripe)

# 3) التشغيل
npm start
```

ثم افتح: **http://localhost:3000**

> أول تشغيل ينشئ قاعدة البيانات تلقائياً ويزرع: حساب المشرف + الخدمات + 8 وظائف نموذجية.

**حساب المشرف الافتراضي** (غيّره من `.env` قبل الإطلاق):
- البريد: `admin@skyline.com`
- كلمة المرور: `Skyline@Admin2026`

## 💳 تفعيل المدفوعات الحقيقية (Stripe)

البوابة **حقيقية 100٪** عبر Stripe Checkout. تعمل بثلاثة أوضاع حسب المفاتيح في `.env`:

| الوضع | المفاتيح | السلوك |
|------|---------|--------|
| **Demo** 🧩 | لا توجد مفاتيح | محاكاة كاملة لتدفّق الدفع (للعرض والتطوير) |
| **Test** 🧪 | `sk_test_…` / `pk_test_…` | دفع حقيقي عبر Stripe ببطاقات الاختبار |
| **Live** 💳 | `sk_live_…` / `pk_live_…` | **مدفوعات نقدية حقيقية** |

خطوات التفعيل الحقيقي:
1. أنشئ حساباً على [stripe.com](https://dashboard.stripe.com) ووثّق نشاطك التجاري.
2. انسخ المفاتيح من [Dashboard → API keys](https://dashboard.stripe.com/apikeys) إلى `.env`.
3. (اختياري للإنتاج) أضف Webhook على `https://YOUR_DOMAIN/api/payments/webhook` وضع `STRIPE_WEBHOOK_SECRET`.
4. أعد التشغيل — ستصبح كل عمليات الدفع حقيقية.

> بطاقة اختبار Stripe: `4242 4242 4242 4242` — أي تاريخ مستقبلي وأي CVC.

## 🗂️ البنية

```
server/
  index.js        # خادم Express + الأمان (helmet, rate-limit, CSP)
  db.js           # قاعدة بيانات SQLite + المخطط
  auth.js         # JWT + الصلاحيات
  stripe.js       # تهيئة بوابة الدفع
  seed.js         # بيانات أولية (مشرف، خدمات، وظائف)
  routes/         # auth, catalog, applications, payments, admin
public/
  index.html      # الصفحة الرئيسية
  services.html   # الخدمات + الدفع
  jobs.html       # الوظائف الدولية
  account.html    # دخول/تسجيل + لوحة العميل
  admin.html      # لوحة المشرف
  payment-*.html  # صفحات الدفع والنجاح
  css/ js/ assets/
```

## 🔌 أهم نقاط الـ API

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/register` `/login` `/logout` | المصادقة |
| GET | `/api/services` `/api/jobs` | الكتالوج العام |
| POST | `/api/applications` | تقديم طلب/وظيفة |
| GET | `/api/payments/config` | وضع البوابة الحالي |
| POST | `/api/payments/checkout` | إنشاء جلسة دفع |
| GET | `/api/payments/verify` | تأكيد الدفع |
| POST | `/api/payments/webhook` | استقبال أحداث Stripe |
| * | `/api/admin/*` | إدارة (مشرف فقط) |

## 🔒 الأمان

- تشفير كلمات المرور بـ bcrypt، وجلسات JWT عبر httpOnly cookies.
- Helmet + Content-Security-Policy + حدّ معدّل الطلبات (rate limiting).
- التحقق من توقيع Stripe webhook، والتحقق من الجلسة قبل اعتماد الدفع.
- لا تُخزَّن بيانات البطاقات إطلاقاً — تُعالَج بالكامل لدى Stripe.

## 📄 الترخيص
MIT
