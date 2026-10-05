// Kav Cafe (كاف كافيه) — menu from the "المنيو" highlight on instagram.com/kav.cafe.
// - Names, prices (SAR) and calories are as printed on that menu.
// - Photos are cut from the same menu pages (public/assets/menu/<id>.jpg); items without one show a styled tile.
// - Descriptions are written for the demo (sandwich fillings are from the menu); allergens are placeholders.
// Add-ons (milk, extra shot, ice, sandwich extras) are SAMPLE options — see `sampleOptions`.

export const categories = [
  { id: 'coffee', en: 'Coffee', ar: 'القهوة', icon: 'coffee' },
  { id: 'drinks', en: 'Drinks', ar: 'المشروبات', icon: 'leaf' },
  { id: 'croissant', en: 'Croissants', ar: 'الكرواسون', icon: 'bread' },
  { id: 'food', en: 'Sandwiches', ar: 'المأكولات', icon: 'food' },
  { id: 'dessert', en: 'Desserts', ar: 'الحلويات', icon: 'cake' },
];

// `photo: false` = not photographed on the menu (shown as a styled tile).
const item = (id, category, en, ar, price, kcal, extra = {}) => ({
  id, category, en, ar, price, kcal, ...extra,
  photo: extra.photo === false ? null : `menu/${id}.jpg`,
});

// Option presets. All options are samples (not on the published menu).
const milky = { options: ['milk', 'shot'] };
const iced = { options: ['ice'] };
const sandwich = { options: ['addons', 'remove'] };

