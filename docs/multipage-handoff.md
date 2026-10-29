# تسليم إعادة البناء متعددة الصفحات — 2026-10-29

هذا التقرير يلخّص ما اتنفّذ استجابةً لتقييمك (3/10) ولقراراتك النهائية: الموقع بقى تطبيق متعدد الصفحات، كل صفحة ليها تكوين مستقل، والهوية الزرقاء الموحدة مستخدمة في الكل. مفيش أي deployment حصل، ولا Neon ولا Resend اتوصّلوا لحد دلوقتي.

## المسارات

| المسار | الوظيفة | طبيعة الحركة |
| --- | --- | --- |
| `/` | Home: Hero، About، Journey، Featured، More Projects، Skills، Process، CTA بعنوان Let's Connect | أقوى سرد scroll-driven في الموقع |
| `/about` | الخبرة والتعليم والمبادئ من الـCV، وتحميل الـCV | reveals خفيفة وصورة parallax |
| `/projects` | فهرس المشاريع الستة | بدون pin، محتوى أولًا |
| `/projects/[slug]` | دراسة حالة لكل مشروع: rafiq، it-sum، phantoms، nabd-masr، personal-portfolio، trackup | حركة صورة واحدة مختارة |
| `/blog` | فهرس المقالات المنشورة (فاضي حاليًا وبيعرض empty state) | خفيفة |
| `/blog/[slug]` | المقال. المسودات بترجّع 404 | خفيفة |
| `/contact` | نموذج التواصل الكامل | خفيفة |

الـslugs غير الموجودة وغير المنشورة بيرفضها `proxy.ts` قبل الـrender، فبترجّع 404 حقيقي. والـsitemap مفيهوش أي مسودة.

## ما اتغيّر حسب ملاحظاتك

- **About**: العنوان بيظهر سطر بسطر بقناع، ولوحة الحبر بتتحرك، والبيان بيمتلي مع التمرير. كله مربوط بتقدّم الـscroll الفعلي (scrub) ومش reveal عشوائي.
- **Journey**: اتعاد تصميمه بالكامل كأربع فصول مكدسة sticky بنفس المقاس (497px). معاه rail جانبي بيوضح الفصل الحالي، وkanji لكل فصل، وحقائق الـCV بس. على الموبايل بيتعرض رأسي عادي.
- **Featured Projects**: track أفقي مثبت بيقف على آخر شريحة بالظبط مع snap للشرائح. الشريحة الحالية بتكبر بدل ما الباقي يبهت. الـnavbar بقى معتم فوق الأسطح الفاتحة. الـstage بيتظبط على الشاشات القصيرة: 1440×760 و1280×800 و1024×768 كلها بدون overflow.
- **More Projects**: تلات مشاريع (Nabd Masr، Personal Portfolio، TrackUp). زرار Watch Live أو Go to Repo بيظهر بس للروابط اللي اتأكدت منها. Nabd Masr معاينته مقفولة، فمعروض بـvisual تحريري ومش screenshot.
- **Skills & Technologies**: تلات صفوف marquee بتتحرك عكس بعض، مترتبة Interface / Systems / Platform. الألوان مضبوطة للوضع الداكن، والحركة بتقف خارج الشاشة، وفيه زرار pause.
- **My Process**: تصميم جديد عبارة عن مسار متصل بيمتلي مع التمرير وبيفعّل كل مرحلة. على الشاشات الصغيرة بيبقى خط تقدّم رأسي.
- **Let's Connect**: بقى CTA مختصر في آخر الـHome بيودّي على `/contact`.
- **Footer**: اتعاد تصميمه بروابط حقيقية للصفحات والتواصل والـCV.

## نموذج التواصل

- التحقق بـZod على الخادم، ومعاه honeypot وفحص لسرعة الإرسال وrate limiting بـHMAC للـIP.
- الحفظ عن طريق Drizzle في جدول `contact_messages`، والـmigration في `drizzle/0000_contact_messages.sql`.
- إشعار Resend بيتبعت بعد الحفظ بس، ولو فشل الإرسال الرسالة بتفضل محفوظة ومعاها حالة الفشل.
- الواجهة بتقول الحقيقة دايمًا: نجاح بس لو الرسالة اتحفظت فعلًا، و«ما اتبعتتش» لو مفيش قاعدة بيانات، و«اتحفظت بس الإيميل ما اتبعتش» لو Resend فشل.

**للتفعيل لاحقًا**: محتاج `DATABASE_URL` (والـunpooled للـmigrations) و`CONTACT_HASH_SECRET`، وبعدين تشغيل `npx drizzle-kit migrate`. ولـResend محتاج `RESEND_API_KEY` و`CONTACT_FROM_EMAIL` من دومين متأكَّد منه، و`CONTACT_TO_EMAIL`. كل المتغيرات موصوفة في `.env.example`.

## المدونة

فيه تلات مسودات في `lib/content/blog.ts` حالتها `draft`، ومحتاجة مراجعتك قبل النشر:

- Keep the interface away from the model
- Validate at the boundary
- Scroll animation that cleans up after itself

مفيش ولا واحدة فيهم ظاهرة للعامة.

## الاختبارات اللي اتشغّلت فعلًا

- `next build` و`tsc --noEmit` و`eslint`: كلهم exit 0.
- فتح كل مسار مباشرة: 200 للصفحات و404 للـslugs غير الموجودة والمسودات.
- `scripts/check-multipage.py` على production build (النتيجة FAILURES: 0):
  - على Home: 13 trigger و2 pins.
  - track الـFeatured بيتحرك 0 ثم −1050 ثم −2100px وبيقف على آخر شريحة، وكل نقاط الـsnap محاذية.
  - Process بيرجع للمرحلة الأولى لما تمرّر لفوق.
  - التنقل بين الصفحات: `/about` بعد Home فيها triggers الـAbout بس، والرجوع لـHome بيعيد إنشاء نفس الـ13 trigger والـ2 pins من غير تراكم.
  - reduced motion: صفر triggers وكل المحتوى ظاهر.
- `scripts/measure-featured-fit.py` مع فحص لـProcess وJourney: صفر overflow على 1440×900 و1440×760 و1280×800 و1024×768 و1920×1080.
- API التواصل على PostgreSQL محلي (`docs/checks/contact-api-results.txt`):
  - 201 saved.
  - 201 saved مع notification فشلت والصف محفوظ.
  - 429 بعد تكرار الإرسال.
  - رفض الـhoneypot والإرسال السريع.
  - 400 للحقول غير الصحيحة.
  - 503 `not_configured` لما مفيش قاعدة بيانات.

## حدود واضحة

- Neon وResend متجرّبوش بإعدادات حقيقية لسه.
- الـdashboard والمصادقة واستيراد GitHub وInstagram كلها مؤجلة للمرحلة الجاية.
- Personal Portfolio مربوط بالموقع الحي القديم seifdev.vercel.app. مفيش repo معروض له، لأن `TheSeifDev/seif` فيه الكود الجديد ده، مش القديم.
