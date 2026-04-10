const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const dataDir = path.join(__dirname, 'data');
const getFilePath = (name) => path.join(dataDir, `${name}.json`);

const readJSON = (name) => {
  try {
    const data = fs.readFileSync(getFilePath(name), 'utf8');
    return JSON.parse(data);
  } catch (err) { return []; }
};

const writeJSON = (name, data) => {
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2));
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// SAN-4
app.get('/api/products', (req, res) => {
  let products = readJSON('products');
  const q = req.query.q?.toLowerCase();
  if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  res.json(products);
});

// Single Product (SAN-10)
app.get('/api/products/:id', (req, res) => {
  const products = readJSON('products');
  const p = products.find(x => x.id === req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});

// GET Reviews (SAN-10)
app.get('/api/reviews/:productId', (req, res) => {
  const reviews = readJSON('reviews');
  res.json(reviews.filter(r => r.productId === req.params.productId));
});

// POST Review (SAN-10)
app.post('/api/reviews', (req, res) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName) return res.status(400).json({ error: 'Missing data' });
  const reviews = readJSON('reviews');
  const newReview = { id: `r${Date.now()}`, productId, userName, rating: Number(rating) || 5, comment, createdAt: new Date().toISOString() };
  reviews.push(newReview);
  writeJSON('reviews', reviews);
  res.json(newReview);
});

// SAN-8 POST Order
app.post('/api/orders', (req, res) => {
  const { customer, items, totalAmount } = req.body;
  const orders = readJSON('orders');
  const newOrder = { id: `ORD-${Date.now().toString().slice(-6)}`, customer, items, totalAmount, status: "Đang xử lý", createdAt: new Date().toISOString() };
  orders.push(newOrder);
  writeJSON('orders', orders);
  res.json({ message: 'Success', orderId: newOrder.id });
});

// SAN-11 GET Order Tracking
app.get('/api/orders/:id', (req, res) => {
  const orders = readJSON('orders');
  const o = orders.find(x => x.id === req.params.id);
  o ? res.json(o) : res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => console.log(`Backend is running on http://localhost:${PORT}`));
