// @ts-nocheck
(function () {
  'use strict';

  const STORAGE_KEY = 'sizzle_menu_items';
  const DELETED_KEY = 'sizzle_deleted_items';
  const grid = document.querySelector('.cbe952a50');
  if (!grid) return;

  // On hard refresh, clear session items so they disappear
  const navEntry = performance.getEntriesByType('navigation')[0];
  if (navEntry && navEntry.type === 'reload') {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(DELETED_KEY);
  }

  // ── Hide hardcoded cards that were "deleted" via detail page ──
  var deleted = [];
  try { deleted = JSON.parse(sessionStorage.getItem(DELETED_KEY)) || []; } catch (_) {}

  if (deleted.length) {
    deleted.forEach(function (id) {
      var card = grid.querySelector('.c5f5ae532[data-id="' + id + '"]');
      if (card) card.style.display = 'none';
    });
  }

  // ── Update hardcoded cards with session overrides (edited items) ──
  var allSessionItems = [];
  try { allSessionItems = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; } catch (_) {}

  var HARDCODED_IDS = ['tacos', 'burrito', 'churros', 'elote', 'quesadilla', 'horchata'];
  allSessionItems.forEach(function (item) {
    if (HARDCODED_IDS.indexOf(item.id) !== -1) {
      // This is an edited hardcoded item — update its card in place
      var card = grid.querySelector('.c5f5ae532[data-id="' + item.id + '"]');
      if (!card) return;
      var nameEl = card.querySelector('.c9407cbad');
      var priceEl = card.querySelector('.ca1611c28');
      var descEl = card.querySelector('.cd88fea1f');
      if (nameEl) nameEl.textContent = item.name;
      if (priceEl) priceEl.textContent = '$' + Number(item.price).toFixed(2);
      if (descEl) descEl.textContent = item.description || item.ingredients || '';
      // Update availability indicator
      var dotEl = card.querySelector('.c8755b902, .ce51fb085');
      var statusEl = card.querySelector('.ca28922ed, .c7b90673d');
      var isAvailable = item.availability !== 'sold-out';
      if (dotEl) dotEl.className = isAvailable ? 'c8755b902' : 'ce51fb085';
      if (statusEl && (statusEl.textContent === 'Available' || statusEl.textContent === 'Sold out')) {
        statusEl.className = isAvailable ? 'ca28922ed' : 'c7b90673d';
        statusEl.textContent = isAvailable ? 'Available' : 'Sold out';
      }
    }
  });

  // ── Render dynamic session items (non-hardcoded) ───────────
  var items = allSessionItems.filter(function (it) {
    return HARDCODED_IDS.indexOf(it.id) === -1;
  });

  if (items.length) {
    // Find the last row in the grid, count how many visible cards are in it
    var rows = grid.querySelectorAll('.ce522eec8');
    var lastRow = rows.length ? rows[rows.length - 1] : null;
    var cardsInLastRow = lastRow ? lastRow.querySelectorAll('.c5f5ae532:not([style*="display: none"])').length : 3;

    // Generic food icon SVG for placeholder
    var placeholderSVG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none">' +
      '<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="#D0CFCB" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M15 2.5C15 2.5 16.5 5 16.5 8C16.5 11 15 13.5 15 13.5" stroke="#D0CFCB" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M22 8H16" stroke="#D0CFCB" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>';

    items.forEach(function (item) {
      // If current row is full (3 cards), create a new row
      if (cardsInLastRow >= 3) {
        lastRow = document.createElement('div');
        lastRow.className = 'ce522eec8';
        grid.appendChild(lastRow);
        cardsInLastRow = 0;
      }

      var isAvailable = item.availability !== 'sold-out';
      var priceStr = '$' + (item.price || 0).toFixed(2);

      // Build image area – use uploaded image or placeholder
      var imageHTML;
      if (item.image) {
        imageHTML = '<div class="c2ba51230" style="padding:0">' +
          '<img src="' + item.image + '" alt="' + item.name + '" style="width:100%;height:100%;object-fit:cover;" />' +
          '</div>';
      } else {
        imageHTML = '<div class="c2ba51230">' + placeholderSVG + '</div>';
      }

      var card = document.createElement('div');
      card.className = 'c5f5ae532';
      card.setAttribute('data-id', item.id);
      card.innerHTML =
        imageHTML +
        '<div class="c137834b1">' +
          '<div class="c5fd6f910">' +
            '<div class="c9407cbad">' + item.name + '</div>' +
            '<div class="ca1611c28">' + priceStr + '</div>' +
          '</div>' +
          '<div class="cd88fea1f">' + (item.description || item.ingredients || '') + '</div>' +
          '<div class="cb419a80a">' +
            '<div class="c72dd1a62">' +
              '<div class="' + (isAvailable ? 'c8755b902' : 'ce51fb085') + '"></div>' +
              '<div class="' + (isAvailable ? 'ca28922ed' : 'c7b90673d') + '">' + (isAvailable ? 'Available' : 'Sold out') + '</div>' +
            '</div>' +
            '<div class="c7b90673d">0 sold today</div>' +
          '</div>' +
        '</div>';

      lastRow.appendChild(card);
      cardsInLastRow++;
    });
  }

  // ── Make all cards clickable → item detail page ────────
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.c5f5ae532');
    if (!card) return;
    var id = card.getAttribute('data-id');
    if (!id) return;
    window.location.href = 'item-detail.html?id=' + encodeURIComponent(id);
  });

  // Add pointer cursor to all cards
  var allCards = grid.querySelectorAll('.c5f5ae532[data-id]');
  allCards.forEach(function (c) { c.style.cursor = 'pointer'; });

})();