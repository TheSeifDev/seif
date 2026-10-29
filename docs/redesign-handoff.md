# تسليم إعادة تصميم Home — Seif Ayman

تم إعادة بناء Home في نفس مشروع Next.js، باستخدام **Tailwind utilities** لكل مكوّن وGSAP للمشاهد المرتبطة بالتمرير. الهوية الآن **Light Blue ثابتة**؛ أُزيلت حركة Crimson/البنفسجي نهائيًا من نظام الحركة. صورة سيف وصور المشاريع لا تتلوّن. التنفيذ الحالي للمراجعة في Preview، وليس نشرًا على Vercel أو استكمالًا للـDashboard.

## ما تغيّر في التجربة

| المشهد | التنفيذ الفعلي |
|---|---|
| Hero | عنوان SEIF / AYMAN داخل masks، صورتك الطبيعية أمام بيئة يابانية أصلية جديدة، parallax مستقل للخلفية/القمر/الصورة والضباب عند المغادرة، وCTA/CV فعليان. |
| About | سطح أبيض مستدير يتداخل مع Hero، عنوان/supporting copy مرتبطان بالـscroll، reveal محدود للوحة الحبر وparallax قليل. |
| Journey | ثلاث مراحل Foundation → Products → Leadership داخل لوحة ثابتة على desktop، تتراكم الطبقات تدريجيًا. Progress وpager قابل للوحة المفاتيح، مع `aria-hidden`/`inert` للمراحل غير النشطة. |
| Featured Projects | ثلاث case studies أفقية يقودها التمرير الرأسي؛ عرض slide كامل ومسافة track محسوبة من DOM، نهاية واضحة وتحرير pin، depth بسيط للصور داخل نفس timeline وfocus ينقل إلى المشروع الصحيح. |
| More Projects | عرض رأسي/عمودان خفيف ومختلف عن الـFeatured؛ Nabd Masr يظل editorial visual معلّمًا، وليس screenshot مختلقًا. |
| Skills | ثلاث صفوف CV/icons باتجاه يسار/يمين/يسار وloop حقيقي؛ pause يدوي/hover/focus/offscreen/hidden tab، وstatic wrap مع reduced motion. |
| Process | Discover / Design / Build / Ship على خط تقدّم واحد مرتبط بالتمرير، أفقي desktop ورأسي mobile. |
| Contact | تداخل إلى مشهد Torii أزرق، reveal للعنوان والمشهد وCTA، ومعلومات CV وروابط تواصل صحيحة. |

تعمل الـpins على عرض **1024px فأكثر وارتفاع760px فأكثر** فقط، دون reduced motion. باقي الأوضاع تعرض المحتوى رأسيًا في normal flow. لا smooth-scroll library ولا root overflow trap.

## Three.js فعلًا، وليس تأثير CSS مُسمّى 3D

تم تقييم R3F9 المناسب لـReact19 وميزة demand rendering، ثم اختيار Three.js مباشر لأن المشهد قمر واحد ولا يحتاج renderer React أو Drei. الكود lazy داخل client boundary مستقل، والـCSS fallback ظاهر منذ SSR. المصنّع يستخدم sphere واحدة مع surface variation وإضاءة blue-hour، **2208 مثلثات وdraw call واحدة**. DPR≤1.5؛ canvas510×510 في الاختبار عند DPR2، وليس canvas بحجم الصفحة.

لا animation loop مستمر. إطارات الرسم تُطلب فقط عند scroll/resize/visibility وتُدمج في rAF واحدة. المصنع يتخلّص صراحةً من geometry/material/renderer والـcontext والـcanvas، ويعود إلى fallback إذا فُقد WebGL أو أصبحت CPU render calls بطيئة بصورة متكررة. الموبايل وreduced-motion وdata saver والأجهزة منخفضة الذاكرة لا تحمّل مشهدًا عاملًا.

## قرارات الأداء وتصحيحات كشفتها الاختبارات

الـinitializer القديم الذي يملك كل الصفحة استُبدل بـcontrollers محددة النطاق. يوجد **6 ScrollTriggers** على desktop: أربع مشاهد واثنتان للـpins؛ لا trigger لكل حرف أو كارت. لا tween لمتغيرات الهوية الوراثية على root، ولا مراقبة لارتفاع الصفحة تؤدي إلى refresh بسبب pin-spacing. قياسات horizontal تُعاد من المسافة الفعلية عند native viewport refresh؛ font refresh منسق مرة بعد جاهزية الخطوط.

اختبار البداية اكتشف `flex-shrink` كان يجعل مسافة horizontal صفرًا؛ صُحح بعرض كامل و`shrink-0`. تدقيق آخر صحح accessible names والـskip target وإلغاء focus rAF، وأعاد responsive image optimization.

قياس الأداء الأول كشف CLS مرتفعًا عند التحويل بين normal flow و`position:fixed` للـpins. سُجلت المصادر وتوقيتها، ثم استخدم التنفيذ **transform-based pin** ليبقى position مستقرًا. القياس النهائي صار CLS=0 في جلسة الاختبار، مع بقاء ثبات اللوحات والمسافة ونهايات التمرير.

