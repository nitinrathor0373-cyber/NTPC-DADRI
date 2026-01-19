const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const cartCount = document.getElementById("cartCount");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearCartButton = document.getElementById("clearCart");
const checkoutButton = document.getElementById("checkoutButton");
const statusToast = document.getElementById("statusToast");

let activeCategory = "all";
let productsCache = [];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const setToast = (message, type = "info") => {
  statusToast.textContent = message;
  statusToast.className = `toast ${type} visible`;
  window.clearTimeout(statusToast.dataset.timeoutId);
  const timeoutId = window.setTimeout(() => {
    statusToast.classList.remove("visible");
  }, 2500);
  statusToast.dataset.timeoutId = timeoutId;
};

const fetchProducts = async () => {
  const query = new URLSearchParams({
    search: searchInput.value.trim(),
    category: activeCategory,
  });

  try {
    const response = await fetch(`/api/products?${query.toString()}`);
    const data = await response.json();
    productsCache = data.products;
    renderProducts(data.products);
  } catch (error) {
    setToast("Unable to load products right now.", "error");
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch("/api/categories");
    const data = await response.json();
    initCategories(data.categories);
  } catch (error) {
    initCategories(["all"]);
  }
};

const fetchCart = async () => {
  try {
    const response = await fetch("/api/cart");
    const data = await response.json();
    renderCart(data.items, data.totals);
  } catch (error) {
    setToast("Unable to load cart right now.", "error");
  }
};

const renderProducts = (products) => {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    productGrid.innerHTML =
      "<p class=\"muted\">No products found. Try another search.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="card-top">
        <span class="badge">${product.badge}</span>
        <span class="stock">${product.stock} left</span>
      </div>
      <h4>${product.name}</h4>
      <p class="muted">${product.description}</p>
      <div class="meta">
        <span class="rating">★ ${product.rating}</span>
        <span class="delivery">${product.delivery}</span>
      </div>
      <div class="price-row">
        <div>
          <div class="price">${formatCurrency(product.price)}</div>
          <div class="muted">${product.offer}</div>
        </div>
        <button class="primary" data-product="${product.id}">Add to Cart</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(card);
  });
};

const renderCart = (items, totals) => {
  cartItems.innerHTML = "";

  if (items.length === 0) {
    cartItems.innerHTML =
      "<p class=\"muted\">Your cart is empty. Add items to get started.</p>";
  }

  items.forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "cart-item";
    entry.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="cart-item-header">
          <h5>${item.name}</h5>
          <button class="link" data-action="remove">Remove</button>
        </div>
        <p>${formatCurrency(item.price)}</p>
        <div class="quantity-controls">
          <button data-action="decrease">-</button>
          <span>${item.quantity}</span>
          <button data-action="increase">+</button>
        </div>
      </div>
    `;

    const [removeBtn, decreaseBtn, increaseBtn] = entry.querySelectorAll("button");
    removeBtn.addEventListener("click", () => removeItem(item.productId));
    decreaseBtn.addEventListener("click", () => updateQuantity(item.productId, item.quantity - 1));
    increaseBtn.addEventListener("click", () => updateQuantity(item.productId, item.quantity + 1));

    cartItems.appendChild(entry);
  });

  cartSummary.innerHTML = `
    <div><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
    <div><span>Discount</span><span>- ${formatCurrency(totals.discount)}</span></div>
    <div><span>Delivery</span><span>${formatCurrency(totals.delivery)}</span></div>
    <div><strong>Total</strong><strong>${formatCurrency(totals.total)}</strong></div>
  `;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
};

const addToCart = async (productId) => {
  await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  setToast("Added to cart!", "success");
  fetchCart();
};

const updateQuantity = async (productId, quantity) => {
  await fetch(`/api/cart/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });

  fetchCart();
};

const removeItem = async (productId) => {
  await fetch(`/api/cart/${productId}`, { method: "DELETE" });
  setToast("Item removed from cart.", "info");
  fetchCart();
};

const clearCart = async () => {
  await fetch("/api/cart/clear", { method: "POST" });
  setToast("Cart cleared.", "info");
  fetchCart();
};

const checkout = async () => {
  const response = await fetch("/api/checkout", { method: "POST" });
  const data = await response.json();
  setToast(`Order confirmed! ${data.orderId}`, "success");
  fetchCart();
};

const initCategories = (categories) => {
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-pill";
    button.textContent = category === "all" ? "All" : category;
    if (category === activeCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeCategory = category;
      document.querySelectorAll(".category-pill").forEach((pill) => pill.classList.remove("active"));
      button.classList.add("active");
      fetchProducts();
    });

    categoryList.appendChild(button);
  });
};

searchButton.addEventListener("click", fetchProducts);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    fetchProducts();
  }
});

clearCartButton.addEventListener("click", clearCart);
checkoutButton.addEventListener("click", checkout);

fetchCategories();
fetchProducts();
fetchCart();
