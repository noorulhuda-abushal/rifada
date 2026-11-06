/* =========================================================
   رِفادة — الصفحة الرئيسية (نموذج البحث)
   ========================================================= */

initPage('home');

const form = document.getElementById('search-form');
const menInput = document.getElementById('men');
const womenInput = document.getElementById('women');
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');
const totalText = document.getElementById('group-total');
const errorText = document.getElementById('search-error');

// تعبئة الخانات بآخر بحث محفوظ
const saved = getSearch();
menInput.value = saved.men;
womenInput.value = saved.women;
checkinInput.value = saved.checkin;
checkoutInput.value = saved.checkout;

// تحديث "إجمالي الحملة" كل ما تغيّر رقم أو تاريخ
function updateTotal() {
  const men = parseInt(menInput.value, 10) || 0;
  const women = parseInt(womenInput.value, 10) || 0;
  const nights = nightsBetween(checkinInput.value, checkoutInput.value);
  totalText.textContent = t('group_total', { n: men + women, nights });
}

[menInput, womenInput, checkinInput, checkoutInput].forEach((input) => {
  input.addEventListener('input', updateTotal);
});
updateTotal();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const men = parseInt(menInput.value, 10);
  const women = parseInt(womenInput.value, 10);

  // التحقق من الأعداد
  if (isNaN(men) || isNaN(women) || men < 0 || women < 0 || men + women < 1) {
    showError(t('err_count'));
    return;
  }
  // التحقق من التواريخ
  if (nightsBetween(checkinInput.value, checkoutInput.value) < 1) {
    showError(t('err_dates'));
    return;
  }

  STORE.set('rifada_search', {
    men,
    women,
    checkin: checkinInput.value,
    checkout: checkoutInput.value
  });
  location.href = 'results.html';
});

function showError(message) {
  errorText.textContent = message;
  errorText.classList.remove('hidden');
}
