// @ts-nocheck
(function () {
  'use strict';

  const STORAGE_KEY = 'sizzle_menu_items';

  // ── Hardcoded items (match the 6 cards in menu.html) ───
  const HARDCODED_ITEMS = {
    tacos: {
      id: 'tacos',
      name: 'Tacos Al Pastor',
      price: 9,
      category: 'mains',
      availability: 'available',
      description: 'Marinated pork, pineapple, onion, cilantro on corn tortillas',
      ingredients: 'Pork shoulder, pineapple, white onion, cilantro, corn tortillas, achiote paste, lime',
      prepTime: '10 min',
      dietaryTags: ['spicy'],
      popular: true,
      featured: false,
      image: null,
      soldToday: 38,
      thisWeek: 245,
      revenue: 342,
      rating: 4.8,
    },
    burrito: {
      id: 'burrito',
      name: 'Burrito Bowl',
      price: 11,
      category: 'mains',
      availability: 'available',
      description: 'Rice, beans, choice of protein, salsa, guac, sour cream',
      ingredients: 'Cilantro rice, black beans, chicken or steak, pico de gallo, guacamole, sour cream, lettuce',
      prepTime: '12 min',
      dietaryTags: ['gluten-free'],
      popular: true,
      featured: true,
      image: null,
      soldToday: 26,
      thisWeek: 189,
      revenue: 286,
      rating: 4.7,
    },
    churros: {
      id: 'churros',
      name: 'Churros',
      price: 7,
      category: 'desserts',
      availability: 'available',
      description: 'Crispy cinnamon sugar sticks with chocolate dipping sauce',
      ingredients: 'Flour, butter, sugar, cinnamon, eggs, dark chocolate, heavy cream',
      prepTime: '8 min',
      dietaryTags: ['vegetarian'],
      popular: false,
      featured: true,
      image: null,
      soldToday: 22,
      thisWeek: 156,
      revenue: 154,
      rating: 4.9,
    },
    elote: {
      id: 'elote',
      name: 'Elote',
      price: 6,
      category: 'sides',
      availability: 'available',
      description: 'Grilled corn with mayo, cotija cheese, chili, lime',
      ingredients: 'Sweet corn, mayonnaise, cotija cheese, chili powder, lime, cilantro',
      prepTime: '6 min',
      dietaryTags: ['vegetarian', 'gluten-free'],
      popular: false,
      featured: false,
      image: null,
      soldToday: 19,
      thisWeek: 134,
      revenue: 114,
      rating: 4.6,
    },
    quesadilla: {
      id: 'quesadilla',
      name: 'Quesadilla',
      price: 10,
      category: 'mains',
      availability: 'available',
      description: 'Flour tortilla, melted cheese, peppers, onions, salsa',
      ingredients: 'Flour tortilla, Oaxaca cheese, bell peppers, white onion, salsa verde',
      prepTime: '8 min',
      dietaryTags: ['vegetarian'],
      popular: false,
      featured: false,
      image: null,
      soldToday: 15,
      thisWeek: 102,
      revenue: 150,
      rating: 4.5,
    },
    horchata: {
      id: 'horchata',
      name: 'Horchata',
      price: 4.5,
      category: 'drinks',
      availability: 'sold-out',
      description: 'Traditional rice milk with cinnamon and vanilla',
      ingredients: 'Long-grain rice, cinnamon sticks, vanilla extract, sugar, whole milk',
      prepTime: '5 min',
      dietaryTags: ['vegetarian', 'nut-free'],
      popular: false,
      featured: false,
      image: null,
      soldToday: 12,
      thisWeek: 88,
      revenue: 54,
      rating: 4.4,
    },
  };

  // ── Helpers ────────────────────────────────
  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function getSessionItems() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveSessionItems(items) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function findItem(id) {
    if (!id) return null;
    // Check sessionStorage first (edited items override hardcoded)
    var items = getSessionItems();
    var sessionItem = items.find(function (it) { return it.id === id; });
    if (sessionItem) return Object.assign({}, sessionItem);
    // Then check hardcoded
    if (HARDCODED_ITEMS[id]) return Object.assign({}, HARDCODED_ITEMS[id]);
    return null;
  }

  function isHardcoded(id) {
    return !!HARDCODED_ITEMS[id];
  }

  // ── DOM references ─────────────────────────
  const el = {
    name:         document.getElementById('detail-name'),
    image:        document.getElementById('detail-image'),
    description:  document.getElementById('detail-description'),
    ingredients:  document.getElementById('detail-ingredients'),
    badges:       document.getElementById('detail-badges'),
    price:        document.getElementById('detail-price'),
    category:     document.getElementById('detail-category'),
    availability: document.getElementById('detail-availability'),
    prepTime:     document.getElementById('detail-prep-time'),
    tags:         document.getElementById('detail-tags'),
    soldToday:    document.getElementById('stat-sold-today'),
    thisWeek:     document.getElementById('stat-this-week'),
    revenue:      document.getElementById('stat-revenue'),
    rating:       document.getElementById('stat-rating'),
    btnEdit:      document.getElementById('btn-edit'),
    btnDelete:    document.getElementById('btn-delete'),
    modal:        document.getElementById('delete-modal'),
    modalName:    document.getElementById('modal-item-name'),
    modalCancel:  document.getElementById('modal-cancel'),
    modalConfirm: document.getElementById('modal-confirm'),
    toast:        document.getElementById('toast'),
    toastMsg:     document.getElementById('toast-message'),
    btnOrder: document.getElementById('btn-order'),
  };

  // ── Get current item ───────────────────────
  var itemId = getParam('id');
  var item = findItem(itemId);

  if (!item) {
    el.name.textContent = 'Item not found';
    el.btnEdit.disabled = true;
    el.btnDelete.disabled = true;
    return;
  }

  // ── Populate page ──────────────────────────
  document.title = 'Sizzle | ' + item.name;
  el.name.textContent = item.name;

  // Image
  if (item.image) {
    el.image.innerHTML = '<img src="' + item.image + '" alt="' + item.name + '" />';
  }
  // else keep placeholder SVG from HTML

  // Description & Ingredients
  el.description.textContent = item.description || 'No description provided.';
  el.ingredients.textContent = item.ingredients || 'No ingredients listed.';

  // Badges
  var badgeHTML = '';
  if (item.popular) {
    badgeHTML += '<span class="badge badge-popular"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B2C"/></svg>Popular</span>';
  }
  if (item.featured) {
    badgeHTML += '<span class="badge badge-featured"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#2D9F6F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Featured</span>';
  }
  if (!item.popular && !item.featured) {
    badgeHTML = '<span class="badge badge-inactive">No badges</span>';
  }
  el.badges.innerHTML = badgeHTML;

  // Info card
  el.price.textContent = '$' + Number(item.price).toFixed(2);

  var catMap = { mains: 'Mains', sides: 'Sides', desserts: 'Desserts', drinks: 'Drinks', snacks: 'Snacks' };
  el.category.textContent = catMap[item.category] || item.category || '—';

  var isAvailable = item.availability !== 'sold-out';
  el.availability.innerHTML = '<span class="avail-dot ' + (isAvailable ? 'available' : 'sold-out') + '"></span>' +
    '<span class="avail-text ' + (isAvailable ? 'available' : 'sold-out') + '">' +
    (isAvailable ? 'Available' : 'Sold Out') + '</span>';

  el.prepTime.textContent = item.prepTime || '—';

  // Dietary tags
  var ALL_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'nut-free', 'dairy-free'];
  var activeTags = item.dietaryTags || [];
  if (activeTags.length) {
    el.tags.innerHTML = activeTags.map(function (t) {
      var label = t.charAt(0).toUpperCase() + t.slice(1);
      return '<span class="diet-tag active">' + label + '</span>';
    }).join('');
    // Add inactive tags too for completeness
    ALL_TAGS.forEach(function (t) {
      if (activeTags.indexOf(t) === -1) {
        var label = t.charAt(0).toUpperCase() + t.slice(1);
        el.tags.innerHTML += '<span class="diet-tag inactive">' + label + '</span>';
      }
    });
  } else {
    el.tags.innerHTML = '<span class="tag-empty">None</span>';
  }

  // Performance stats
  el.soldToday.textContent = item.soldToday != null ? item.soldToday : 0;
  el.thisWeek.textContent  = item.thisWeek  != null ? item.thisWeek  : 0;
  el.revenue.textContent   = '$' + (item.revenue != null ? item.revenue : 0);
  el.rating.textContent    = item.rating != null ? item.rating : '—';

  // ── Edit button ────────────────────────────
  el.btnEdit.addEventListener('click', function () {
    window.location.href = 'add-item.html?edit=' + encodeURIComponent(item.id);
  });

    // ── Place Order ───────────────────────────
    el.btnOrder?.addEventListener('click', function () {
      const order = {
        id: Date.now(),
        itemId: item.id,
        name: item.name,
        price: item.price,
        time: new Date().toLocaleString(),
        status: 'active'
      };
  
      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem('sizzle_orders')) || [];
      } catch (_) {}
  
      orders.push(order);
      localStorage.setItem('sizzle_orders', JSON.stringify(orders));
  
      showToast('Order placed!');
    });

  // ── Delete button / modal ──────────────────
  el.btnDelete.addEventListener('click', function () {
    el.modalName.textContent = item.name;
    el.modal.hidden = false;
  });

  el.modalCancel.addEventListener('click', function () {
    el.modal.hidden = true;
  });

  // Close on overlay click
  el.modal.addEventListener('click', function (e) {
    if (e.target === el.modal) el.modal.hidden = true;
  });

  el.modalConfirm.addEventListener('click', function () {
    el.modal.hidden = true;

    if (isHardcoded(item.id)) {
      var deleted = [];
      try { deleted = JSON.parse(sessionStorage.getItem('sizzle_deleted_items')) || []; } catch (_) {}
      if (deleted.indexOf(item.id) === -1) deleted.push(item.id);
      sessionStorage.setItem('sizzle_deleted_items', JSON.stringify(deleted));
    } else {
      // Remove from sessionStorage
      var items = getSessionItems().filter(function (it) { return it.id !== item.id; });
      saveSessionItems(items);
    }

    showToast('Item deleted');
    setTimeout(function () {
      window.location.href = 'menu.html';
    }, 1200);
  });

  // ── Toast helper ───────────────────────────
  function showToast(msg) {
    el.toastMsg.textContent = msg;
    el.toast.hidden = false;
    void el.toast.offsetWidth;
    el.toast.classList.add('show');
    setTimeout(function () {
      el.toast.classList.remove('show');
      setTimeout(function () { el.toast.hidden = true; }, 300);
    }, 3000);
  }

})();