export const menu = [
  // القهوة
  item('salted-caramel', 'coffee', 'Salted Caramel', 'سولتد كراميل', 20, 138, { ...milky, featured: true }),
  item('caramel-latte', 'coffee', 'Caramel Latte', 'كراميل لاتيه', 20, 142, milky),
  item('white-mocha', 'coffee', 'White Mocha', 'وايت موكا', 20, 132, milky),
  item('mocha', 'coffee', 'Mocha', 'موكا', 18, 120, milky),
  item('hot-chocolate', 'coffee', 'Hot Chocolate', 'هوت شوكلت', 17, 126, { options: ['milk'] }),
  item('macchiato', 'coffee', 'Macchiato', 'ماكياتو', 15, 23, { options: ['shot'] }),
  item('saudi-coffee', 'coffee', 'Saudi Coffee', 'قهوة سعودية', 5, 5, {
    photo: false, sizes: [{ id: 'small', en: 'Small', ar: 'صغير', price: 5 }, { id: 'large', en: 'Large', ar: 'كبير', price: 10 }],
  }),
  item('turkish-coffee', 'coffee', 'Turkish Coffee', 'قهوة تركية', 6, 10, { photo: false }),

  // المشروبات
  item('matcha', 'drinks', 'Matcha', 'ماتشا', 22, 117, { options: ['milk'], featured: true }),
  item('mojito', 'drinks', 'Mojito', 'موهيتو', 18, 140, { ...iced, featured: true }),
  item('iced-tea', 'drinks', 'Iced Tea', 'آيس تي', 16, 30, iced),
  item('hibiscus', 'drinks', 'Hibiscus', 'كركديه', 16, 70, iced),
  item('milk-tea', 'drinks', 'Milk Tea', 'شاي حليب', 8, 43),
  item('black-tea', 'drinks', 'Black Tea', 'شاي أحمر', 5, 2),
  item('juice', 'drinks', 'Juice · 250 ml', 'عصير ٢٥٠ مل', 8, 110, { photo: false }),
  item('water', 'drinks', 'Water · 330 ml', 'ماء ٣٣٠ مل', 1, 0, { photo: false }),

  // الكرواسون
  item('zaatar-croissant', 'croissant', 'Zaatar Croissant', 'كرواسون الزعتر', 14, 360, { featured: true }),
  item('cheese-croissant', 'croissant', 'Cheese Croissant', 'كرواسون الجبنة', 14, 380),
  item('zaatar-choc-croissant', 'croissant', 'Zaatar & Chocolate Croissant', 'كرواسون الزعتر والشوكلت', 15, 520),
  item('almond-croissant', 'croissant', 'Almond Croissant', 'كرواسون اللوز', 15, 530),

  // المأكولات
  item('halloumi-pesto', 'food', 'Halloumi Pesto', 'حلومي بيستو', 28, 671, { ...sandwich, featured: true }),
  item('omelette', 'food', 'Omelette', 'أومليت', 28, 650, sandwich),
  item('boiled-egg', 'food', 'Boiled Egg', 'بيض مسلوق', 16, 308, sandwich),
  item('kebda', 'food', 'Kebda', 'كبدة', 16, 260, sandwich),
  item('falafel-wrap', 'food', 'Falafel Wrap', 'فلافل راب', 16, 477, sandwich),
  item('danish-feta', 'food', 'Feta Danish', 'دانيش فيتا', 14, 340),

  // الحلويات
  item('pistachio-cheesecake', 'dessert', 'Pistachio Cheesecake', 'تشيز كيك البستاشيو', 20, 210, { featured: true }),
  item('lotus-cheesecake', 'dessert', 'Lotus Cheesecake', 'تشيز كيك اللوتس', 22, 320, { featured: true }),
  item('berry-cheesecake', 'dessert', 'Berry Cheesecake', 'تشيز كيك البيري', 20, 280),
  item('tiramisu', 'dessert', 'Tiramisu', 'تراميسو', 18, 100),
  item('date-pudding', 'dessert', 'Date Pudding', 'بودنغ التمر', 18, 125, { featured: true }),
  item('choc-pudding', 'dessert', 'Chocolate Pudding', 'بودنغ الشوكلت', 18, 120),
  item('lemon-cake', 'dessert', 'English Cake · Lemon', 'إنجليش كيك ليمون', 12, 215),
  item('carrot-cake', 'dessert', 'English Cake · Carrot', 'إنجليش كيك جزر', 10, 275),
  item('chocolate-cake', 'dessert', 'English Cake · Chocolate', 'إنجليش كيك شوكلت', 10, 260),
  item('brownies', 'dessert', 'Brownies', 'براونيز', 12, 110),
  item('cookies', 'dessert', 'Classic Cookies', 'كوكيز كلاسيك', 12, 170),
  item('pecan-tart', 'dessert', 'Pecan Tart', 'تارت البيكان', 12, 45),
  item('madeleine', 'dessert', 'Madeleine', 'مادلين', 11, 110),
  item('granola', 'dessert', 'Granola Bar', 'قرانولا', 16, 170),
  item('truffles', 'dessert', 'Truffles', 'ترافلز', 5, 160),
];

