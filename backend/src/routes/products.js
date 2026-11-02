const express = require('express');
const router = express.Router();

// Sample curated catalog for demo price lookup (when external pricing API keys are not configured)
const DEMO_CATALOG = [
  { id: 'p1', name: 'Groceries: Monthly Staples Basket (Rice, Dal, Oil, Spices)', category: 'Food', estimatedPrice: 2400, unit: 'Monthly supply', priceType: 'demo_estimate' },
  { id: 'p2', name: 'Fresh Vegetables & Fruits (Weekly)', category: 'Food', estimatedPrice: 650, unit: 'Weekly basket', priceType: 'demo_estimate' },
  { id: 'p3', name: 'Café & Restaurant Meal for Two', category: 'Food', estimatedPrice: 850, unit: 'Per outing', priceType: 'demo_estimate' },
  { id: 'p4', name: 'Monthly City Metro / Bus Smart Card Recharge', category: 'Transport', estimatedPrice: 800, unit: 'Monthly pass', priceType: 'demo_estimate' },
  { id: 'p5', name: 'Fuel / Petrol Refill (Bike / Scooter - 5L)', category: 'Transport', estimatedPrice: 520, unit: 'Refill', priceType: 'demo_estimate' },
  { id: 'p6', name: 'Cab / Auto Commute (10 rides average)', category: 'Transport', estimatedPrice: 1200, unit: '10 trips', priceType: 'demo_estimate' },
  { id: 'p7', name: 'Broadband High-Speed Internet (50 Mbps)', category: 'Bills', estimatedPrice: 799, unit: 'Monthly bill', priceType: 'demo_estimate' },
  { id: 'p8', name: 'Mobile Prepaid Recharge (Unlimited 84 days)', category: 'Bills', estimatedPrice: 719, unit: 'Quarterly', priceType: 'demo_estimate' },
  { id: 'p9', name: 'Electricity Utility Bill (Apartment average)', category: 'Bills', estimatedPrice: 1400, unit: 'Monthly bill', priceType: 'demo_estimate' },
  { id: 'p10', name: 'Engineering / College Textbooks Bundle', category: 'Education', estimatedPrice: 1800, unit: 'Semester set', priceType: 'demo_estimate' },
  { id: 'p11', name: 'Online Learning Platform Subscription (Coursera/Udemy course)', category: 'Education', estimatedPrice: 999, unit: 'Per course', priceType: 'demo_estimate' },
  { id: 'p12', name: 'Notebooks, Stationery & Lab Record Supplies', category: 'Education', estimatedPrice: 450, unit: 'Pack', priceType: 'demo_estimate' },
  { id: 'p13', name: 'General Physician Consultation & Basic Medicines', category: 'Healthcare', estimatedPrice: 600, unit: 'Visit', priceType: 'demo_estimate' },
  { id: 'p14', name: 'Monthly Health Supplements & Multivitamins', category: 'Healthcare', estimatedPrice: 850, unit: 'Monthly bottle', priceType: 'demo_estimate' },
  { id: 'p15', name: 'Casual T-Shirt / Jeans Apparel', category: 'Shopping', estimatedPrice: 1100, unit: 'Piece', priceType: 'demo_estimate' },
  { id: 'p16', name: 'Sneakers / Everyday Footwear', category: 'Shopping', estimatedPrice: 2200, unit: 'Pair', priceType: 'demo_estimate' },
  { id: 'p17', name: 'Weekend Movie Theater Tickets + Popcorn (2 Persons)', category: 'Entertainment', estimatedPrice: 750, unit: 'Show', priceType: 'demo_estimate' },
  { id: 'p18', name: 'OTT Video & Music Streaming Bundle (Monthly)', category: 'Entertainment', estimatedPrice: 499, unit: 'Monthly plan', priceType: 'demo_estimate' },
];

// GET /api/products/search?q=keyword&category=Food
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  const category = req.query.category;

  let results = DEMO_CATALOG;
  if (category && category !== 'all') {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    results = results.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    data: results,
    isExternalApiAvailable: false,
    disclaimer: 'Product prices are curated reference estimates for budgeting and simulation. They can be added to your proposed expense plan without automatically saving until you confirm.',
  });
});

module.exports = router;
