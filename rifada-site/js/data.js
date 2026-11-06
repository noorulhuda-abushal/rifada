/* =========================================================
   رِفادة — البيانات التجريبية
   كل الفنادق هنا وهمية. لاحقاً تُستبدل بالفنادق الحقيقية
   (أو تُجلب من قاعدة بيانات).
   ========================================================= */

// موقع المسجد الحرام على الخريطة
const HARAM = { lat: 21.4225, lng: 39.8262 };

// سعة كل نوع غرفة
const ROOM_CAPACITY = { quad: 4, triple: 3, double: 2 };

// ترتيب أنواع الغرف (من الأكبر للأصغر)
const ROOM_TYPES = ['quad', 'triple', 'double'];

const HOTELS_DEFAULT = [
  {
    id: 1,
    name: { ar: 'فندق السكينة', en: 'Al-Sakina Hotel' },
    area: { ar: 'إبراهيم الخليل', en: 'Ibrahim Al-Khalil' },
    stars: 5,
    lat: 21.4200, lng: 39.8250,
    rooms: {
      double: { price: 700, free: 4 },
      triple: { price: 950, free: 6 },
      quad:   { price: 1200, free: 16 }
    },
    separate: true, elderly: true, hall: true,
    services: ['meals3', 'prayer', 'restaurant', 'wifi', 'laundry']
  },
  {
    id: 2,
    name: { ar: 'فندق برج الضيافة', en: 'Burj Al-Diyafa Hotel' },
    area: { ar: 'أجياد', en: 'Ajyad' },
    stars: 4,
    lat: 21.4170, lng: 39.8275,
    rooms: {
      double: { price: 520, free: 6 },
      triple: { price: 750, free: 4 },
      quad:   { price: 960, free: 12 }
    },
    separate: true, elderly: true, hall: true,
    services: ['meals3', 'prayer', 'restaurant', 'wifi']
  },
  {
    id: 3,
    name: { ar: 'فندق الأصيل', en: 'Al-Aseel Hotel' },
    area: { ar: 'الشبيكة', en: 'Al-Shubaika' },
    stars: 4,
    lat: 21.4220, lng: 39.8180,
    rooms: {
      double: { price: 450, free: 5 },
      triple: { price: 650, free: 5 },
      quad:   { price: 840, free: 10 }
    },
    separate: true, elderly: false, hall: false,
    services: ['breakfast', 'prayer', 'wifi']
  },
  {
    id: 4,
    name: { ar: 'نزل المشاعر', en: 'Nuzul Al-Mashaer' },
    area: { ar: 'المسفلة', en: 'Al-Misfalah' },
    stars: 3,
    lat: 21.4160, lng: 39.8380,
    rooms: {
      double: { price: 300, free: 10 },
      triple: { price: 450, free: 8 },
      quad:   { price: 620, free: 14 }
    },
    separate: false, elderly: true, hall: true,
    services: ['breakfast', 'restaurant', 'wifi', 'laundry']
  },
  {
    id: 5,
    name: { ar: 'فندق الروضة', en: 'Al-Rawda Hotel' },
    area: { ar: 'العزيزية', en: 'Al-Aziziyah' },
    stars: 3,
    lat: 21.4040, lng: 39.8560,
    rooms: {
      double: { price: 220, free: 12 },
      triple: { price: 330, free: 10 },
      quad:   { price: 480, free: 20 }
    },
    separate: true, elderly: false, hall: true,
    services: ['meals3', 'prayer', 'wifi']
  }
];

// طلبات حجز تجريبية تظهر في لوحة الفندق أول مرة
const REQUESTS_DEFAULT = [
  {
    ref: 'RF-2041', hotelId: 2, groupName: 'حملة النور', license: '1450-221',
    phone: '0551234567', email: 'alnoor@example.com',
    men: 24, women: 16, checkin: '2027-05-10', checkout: '2027-05-20', nights: 10,
    plan: { men: { quad: 6, triple: 0, double: 0 }, women: { quad: 4, triple: 0, double: 0 } },
    total: 96000, status: 'new'
  },
  {
    ref: 'RF-2042', hotelId: 2, groupName: 'حملة الهدى', license: '1450-317',
    phone: '0559876543', email: 'alhuda@example.com',
    men: 10, women: 8, checkin: '2027-05-11', checkout: '2027-05-19', nights: 8,
    plan: { men: { quad: 1, triple: 2, double: 0 }, women: { quad: 1, triple: 0, double: 2 } },
    total: 35680, status: 'new'
  }
];
