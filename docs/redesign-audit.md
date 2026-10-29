# تدقيق إعادة التصميم — 29 أكتوبر 2026

## المراجع وأدوارها

المرجع الياباني الأصلي والصورة الجديدة يحددان composition: عنوان editorial كبير، subject foreground، بيئة سوداء، انتقال إلى سطح أبيض كبير مستدير، accents قليلة وإضاءة محسوبة. لا يُعاد فتح الصور المرفقة بناءً على طلب سيف، ولا تُنسخ صورة Samurai أو محتوى NFT. صورة سيف والأصول اليابانية الأصلية الموجودة تبقى أساس الهوية.

الموقع الحي https://7lf.vercel.app/ هو موقع Ahmed Eid/ALF وليس تصميم Samurai المعروض. فُحص في المتصفح فعليًا عند viewport 1280×1100. Intro أظهر logo/loading مع Skip intro ثم انتهى وظهر Hero. الأقسام المرصودة: Hero ثم manifesto ثم About ثم services ثم Process ثم Work ثم Wasla ثم Journey ثم Stack ثم Contact. Navbar يستخدم anchor links للأقسام.

تم رصد pin-spacer واحد بارتفاع حوالي3740px حول process__pin. عند scrollY=5500 كان process__pin position:fixed، وعند8200 تحرر. هذه ملاحظة مؤكدة. marquee__track يتحرك أفقياً بمرور الوقت. svc__track لم يظهر transform في العينات؛ لا يُدّعى أنه horizontal scroll دون دليل آخر. لم تُستنتج حركة من الصورة الثابتة وحدها. البيانات الخام محفوظة من browser console في /home/ubuntu/console_outputs/exec_result_2026-10-29_14-07-42_431.txt. دراسة الموبايل التفصيلية تُستكمل قبل اعتماد سلوك المرجع عليه.

## ما يثبته الكود الحالي

المستودع Next16.4.3/React19.3 وGSAP3.15 وTailwind4، ولا يوجد Three.js أو R3F في dependencies. scroll-experience.tsx يملك initializer كبيرًا؛ معظم الحركة toggleActions time-based reveals وليست scrub-linked. لا يوجد أي pin أو horizontal project timeline. Journey عبارة عن ثلاثة cards ثابتة والمشاريع grid؛ لذلك نجاح اختبار RGB والـmarquee القديم لا يثبت choreography المطلوبة. tween الهوية يحوّل متغيرات وراثية على root من الأزرق إلى Crimson طوال معظم الصفحة؛ هذا الآن مخالف لقرار blue-only وقد يزيد style/paint العمل، لكن مقدار البطء يحتاج قياسًا ولا يُنسب إليه كحقيقة measured.

Hero يفرض min-height≥740px على desktop، بينما portrait والنص والقمر oversized؛ الموبايل يكدس المحتوى والصورة إلى حوالي992px في عرض390. المواضع المطلقة والقرص ذي100vw يهيمنان على composition. الـResizeObserver الحالي على root يطلب ScrollTrigger.refresh عند تغير المقاسات، وكل image load يطلب refresh إضافيًا؛ يحتاج ذلك ضبطًا خصوصًا مع pin spacing الجديدة. يوجد cleanup context/matchMedia/listeners عامل ينبغي الحفاظ على مبدأه، لا حذف الحركة كلها.

## تقييم 3D

R3F9 يدعم React19 بحسب https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide، وframeloop=demand مع invalidate يسمح بالتوقف عند السكون بحسب https://r3f.docs.pmnd.rs/advanced/scaling-performance. ليس مرفوضًا بسبب ادعاء overhead في كل frame. لكن لمشهد Moon واحد، اختيار Three.js مباشر داخل component مع dynamic import وrequestRender عند scroll/resize فقط يبقي الشجرة والاعتمادات أبسط ولا يحتاج renderer React أو Drei. المشهد سيأتي بعد استقرار layout/core scroll: canvas محلي محدود، mesh/material قليلة، DPR≤1.5، بلا post-processing أو particles أو fullscreenCanvas. fallback blue moon ظاهر SSR للموبايل/reduced-motion/data-saver/no-WebGL. GPU resources تحتاج dispose صريحًا بحسب https://threejs.org/manual/en/cleanup.html.

