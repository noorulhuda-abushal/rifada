/* =========================================================
   رِفادة — صفحة تفاصيل الفندق
   ========================================================= */

initPage('results');

const page = document.getElementById('hotel-page');
const hotel = getHotel(getParam('id'));

if (!hotel) {
  page.innerHTML = `<div class="notice warn">${t('hotel_not_found')}</div>`;
} else {
  renderHotel(hotel);
}

function renderHotel(h) {
  const search = getSearch();
  const nights = nightsBetween(search.checkin, search.checkout) || 1;
  const plan = makePlan(h, search.men, search.women);
  const distance = hotelDistance(h);
  const walk = walkMinutes(h);

  // صفوف جدول الغرف
  const roomRows = ROOM_TYPES.map((type) => `
    <div class="table-row">
      <span>${t(type)}</span>
      <span>${formatMoney(h.rooms[type].price)}</span>
      <span>${h.rooms[type].free}</span>
    </div>`).join('');

  // ما يهم الحملة (يظهر فقط المتوفر في الفندق)
  const needs = [];
  if (h.separate) needs.push('need_separate');
  if (h.elderly) needs.push('need_elderly');
  if (h.hall) needs.push('need_hall');
  const needsHtml = needs.length ? `
    <section class="card">
      <h2>${t('needs_title')}</h2>
      <div class="needs">
        ${needs.map((key) => `<span class="need"><span class="tick">✓</span>${t(key)}</span>`).join('')}
      </div>
    </section>` : '';

  // التوزيع المقترح أو رسالة عدم كفاية الغرف
  const distHtml = plan ? `
    <section class="card">
      <h2>${t('dist_title')}</h2>
      <div class="dist-grid">
        <div class="dist-box">
          <span class="muted">${t('men_group', { n: search.men })}</span>
          <strong>${planText(plan.men)}</strong>
        </div>
        <div class="dist-box">
          <span class="muted">${t('women_group', { n: search.women })}</span>
          <strong>${planText(plan.women)}</strong>
        </div>
      </div>
    </section>` : `<div class="notice warn">${t('not_enough')}</div>`;

  // ملخص الحجز
  const summaryHtml = plan ? `
    <aside class="side card card-gold">
      <h2>${t('summary_title')}</h2>
      <div class="sum-row"><span class="label">${t('people')}</span><span>${search.men + search.women}</span></div>
      <div class="sum-row"><span class="label">${t('rooms')}</span><span>${totalPlanText(plan)}</span></div>
      <div class="sum-row"><span class="label">${t('nights')}</span><span>${nights}</span></div>
      <div class="divider"></div>
      <div class="sum-total"><strong>${t('total')}</strong><strong>${formatMoney(plan.perNight * nights)}</strong></div>
      <a class="btn btn-block" href="booking.html?id=${h.id}">${t('reserve')}</a>
      <span class="muted" style="font-size: 13px">${t('hold_note')}</span>
    </aside>` : '';

  page.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px">
      <div class="hotel-title">
        <h1>${hotelName(h)}</h1>
        <span class="stars" style="font-size: 16px">${starsText(h.stars)}</span>
      </div>
      <span class="muted">${hotelArea(h)} · ${formatDistance(distance)} ${t('from_haram')} (${formatWalk(walk)})</span>
    </div>

    <div class="gallery">
      <div class="ph">${t('ph_front')}</div>
      <div class="ph">${t('ph_quad')}</div>
      <div class="ph">${t('ph_double')}</div>
      <div class="ph">${t('ph_bath')}</div>
      <div class="ph">${t('ph_dining')}</div>
    </div>

    <div class="layout" style="padding: 0">
      <div class="main">
        <section class="card">
          <h2>${t('rooms_title')}</h2>
          <div class="table">
            <div class="table-row head">
              <span>${t('col_type')}</span><span>${t('col_price')}</span><span>${t('col_free')}</span>
            </div>
            ${roomRows}
          </div>
        </section>

        ${distHtml}
        ${needsHtml}

        <section class="card">
          <h2>${t('services_title')}</h2>
          <div class="chips">
            ${h.services.map((s) => `<span class="chip">${t('svc_' + s)}</span>`).join('')}
          </div>
        </section>

        <section class="card">
          <h2>${t('location_title')}</h2>
          <div id="hotel-map" class="map map-sm"></div>
        </section>
      </div>
      ${summaryHtml}
    </div>`;

  // خريطة صغيرة للفندق والحرم
  const map = createMap('hotel-map', HARAM, 15);
  if (map) {
    L.marker([h.lat, h.lng], { icon: hotelPin(h, walk) }).addTo(map);
    map.fitBounds([[HARAM.lat, HARAM.lng], [h.lat, h.lng]], { padding: [60, 60] });
  }
}
