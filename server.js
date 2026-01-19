const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
  {
    id: 1,
    name: "Saraswati Smart TV 55\"",
    category: "Electronics",
    price: 48999,
    rating: 4.6,
    badge: "Top Rated",
    stock: 12,
    delivery: "Tomorrow",
    offer: "Extra ₹3,000 off with bank offer",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    description: "4K UHD smart TV with Dolby Vision and built-in voice assistant.",
  },
  {
    id: 2,
    name: "Aurora Noise-Canceling Headphones",
    category: "Audio",
    price: 7999,
    rating: 4.4,
    badge: "Hot Deal",
    stock: 25,
    delivery: "2 days",
    offer: "No-cost EMI for 6 months",
    image:
      "https://images.unsplash.com/photo-1505740106531-4243f3831c78?auto=format&fit=crop&w=900&q=80",
    description: "40-hour battery life with adaptive noise cancellation.",
  },
  {
    id: 3,
    name: "Saraswati Laptop Pro 14",
    category: "Computers",
    price: 82999,
    rating: 4.7,
    badge: "Best Seller",
    stock: 8,
    delivery: "Tomorrow",
    offer: "Free 1-year warranty upgrade",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    description: "Ultra-thin performance laptop with 16GB RAM and 1TB SSD.",
  },
  {
    id: 4,
    name: "Prism Air Fryer 5L",
    category: "Home & Kitchen",
    price: 5999,
    rating: 4.3,
    badge: "New",
    stock: 18,
    delivery: "3 days",
    offer: "Combo discount with cookware",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
    description: "Healthy crisping with 8 smart presets and touch display.",
  },
  {
    id: 5,
    name: "Saraswati Active Wear Set",
    category: "Fashion",
    price: 2499,
    rating: 4.5,
    badge: "Trending",
    stock: 30,
    delivery: "2 days",
    offer: "Buy 2 get 10% off",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Breathable fabric with sweat-wicking technology.",
  },
  {
    id: 6,
    name: "Glow Skin Essentials Kit",
    category: "Beauty",
    price: 1899,
    rating: 4.2,
    badge: "Combo",
    stock: 40,
    delivery: "Tomorrow",
    offer: "Free travel pouch",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    description: "Hydration-focused skincare kit for radiant glow.",
  },
];

let cart = [];

const calculateCartTotals = () => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal > 50000 ? 2500 : subtotal > 25000 ? 1200 : 0;
  const delivery = subtotal === 0 ? 0 : subtotal > 15000 ? 0 : 199;
  const total = subtotal - discount + delivery;

  return {
    subtotal,
    discount,
    delivery,
    total,
  };
};

app.get("/api/products", (req, res) => {
  const { search = "", category = "all" } = req.query;
  const query = search.toString().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);
    const matchesCategory =
      category === "all" || product.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  res.json({ products: filtered });
});

app.get("/api/categories", (_req, res) => {
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category.toLowerCase())),
  ];
  res.json({ categories });
});

app.get("/api/cart", (_req, res) => {
  res.json({ items: cart, totals: calculateCartTotals() });
});

app.post("/api/cart", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  return res.status(201).json({ items: cart, totals: calculateCartTotals() });
});

app.patch("/api/cart/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;
  const item = cart.find((entry) => entry.productId === productId);

  if (!item) {
    return res.status(404).json({ message: "Cart item not found." });
  }

  if (quantity <= 0) {
    cart = cart.filter((entry) => entry.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  return res.json({ items: cart, totals: calculateCartTotals() });
});

app.delete("/api/cart/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  cart = cart.filter((entry) => entry.productId !== productId);

  return res.json({ items: cart, totals: calculateCartTotals() });
});

app.post("/api/cart/clear", (_req, res) => {
  cart = [];
  return res.json({ items: cart, totals: calculateCartTotals() });
});

app.post("/api/checkout", (_req, res) => {
  const orderId = `SAR-${Math.floor(Math.random() * 900000 + 100000)}`;
  cart = [];
  res.json({ orderId });
});

app.listen(PORT, () => {
  console.log(`Saraswati store running on http://localhost:${PORT}`);
});
