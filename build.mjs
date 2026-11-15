import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=__dirname;
const data=JSON.parse(fs.readFileSync(path.join(root,'src/catalog.json'),'utf8'));
const {categories,calculators}=data;
const dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
fs.cpSync(path.join(root,'public'),path.join(dist,'assets'),{recursive:true});
const SITE_URL=(process.env.SITE_URL||'').replace(/\/$/,'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const href=s=>s.startsWith('/')?s:s;
const fmtDate='';
function header(active=''){
  return `<a class="skip-link" href="#main">Перейти до основного вмісту</a><header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="Розрахуй — головна"><span class="brand-mark">÷</span><span>розрахуй</span></a><button class="menu-toggle" type="button" aria-label="Відкрити меню" aria-expanded="false" data-menu-toggle>☰</button><nav class="main-nav" data-main-nav aria-label="Головна навігація"><a href="/calculators/" ${active==='all'?'aria-current="page"':''}>Усі калькулятори</a><a href="/category/finance/">Фінанси</a><a href="/category/health/">Здоров’я</a><a href="/category/math/">Математика</a><a href="/about/" ${active==='about'?'aria-current="page"':''}>Про сайт</a></nav><div class="header-actions"><a class="button button-secondary" href="/calculators/">Знайти калькулятор <span aria-hidden="true">↗</span></a></div></div></header>`;
}
function footer(){
 const cats=Object.entries(categories);
 return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><a class="footer-brand" href="/">÷ розрахуй<span>.</span></a><p class="footer-about">Безкоштовні онлайн-калькулятори українською для фінансів, здоров’я, математики, ремонту та щоденних справ. Розрахунки виконуються у вашому браузері.</p></div><div class="footer-col"><h3>Категорії</h3>${cats.slice(0,4).map(([k,c])=>`<a href="/category/${k}/">${esc(c.name)}</a>`).join('')}</div><div class="footer-col"><h3>Інструменти</h3>${cats.slice(4).map(([k,c])=>`<a href="/category/${k}/">${esc(c.name)}</a>`).join('')}<a href="/calculators/">Усі калькулятори</a></div><div class="footer-col"><h3>Проєкт</h3><a href="/about/">Про сайт</a><a href="/privacy/">Конфіденційність</a></div></div><div class="footer-bottom"><span>© <span data-year></span> Розрахуй. Безкоштовні розрахунки українською.</span><span>Створено й підтримується незалежно.</span></div></div></footer>`;
}
function base(title,description,body,{canonical='',keywords=[],active='',extraHead=''}={}){
 const canon=canonical&&SITE_URL?`<link rel="canonical" href="${SITE_URL}${canonical}">`:'';
 const og=SITE_URL&&canonical?`<meta property="og:url" content="${SITE_URL}${canonical}">` : '';
 const kw=keywords.length?`<meta name="keywords" content="${esc(keywords.join(', '))}">`:'';
 return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#176b54"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:locale" content="uk_UA"><meta property="og:site_name" content="Розрахуй"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">${og}${SITE_URL?`<meta property="og:image" content="${SITE_URL}/assets/social-card.svg"><meta name="twitter:card" content="summary_large_image">`:''}${canon}${kw}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/site.css">${extraHead}</head><body>${header(active)}${body}${footer()}<script src="/assets/app.js" defer></script></body></html>`;
}
function writePage(url,html){const target=path.join(dist,url.replace(/^\//,''));const file=target.endsWith('.html')?target:path.join(target,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html,'utf8');}
function card(c){return `<a class="calculator-card" href="${c.url}" data-search-item="${esc([c.title,c.description,...c.keywords].join(' '))}"><span class="card-category">${esc(c.categoryName)}</span><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><span class="card-arrow">Відкрити калькулятор <span aria-hidden="true">↗</span></span></a>`;}
function categoryCard(key,c){const count=calculators.filter(x=>x.category===key).length;return `<a class="category-card" href="/category/${key}/"><span class="category-icon" aria-hidden="true">${esc(c.icon)}</span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><small>${count} калькуляторів · Переглянути →</small></a>`;}
function fieldHTML(f,i){
 const id=esc(f.id),label=esc(f.label),unit=f.unit?`<span class="field-hint">${esc(f.unit)}</span>`:'';
 let control='';
 if(f.type==='select')control=`<select id="${id}" name="${id}" data-label="${label}">${f.options.map(o=>`<option value="${esc(o.value)}" ${o.value===f.default?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
 else if(f.type==='date')control=`<input id="${id}" name="${id}" type="date" value="${f.default==='TODAY'?'':esc(f.default)}" ${f.default==='TODAY'?'data-default-today="1"':''} data-label="${label}" required>`;
 else if(f.type==='time')control=`<input id="${id}" name="${id}" type="time" value="${esc(f.default)}" data-label="${label}" required>`;
 else if(f.type==='text')control=`<input id="${id}" name="${id}" type="text" value="${esc(f.default)}" inputmode="${f.id==='expression'?'text':'decimal'}" spellcheck="false" data-label="${label}" required>`;
 else control=`<input id="${id}" name="${id}" type="text" inputmode="decimal" value="${esc(f.default)}" data-label="${label}" required>`;
 const full=(f.type==='text'||f.id==='expression')?' full':'';
 return `<div class="field${full}"><label for="${id}">${label}</label>${control}${unit}</div>`;
}
function howToSteps(c){
 const fields=c.fields.map(f=>`«${f.label}${f.unit?` (${f.unit})`:''}»`);
 const fieldList=fields.length>4?`${fields.slice(0,4).join(', ')} та інші параметри форми`:fields.join(', ');
 const units=[...new Set(c.fields.map(f=>f.unit).filter(Boolean))];
 const unitText=units.length?` Одиниці вимірювання для цього розрахунку: ${units.join(', ')}.`:'';
 const rateFields=c.fields.filter(f=>/%/.test(f.unit||'')||/ставк|коефіцієнт|запас|знижк|активност/i.test(f.label)).map(f=>f.label);
 const rateText=rateFields.length?` Окремо перевірте параметри «${rateFields.join('», «')}» — вони помітно впливають на підсумок.`:'';
 return [
  `Введіть свої дані в поля ${fieldList} на сторінці «${c.title}». Якщо у формі є список варіантів, оберіть той, що відповідає вашій ситуації.`,
  `Перевірте числа, дати та одиниці перед запуском розрахунку.${unitText}${rateText}`,
  `Натисніть «Розрахувати» й перегляньте підсумок у блоці «Ваш результат». Зіставте його з формулою та прикладом нижче; за потреби змініть параметри й перерахуйте.`
 ];
}
function faqAnswer(c,i){
 const cautions={
  finance:'Це попередня оцінка за введеними параметрами. Базовий розрахунок не підміняє умови банку або договору: окремо перевіряйте комісії, страхування, податки й чинні ставки.',
  health:'Це довідковий розрахунок, а не медичний висновок. На результат можуть впливати вік, стан здоров’я, ліки та інші обставини; за персональними рекомендаціями зверніться до медичного фахівця.',
  math:'Перевірте порядок величин, знаки чисел і одиниці вимірювання. Для ділення знаменник або дільник не може дорівнювати нулю.',
  dates:'Калькулятор працює з календарними датами. Державні свята, перенесення вихідних і спеціальні правила обчислення строків враховуються лише тоді, коли це прямо зазначено на сторінці.',
  build:'Це попередня оцінка матеріалів. Відходи, прорізи, геометрія поверхонь, спосіб монтажу та вимоги виробника можуть змінити фактичну кількість.',
  auto:'Фактичний результат залежить від маршруту, заторів, погоди, стану автомобіля, стилю водіння та реальної ціни пального або електроенергії.',
  convert:'Переконайтеся, що вибрали правильні початкову й кінцеву одиниці. Для деяких величин (наприклад, температури) перерахунок використовує формулу зі зсувом, а не лише множення.',
  everyday:'Використовуйте власні актуальні значення. Тарифи, правила оцінювання й умови приготування можуть відрізнятися, тому перевіряйте їх окремо.'
 };
 const specific={
  salary:'ПДФО та військовий збір віднімаються від нарахованої зарплати працівника. ЄСВ зазвичай є внеском роботодавця й показується окремо, а не віднімається із суми «на руки». Перевірте ставки та пільги для своєї ситуації.',
  loan:'Указаний платіж розраховується за сумою кредиту, річною ставкою та строком. Банківські комісії, страхування, додаткові послуги й штрафи не враховуються, якщо для них немає окремих полів.',
  mortgage:'Розрахунок охоплює суму кредиту, перший внесок, ставку та строк. Нотаріальні витрати, оцінка нерухомості, страхування й банківські комісії потрібно додавати окремо.',
  deposit:'Результат залежить від ставки, строку та капіталізації. Податки на депозитний дохід і можливі банківські умови не слід вважати врахованими, якщо форма не містить окремого поля для них.',
  compound:'Щомісячне поповнення збільшує базу, на яку надалі нараховуються відсотки. Тому за однакової ставки й строку регулярні внески зазвичай дають більшу кінцеву суму, ніж вклад без поповнень.',
  simpleInterest:'У цій формулі відсотки нараховуються на початкову суму. Уже нараховані відсотки не додаються до бази наступних періодів — це відрізняє прості від складних відсотків.',
  vat:'Щоб виділити податок із суми, яка вже містить ПДВ, використовується частка ставка ÷ (100 + ставка). Для нарахування ПДВ зверху до бази застосовують ставку без такого перерахунку.',
  currency:'Курс у формі вводиться вручну. Він не оновлюється автоматично, тому перед обміном перевірте курс НБУ, банку або пункту обміну та напрям котирування.',
  savings:'Час до цілі залежить від початкових заощаджень, регулярного внеску та введеної ставки доходу. Якщо ставка нульова, розрахунок враховує лише накопичення внесками.',
  roi:'Додатний ROI означає, що вартість після врахованих витрат перевищує початкове вкладення; від’ємний — що вона нижча. Для коректного результату внесіть усі додаткові витрати.',
  creditCard:'Комісії, покупки, пільговий період і правила мінімального платежу можуть змінити строк погашення. Перевірте тариф картки та використовуйте фактичну ставку банку.',
  loanPayoff:'Економія залежить від того, як банк перераховує графік після часткового дострокового погашення. Комісії та обмеження договору потрібно перевірити окремо.',
  carLoan:'У розрахунку враховуються ціна авто, аванс, ставка й строк. КАСКО, реєстраційні платежі, комісія за видачу та інші супутні витрати потрібно оцінювати окремо.',
  overtime:'Калькулятор множить погодинну ставку на кількість додаткових годин і заданий коефіцієнт. Податкові утримання та вимоги трудового законодавства залежать від конкретної ситуації.',
  bmi:'Стандартні категорії ІМТ призначені для дорослих. Для дітей використовують вікові та статеві перцентилі; під час вагітності й для деяких спортсменів ІМТ може бути недостатнім показником.',
  calories:'Добова оцінка базується на формулі енергетичних потреб і вибраному рівні активності. Це орієнтир, а фактичні потреби можуть відрізнятися.',
  bmr:'BMR оцінює енергію, потрібну організму у стані спокою. Це не повна добова потреба: для неї враховують рухову активність та інші чинники.',
  tdee:'TDEE — приблизна загальна добова витрата енергії з урахуванням активності. Перераховуйте її, коли суттєво змінюються вага, режим руху або тренування.',
  idealWeight:'Це діапазон за формулою ІМТ для дорослих, а не індивідуальна ціль. Вік, м’язова маса, вагітність і стан здоров’я можуть вимагати іншої оцінки.',
  bodyFat:'Формула ВМС США оцінює відсоток жиру за зростом та обхватами тіла. Похибка вимірювання стрічкою впливає на результат; це не метод діагностики.',
  macros:'У стандартному енергетичному підрахунку 1 г білка й вуглеводів дає близько 4 ккал, а 1 г жиру — близько 9 ккал. Перевірте, щоб сума часток відповідала обраній калорійності.',
  water:'Це груба оцінка загальної потреби, а не обов’язкова кількість чистої води. Потреба змінюється через клімат, навантаження, харчування та медичні обмеження.',
  pregnancy:'Календарна дата пологів є орієнтовною. Термін і дату уточнюють за медичними даними, зокрема за результатами огляду та ультразвукового дослідження.',
  pregnancyWeeks:'Акушерський термін зазвичай рахують від першого дня останньої менструації, а не від дня зачаття. Медичний фахівець може уточнити термін за результатами обстеження.',
  ovulation:'Календарний метод лише прогнозує овуляцію за середньою довжиною циклу. Стрес, хвороба, нерегулярний цикл та інші чинники можуть зміщувати її дату.',
  fertileWindow:'Календарний прогноз фертильних днів не є надійним методом контрацепції. Дата овуляції може змінюватися навіть за звичного циклу.',
  protein:'Оцінка залежить від ваги та вибраного рівня активності. Індивідуальну норму варто узгоджувати з фахівцем, особливо за наявності захворювань нирок або інших медичних обмежень.',
  pace:'Темп показує час на один кілометр. Наприклад, 30 хвилин на 5 км — це 6:00 хв/км; швидкість вимірюють у км/год.',
  oneRepMax:'Формула Еплі дає приблизну оцінку максимальної ваги за робочою вагою та кількістю повторень. Не перевіряйте граничну вагу без належної техніки й страховки.',
  scientific:'Тригонометричні функції цього калькулятора використовують радіани. Для введення кутів у градусах спочатку переведіть їх у радіани.',
  weightedAverage:'Зважене середнє враховує, наскільки важливе кожне значення. Якщо оцінка має вагу 40%, її внесок більший, ніж у оцінки з вагою 10%.',
  random:'Генератор призначений для звичайних випадкових чисел і побутових задач. Не використовуйте його для паролів, ключів або інших криптографічних цілей.',
  workingDays:'У цьому калькуляторі робочими вважаються понеділок–п’ятниця. Державні свята та перенесені робочі дні не віднімаються автоматично.',
  serviceLength:'Калькулятор визначає календарну тривалість між датами. Він не враховує автоматично перерви, пільгові періоди чи спеціальні правила підтвердження страхового стажу.',
  weekends:'Вихідними в цьому розрахунку вважаються субота й неділя. Державні свята не додаються до підрахунку окремо.',
  electricity:'У полі тарифу можна вказати чинну для вашого договору ціну за кВт·год. Перевірте свій тариф і можливі пільги перед оцінкою платежу.',
  gpa:'Введіть оцінки в одній шкалі. Якщо потрібно врахувати різну кількість кредитів або вагу предметів, використовуйте зважене середнє.',
  grade:'Відсоток показує частку набраних балів від максимально можливих. Звичайний розрахунок не задає автоматично оцінку за шкільною 12-бальною шкалою.'
 };
 if(i===0)return `${c.formula} Приклад: ${c.example}`;
 if(i===1)return `${c.description} У формі можна змінити такі параметри: ${c.fields.map(f=>f.label.toLowerCase()).join(', ')}. Приклад: ${c.example}`;
 return specific[c.type]||cautions[c.category]||'Перевірте введені дані та одиниці вимірювання.';
}
function faqJSON(c){return c.faqs.map((q,i)=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:faqAnswer(c,i)}}));}
function pageSchema(c){
 const blocks=[
  {'@context':'https://schema.org','@type':'SoftwareApplication','name':c.title,'applicationCategory':'UtilitiesApplication','operatingSystem':'Any','inLanguage':'uk','description':c.description,'offers':{'@type':'Offer','price':'0','priceCurrency':'UAH'}},
  {'@context':'https://schema.org','@type':'FAQPage','mainEntity':faqJSON(c)}
 ];
 if(SITE_URL) blocks.push({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
  {'@type':'ListItem','position':1,'name':'Головна','item':SITE_URL+'/'},
  {'@type':'ListItem','position':2,'name':c.categoryName,'item':SITE_URL+`/category/${c.category}/`},
  {'@type':'ListItem','position':3,'name':c.title,'item':SITE_URL+c.url}
 ]});
 return blocks;
}
function calcPage(c){
 const related=calculators.filter(x=>x.category===c.category&&x.slug!==c.slug).slice(0,4);
 const faq=c.faqs.map((q,i)=>`<div class="faq-item"><h3>${esc(q)}</h3><p>${esc(faqAnswer(c,i))}</p></div>`).join('');
 const form=`<section class="calculator-layout" aria-label="${esc(c.title)}" data-calculator-app data-type="${esc(c.type)}"><div class="calculator-panel"><div class="panel-head"><h2>Введіть дані для розрахунку</h2><span class="badge-soft">Безкоштовно</span></div><form>${`<div class="fields-grid">${c.fields.map(fieldHTML).join('')}</div>`}<div class="form-actions"><button class="button" type="submit">Розрахувати <span aria-hidden="true">→</span></button><span>Результат оновлюється після зміни даних</span></div></form></div><aside class="result-panel"><h2>Ваш результат</h2><div data-result><div class="result-empty"><div class="result-symbol">=</div>Введіть значення, щоб отримати результат.</div></div></aside></section>`;
 const schema=`<script type="application/ld+json">${json(pageSchema(c))}</script>`;
 const intro=`<main id="main"><div class="container page-intro"><nav class="breadcrumbs" aria-label="Хлібні крихти"><a href="/">Головна</a><span class="sep">/</span><a href="/category/${c.category}/">${esc(c.categoryName)}</a><span class="sep">/</span><span>${esc(c.title)}</span></nav><h1>${esc(c.title)}</h1><p>${esc(c.intro)}</p></div>${form}<div class="container"><div class="info-grid"><section class="content-card"><h2>Як користуватися: ${esc(c.title)}</h2><ol>${howToSteps(c).map(s=>`<li>${esc(s)}</li>`).join('')}</ol><h3>Що враховує ${esc(c.title.toLowerCase())}?</h3><p>${esc(c.description)} Калькулятор приймає введені значення та показує результат разом із коротким поясненням.</p></section><section class="content-card"><h2>Формула: ${esc(c.title)}</h2><div class="formula-box">${esc(c.formula)}</div><h3>Приклад розрахунку</h3><p>${esc(c.example)}</p><p>Щоб отримати власний результат, замініть прикладові значення у формі на свої дані. ${esc(c.title)} перерахує підсумок автоматично.</p></section></div><section class="section-tight"><div class="section-heading"><div><h2>Часті запитання про ${esc(c.title.toLowerCase())}</h2><p>Відповіді про формулу, параметри та використання калькулятора.</p></div></div><div class="faq-list">${faq}</div></section>${related.length?`<section class="section-tight"><div class="section-heading"><div><h2>Інші калькулятори в категорії «${esc(c.categoryName)}»</h2><p>Інструменти для суміжних розрахунків.</p></div><a class="text-link" href="/category/${c.category}/">Уся категорія →</a></div><div class="related-grid">${related.map(r=>`<a class="related-link" href="${r.url}"><span>${esc(r.categoryName)}</span>${esc(r.title)}</a>`).join('')}</div></section>`:''}<div class="article-note">Розрахунки виконуються у браузері. Введені значення не надсилаються на сервер цього сайту. ${c.category==='health'?'Результати для здоров’я мають інформаційний характер.':''}</div></div></main>${schema}`;
 const title=c.title+' | Розрахуй';
 return base(title,c.metaDescription,intro,{canonical:c.url,keywords:c.keywords});
}

// Individual calculator pages
for(const c of calculators){
 // fix typo slug safety if needed
 const fileUrl=c.url;
 writePage(fileUrl,calcPage(c));
}

// Category pages
for(const [key,cat] of Object.entries(categories)){
 const list=calculators.filter(c=>c.category===key);
 const cards=list.map(card).join('');
 const title=`${cat.name}: онлайн-калькулятори українською | Розрахуй`;
 const desc=`${cat.desc} ${list.length} безкоштовних онлайн-калькуляторів українською.`;
 const page=`<main id="main"><section class="category-hero"><div class="container"><nav class="breadcrumbs"><a href="/">Головна</a><span class="sep">/</span><span>${esc(cat.name)}</span></nav><div class="eyebrow">Категорія калькуляторів</div><h1>${esc(cat.name)} — онлайн-калькулятори</h1><p>${esc(cat.desc)} Оберіть інструмент, введіть параметри й отримайте результат без реєстрації.</p><div class="category-stat"><span aria-hidden="true">${esc(cat.icon)}</span>${list.length} калькуляторів у категорії</div></div></section><section class="section"><div class="container"><div class="section-heading"><div><h2>Усі калькулятори: ${esc(cat.name.toLowerCase())}</h2><p>Кожен інструмент має власну формулу, інструкцію та відповіді на часті запитання.</p></div></div><div class="calculator-grid">${cards}</div><div class="article-copy" style="margin-top:32px"><h2>Як обрати ${esc(cat.name.toLowerCase())}?</h2><p>${esc(cat.desc)} Перед розрахунком перевірте, що введені значення відповідають потрібним одиницям вимірювання та періоду. Якщо результат залежить від тарифу, ставки або умов договору, використовуйте актуальні дані.</p><p>Усі калькулятори на сайті працюють українською мовою. Розрахунок відбувається у браузері, без створення облікового запису.</p></div></div></section></main>`;
 writePage(`/category/${key}/`,base(title,desc,page,{canonical:`/category/${key}/`,active:key==='finance'?'finance':''}));
}

// All calculators directory
const allPage=`<main id="main"><section class="category-hero"><div class="container"><nav class="breadcrumbs"><a href="/">Головна</a><span class="sep">/</span><span>Усі калькулятори</span></nav><div class="eyebrow">Каталог інструментів</div><h1>Усі онлайн-калькулятори українською</h1><p>Знайдіть потрібний розрахунок за назвою або ключовим словом. У каталозі є фінансові, математичні, медичні довідкові, будівельні та побутові калькулятори.</p><div class="category-stat">100 безкоштовних калькуляторів · Без реєстрації</div></div></section><section class="section"><div class="container"><div class="search-box" style="max-width:none;border:1px solid var(--line);box-shadow:none;margin-bottom:24px"><span class="search-icon" aria-hidden="true">⌕</span><input data-search type="search" placeholder="Наприклад: ІМТ, зарплата, відсотки, ремонт…" aria-label="Пошук калькулятора"><span class="badge-soft">Пошук по каталогу</span></div>${Object.entries(categories).map(([key,cat])=>`<section class="section-tight"><div class="section-heading"><div><h2>${esc(cat.name)}</h2><p>${esc(cat.desc)}</p></div><a class="text-link" href="/category/${key}/">Усі в категорії →</a></div><div class="calculator-grid">${calculators.filter(c=>c.category===key).map(card).join('')}</div></section>`).join('')}<div class="empty-state" data-search-empty hidden>За цим запитом калькуляторів не знайдено. Спробуйте інше слово.</div></div></section></main>`;
writePage('/calculators/',base('Усі 100 онлайн-калькуляторів українською | Розрахуй','Каталог 100 безкоштовних онлайн-калькуляторів українською: фінанси, здоров’я, математика, дати, будівництво, авто та конвертери.',allPage,{canonical:'/calculators/',active:'all'}));

// Homepage
const featuredSlugs=['kalkulyator-imt','kalkulyator-viku','kalkulyator-zarplaty','kalkulyator-vidsotkiv','kredytnyi-kalkulyator','kalkulyator-kalorii','kalkulyator-znyzhky','dni-mizh-datamy','kalkulyator-vytrat-palyva','kalkulyator-betonu','konverter-valyut','kalkulyator-vartosti-remontu'];
const featured=featuredSlugs.map(s=>calculators.find(c=>c.slug===s)).filter(Boolean);
const home=`<main id="main"><section class="hero"><div class="container hero-inner"><div class="eyebrow">Онлайн-інструменти для щоденних рішень</div><h1>Порахуйте потрібне.<br>Без зайвих складнощів.</h1><p>Безкоштовні онлайн-калькулятори українською — від зарплати й кредиту до ІМТ, ремонту та витрат на авто.</p><div class="search-box"><span class="search-icon" aria-hidden="true">⌕</span><input type="search" data-search placeholder="Що потрібно порахувати? Наприклад, ІМТ або зарплату" aria-label="Пошук серед калькуляторів"><a class="button" href="/calculators/">Знайти <span aria-hidden="true">→</span></a></div><div class="hero-meta"><span>✓ 100 калькуляторів</span><span>✓ Без реєстрації</span><span>✓ Розрахунок у браузері</span></div></div></section><section class="section"><div class="container"><div class="section-heading"><div><h2>Оберіть категорію</h2><p>Інструменти згруповані за темами, щоб потрібний розрахунок було легко знайти.</p></div><a class="text-link" href="/calculators/">Усі 100 калькуляторів →</a></div><div class="category-grid">${Object.entries(categories).map(([key,c])=>categoryCard(key,c)).join('')}</div></div></section><section class="section-tight"><div class="container"><div class="section-heading"><div><h2>Часто потрібні калькулятори</h2><p>Швидкий доступ до розрахунків для повсякденних задач.</p></div></div><div class="calculator-grid">${featured.map(card).join('')}</div></div></section><section class="section"><div class="container"><div class="soft-panel"><h2>Розрахунки українською, з поясненнями</h2><p>Кожна сторінка містить окремий калькулятор, формулу, приклад, інструкцію та відповіді на часті запитання. Введені значення обробляються у вашому браузері.</p><div style="margin-top:18px"><a class="button" href="/calculators/">Переглянути всі калькулятори <span aria-hidden="true">→</span></a></div></div></div></section><section class="section-tight"><div class="container"><div class="section-heading"><div><h2>Знайти калькулятор за назвою</h2><p>Пошук охоплює всі інструменти каталогу.</p></div></div><div class="calculator-grid">${calculators.map(card).join('')}</div><div class="empty-state" data-search-empty hidden>За цим запитом нічого не знайдено. Спробуйте іншу назву або відкрийте категорії вище.</div></div></section></main>`;
writePage('/',base('Розрахуй — 100 безкоштовних онлайн-калькуляторів українською','Онлайн-калькулятори українською: ІМТ, вік, зарплата на руки, кредит, відсотки, калорії, ремонт, пальне, конвертери та інші розрахунки.',home,{canonical:'/',keywords:['калькулятор онлайн','онлайн калькулятори українською','безкоштовний калькулятор','калькулятор ІМТ','калькулятор віку','калькулятор зарплати','калькулятор кредиту']}));

// About and privacy
const about=`<main id="main"><section class="about-hero"><div class="container"><nav class="breadcrumbs"><a href="/">Головна</a><span class="sep">/</span><span>Про сайт</span></nav><div class="eyebrow" style="color:var(--green)">Про проєкт</div><h1>Про «Розрахуй»</h1><p>«Розрахуй» — незалежний сайт безкоштовних онлайн-калькуляторів українською мовою. Його мета — допомагати швидко виконувати зрозумілі побутові, фінансові, математичні та інші розрахунки.</p></div></section><section class="section-tight"><div class="container"><div class="info-grid"><section class="content-card"><h2>Як усе працює</h2><p>Кожен калькулятор має власні поля, формулу та приклад. Ви вводите значення й одразу отримуєте результат у браузері. Реєстрація не потрібна.</p><p>На сторінках наведено пояснення, щоб можна було перевірити логіку розрахунку й зрозуміти, які дані впливають на результат.</p></section><section class="content-card"><h2>Хто підтримує сайт</h2><p>Сайт створює та підтримує одна людина. Це незалежний проєкт із самостійною розробкою, перевіркою розрахунків і поступовим розширенням каталогу.</p><p>Знайдені помилки та неточності враховуються під час оновлення інструментів.</p></section><section class="content-card"><h2>Точність і межі розрахунків</h2><p>Результат залежить від введених даних і формули, зазначеної на відповідній сторінці. Для тарифів, податків, ставок, нормативів і договорів потрібно перевіряти актуальні умови.</p><p>Калькулятори здоров’я мають довідковий характер і не замінюють консультацію медичного фахівця.</p></section><section class="content-card"><h2>Приватність</h2><p>Обчислення виконуються у браузері. Значення, які ви вводите у форми калькуляторів, не надсилаються на сервер сайту.</p><p>Для роботи сторінок не потрібен обліковий запис.</p></section></div></div></section></main>`;
writePage('/about/',base('Про сайт Розрахуй — українські онлайн-калькулятори','Дізнайтеся про незалежний проєкт «Розрахуй», його калькулятори українською, принципи роботи та підхід до приватності.',about,{canonical:'/about/',active:'about'}));
const privacy=`<main id="main"><section class="about-hero"><div class="container"><nav class="breadcrumbs"><a href="/">Головна</a><span class="sep">/</span><span>Конфіденційність</span></nav><div class="eyebrow" style="color:var(--green)">Конфіденційність</div><h1>Як працюють ваші дані</h1><p>Калькулятори виконують обчислення безпосередньо у браузері й не надсилають введені значення на сервер сайту.</p></div></section><section class="section-tight"><div class="container"><article class="content-card article-copy"><h2>Дані у формах калькуляторів</h2><p>Значення, які ви вводите у поля калькуляторів, використовуються браузером для виконання розрахунку. Сайт не має облікових записів і не потребує реєстрації.</p><h2>Технічні дані</h2><p>Хостинг може обробляти стандартні технічні журнали запитів для доставки сторінок і захисту інфраструктури. У цій версії сайту не підключено сторонні рекламні або аналітичні скрипти.</p><h2>Зовнішні посилання</h2><p>Якщо сторінка посилається на зовнішній ресурс, його правила конфіденційності діють окремо.</p><h2>Оновлення</h2><p>Описані принципи відповідають поточній реалізації сайту. Якщо технічна робота сайту зміниться, цю сторінку буде оновлено.</p></article></div></section></main>`;
writePage('/privacy/',base('Конфіденційність — Розрахуй','Як сайт «Розрахуй» обробляє значення, введені в онлайн-калькулятори, технічні дані та зовнішні посилання.',privacy));

// Static files and optional sitemap
writePage('/404.html',base('Сторінку не знайдено | Розрахуй','Такої сторінки немає. Перейдіть до каталогу онлайн-калькуляторів українською.',`<main id="main"><div class="container not-found"><div class="eyebrow" style="color:var(--green)">Помилка 404</div><h1>Сторінку не знайдено</h1><p class="muted">Можливо, адресу змінено або сторінку видалено.</p><a class="button" href="/calculators/">Переглянути калькулятори →</a></div></main>`));
fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\n');
fs.writeFileSync(path.join(dist,'manifest.webmanifest'),JSON.stringify({name:'Розрахуй — онлайн-калькулятори українською',short_name:'Розрахуй',lang:'uk',start_url:'/',display:'standalone',background_color:'#f5f8f5',theme_color:'#176b54',icons:[{src:'/assets/favicon.svg',sizes:'any',type:'image/svg+xml'}]},null,2));
if(SITE_URL){
 const urls=['/', '/calculators/', '/about/', '/privacy/',...Object.keys(categories).map(k=>`/category/${k}/`),...calculators.map(c=>c.url)];
 const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${SITE_URL}${u}</loc></url>`).join('')}</urlset>`;
 fs.writeFileSync(path.join(dist,'sitemap.xml'),xml);
 fs.appendFileSync(path.join(dist,'robots.txt'),`Sitemap: ${SITE_URL}/sitemap.xml\n`);
}
console.log(`Built ${calculators.length} calculator pages, ${Object.keys(categories).length} category pages and supporting pages.`);
console.log(SITE_URL?'Sitemap generated.':'No SITE_URL provided; sitemap will be generated when SITE_URL is set.');
