# Seif — Blue-hour engineering / Home redesign

النطاق هو إعادة بناء Home الحالية في Next.js/Tailwind/GSAP، لا ترميم الـinitializer السابق. المحتوى المعتمد من CV، صورة سيف الطبيعية والروابط/captures المتحققة تبقى. إعداد Next وNeon والمكونات العامة المتوافقة لا يُستبدل بـstarter. لا dashboard أو نشر أو smooth-scroll library في هذه المرحلة. القرار الجديد supersedes الهوية الثنائية: Light Blue ثابت في الموقع؛ لا Crimson ولا root color tween.

## Art direction

Japanese cinematic editorial: أسود حبر وأبيض ورق مع blue-hour illumination. typography Geist Sans ثقيلة ومكثفة للعناوين، Geist Mono صغير واضح للlabels. أول viewport يوازن اسم SEIF/AYMAN يسارًا وportrait foreground يمينًا، خلفهما mountain/forest world وقمر محدد، لا قرص100vw ولا طبقات bloom تغطي النص. الأسطح الفاتحة واسعة ومستديرة مع توازن whitespace ومشهد الحبر. glow على moon rim وحدود مختارة فقط. glass في experience card وnavigation بحذر، backdrop blur محدود وليس فوق مساحة الشاشة. الهوية blue #49baf1، blue ink #076c9b للسطوح البيضاء، night #080b0d، paper #f5f5f2. الصورة والمشاريع لا filters. روح العلامة: مطوّر يقود بناء المنتج من الواجهة إلى المعمار؛ دقيق، هادئ، مباشر. CTAs: Explore my work / Let’s build something that matters. علامة sa الحالية تبقى إن لم تعارض composition.

## Section-by-section interaction map

**A / Hero — introduction + exit.** 1 timeline entrance للعنوان المقنّع فقط، لا intro/loading curtain. scene layers تتحرك بمقادير قليلة في timeline scrub من top top إلى bottom top، portrait لا يتلوّن. عند الخروج يتقدم landscape ببطء مقارنة foreground ويأتي السطح الأبيض فوق المشهد. أولviewport لا يستلزم تحميلThree.js أو يختفي بدونه.

**B / About — controlled overlap.** سطح paper بـrelative z-index أعلى وهامش سلبي صغير يقارب56px علىdesktop وأقل علىmobile، مع Hero spacing محسوب، لا pin إضافي. عنوان من سطرين/ثلاثة داخل masks يتحرك yPercent عبر scrub من top85% إلى top25%. صورة ink تُكشف بـclip-path مرة مرتبطة بنفس timeline، parallax للمشهد بضعةpx، supporting copy يبقى قابلًا للقراءة. لا تحريك ارتفاع القسم أو عرض النص.

**C / Journey — pinned stacking.** desktop ≥1024px وارتفاعviewport≥760px/no-reduced-motion: stable stage viewport حواليmin(620px,viewport−140px)، pinned top≈100px عبر GSAP. Foundation → product ownership → technical leadership ثلاث صفحات editorial، اللوحة التالية تأتي translateY100% فوق السابقة مع تقدم واضح؛ ارتفاع overlay panels ثابت وتفاصيل CV مصاغة دون أرقام عملاء. duration = نحو2×0.8viewport، نهاية محددة وpinSpacing حقيقي. mobile/shortviewport/reduced-motion: ثلاث صفحات رأسيًا في normal flow، لا inline transforms ولا forcedpin ولا مخفي عنkeyboard.

**D / Featured — vertical-to-horizontal case studies.** desktop بنفسشرطJourney: viewport stage حواليmin(650px,viewport−140px)، bounded overflow clip محلي لا root overflow trap، track flex وslide واحدة بعرض viewportالمتاح. ثلاث case studies: screenshotحوالي62% والنص38%، identity/description/stack/verifiedlinks. مسافةالتمرير = track.scrollWidth−viewport.clientWidth، x يتدرج0→−distance scrub، start top100px، end +=distance، invalidateOnRefresh. لا CSSsmoothscroll ولا fakefixed width. تغيرnavigation/resize/font readiness يقيس من جديد فقطعندتغيرالعرض، pin releaseبعدآخرslide. Keyboard focus علىCTA خارجالviewport ينقلwindowscroll للمشروع المقابل عبرنفسprogress قبلإعطاءfocus؛ reduced/mobile تعرضslides رأسيًا وبعرض100%، no pin/spacer.

