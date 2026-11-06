/* =========================================================
   رِفادة — صفحة تأكيد الحجز
   الحجز يُحفظ في المتصفح، ويظهر في "لوحة الفندق" كطلب جديد
   ========================================================= */

initPage('results');

const bookingHotel = getHotel(getParam('id'));
const bookingSearch = getSearch();
const bookingNights = nightsBetween(bookingSearch.checkin, bookingSearch.checkout) || 1;
const bookingPlan = bookingHotel ? makePlan(bookingHotel, bookingSearch.men, bookingSearch.women) : null;

const layout = document.getElementById('booking-layout');
document.getElementById('back-link').href = bookingHotel ? `hotel.html?id=${bookingHotel.id}` : 'results.html';

if (!bookingHotel || !bookingPlan) {
  layout.innerHTML = `<div class="notice warn" style="flex: 1">${bookingHotel ? t('not_enough') : t('hotel_not_found')}</div>`;
} else {
  renderSummary();
}

function renderSummary() {
  document.getElementById('summary').innerHTML = `
    <h2>${t('summary_title')}</h2>
    <div class="sum-row"><span class="label">${t('hotel_label')}</span><span>${hotelName(bookingHotel)}</span></div>
    <div class="sum-row"><span class="label">${t('period')}</span><span>${formatPeriod(bookingSearch.checkin, bookingSearch.checkout)}</span></div>
    <div class="sum-row"><span class="label">${t('men_group', { n: bookingSearch.men })}</span><span>${planText(bookingPlan.men)}</span></div>
    <div class="sum-row"><span class="label">${t('women_group', { n: bookingSearch.women })}</span><span>${planText(bookingPlan.women)}</span></div>
    <div class="sum-row"><span class="label">${t('nights')}</span><span>${bookingNights}</span></div>
    <div class="divider"></div>
    <div class="sum-total"><strong>${t('total')}</strong><strong>${formatMoney(bookingPlan.perNight * bookingNights)}</strong></div>`;
}

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('g-name').value.trim();
    const license = document.getElementById('g-license').value.trim();
    const phone = document.getElementById('g-phone').value.trim();
    const email = document.getElementById('g-email').value.trim();
    const agree = document.getElementById('g-agree').checked;

    // التحقق من البيانات
    if (!name || !license || !phone || !email) return showBookingError(t('err_required'));
    if (!/^05\d{8}$/.test(phone)) return showBookingError(t('err_phone'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showBookingError(t('err_email'));
    if (!agree) return showBookingError(t('err_agree'));

    // إنشاء رقم حجز وحفظ الطلب
    const ref = 'RF-' + Math.floor(1000 + Math.random() * 9000);
    const requests = STORE.get('rifada_requests', REQUESTS_DEFAULT);
    requests.unshift({
      ref,
      hotelId: bookingHotel.id,
      groupName: name,
      license,
      phone,
      email,
      men: bookingSearch.men,
      women: bookingSearch.women,
      checkin: bookingSearch.checkin,
      checkout: bookingSearch.checkout,
      nights: bookingNights,
      plan: { men: bookingPlan.men, women: bookingPlan.women },
      total: bookingPlan.perNight * bookingNights,
      status: 'new'
    });
    STORE.set('rifada_requests', requests);

    // إظهار رسالة النجاح
    layout.classList.add('hidden');
    document.getElementById('ok-icon').innerHTML = ICON_CHECK;
    document.getElementById('ref-number').textContent = ref;
    document.getElementById('success-box').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showBookingError(message) {
  const el = document.getElementById('booking-error');
  el.textContent = message;
  el.classList.remove('hidden');
}
