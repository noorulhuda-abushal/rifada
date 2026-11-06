/* =========================================================
   رِفادة — الكود المشترك بين كل الصفحات
   (الحفظ، اللغة، الوضع الليلي، الهيدر، الفوتر، الحسابات)
   ========================================================= */

/* ---------- الحفظ في المتصفح ---------- */
const STORE = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* تجاهل */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* تجاهل */ }
  }
};

/* ---------- اللغة ---------- */
function getLang() {
  const lang = STORE.get('rifada_lang', 'ar');
  return READY_LANGS.includes(lang) ? lang : 'ar';
}

// ترجمة مفتاح، مع تعويض المتغيرات مثل {n}
function t(key, vars) {
  const lang = getLang();
  let text = (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      text = text.split('{' + k + '}').join(vars[k]);
    });
  }
  return text;
}

// تطبيق الترجمة على العناصر التي فيها data-i18n
function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function setLang(lang) {
  if (!READY_LANGS.includes(lang)) {
    toast(t('lang_soon'));
    return;
  }
  STORE.set('rifada_lang', lang);
  location.reload();
}

/* ---------- الوضع الليلي ---------- */
function getTheme() {
  return STORE.get('rifada_theme', 'light');
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', getTheme());
}

function toggleTheme() {
  STORE.set('rifada_theme', getTheme() === 'dark' ? 'light' : 'dark');
  applyTheme();
  renderHeader(document.body.dataset.page);
  document.dispatchEvent(new Event('themechange'));
}

