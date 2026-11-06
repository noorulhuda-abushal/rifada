/* =========================================================
   رِفادة — صفحة النتائج (الفلاتر + الخريطة + الكروت)
   ========================================================= */

initPage('results');

const search = getSearch();
const nights = nightsBetween(search.checkin, search.checkout) || 1;

document.getElementById('chip-people').textContent = t('chip_people', { m: search.men, w: search.women });
document.getElementById('chip-dates').textContent = formatPeriod(search.checkin, search.checkout);

// نجهّز كل فندق: المسافة، وقت المشي، خطة التوزيع
const allHotels = getHotels().map((h) => ({
  ...h,
  distance: hotelDistance(h),
  walk: walkMinutes(h),
  plan: makePlan(h, search.men, search.women)
}));

// الفنادق التي تكفي غرفها الحملة
const fitHotels = allHotels.filter((h) => h.plan !== null);
const notFitCount = allHotels.length - fitHotels.length;

/* ---------- الخريطة ---------- */
const map = createMap('map', HARAM, 14);
let markersLayer = null;

if (map) {
  // دائرتا 10 و20 دقيقة مشياً (تقريباً 600 م و1200 م)
  L.circle([HARAM.lat, HARAM.lng], { radius: 600, color: '#8A6420', weight: 2, dashArray: '6 6', fillOpacity: 0.06 }).addTo(map);
  L.circle([HARAM.lat, HARAM.lng], { radius: 1200, color: '#C9A24A', weight: 2, dashArray: '6 6', fillOpacity: 0 }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

/* ---------- قراءة الفلاتر ---------- */
function checkedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((i) => i.value);
}

function timeBucket(minutes) {
  if (minutes < 10) return 'lt10';
  if (minutes <= 20) return '10_20';
  if (minutes <= 30) return '20_30';
  return 'gt30';
}

function applyFilters() {
  const times = checkedValues('time');
  const rooms = checkedValues('room');
  const needs = checkedValues('need');
  const sort = document.getElementById('sort').value;

  let list = fitHotels.filter((h) => {
    if (!times.includes(timeBucket(h.walk))) return false;
    if (rooms.length && !rooms.some((type) => h.rooms[type].free > 0)) return false;
    if (needs.includes('separate') && !h.separate) return false;
    if (needs.includes('elderly') && !h.elderly) return false;
    return true;
  });

  if (sort === 'near') list.sort((a, b) => a.distance - b.distance);
  if (sort === 'price') list.sort((a, b) => a.plan.perNight - b.plan.perNight);
  if (sort === 'free') list.sort((a, b) => freeBeds(b) - freeBeds(a));

  renderList(list);
  renderMarkers(list);
}

/* ---------- عرض الكروت ---------- */
function renderList(list) {
  document.getElementById('results-title').textContent = t('results_title', { n: list.length });
  const box = document.getElementById('hotel-list');

  if (list.length === 0) {
    box.innerHTML = `<div class="notice">${t('no_results')}</div>`;
  } else {
    box.innerHTML = list.map((h) => `
      <article class="hotel-card">
        <div class="ph">${t('ph_front')}</div>
        <div class="info">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center">
            <h2 class="hotel-name">${hotelName(h)}</h2>
            <span class="stars">${starsText(h.stars)}</span>
          </div>
          <span class="muted">${formatDistance(h.distance)} ${t('from_haram')} (${formatWalk(h.walk)}) · ${hotelArea(h)}</span>
          <div class="chips">
            <span class="chip">${t('vacant_beds', { n: freeBeds(h) })}</span>
            <span class="chip chip-outline">${t('suggested', { plan: totalPlanText(h.plan) })}</span>
          </div>
        </div>
        <div class="price-col">
          <div>
            <span class="muted" style="font-size: 13px">${t('total_group')}</span>
            <div class="price">${formatMoney(h.plan.perNight * nights)}</div>
          </div>
          <a class="btn btn-sm" href="hotel.html?id=${h.id}">${t('details')}</a>
        </div>
      </article>`).join('');
  }

  document.getElementById('not-fit').textContent = notFitCount > 0 ? t('not_fit_count', { n: notFitCount }) : '';
}

/* ---------- علامات الخريطة ---------- */
function renderMarkers(list) {
  if (!map) return;
  markersLayer.clearLayers();
  const points = [[HARAM.lat, HARAM.lng]];

  list.forEach((h) => {
    const marker = L.marker([h.lat, h.lng], { icon: hotelPin(h, h.walk) });
    marker.bindPopup(`
      <strong>${hotelName(h)}</strong><br>
      ${formatWalk(h.walk)}<br>
      ${formatMoney(h.plan.perNight * nights)}<br>
      <a href="hotel.html?id=${h.id}">${t('details')}</a>`);
    marker.addTo(markersLayer);
    points.push([h.lat, h.lng]);
  });

  if (points.length > 1) map.fitBounds(points, { padding: [60, 60] });
}

// أي تغيير في الفلاتر يحدّث النتائج مباشرة
document.querySelectorAll('.filters input, #sort').forEach((el) => {
  el.addEventListener('change', applyFilters);
});

applyFilters();