## نتائج الدراسة الإضافية قبل البناء

`reference-study.json` يوثق viewport1440×900 و390×900. الـProcess في المرجع يثبت على desktop فقط (pin-spacer≈3060px حسب viewport) وتتبدل opacity/scale marker منstageإلىآخر؛ عند390 لاpin-spacer، والـProcesspositionstaticعبرنقاطالتمرير. هذا يدعم تكييفmobileللرأسي بدلتصغيرdesktop؛ horizontalFeaturedفيportfolio قراربناءمنسيف وليسادعاءبأنالمرجعيفعله. svc__trackبقيtransform:none فيالعينات.

قبلتغييراتUI، Chromium156 بviewport1440×900 وdeviceScale1 و160خطوةnativeinstant-scroll أعطى mean frame46.35ms/p95≈91.3ms، و16longTasksبين50 و283ms، وpinCount0. هذه labقياساتفيالسندبوكس وليستfieldmetricsأوdeviceperformanceوحدة. المرجعوالـbaselineتسجلافي`scripts/study-reference.py`/`docs/checks/reference-study.json`. تدقيقالعاملread-onlyأكدأنلاpin/horizontal/3DوأنrootcolorScrubوgenericrevealsوrootResizeObserverهيتعقيداتمصدريةمؤكدة؛ مقدارمساهمةكلواحدفيالبطءليسمقاسًا.

## ما كشفته الاختبارات على النسخة الجديدة

الفحص الفعلي التقط مسافةFeatured=0 فيأولتركيببسببflex-shrink؛صُححتالslidesإلىw-full/shrink-0. بعدهثبتتالمسافة2560pxعند1440والوصولإلىx=-2560بالضبط، والـfocusينقلالتمريرإلىslideالمقصودة. الـJourneyfallbackالأوليكانفيهmediautilityعرضبدلارتفاع؛أُزيلتتلـSSR/narrow/short/reducedFlow،والـenhancementيعتمدداتاmodeخاصةبالcontroller.

القياسالأولبعد3Dأظهرmean≈17.61ms/p95≈22.1msعلىdesktopوlongTasks=0أثناء160خطوة،مقابلbaseline46.35/91.3ms. لكنهسجلlayout-shiftمجموع2.51. التحقيقفي`shift-diagnosis.json`يثبتأنinitialShifts=[]،والأحداثالأربعةمحصورةفيJourney-stageوFeatured-viewportعنددخول/خروجposition:fixed،وليستتحميلخط/صورة. عُدلالـpinTypeإلىtransformللحفاظعلىmodepositionواستبعادالنقلمنlayout،معإبقاءالمسافاتوالـscrub. النتيجةبعدالتعديليُحكممنآخر`redesign-performance.json`وليسهذاالرقمالأولي.

harnessStrictMode5cyclesأثبت6triggers→0و2spacers→0وcanvas→0فيكلunmount. كماكشفارتفاعrefreshCountبعدتبديلmotion. أزيلobserverللtrackلمنعfeedbackمحتمل،لكنالعددبعدالتبديللميتغير؛لذلكلميثبتأنهسببه،ولاينسبإليهتحسنغيرمقاس. القياسالفعليللسكونيثبتثباتالعداد،والزيادةتحصلفيتبديلmediaوليسloopوقتscroll. قياساتtrackتبقىfunctionsتُعادوقتScrollTriggernativeviewportresize،معfontrefreshواحدمنrootوimagesمحددةالأبعاد. لاظلrefreshcoordinatorيراقبheightالموقع.
