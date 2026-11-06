/* =========================================================
   رِفادة — لوحة تحكم الفندق
   تعديل الأسعار والشاغر، وقبول أو رفض طلبات الحجز
   ========================================================= */

initPage('dashboard');

const select = document.getElementById('hotel-select');
let currentId = Number(STORE.get('rifada_dash_hotel', 2));

// قائمة اختيار الفندق
getHotels().forEach((h) => {
  const option = document.createElement('option');
  option.value = h.id;
  option.textContent = hotelName(h);
  select.appendChild(option);
});
select.value = currentId;
select.addEventListener('change', () => {
  currentId = Number(select.value);
  STORE.set('rifada_dash_hotel', currentId);
  renderDashboard();
});

function getRequests() {
  return STORE.get('rifada_requests', REQUESTS_DEFAULT);
}

function saveRooms(hotelId, rooms) {
  const overrides = STORE.get('rifada_overrides', {});
  overrides[hotelId] = rooms;
  STORE.set('rifada_overrides', overrides);
}

function renderDashboard() {
  const hotel = getHotel(currentId);
  const requests = getRequests().filter((r) => r.hotelId === currentId);

  document.getElementById('dash-hotel-name').textContent = hotelName(hotel);

  // الأرقام السريعة
  document.getElementById('stat-free').textContent = ROOM_TYPES.reduce((s, type) => s + hotel.rooms[type].free, 0);
  document.getElementById('stat-new').textContent = requests.filter((r) => r.status === 'new').length;
  document.getElementById('stat-accepted').textContent = requests.filter((r) => r.status === 'accepted').length;

  // جدول الغرف (قابل للتعديل)
  document.getElementById('rooms-table').innerHTML = `
    <div class="table-row cols-4 head">
      <span>${t('col_type')}</span><span>${t('col_price')} (${t('sar')})</span><span>${t('col_free')}</span><span>${t('col_photos')}</span>
    </div>
    ${ROOM_TYPES.map((type) => `
      <div class="table-row cols-4">
        <span>${t(type)}</span>
        <input class="input" type="number" min="0" data-type="${type}" data-field="price" value="${hotel.rooms[type].price}" aria-label="${t('col_price')} — ${t(type)}">
        <input class="input" type="number" min="0" data-type="${type}" data-field="free" value="${hotel.rooms[type].free}" aria-label="${t('col_free')} — ${t(type)}">
        <a href="#" class="soon">${t('add_photos')}</a>
      </div>`).join('')}`;

  // طلبات الحجز
  const list = document.getElementById('requests-list');
  if (requests.length === 0) {
    list.innerHTML = `<p class="muted" style="margin: 0">${t('no_requests')}</p>`;
  } else {
    list.innerHTML = requests.map((r) => {
      const fullPlan = {
        quad: r.plan.men.quad + r.plan.women.quad,
        triple: r.plan.men.triple + r.plan.women.triple,
        double: r.plan.men.double + r.plan.women.double
      };
      const actions = r.status === 'new' ? `
        <div style="display: flex; gap: 8px">
          <button type="button" class="btn btn-sm" data-accept="${r.ref}">${t('accept')}</button>
          <button type="button" class="btn btn-outline btn-sm" data-reject="${r.ref}">${t('reject')}</button>
        </div>` : `<span class="status ${r.status}">${t('status_' + r.status)}</span>`;
      return `
        <div class="request">
          <div style="display: flex; flex-direction: column; gap: 2px">
            <strong>${r.groupName} <span class="muted" style="font-weight: 400; font-size: 13px">(${r.ref})</span></strong>
            <span class="muted" style="font-size: 14px">${t('request_line', { n: r.men + r.women, plan: planText(fullPlan), period: formatPeriod(r.checkin, r.checkout) })}</span>
            <span style="font-size: 14px">${formatMoney(r.total)}</span>
          </div>
          ${actions}
        </div>`;
    }).join('');
  }

  bindDashboardButtons();
}

function bindDashboardButtons() {
  document.querySelectorAll('[data-accept]').forEach((btn) => {
    btn.addEventListener('click', () => updateRequest(btn.dataset.accept, 'accepted'));
  });
  document.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', () => updateRequest(btn.dataset.reject, 'rejected'));
  });
  document.querySelectorAll('.soon').forEach((el) => {
    el.onclick = (e) => { e.preventDefault(); toast(t('feature_soon')); };
  });
}

function updateRequest(ref, status) {
  const requests = getRequests();
  const request = requests.find((r) => r.ref === ref);
  if (!request) return;

  if (status === 'accepted') {
    // نتأكد أن الغرف تكفي ثم نخصمها من الشاغر
    const hotel = getHotel(request.hotelId);
    const rooms = JSON.parse(JSON.stringify(hotel.rooms));
    for (const type of ROOM_TYPES) {
      const needed = request.plan.men[type] + request.plan.women[type];
      if (rooms[type].free < needed) {
        toast(t('cannot_accept'));
        return;
      }
      rooms[type].free -= needed;
    }
    saveRooms(hotel.id, rooms);
    toast(t('accepted_msg'));
  } else {
    toast(t('rejected_msg'));
  }

  request.status = status;
  STORE.set('rifada_requests', requests);
  renderDashboard();
}

// حفظ تعديلات الأسعار والشاغر
document.getElementById('save-rooms').addEventListener('click', () => {
  const hotel = getHotel(currentId);
  const rooms = JSON.parse(JSON.stringify(hotel.rooms));
  let valid = true;

  document.querySelectorAll('#rooms-table input').forEach((input) => {
    const value = Number(input.value);
    if (input.value === '' || isNaN(value) || value < 0 || !Number.isInteger(value)) valid = false;
    rooms[input.dataset.type][input.dataset.field] = value;
  });

  if (!valid) {
    toast(t('err_numbers'));
    return;
  }
  saveRooms(currentId, rooms);
  toast(t('saved'));
  renderDashboard();
});

// إعادة البيانات التجريبية لوضعها الأصلي
document.getElementById('reset-demo').addEventListener('click', () => {
  STORE.remove('rifada_overrides');
  STORE.remove('rifada_requests');
  toast(t('reset_done'));
  renderDashboard();
});

// تمييز عنصر القائمة الجانبية عند الضغط
document.querySelectorAll('.dash-side a[href^="#"]:not(.soon)').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.dash-side a').forEach((a) => a.classList.remove('active'));
    link.classList.add('active');
  });
});

renderDashboard();
