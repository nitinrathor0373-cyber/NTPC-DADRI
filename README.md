# Saraswati Store

Saraswati is a full stack shopping experience inspired by Flipkart. The Node/Express backend powers product discovery, categories, and a live cart, while the frontend delivers a polished, responsive storefront.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## API highlights

- `GET /api/products` (supports `search` and `category` query params)
- `GET /api/categories`
- `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/:productId`, `DELETE /api/cart/:productId`, `POST /api/cart/clear`
- `POST /api/checkout`
