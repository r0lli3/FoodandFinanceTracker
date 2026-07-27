// Meal data — mirrors the live app structure
window.SECTIONS = [
  {
    name: 'Breakfast',
    meals: [
      { id: 'scrambled-egg-rr01', name: 'Scrambled Egg, Bacon & Asparagus', sub: 'Roast Run', protein: 26.1, carbs: 1.6, fat: 27.1, fiber: 0.9, cals: 355 },
      { id: 'khai-on-nut', name: 'Khai On Nut', sub: 'Local · 1 plate', protein: 30, carbs: 60, fat: 38, fiber: 0, cals: 725 },
      { id: 'juice-breakfast', name: 'Cold-Pressed Juice', sub: '250 ml', protein: 2.2, carbs: 36.5, fat: 0.4, fiber: 0, cals: 158 },
      { id: 'meiji-breakfast', name: 'High Protein Drink', sub: 'Meiji', protein: 28.0, carbs: 10.0, fat: 2.0, fiber: 0.0, cals: 170 },
    ],
  },
  {
    name: 'Lunch',
    meals: [
      { id: 'beef-bolognese-b04', name: 'Beef Bolognese, Wholegrain Pasta', sub: 'Basics', protein: 33.2, carbs: 52.4, fat: 10.2, fiber: 7.2, cals: 434 },
      { id: 'juice-lunch', name: 'Cold-Pressed Juice', sub: '250 ml', protein: 2.2, carbs: 36.5, fat: 0.4, fiber: 0, cals: 158 },
    ],
  },
  {
    name: 'Dinner',
    meals: [
      { id: 'beef-tenderloin-b03', name: 'Beef Tenderloin Teriyaki, Sweet Mash', sub: 'Basics', protein: 26.5, carbs: 36.4, fat: 7.5, fiber: 5.4, cals: 319 },
      { id: 'bbq-beef-mince-b01', name: 'BBQ Beef Mince, White Mash', sub: 'Basics', protein: 25.9, carbs: 42.7, fat: 6.5, fiber: 5.1, cals: 334 },
      { id: 'meiji-dinner', name: 'High Protein Drink', sub: 'Meiji', protein: 28.0, carbs: 10.0, fat: 2.0, fiber: 0.0, cals: 170 },
    ],
  },
];

window.TARGETS = { protein: 155, carbs: 180, fat: 50, fiber: 30, cals: 1790 };

// Seed history (local prototype only — keeps the History sheet from being empty)
window.SEED_HISTORY = {
  // dateStr: { mealId: count, _kg?: number }
  // (filled in at runtime relative to today)
};