// Descriptions and allergens. Allergen codes: milk, gluten, egg, nuts, soy, sesame, fish.
const details = {
  'salted-caramel': ['Espresso, steamed milk and salted caramel.', 'اسبريسو وحليب مبخر مع كراميل مملح.', ['milk']],
  'caramel-latte': ['Latte with caramel, finished with a caramel drizzle.', 'لاتيه بالكراميل مع صوص كراميل.', ['milk']],
  'white-mocha': ['Espresso, white chocolate and steamed milk.', 'اسبريسو مع شوكولاتة بيضاء وحليب.', ['milk', 'soy']],
  mocha: ['Espresso, dark chocolate and steamed milk.', 'اسبريسو مع شوكولاتة داكنة وحليب.', ['milk', 'soy']],
  'hot-chocolate': ['Rich, creamy hot chocolate.', 'شوكولاتة ساخنة غنية وكريمية.', ['milk', 'soy']],
  macchiato: ['Espresso marked with a spoon of milk foam.', 'اسبريسو مع لمسة رغوة حليب.', ['milk']],
  'saudi-coffee': ['Light-roast Saudi coffee with cardamom.', 'قهوة سعودية شقراء بالهيل.', []],
  'turkish-coffee': ['Finely ground, slow-brewed Turkish coffee.', 'قهوة تركية مطحونة ناعم ومحضرة على مهل.', []],
  matcha: ['Matcha whisked into cold milk.', 'ماتشا مخفوقة مع حليب بارد.', ['milk']],
  mojito: ['Fresh mint and lime over ice.', 'نعناع طازج وليمون على ثلج.', []],
  'iced-tea': ['House iced tea, shaken over ice.', 'آيس تي بطريقة كاف على ثلج.', []],
  hibiscus: ['Chilled hibiscus, bright and refreshing.', 'كركديه بارد ومنعش.', []],
  'milk-tea': ['Black tea with warm milk.', 'شاي أحمر مع حليب دافئ.', ['milk']],
  'black-tea': ['Classic black tea, served hot.', 'شاي أحمر كلاسيكي.', []],
  juice: ['Chilled bottled juice.', 'عصير بارد.', []],
  water: ['Still water, 330 ml.', 'مياه ٣٣٠ مل.', []],
  'zaatar-croissant': ['Butter croissant filled with zaatar.', 'كرواسون بالزبدة محشي زعتر.', ['gluten', 'milk', 'sesame']],
  'cheese-croissant': ['Butter croissant filled with melted cheese.', 'كرواسون بالزبدة محشي جبنة.', ['gluten', 'milk']],
  'zaatar-choc-croissant': ['Zaatar and chocolate — sweet meets savoury.', 'زعتر وشوكولاتة — حلو ومالح.', ['gluten', 'milk', 'sesame', 'soy']],
  'almond-croissant': ['Almond cream and toasted almonds.', 'كريمة اللوز مع لوز محمص.', ['gluten', 'milk', 'nuts', 'egg']],
  'halloumi-pesto': ['Brown sourdough, halloumi, labneh, pesto, sun-dried tomato.', 'خبز ساوردو أسمر، جبن حلوم، لبنة، بيستو، طماطم مجففة.', ['gluten', 'milk', 'nuts']],
  omelette: ['Brown sourdough, egg, cheese, lettuce, mayo.', 'خبز ساوردو أسمر، بيض، جبن، خس، مايونيز.', ['gluten', 'egg', 'milk']],
  'boiled-egg': ['Brown samoon, egg, cheese, cold pepper sauce.', 'خبز صامولي أسمر، بيض، جبن، صلصة الفلفل البارد.', ['gluten', 'egg', 'milk']],
  kebda: ['Brown samoon, veal liver, onion, bell peppers.', 'خبز صامولي أسمر، كبدة عجل، بصل، فلفل بارد ألوان.', ['gluten']],
  'falafel-wrap': ['Brown tortilla, falafel, eggplant, labneh, tahini.', 'خبز تورتيلا أسمر، فلافل، باذنجان، لبنة، طحينية.', ['gluten', 'milk', 'sesame']],
  'danish-feta': ['Flaky Danish pastry with feta.', 'دانيش هش بجبن الفيتا.', ['gluten', 'milk', 'egg']],
  'pistachio-cheesecake': ['Creamy cheesecake, pistachio cream, crumble.', 'تشيز كيك كريمي مع كريمة الفستق وكرمبل.', ['milk', 'gluten', 'nuts', 'egg']],
  'lotus-cheesecake': ['Creamy cheesecake with Lotus biscuit and spread.', 'تشيز كيك كريمي مع بسكويت وصوص اللوتس.', ['milk', 'gluten', 'egg', 'soy']],
  'berry-cheesecake': ['Creamy cheesecake with a mixed-berry topping.', 'تشيز كيك كريمي مع صوص التوت.', ['milk', 'gluten', 'egg']],
  tiramisu: ['Espresso-soaked sponge, mascarpone and cocoa.', 'بسكويت بالاسبريسو وماسكربوني وكاكاو.', ['milk', 'egg', 'gluten']],
  'date-pudding': ['Soft date pudding with a rich sauce.', 'بودنغ التمر الطري مع صوص غني.', ['milk', 'egg', 'gluten']],
  'choc-pudding': ['Soft chocolate pudding with chocolate sauce.', 'بودنغ شوكولاتة طري مع صوص الشوكولاتة.', ['milk', 'egg', 'gluten', 'soy']],
  'lemon-cake': ['Lemon loaf cake with blueberries.', 'كيك ليمون مع توت أزرق.', ['gluten', 'egg', 'milk']],
  'carrot-cake': ['Spiced carrot loaf cake.', 'كيك جزر بالبهارات.', ['gluten', 'egg', 'nuts']],
  'chocolate-cake': ['Moist chocolate loaf cake.', 'كيك شوكولاتة طري.', ['gluten', 'egg', 'milk', 'soy']],
  brownies: ['Fudgy brownie with nuts.', 'براونيز غني بالمكسرات.', ['gluten', 'egg', 'milk', 'nuts']],
  cookies: ['Classic butter cookie.', 'كوكيز كلاسيك بالزبدة.', ['gluten', 'milk', 'egg']],
  'pecan-tart': ['Mini tarts with caramelised pecans.', 'تارت صغير بالبيكان المكرمل.', ['gluten', 'milk', 'egg', 'nuts']],
  madeleine: ['Buttery French sponge cakes.', 'كيك مادلين فرنسي بالزبدة.', ['gluten', 'milk', 'egg']],
  granola: ['Oat and honey granola bar.', 'قرانولا بالشوفان والعسل.', ['gluten', 'nuts']],
  truffles: ['Chocolate truffles — two pieces.', 'ترافلز شوكولاتة — حبتين.', ['milk', 'soy']],
};
for (const p of menu) {
  const [en, ar, allergens] = details[p.id];
  Object.assign(p, { desc: { en, ar }, allergens });
}