/* ---------- الأيقونات ---------- */
const ICON_MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_GLOBE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
const ICON_CHECK ='<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/* ---------- الهيدر والفوتر ---------- */
function renderHeader(active) {
  const el = document.getElementById('site-header');
  if (!el) return;
  const lang = getLang();
  const dark = getTheme() === 'dark';
  const link = (href, key, name) =>
    `<a href="${href}" class="${active === name ? 'active' : ''}">${t(key)}</a>`;

  el.className = 'site-header';
  el.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="brand">${t('brand')}</a>
      <nav class="nav">
        ${link('index.html', 'nav_home', 'home')}
        ${link('results.html', 'nav_hotels', 'results')}
        ${link('dashboard.html', 'nav_owners', 'dashboard')}
      </nav>
      <div class="controls">
        <div class="lang-menu" id="lang-menu">
          <button type="button" class="lang-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-controls="lang-list" aria-label="${t('lang_label')}">
            ${ICON_GLOBE}<span>${LANG_NAMES[lang]}</span>
          </button>
          <ul class="lang-list hidden" id="lang-list">
            ${Object.keys(LANG_NAMES).map((l) => `
              <li>
                <button type="button" data-lang="${l}" lang="${l}" class="${l === lang ? 'active' : ''}">
                  <span>${LANG_NAMES[l]}</span>${l === lang ? '<span aria-hidden="true">✓</span>' : ''}
                </button>
              </li>`).join('')}
          </ul>
        </div>
        <button type="button" class="icon-btn" id="theme-toggle" aria-label="${dark ? t('light') : t('dark')}" title="${dark ? t('light') : t('dark')}">
          ${dark ? ICON_SUN : ICON_MOON}
        </button>
        <button type="button" class="btn btn-sm" id="login-btn">${t('login')}</button>
      </div>
    </div>`;

  // قائمة اللغات: تفتح وتسكر بالضغط على الزر
  const langBtn = el.querySelector('#lang-btn');
  const langList = el.querySelector('#lang-list');
  langBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = langList.classList.toggle('hidden') === false;
    langBtn.setAttribute('aria-expanded', String(open));
  });
  el.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  el.querySelector('#theme-toggle').addEventListener('click', toggleTheme);

  // تسكير القائمة عند الضغط خارجها أو على زر Esc (نضيفها مرة وحدة فقط)
  if (!window.__langMenuBound) {
    window.__langMenuBound = true;
    const closeMenu = () => {
      const list = document.getElementById('lang-list');
      const btn = document.getElementById('lang-btn');
      if (list && !list.classList.contains('hidden')) {
        list.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      }
    };
    document.addEventListener('click', (event) => {
      if (!event.target.closest('#lang-menu')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }
  el.querySelector('#login-btn').addEventListener('click', () => toast(t('feature_soon')));
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.className = 'site-footer';
  el.innerHTML = `
    <div class="container footer-inner">
      <span class="footer-brand">${t('brand')}</span>
      <span>${t('footer_note')}</span>
    </div>`;
}

// تُستدعى في بداية كل صفحة
function initPage(name) {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.page = name;
  applyTheme();
  renderHeader(name);
  renderFooter();
  applyI18n();
  // اتجاه أسهم مسار الخطوات حسب اللغة
  document.querySelectorAll('.steps-path .sep').forEach((el) => {
    el.textContent = lang === 'ar' ? '←' : '→';
  });
}

/* ---------- رسالة منبثقة ---------- */
function toast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ---------- بيانات البحث ---------- */
// يرجّع آخر بحث سوّاه المستخدم، أو null إذا ما بحث للحين
function getSearch() {
  return STORE.get('rifada_search', null);
}

// للصفحات التي تحتاج بحثاً: إذا ما فيه بحث، نرجع للرئيسية
function requireSearch() {
  const search = getSearch();
  if (!search) location.replace('index.html');
  return search;
}

function nightsBetween(checkin, checkout) {
  const a = new Date(checkin);
  const b = new Date(checkout);
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
}

// عرض التاريخ بالهجري (أم القرى)
function formatHijri(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d)) return dateStr;
  const locale = getLang() === 'ar' ? 'ar-SA-u-ca-islamic-umalqura-nu-latn' : 'en-u-ca-islamic-umalqura';
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(d);
  } catch (e) {
    return dateStr;
  }
}

function formatPeriod(checkin, checkout) {
  return `${formatHijri(checkin)} – ${formatHijri(checkout)}`;
}

/* ---------- الفنادق (مع تعديلات لوحة الفندق) ---------- */
function getHotels() {
  const overrides = STORE.get('rifada_overrides', {});
  return HOTELS_DEFAULT.map((h) => {
    const copy = JSON.parse(JSON.stringify(h));
    if (overrides[h.id]) copy.rooms = overrides[h.id];
    return copy;
  });
}

function getHotel(id) {
  return getHotels().find((h) => h.id === Number(id)) || null;
}

function hotelName(h) { return h.name[getLang()] || h.name.ar; }
function hotelArea(h) { return h.area[getLang()] || h.area.ar; }
function starsText(n) { return '★'.repeat(n); }

function formatMoney(n) {
  return Number(n).toLocaleString('en-US') + ' ' + t('sar');
}

/* ---------- المسافة ووقت المشي ---------- */
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function hotelDistance(h) {
  return distanceMeters(h.lat, h.lng, HARAM.lat, HARAM.lng);
}

// تقدير: الطريق أطول من الخط المستقيم بـ 25%، وسرعة المشي 75 متر في الدقيقة
function walkMinutes(h) {
  return Math.max(1, Math.round((hotelDistance(h) * 1.25) / 75));
}

function formatDistance(meters) {
  if (meters < 1000) return Math.round(meters / 10) * 10 + ' ' + t('m');
  return (meters / 1000).toFixed(1) + ' ' + t('km');
}

function formatWalk(minutes) {
  const unit = minutes >= 3 && minutes <= 10 ? t('min_unit_few') : t('min_unit');
  return `${minutes} ${unit} ${t('walking')}`;
}

/* ---------- توزيع الأفراد على الغرف ---------- */
// يوزّع مجموعة (رجال أو نساء) على الغرف الشاغرة، ويخصم من avail
function planGroup(count, avail) {
  const result = { quad: 0, triple: 0, double: 0 };
  let left = count;

  // 1) نملأ الغرف الكبيرة أولاً
  ROOM_TYPES.forEach((type) => {
    while (left >= ROOM_CAPACITY[type] && avail[type] > 0) {
      result[type]++;
      avail[type]--;
      left -= ROOM_CAPACITY[type];
    }
  });

  // 2) الباقي (1 إلى 3 أشخاص) يأخذ أصغر غرفة تكفيهم
  if (left > 0) {
    const fit = ['double', 'triple', 'quad'].find((type) => left <= ROOM_CAPACITY[type] && avail[type] > 0);
    if (fit) {
      result[fit]++;
      avail[fit]--;
      left = 0;
    }
  }

  // 3) إذا ما زال فيه أشخاص، نستخدم أي غرفة متبقية
  while (left > 0) {
    const any = ROOM_TYPES.find((type) => avail[type] > 0);
    if (!any) return null; // الغرف لا تكفي
    result[any]++;
    avail[any]--;
    left -= ROOM_CAPACITY[any];
  }
  return result;
}

// خطة كاملة للحملة في فندق معيّن (أو null إذا لا تكفي الغرف)
function makePlan(hotel, men, women) {
  const avail = {};
  ROOM_TYPES.forEach((type) => { avail[type] = hotel.rooms[type].free; });
  const empty = { quad: 0, triple: 0, double: 0 };

  const menPlan = men > 0 ? planGroup(men, avail) : { ...empty };
  if (!menPlan) return null;
  const womenPlan = women > 0 ? planGroup(women, avail) : { ...empty };
  if (!womenPlan) return null;

  let perNight = 0;
  let roomCount = 0;
  ROOM_TYPES.forEach((type) => {
    const n = menPlan[type] + womenPlan[type];
    perNight += n * hotel.rooms[type].price;
    roomCount += n;
  });
  return { men: menPlan, women: womenPlan, perNight, roomCount };
}

// نص مثل: "6 × رباعية + 1 × ثنائية"
function planText(groupPlan) {
  const parts = ROOM_TYPES
    .filter((type) => groupPlan[type] > 0)
    .map((type) => `${groupPlan[type]} × ${t(type)}`);
  return parts.length ? parts.join(' + ') : '—';
}

// دمج خطة الرجال والنساء في نص واحد
function totalPlanText(plan) {
  const sum = {};
  ROOM_TYPES.forEach((type) => { sum[type] = plan.men[type] + plan.women[type]; });
  return planText(sum);
}

function freeBeds(hotel) {
  return ROOM_TYPES.reduce((s, type) => s + hotel.rooms[type].free * ROOM_CAPACITY[type], 0);
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ---------- الخريطة (Leaflet + OpenStreetMap المجانية) ---------- */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// في الوضع الليلي نقلب ألوان الخريطة لتصير داكنة
function styleMapTiles(map) {
  map.getPane('tilePane').style.filter = getTheme() === 'dark'
    ? 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9)'
    : '';
}

function createMap(elementId, center, zoom) {
  if (typeof L === 'undefined') {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = '<div class="ph" style="height:100%">Map needs an internet connection</div>';
    return null;
  }
  const map = L.map(elementId, { scrollWheelZoom: false }).setView([center.lat, center.lng], zoom);
  L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
  styleMapTiles(map);

  // تحديث ألوان الخريطة عند تغيير الوضع الليلي
  document.addEventListener('themechange', () => styleMapTiles(map));

  // علامة المسجد الحرام
  L.marker([HARAM.lat, HARAM.lng], {
    icon: L.divIcon({ className: 'pin-wrap', html: `<span class="map-pin haram">${t('haram')}</span>`, iconSize: null })
  }).addTo(map);

  return map;
}

function hotelPin(h, minutes) {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="map-pin">${hotelName(h)} · ${minutes} ${t('min_short')}</span>`,
    iconSize: null
  });
}