## الفحوص التي نُفذت فعليًا

`npm run build` و`npm run typecheck` و`npm run lint` نجحت جميعًا بـexit code0. سجلات `docs/checks/build.log` و`typecheck.log` و`lint.log` تُظهر مخرجات الأوامر، و`docs/checks/results.json` يحفظ exit codes.

فحص Chromium الفعلي شمل 7 مقاسات:1440×900،1024×768،768×900،390×844،320×740،1440×650،1440×760. تحقّق من عدم overflow، لون أزرق ثابت وportrait filter:none، progress للـJourney، نهاية horizontal والتراجع للأعلى، keyboard focus للمشروع الثالث، قائمة الموبايل وEscape، scrub نصي بقيمة وسطية، واتجاهات marquee وmanual pause. loop كامل للصفوف الثلاثة رُصد فعليًا بعد تعديلها، وليس افتراضًا من أسماء classes.

اختبار harness مع React development StrictMode نفذ **5 دورات mount/unmount** للمكونات الحقيقية: 6→0 triggers، و2→0 spacers، وcanvas→0 بعد teardown في كل دورة. reduced motion يزيل الـpins/المشاهد المتحركة، والعودة تعيدها، والـmobile يعرض المسار الطبيعي. العداد ثابت في فحص السكون؛ تبديل media يسبب عدة refresh داخل GSAP، فلا يُدّعى أن كل تفضيل يسبب refresh واحدة فقط.

فحص WebGL عبر Chromium/SwiftShader أثبت draw call واحدة و2208 مثلثات، وثبات frameCount عند السكون وخارج الشاشة، وتغير progress/frameCount عند التمرير. نجح fallback مع mobile/reduced/saveData/lowMemory/noWebGL/context loss، دون page errors. هذه ليست تجربة جهاز محمول حقيقي أو benchmark لبطاقة رسومية فعلية.

### قياس الأداء المخبري

نفس بروتوكول160 خطوة native instant-scroll في Chromium156، viewport1440×900 وdeviceScale1:

| القياس | قبل إعادة البناء | بعد المعالجة النهائية |
|---|---:|---:|
| متوسط زمن الإطار | 46.35ms | 17.74ms أول مرور / 17.10ms دافئ |
| p95 زمن الإطار | 91.3ms | 23.6ms أول مرور / 21.2ms دافئ |
| long tasks أثناء المرور | سُجلت مهام تتجاوز50ms | 0 في المرور المقاس |
| CLS في جلسة النسخة الجديدة | غير مقاس في baseline | 0 بعد transform pins |

على390×900: متوسط16.62ms وp95≈17.1ms، CLS=0، وبدون pins. هذه **قياسات سندبوكس headless محلية وليست Core Web Vitals ميدانية أو ضمان أداء لكل الأجهزة**؛ LCP المحلي لا يصلح كزمن تحميل شبكة زائر حقيقي. أدلة المصدر محفوظة في `reference-study.json` و`redesign-performance.json`.

## الملفات الأساسية التي تغيّرت

- `app/page.tsx` و`app/layout.tsx`: تركيب Home، skip target، وإزالة smooth scroll العام المنافس للتحكم بالـpins.
- `lib/ui/layout.ts` و`lib/content/home.ts`: shared geometry وblue tokens وربط بيئة Hero الجديدة؛ باقي حقائق CV والمشاريع محفوظة.
- `components/home/hero.tsx` و`sections.tsx` و`journey-section.tsx` و`work-section.tsx` و`skills-section.tsx`: presentation وresponsive hierarchy للمشاهد الثمانية باستخدام Tailwind.
- `components/motion/scroll-experience.tsx` و`home-scenes.tsx` و`journey-pin.tsx` و`horizontal-projects.tsx`: boundaries/GSAP/controller lifecycles مستقلة.
- `components/visuals/moon.tsx` و`lib/visuals/moon-scene.ts`: lazy client + GPU factory + fallback/disposal.
- `package.json`/`package-lock.json`: Three.js0.186.1 وtypes0.186.0؛ بدون R3F/Drei أو smooth-scroll dependency.
- `public/images/blue-hour-world.webp`: بيئة أصلية جديدة141.7KB. طبقة Torii alpha المولّدة الإضافية رُفضت بسبب artifacts ولم تدخل الواجهة.
- `plan.md` و`TODO.md` و`docs/redesign-audit.md` و`scripts/*` و`docs/checks/*`: الخريطة، المصادر، اختبارات قابلة لإعادة التشغيل والأدلة.

## حدود التسليم

النطاق الحالي Home فقط. صفحات About/Projects/Blog المستقلة والـDashboard/BetterAuth/Neon/Instagram/GitHub sync وVercel deployment ما زالت مراحل لاحقة؛ لا tokens حقيقية أو اتصالات كتابة أو مدفوعات أو domain جديدة. يجب تجربة الأجهزة الفعلية/Safari قبل نشر إنتاجي، ومراجعة المحتوى والتصميم في Preview. حفظ الكود يتم على `feat/portfolio-home` دون merge إلى `main`، والنشر التلقائي مُعطّل.