// The published menu, untouched. `menu` / `byId` below are live: src/shared/catalog.js rebuilds them in place
// from this list plus the edits made in the Admin portal (prices, names, photos, new items, hidden items).
export const baseMenu = menu.map((p) => ({ ...p }));

export const allergenNames = {
  milk: { en: 'Milk', ar: 'حليب' },
  gluten: { en: 'Gluten', ar: 'جلوتين' },
  egg: { en: 'Egg', ar: 'بيض' },
  nuts: { en: 'Nuts', ar: 'مكسرات' },
  soy: { en: 'Soy', ar: 'صويا' },
  sesame: { en: 'Sesame', ar: 'سمسم' },
  fish: { en: 'Fish', ar: 'سمك' },
};

// Sample customisations — NOT on the published menu. Prices are placeholders for Kav to set.
export const sampleOptions = {
  milk: {
    en: 'Milk', ar: 'الحليب',
    choices: [
      { id: 'regular', en: 'Regular', ar: 'عادي', price: 0 },
      { id: 'oat', en: 'Oat', ar: 'شوفان', price: 3 },
      { id: 'almond', en: 'Almond', ar: 'لوز', price: 3 },
    ],
  },
  ice: {
    en: 'Ice', ar: 'الثلج',
    choices: [
      { id: 'regular', en: 'Regular ice', ar: 'ثلج عادي', price: 0 },
      { id: 'light', en: 'Light ice', ar: 'ثلج خفيف', price: 0 },
    ],
  },
  shot: { en: 'Extra espresso shot', ar: 'شوت اسبريسو إضافي', price: 3 },
  addons: {
    en: 'Add-ons', ar: 'الإضافات', max: 3,
    choices: [
      { id: 'cheese', en: 'Extra cheese', ar: 'جبنة إضافية', price: 4 },
      { id: 'egg', en: 'Extra egg', ar: 'بيض إضافي', price: 4 },
      { id: 'labneh', en: 'Labneh', ar: 'لبنة', price: 3 },
      { id: 'jalapeno', en: 'Jalapeño', ar: 'هالبينو', price: 2 },
    ],
  },
  remove: {
    en: 'Without', ar: 'بدون',
    choices: [
      { id: 'onion', en: 'No onion', ar: 'بدون بصل' },
      { id: 'mayo', en: 'No mayo', ar: 'بدون مايونيز' },
      { id: 'lettuce', en: 'No lettuce', ar: 'بدون خس' },
      { id: 'spicy', en: 'Not spicy', ar: 'بدون حار' },
    ],
  },
};

