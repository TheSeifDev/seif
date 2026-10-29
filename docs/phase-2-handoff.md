# Seif Portfolio — تسليم إصلاح Home بـTailwind

تم إصلاح الكود فعليًا فوق النسخة الحالية من مستودع `TheSeifDev/seif`، وليس تقديم خطة جديدة. الصفحة الإنجليزية تحافظ على Next.js وTypeScript وTailwind وshadcn/Base UI وGSAP وNeon. هذه النسخة تخص Home؛ لا تشمل dashboard أو التكاملات أو نشرًا على Vercel.

## Tailwind، وليس component CSS

كل layout وresponsive والـtypography والحواف والخلفيات والحالات التفاعلية موجودة كـTailwind utilities داخل TSX. الـutility recipes المشتركة في `lib/ui/layout.ts` توحّد العرض والمسافات بين Navbar وHero والأقسام وFooter. خواص الألوان والمسافات والـradius مُعرّفة بـTailwind arbitrary properties على wrapper؛ GSAP يحرّك متغيرات الهوية فقط.

`app/globals.css` يحتوي إعدادات Tailwind/shadcn الأصلية وtheme/base، مع ثلاثة aliases لألوان الهوية. لا يحتوي قواعد تصميم خاصة بـHero أو المشاريع أو المهارات. ملفات `portfolio.css` و`work.css` و`skills.css` غير موجودة، ولا يوجد استخدام لـ`@apply` لبناء ستايلات المكونات. الأسماء مثل `hero-word` و`work-visual` و`skills-marquee-track` باقية كـhooks لـGSAP والاختبارات، وليست تعريفات CSS.

## ما تغير فعليًا

**Layout:** نظام محتوى مشترك بـmax-width 1280px وgutters responsive. عند 1440px كل محتويات الأقسام تبدأ عند x=80 بعرض 1280px، وعند 768px عند x=32 بعرض 704px، وعند 390px عند x=20 بعرض 350px، وعند 320px عند x=20 بعرض 280px. السطوح الفاتحة تتشارك الهوامش والـradius، وإطارات الصور وكروت المشاريع تستخدم radius معرّفًا فعليًا.

**GSAP والهوية:** تسلسل Hero للعناوين المقنّعة والصورة والقائمة والمحتوى، staggered reveals، parallax لطبقات المشهد والقمر والضباب ومشهد Torii، project hover، خط تقدم Process، وخاتمة Contact. الانتقال يعتمد على scroll progress من Light Blue `#49baf1` إلى Crimson `#dc143c` مع درجات نص مناسبة للتباين. يعود للأزرق عند الصعود. Contact يعزل نفسه محليًا على Light Blue، ولا توجد color filters على portrait أو الصفحة أو مؤقت يبدّل الهوية.

**المحتوى:** ملخص مهني وقيادة PHANTOMS والتعليم والتدريب والتواصل من CV. `5+ years` بتأكيدك، وfive production platforms من CV، دون أرقام عملاء أو نتائج مخترعة. نسخة CV الأصلية قابلة للتحميل من `public/documents/seif-ayman-cv.pdf`.

**المشاريع:** RAFIQ AI Assistant وIT-SUM Platform وPHANTOMS Platform في Featured، وNabd Masr وPersonal Portfolio في More Projects. العرض editorial متفاوت التوزيع، وMore Projects grid متجاوب بدل rail إجباري. أربع صور هي captures حقيقية للصفحات العامة، وليست صورًا مخترعة للمنتج أو dashboards. Nabd Masr حوّل إلى صفحة restricted؛ لذلك له editorial visual واضح ولا CTA يدّعي أن demo عام متاح. الصور الحقيقية داخل `figure/figcaption`، والروابط الخارجية موثقة فقط. مصادر المحتوى والروابط في `docs/content-sources.md`.

**Skills وProcess:** 15 مجموعة من CV، وثلاثة marquee rows باتجاهات left/right/left مع أيقونات `react-icons`، segment spacing مضبوط، pause يدوي وعند hover، وتوقف خارج منطقة العرض. reduced motion يعرض محتوى ثابتًا ويلغي النسخة المكررة ويعطل زر الحركة. Process يربط Discover → Design → Build → Ship بخط تقدم على desktop ووصلات مناسبة للموبايل. لا نسب إتقان أو proficiency levels.

**التنقل:** قائمة الموبايل تفتح وتغلق وتدعم Escape، مع إدارة focus عند الإغلاق أو الانتقال للـdesktop. روابط التنقل تستهدف الأقسام الموجودة، وليس صفحات مستقبلية غير منفذة. الصورة الطبيعية والأصول اليابانية المحلية محفوظة، ولم يُستبدل الإعداد الحالي بـstarter آخر.

## الملفات الرئيسية

