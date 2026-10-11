export const DEMO_SAMPLE_URL = 'https://demo.webforall.local/sample-inaccessible-page';

export const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Demo Sample Storefront — Controlled Inaccessible Fixture</title>
  <style>
    body { font-family: sans-serif; margin: 20px; line-height: 1.5; color: #222; }
    .banner { background: #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .btn { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .field { margin: 10px 0; }
  </style>
</head>
<body>
  <!-- Intentional issue 1: Content outside landmark regions (region rule) -->
  <div class="banner">
    <!-- Intentional issue 2: Heading skips levels h1 directly to h4 (heading-order rule) -->
    <h1>Welcome to Apex Community Outfitters</h1>
    <h4 class="featured-collection-heading">Limited Time Spring Clearance Sale</h4>
  </div>

  <div>
    <!-- Intentional issue 3: Image missing alt attribute (image-alt rule) -->
    <img class="product-hero-banner" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" width="300" height="200">
    <p>Premium Outdoor Hydro Flask Water Bottle</p>
  </div>

  <div class="field">
    <!-- Intentional issue 4: Form input missing label element and accessible name (label rule) -->
    <input id="search-store" type="text" name="coupon">
    
    <!-- Intentional issue 5: Icon-only button with no discernible text (button-name rule) -->
    <button class="btn checkout-submit-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  </div>

  <div>
    <!-- Intentional issue 6: Link without discernible text (link-name rule) -->
    <a class="cart-icon-link" href="/checkout/cart">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    </a>
  </div>
</body>
</html>`;