// Branches and hours from the "أوقات العمل" highlight.
// Day index: 0 = Sunday … 5 = Friday, 6 = Saturday. `null` = closed; { open: 0, close: 24 } = 24 hours.
const H24 = { open: 0, close: 24 };
export const branches = [
  {
    id: 'jamiyin', drive: true,
    en: 'Kav Drive Thru · Al Jamiyin', ar: 'كاف درايف ثرو · حي الجامعيين',
    hours: (d) => (d === 5 || d === 6 ? { open: 12, close: 24 } : H24),
    lines: [['Sun–Thu', 'الأحد – الخميس', '24 hours', '٢٤ ساعة'], ['Fri–Sat', 'الجمعة – السبت', '12 PM – 12 AM', '١٢ م – ١٢ ص']],
  },
  {
    id: 'maternity',
    en: 'Maternity & Children Hospital · Dammam', ar: 'مستشفى الولادة والأطفال · الدمام',
    hours: (d) => (d === 5 ? { open: 12, close: 21 } : H24),
    lines: [['Sat–Thu', 'السبت – الخميس', '24 hours', '٢٤ ساعة'], ['Fri', 'الجمعة', '12 PM – 9 PM', '١٢ م – ٩ م']],
  },
  {
    id: 'qatif-central',
    en: 'Qatif Central Hospital', ar: 'مستشفى القطيف المركزي',
    hours: (d) => (d === 5 ? { open: 12, close: 24 } : H24),
    lines: [['Sat–Thu', 'السبت – الخميس', '24 hours', '٢٤ ساعة'], ['Fri', 'الجمعة', '12 PM – 12 AM', '١٢ م – ١٢ ص']],
  },
  {
    id: 'pmbf',
    en: 'Prince Mohammed bin Fahd Hospital', ar: 'مستشفى الأمير محمد بن فهد',
    hours: (d) => (d === 5 || d === 6 ? null : { open: 7, close: 22 }),
    lines: [['Sun–Thu', 'الأحد – الخميس', '7 AM – 10 PM', '٧ ص – ١٠ م'], ['Fri–Sat', 'الجمعة – السبت', 'Closed', 'مغلق']],
  },
  {
    id: 'aziziyah',
    en: 'Al Aziziyah', ar: 'حي العزيزية',
    hours: (d) => (d === 5 ? { open: 12, close: 24 } : { open: 7, close: 24 }),
    lines: [['Sat–Thu', 'السبت – الخميس', '7 AM – 12 AM', '٧ ص – ١٢ ص'], ['Fri', 'الجمعة', '12 PM – 12 AM', '١٢ م – ١٢ ص']],
  },
];
export const branchById = Object.fromEntries(branches.map((b) => [b.id, b]));

export const cafe = {
  name: { en: 'Kav Cafe', ar: 'كاف كافيه' },
  tagline: { en: 'Wherever you are, wherever you go', ar: 'في حلك وترحالك' },
  city: { en: 'Dammam · Qatif', ar: 'الدمام · القطيف' },
  instagram: 'https://www.instagram.com/kav.cafe/',
};

export const byId = Object.fromEntries(menu.map((p) => [p.id, p])); // live, see baseMenu