**E / More — light exploration.** Nabd Masr/Personal Portfolio grid responsive بدون pin. hoverCSS لايملك نفسtransform لصورparallax. الvisual restricted يبقىeditorial واضح، لا fabricateddashboard أو demo assertion.

**F / Skills — three marquee rows.** preserve actual workingCV data/icons/seam geometry left/right/left. loop31px/s تقريبًا، pause user/hover/focus/offscreen/hidden tab. لا ScrollTrigger للـmarquee، no globalrefresh from rebuild. index15groups قابلللقراءة، نسخةduplicateariahidden. reducedmotionstaticwrap.

**G / Process — one connected progress.** normal vertical section بعدآخرlightSkills، أربعةsteps Discover/Design/Build/Ship، single scrub timeline للرابط والنصmarkers، لاfourindependentreveals. desktop connector scaleX، mobile connector scaleY وتكديسnaturalflow.

**H / Contact — final landscape reveal.** نهايةProcess تغطيهاساحةnightبـoverlap40px أعلىz-index بدونpin، Torii landscape mask تدريجي وforegroundheadline reveal scrub منtop90% إلىtop25%، globe/moonMotif منHero يكتمل فيصورةContactالأصلية. CTAمباشرةmail/CV/github، localblue ثابت، no unrelatedfooteranimations.

## Architecture and performance decisions

Server Components تقدمكلالنص/captures والـSSRfallback. `ScrollExperience` يبقىwrapperللtokens فقط. motion تُداربـsmallcontrollers: sharedscene(HomeScenes) / JourneyPin / HorizontalProjects / SkillsMarquee existing. لكلcontroller gsap.context+matchMedia scoped cleanup، IDs مستقرةتسهلتتبعpinlimits. لاgeneric data-reveal لكلelement، لاglobalResizeObserver علىportfolio الذييراقبpinspacer؛ refresh بعدfonts.ready وعندتغيرأبعادviewportفقط، الأصلصورdimensioned. CSSclassesكلهاTailwind؛ globals فقطTailwind/shadcn/themebase.

3D بعداستقرارlayout/coremotion: ReactThreeFiber9 مناسبReact19 ويدعمdemandلكنsceneoneMoon لايحتاجReactrenderer/Drei. استخدمThree.jsمباشرlazyimportداخلclientcomponent معSSR CSSfallback، canvasمحلي≤420px، meshواحدlowpolySphere، مادةمضاءةذاتdepth/roughness، لاshadows/postprocessing/particles. renderon-demand منscrollprogressandresizeبعدvisible/idle، DPR≤1.5، no continuousRAF. noWebGL/contextlost/mobile/dataSaver/reduced-motion→fallback، cancelqueuedframes/observers/listenersanddisposegeometry/material/renderer. مصدرالتوثيقفيdocs/redesign-audit.md.

## Project structure

`components/home/` — Server markup لHero/About/Journey/Featured/More/Process/Contact ومحتوىSkills. `components/motion/` — isolatedGSAPcontrollers بخواصserverchildren وقواعدdesktop/mobile. `components/visuals/` — lazycelestialcomponentandThreefactory. `lib/ui/layout.ts` — sharedTailwindrecipes، `lib/content/` — CVCurationوverifiedprojects. `public/images/`/`public/documents/` — الأصلالصورةوJapaneseoriginalart/projectcaptures/CV، no externalidentitycopy. `scripts/` و`docs/checks/` — actualinteraction/performanceobservations، لاtest-onlyroute فيpublicdelivery.
