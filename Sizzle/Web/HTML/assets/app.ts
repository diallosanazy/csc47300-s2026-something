// @ts-nocheck
import { getFeaturedVendors, getVendorById } from './vendors.js';

const page = document.body?.dataset?.page;

const formatPrice = (value) => `$${value.toFixed(2)}`;

const vendorCardHTML = (v, options = {}) => {
  const size = options.size || 'small';
  const height = size === 'large' ? 160 : 120;
  const labelSize = size === 'large' ? 36 : 32;
  const labelOpacity = size === 'large' ? '0D' : '0F';
  const showOpen = size === 'large';

  return `
    <a class="link-reset" href="vendor.html?id=${v.id}" style="flex-basis:0%;flex-grow:1;flex-shrink:1;">
      <div style="background-color:#FFFFFF;border:1px solid #E8E6E1;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;cursor:pointer;">
        <div style="align-items:center;background-color:${v.bgColor};display:flex;flex-shrink:0;height:${height}px;justify-content:center;position:relative;width:100%;">
          <div style="color:#FFFFFF${labelOpacity};font-size:${labelSize}px;font-weight:900;line-height:${labelSize + 8}px;">${v.label}</div>
          ${showOpen ? `
          <div style="background-color:${v.open ? '#2D9F6F' : '#9C9890'};border-radius:6px;display:flex;left:12px;padding:4px 10px;position:absolute;top:12px;">
            <div style="color:#FFFFFF;font-size:11px;font-weight:600;line-height:14px;">${v.open ? 'Open Now' : 'Closed'}</div>
          </div>` : ''}
          <div style="background-color:#00000080;border-radius:100px;display:flex;padding:4px 10px;position:absolute;right:12px;top:12px;">
            <div style="color:#FFFFFF;font-size:11px;font-weight:600;line-height:14px;">${v.distance}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:16px 20px 20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="color:#1C1917;font-size:17px;font-weight:700;line-height:22px;">${v.name}</div>
            ${size === 'large' ? `
              <div style="display:flex;align-items:center;gap:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B2C"/></svg>
                <div style="color:#1C1917;font-size:14px;font-weight:700;line-height:18px;">${v.rating}</div>
                <div style="color:#9C9890;font-size:13px;line-height:16px;">(${v.reviews})</div>
              </div>` : ''}
          </div>
          <div style="color:#9C9890;font-size:14px;line-height:20px;">${v.cuisine} · ${v.location} · ${v.price}</div>
          <div style="color:#9C9890;font-size:13px;line-height:16px;">${v.description}</div>
        </div>
      </div>
    </a>
  `;
};

const renderLanding = () => {
  const container = document.getElementById('featured-grid');
  if (!container) return;
  const featured = getFeaturedVendors();
  container.innerHTML = featured.map(v => vendorCardHTML(v, { size: 'small' })).join('');
};

const renderVendorDetail = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '1';
  const vendor = getVendorById(id);

  const notFound = document.getElementById('vendor-not-found');
  const pageRoot = document.getElementById('vendor-detail-root');
  if (!vendor) {
    if (notFound) notFound.style.display = 'flex';
    if (pageRoot) pageRoot.style.display = 'none';
    return;
  }
  if (notFound) notFound.style.display = 'none';
  if (pageRoot) pageRoot.style.display = 'flex';

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText('[data-vendor-name]', vendor.name);
  setText('[data-vendor-rating]', vendor.rating);
  setText('[data-vendor-reviews]', `(${vendor.reviews} reviews)`);
  setText('[data-vendor-cuisine]', vendor.cuisineLabel);
  setText('[data-vendor-location]', `${vendor.location} · ${vendor.distance}`);
  setText('[data-vendor-description]', vendor.fullDescription);
  setText('[data-vendor-open]', vendor.open ? 'Open Now' : 'Closed');
  setText('[data-vendor-open-sub]', vendor.open ? `Closes at ${vendor.closesAt}` : 'Opens tomorrow');

  const hero = document.getElementById('vendor-hero');
  if (hero) hero.style.backgroundColor = vendor.bgColor;

  const menu = document.getElementById('vendor-menu');
  if (menu) {
    menu.innerHTML = vendor.menu.map((item, idx) => {
      const isLast = idx === vendor.menu.length - 1;
      const isSoldOut = !!item.soldOut;
      return `
        <div style="align-items:center;border-bottom:${isLast ? '0' : '1px solid #EEEDE9'};display:flex;justify-content:space-between;padding:16px 0;">
          <div style="display:flex;flex-direction:column;gap:4px;flex:1;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="color:${isSoldOut ? '#9C9890' : '#1C1917'};font-size:15px;font-weight:600;line-height:18px;">${item.name}</div>
              ${item.popular ? `<div style="background-color:#FFF4EE;border-radius:4px;padding:2px 8px;"><div style="color:#FF6B2C;font-size:11px;font-weight:600;line-height:14px;">Popular</div></div>` : ''}
            </div>
            <div style="color:${isSoldOut ? '#C5C5C0' : '#9C9890'};font-size:13px;line-height:18px;">${item.description}</div>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="color:${isSoldOut ? '#9C9890' : '#1C1917'};font-size:15px;font-weight:700;line-height:18px;">${formatPrice(item.price)}</div>
            ${isSoldOut
              ? `<div style="align-items:center;background-color:#F0EFEC;border-radius:8px;display:flex;height:32px;justify-content:center;padding:0 10px;"><div style="color:#9C9890;font-size:12px;font-weight:500;line-height:16px;">Sold out</div></div>`
              : `<div style="align-items:center;border:1.5px solid #E8E6E1;border-radius:8px;cursor:pointer;display:flex;height:32px;justify-content:center;width:32px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/></svg></div>`
            }
          </div>
        </div>
      `;
    }).join('');
  }

  const reviews = document.getElementById('vendor-reviews');
  if (reviews) {
    reviews.innerHTML = vendor.reviewsList.map((review) => {
      const stars = Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= review.stars;
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="${filled ? '#FF6B2C' : '#E8E6E1'}"/></svg>`;
      }).join('');
      return `
        <div style="border-bottom:1px solid #EEEDE9;display:flex;flex-direction:column;gap:8px;padding:16px 0;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="align-items:center;background-color:${review.avatarBg};border-radius:50%;display:flex;height:28px;justify-content:center;width:28px;">
                <div style="color:${review.avatarColor};font-size:12px;font-weight:600;line-height:16px;">${review.initial}</div>
              </div>
              <div style="color:#1C1917;font-size:14px;font-weight:600;line-height:18px;">${review.name}</div>
            </div>
            <div style="display:flex;gap:2px;">${stars}</div>
          </div>
          <div style="color:#6B6963;font-size:13px;line-height:20px;">${review.text}</div>
          <div style="color:#B5B5B0;font-size:12px;line-height:16px;">${review.time}</div>
        </div>
      `;
    }).join('');
  }
};

if (page === 'landing') renderLanding();
if (page === 'vendor') renderVendorDetail();