| الملفات | مسؤوليتها في التعديل |
|---|---|
| `app/globals.css`, `app/layout.tsx`, `app/page.tsx` | Tailwind theme/base، typography/scroll accessibility، تركيب الأقسام ومؤشر scroll |
| `lib/ui/layout.ts` | Tailwind utility recipes لنظام container والسطوح والمسافات |
| `components/home/hero.tsx`, `sections.tsx`, `primitives.tsx` | Hero وAbout وJourney وProcess وContact والعناوين والأزرار |
| `components/home/work-section.tsx`, `lib/content/projects.ts` | القصص الخمس، verified links، الصور الحقيقية أو editorial fallback |
| `components/home/skills-section.tsx`, `technology-icons.tsx`, `lib/content/skills.ts` | 15 مجموعة، ثلاث marquee rows، مكتبة أيقونات موحدة وlifecycle |
| `components/layout/navbar.tsx`, `footer.tsx` | التنقل responsive وfocus وروابط CV والتواصل |
| `components/motion/scroll-experience.tsx` | GSAP context/matchMedia/reveals/parallax/theme/progress وتنظيف listeners/tweens |
| `lib/content/home.ts`, `public/documents/`, `public/images/projects/` | محتوى CV وملف التحميل وأربع captures فعلية |
| `package.json`, `package-lock.json` | إضافة `react-icons` فقط فوق الاعتمادات المحفوظة |
| `scripts/check-tailwind-browser.py`, `capture-project-sites.py`, `motion-harness.tsx`, `docs/checks/` | فحوص ومصادر evidence؛ لا public QA route في التسليم |

تم حذف `project-card.tsx` و`project-rail.tsx` القديمين واستبدالهما بالعرض الجديد. `next.config.ts` و`neon.ts` محفوظان دون تغيير. لا database writes أو أسرار أو إنشاء خدمات مدفوعة.

## الفحوص التي نُفذت بالفعل

| الفحص | النتيجة المثبتة |
|---|---|
| `npm run build` بعد آخر تعديل TSX | نجح، exit 0؛ Home prerendered +404 + icon |
| `npm run typecheck` و`npm run lint` | نجحا، exit 0؛ أُعيدا بعد آخر تغييرات التوثيق والاختبارات |
| `/` و`/manus-routes.json` | HTTP200؛ manifest يعلن Home الموجودة فقط |
| Chromium على 1440 / 768 / 390 / 320px | لا horizontal overflow، لا عنوان مقصوص، frames متطابقة، خمس قصص و15 مجموعة، الصور المرئية محملة، لا page JavaScript errors |
| قائمة الموبايل | open / Escape / link-close نجحت على 768 و390 و320px |
| الهوية أثناء تشغيل التطبيق | البداية `#49baf1` / mix=0، الوسط mix≈0.432، النهاية `#dc143c` / mix=1، الرجوع `#49baf1` / mix=0؛ لون عنوان Hero رجع نفسه |
| Contact والصورة | Contact بقي `#49baf1` عند كل مراحل الهوية؛ `portrait filter: none` |
| اتجاه marquee | الإزاحات المقاسة خلال 0.9s تقريبًا −27.84 / +27.83 / −27.84px |
| Pause وloop | pause اليدوي والـhover نجحا؛ segments متساوية، والفاصل يقارب صفر؛ تم انتظار دورة كاملة فعلية لكل الصفوف، بمدد نحو 49.55 / 50.99 / 54.21s |
| reduced motion | transforms الثلاثة `none`، النسخ المكررة `display:none`، زر الحركة disabled، محتوى ثابت |
| StrictMode mount/unmount harness في Chromium | 8 ScrollTriggers → unmount 0 → remount 8 → reduced motion 0 → final unmount 0؛ hover في reduced motion لا يحرّك visual، دون page errors |
| تباين نص الهوية على السطح الفاتح | 11 عينة خلال blend، أقل contrast 5.30:1؛ الأزرق الرئيسي لم يتغير، ink صار `#076c9b` للنص الصغير |
| `git diff --check` | نجح بعد تنظيف whitespace في سجلات الأدوات |

الاختبار النهائي هو `python3 scripts/check-tailwind-browser.py --reuse-loop`: أعاد كل المقاسات والتفاعلات واستعمل دليل الدورة الكاملة السابق فقط بعد مطابقة بصمة ملفات marquee والستايل. التشغيل السابق أكمل جميع فحوص desktop والدورة الحقيقية، ثم توقف بسبب locator اختبار كان يبحث عن اسم “Open” بعد تحول الزر إلى “Close”؛ أُصلح الاختبار إلى locator ثابت، لا كود القائمة بسبب هذا الخطأ. التشغيل الافتراضي للسكربت ما يزال ينتظر دورة كاملة جديدة.

نتائج الآلة في `docs/checks/tailwind-browser-results.json` و`marquee-real-loop.json` و`motion-lifecycle-results.json` و`palette-contrast-results.json` و`results.json` وسجلات build/typecheck/lint. لقطات QA محفوظة محليًا ومستبعدة من Git، وليست بديلًا عن إثبات الحركة الحية.

## حالة التشغيل وحدود التسليم

خادم `next dev` في هذه البيئة أظهر فشل handshake للـHMR WebSocket، ولم يكتمل hydration للقائمة وGSAP رغم تحميل الملفات. تم عزل ذلك عن build الإنتاجي: `npm run start -- --hostname 0.0.0.0` فعّل hydration والتفاعل ونجحت عليه الفحوص المذكورة. Preview يعرض الآن build الإنتاجي على port3000؛ لم يتم تغيير إعدادات Next أو الادعاء بإصلاح مشكلة HMR نفسها. تشغيل production في Preview ليس نشرًا خارجيًا.

لم تُنفذ بعد الصفحات التفصيلية أو dashboard أو Better Auth أو Neon/Drizzle schema/migrations أو GitHub/Instagram integration أو تخزين private assets أو deployment على Vercel. تبقى هذه مراحل لاحقة بقواعد draft/private/explicit publish/delete المعتمدة. مشروع CV المعروض محتوى وافقت عليه للـHome؛ ليس نشرًا تلقائيًا من integration.
