// ── Add New Item – Frontend Logic ─────────────────────────
// Handles form validation, image upload/preview, sessionStorage
// (non-persistent) storage, and navigation guards (no backend).

(function () {
  'use strict';

  // ── DOM references ──────────────────────────
  const form         = document.getElementById('add-item-form');
  const nameInput    = document.getElementById('item-name');
  const priceInput   = document.getElementById('item-price');
  const categoryEl   = document.getElementById('item-category');
  const availEl      = document.getElementById('item-availability');
  const descEl       = document.getElementById('item-description');
  const prepTimeEl   = document.getElementById('item-prep-time');
  const ingredientsEl = document.getElementById('item-ingredients');
  const popularEl    = document.getElementById('item-popular');
  const featuredEl   = document.getElementById('item-featured');

  // Image upload
  const uploadZone   = document.getElementById('upload-zone');
  const fileInput    = document.getElementById('item-photo');
  const previewWrap  = document.getElementById('upload-preview');
  const previewImg   = document.getElementById('preview-img');
  const previewName  = document.getElementById('preview-name');
  const previewRemove = document.getElementById('preview-remove');

  // Toast
  const toast        = document.getElementById('toast');
  const toastMsg     = document.getElementById('toast-message');

  // Cancel / back buttons
  const cancelBtn    = document.querySelector('.btn-secondary');

  // ── State ───────────────────────────────────
  let selectedFile   = null;   // File object (or null)
  let imageDataURL   = null;   // base64 preview string
  let formDirty      = false;  // has user touched the form?

  const STORAGE_KEY  = 'sizzle_menu_items';

  // ── Edit-mode detection ────────────────────
  const editId = new URLSearchParams(window.location.search).get('edit');
  let editingItem = null;

  // Hardcoded items registry (same as item-detail.js)
  const HARDCODED_ITEMS = {
    tacos:      { id:'tacos',      name:'Tacos Al Pastor', price:9,    category:'mains',    availability:'available', description:'Marinated pork, pineapple, onion, cilantro on corn tortillas', ingredients:'Pork shoulder, pineapple, white onion, cilantro, corn tortillas, achiote paste, lime', prepTime:'10 min', dietaryTags:['spicy'],             popular:true,  featured:false, image:null },
    burrito:    { id:'burrito',    name:'Burrito Bowl',    price:11,   category:'mains',    availability:'available', description:'Rice, beans, choice of protein, salsa, guac, sour cream',      ingredients:'Cilantro rice, black beans, chicken or steak, pico de gallo, guacamole, sour cream, lettuce', prepTime:'12 min', dietaryTags:['gluten-free'],       popular:true,  featured:true,  image:null },
    churros:    { id:'churros',    name:'Churros',         price:7,    category:'desserts', availability:'available', description:'Crispy cinnamon sugar sticks with chocolate dipping sauce',     ingredients:'Flour, butter, sugar, cinnamon, eggs, dark chocolate, heavy cream', prepTime:'8 min',  dietaryTags:['vegetarian'],        popular:false, featured:true,  image:null },
    elote:      { id:'elote',      name:'Elote',           price:6,    category:'sides',    availability:'available', description:'Grilled corn with mayo, cotija cheese, chili, lime',           ingredients:'Sweet corn, mayonnaise, cotija cheese, chili powder, lime, cilantro', prepTime:'6 min',  dietaryTags:['vegetarian','gluten-free'], popular:false, featured:false, image:null },
    quesadilla: { id:'quesadilla', name:'Quesadilla',      price:10,   category:'mains',    availability:'available', description:'Flour tortilla, melted cheese, peppers, onions, salsa',        ingredients:'Flour tortilla, Oaxaca cheese, bell peppers, white onion, salsa verde', prepTime:'8 min',  dietaryTags:['vegetarian'],        popular:false, featured:false, image:null },
    horchata:   { id:'horchata',   name:'Horchata',        price:4.50, category:'drinks',   availability:'sold-out',  description:'Traditional rice milk with cinnamon and vanilla',              ingredients:'Long-grain rice, cinnamon sticks, vanilla extract, sugar, whole milk', prepTime:'5 min',  dietaryTags:['vegetarian','nut-free'], popular:false, featured:false, image:null },
  };

  function findEditItem(id) {
    if (!id) return null;
    if (HARDCODED_ITEMS[id]) return Object.assign({}, HARDCODED_ITEMS[id]);
    try {
      var items = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
      return items.find(function (it) { return it.id === id; }) || null;
    } catch (_) { return null; }
  }

  if (editId) {
    editingItem = findEditItem(editId);
    if (editingItem) {
      // Update page title & button text
      document.title = 'Sizzle | Edit Item';
      var titleEl = document.querySelector('.page-title');
      if (titleEl) titleEl.textContent = 'Edit Item';
      var submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Update Item';

      // Pre-fill form fields
      nameInput.value       = editingItem.name || '';
      priceInput.value      = editingItem.price || '';
      categoryEl.value      = editingItem.category || '';
      availEl.value         = editingItem.availability || 'available';
      descEl.value          = editingItem.description || '';
      prepTimeEl.value      = editingItem.prepTime || '';
      ingredientsEl.value   = editingItem.ingredients || '';
      popularEl.checked     = !!editingItem.popular;
      featuredEl.checked    = !!editingItem.featured;

      // Pre-fill dietary tags
      if (editingItem.dietaryTags && editingItem.dietaryTags.length) {
        editingItem.dietaryTags.forEach(function (tag) {
          var cb = form.querySelector('input[name="dietary"][value="' + tag + '"]');
          if (cb) cb.checked = true;
        });
      }

      // Pre-fill image if present
      if (editingItem.image) {
        imageDataURL = editingItem.image;
        previewImg.src = imageDataURL;
        previewName.textContent = 'Current image';
        uploadZone.hidden = true;
        previewWrap.hidden = false;
      }
    }
  }

  // ── Dirty tracking ─────────────────────────
  function markDirty() {
    formDirty = true;
  }

  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);

  // ── Validation helpers ─────────────────────
  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  function showError(field, message) {
    field.classList.add('error');
    const wrapper = field.closest('.input-with-prefix') || field;
    if (wrapper.classList.contains('input-with-prefix')) {
      wrapper.classList.add('error');
    }
    const err = document.createElement('div');
    err.className = 'form-error';
    err.textContent = message;
    const group = field.closest('.form-group');
    if (group) group.appendChild(err);
  }

  function validate() {
    clearErrors();
    let valid = true;

    // Item name
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Item name is required');
      valid = false;
    }

    // Price
    const price = parseFloat(priceInput.value);
    if (!priceInput.value.trim() || isNaN(price) || price < 0) {
      showError(priceInput, 'Enter a valid price');
      valid = false;
    }

    // Category
    if (!categoryEl.value) {
      showError(categoryEl, 'Select a category');
      valid = false;
    }

    return valid;
  }

  // ── Image upload & preview ─────────────────
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  function handleFile(file) {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showToast('Only PNG and JPG files are accepted', true);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('File exceeds 5 MB limit', true);
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      imageDataURL = e.target.result;
      previewImg.src = imageDataURL;
      previewName.textContent = file.name;
      uploadZone.hidden = true;
      previewWrap.hidden = false;
      markDirty();
    };
    reader.readAsDataURL(file);
  }

  // Click to upload
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  // Drag and drop
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // Remove preview
  previewRemove.addEventListener('click', () => {
    selectedFile = null;
    imageDataURL = null;
    fileInput.value = '';
    previewWrap.hidden = true;
    uploadZone.hidden = false;
  });

  // ── Toast ──────────────────────────────────
  let toastTimer = null;
  function showToast(message, isError) {
    toastMsg.textContent = message || 'Item saved successfully!';
    // Swap the check icon color for errors
    const svgPath = toast.querySelector('svg path');
    if (svgPath) {
      svgPath.setAttribute('stroke', isError ? '#DC2626' : '#2D9F6F');
    }
    toast.hidden = false;
    // Force reflow before adding class
    void toast.offsetWidth;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 3000);
  }

  // ── Collect form data ──────────────────────
  function collectData() {
    const dietaryTags = Array.from(
      form.querySelectorAll('input[name="dietary"]:checked')
    ).map(cb => cb.value);

    return {
      id: (editingItem ? editingItem.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      name: nameInput.value.trim(),
      price: parseFloat(parseFloat(priceInput.value).toFixed(2)),
      category: categoryEl.value,
      availability: availEl.value,
      description: descEl.value.trim(),
      prepTime: prepTimeEl.value.trim(),
      dietaryTags,
      ingredients: ingredientsEl.value.trim(),
      popular: popularEl.checked,
      featured: featuredEl.checked,
      image: imageDataURL,       // base64 or null
      createdAt: editingItem ? (editingItem.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
  }

  // ── Save to sessionStorage (non-persistent) ──
  function saveItem(item) {
    let items = [];
    try {
      items = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) { /* ignore */ }

    if (editingItem) {
      // Update existing: replace if found, otherwise push
      const idx = items.findIndex(function (it) { return it.id === item.id; });
      if (idx >= 0) {
        items[idx] = item;
      } else {
        // Editing a hardcoded item → save as session override
        items.push(item);
      }
    } else {
      items.push(item);
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // ── Form submit ────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      // Scroll first error into view
      const first = form.querySelector('.error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const item = collectData();
    saveItem(item);
    formDirty = false;
    showToast(editingItem ? 'Item updated!' : 'Item saved successfully!');

    // Redirect after short delay
    setTimeout(() => {
      if (editingItem) {
        window.location.href = 'item-detail.html?id=' + encodeURIComponent(item.id);
      } else {
        window.location.href = 'menu.html';
      }
    }, 1500);
  });

  // ── Cancel / navigation guard ──────────────
  function confirmLeave() {
    if (!formDirty) return true;
    return confirm('You have unsaved changes. Leave without saving?');
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', function (e) {
      if (!confirmLeave()) {
        e.preventDefault();
      }
    });
  }

  // Also guard the back button (it's an <a>)
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function (e) {
      if (!confirmLeave()) {
        e.preventDefault();
      }
    });
  }

  // Browser beforeunload guard
  window.addEventListener('beforeunload', function (e) {
    if (formDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
