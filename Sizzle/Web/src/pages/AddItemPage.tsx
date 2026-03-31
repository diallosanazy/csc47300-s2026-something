import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { VendorDashboardShell } from '../components/VendorDashboardShell';
import { ALL_DIETARY_TAGS } from '../lib/menuItems';
import { useAuth } from '../lib/auth';
import { createMenuItem, getMenuItemById, updateMenuItem, uploadMenuItemImage, type DbMenuItem } from '../lib/services/menuItems';

type FormState = {
  name: string;
  price: string;
  category: string;
  availability: 'available' | 'sold-out';
  description: string;
  prepTime: string;
  ingredients: string;
  popular: boolean;
  featured: boolean;
  dietaryTags: string[];
  image: string | null;
};

const emptyForm = (): FormState => ({
  name: '',
  price: '',
  category: '',
  availability: 'available',
  description: '',
  prepTime: '',
  ingredients: '',
  popular: false,
  featured: false,
  dietaryTags: [],
  image: null,
});

export function AddItemPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const { vendor } = useAuth();
  const [editingItem, setEditingItem] = useState<DbMenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(!!editId);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!editId) {
        setEditingItem(null);
        setForm(emptyForm());
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const item = await getMenuItemById(editId);
        if (cancelled) return;
        setEditingItem(item);
        setForm({
          name: item.name || '',
          price: String(((item.price_cents ?? 0) / 100).toFixed(2)),
          category: item.category || '',
          availability: (item.is_available ?? true) ? 'available' : 'sold-out',
          description: item.description || '',
          prepTime: item.prep_time || '',
          ingredients: '',
          popular: item.popular ?? false,
          featured: item.featured ?? false,
          dietaryTags: item.dietary_tags ?? [],
          image: item.image_url || null,
        });
      } catch {
        if (!cancelled) setToast('Unable to load item');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editId]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setToast('Only PNG and JPG files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast('File exceeds 5 MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setField('image', typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const toggleDietary = (tag: string) => {
    setDirty(true);
    setForm((current) => ({
      ...current,
      dietaryTags: current.dietaryTags.includes(tag)
        ? current.dietaryTags.filter((entry) => entry !== tag)
        : [...current.dietaryTags, tag],
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required';
    const price = Number(form.price);
    if (!form.price.trim() || Number.isNaN(price) || price < 0) nextErrors.price = 'Enter a valid price';
    if (!form.category) nextErrors.category = 'Select a category';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    if (!vendor) {
      setToast('Create a vendor profile first.');
      return;
    }

    setLoading(true);
    try {
      const price = Number(form.price);
      const payload = {
        vendor_id: vendor.id,
        name: form.name.trim(),
        price_cents: Math.round(price * 100),
        category: form.category,
        description: form.description.trim() || null,
        prep_time: form.prepTime.trim() || null,
        dietary_tags: form.dietaryTags,
        popular: !!form.popular,
        featured: !!form.featured,
        is_available: form.availability === 'available',
      } as const;

      const saved = editingItem
        ? await updateMenuItem(editingItem.id, payload)
        : await createMenuItem(payload as any);

      // Upload data-url image → Storage → public URL
      if (form.image && form.image.startsWith('data:')) {
        const res = await fetch(form.image);
        const blob = await res.blob();
        const ext = blob.type === 'image/png' ? 'png' : 'jpg';
        const file = new File([blob], `menu.${ext}`, { type: blob.type });
        const url = await uploadMenuItemImage(vendor.id, saved.id, file);
        await updateMenuItem(saved.id, { image_url: url });
      } else if (form.image === null && editingItem?.image_url) {
        await updateMenuItem(saved.id, { image_url: null });
      }

      setDirty(false);
      setToast(editingItem ? 'Item updated!' : 'Item saved successfully!');
      window.setTimeout(() => {
        navigate(editingItem ? `/item-detail?id=${saved.id}` : '/menu');
      }, 900);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) {
      return;
    }
    navigate('/menu');
  };

  return (
    <VendorDashboardShell
      active="menu"
      title={editingItem ? 'Edit Item' : 'Add New Item'}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" form="add-item-form" className="btn btn-primary" disabled={loading}>{editingItem ? 'Update Item' : 'Save Item'}</button>
        </>
      }
    >
      <form id="add-item-form" className="item-form" noValidate onSubmit={onSubmit}>
        {loading ? <div style={{ color: '#9C9890', fontSize: 14, marginBottom: 14 }}>Working…</div> : null}
        <div className="form-row">
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="item-name">Item Name</label>
            <input type="text" id="item-name" className="form-input" placeholder="e.g. Tacos Al Pastor" value={form.name} onChange={(event) => setField('name', event.target.value)} />
            {errors.name ? <div className="form-error">{errors.name}</div> : null}
          </div>
          <div className="form-group w-160">
            <label className="form-label" htmlFor="item-price">Price</label>
            <div className={`input-with-prefix${errors.price ? ' error' : ''}`}>
              <span className="input-prefix">$</span>
              <input type="number" id="item-price" className="form-input price-input" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={(event) => setField('price', event.target.value)} />
            </div>
            {errors.price ? <div className="form-error">{errors.price}</div> : null}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="item-category">Category</label>
            <div className="select-wrapper">
              <select id="item-category" className="form-select" value={form.category} onChange={(event) => setField('category', event.target.value)}>
                <option value="">Select category</option>
                <option value="mains">Mains</option>
                <option value="sides">Sides</option>
                <option value="drinks">Drinks</option>
                <option value="desserts">Desserts</option>
                <option value="specials">Specials</option>
              </select>
              <svg className="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {errors.category ? <div className="form-error">{errors.category}</div> : null}
          </div>
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="item-availability">Availability</label>
            <div className="select-wrapper">
              <select id="item-availability" className="form-select" value={form.availability} onChange={(event) => setField('availability', event.target.value as FormState['availability'])}>
                <option value="available">Available</option>
                <option value="sold-out">Sold Out</option>
              </select>
              <svg className="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="item-description">Description</label>
          <textarea id="item-description" className="form-textarea" placeholder="Describe the dish, ingredients, and preparation…" rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Item Photo</label>
          {!form.image ? (
            <label className="upload-zone" htmlFor="item-photo">
              <input type="file" id="item-photo" accept="image/png,image/jpeg" hidden onChange={onPhotoChange} />
              <div className="upload-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 19V15" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 8L12 3L7 8" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3V15" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="upload-text">
                <span className="upload-link">Upload a photo</span> or drag and drop
              </div>
              <div className="upload-hint">PNG, JPG up to 5MB</div>
            </label>
          ) : (
            <div className="upload-preview">
              <div className="preview-name">Current image</div>
              <button type="button" className="preview-remove" title="Remove photo" onClick={() => setField('image', null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group w-200">
            <label className="form-label" htmlFor="item-prep-time">Prep Time</label>
            <input type="text" id="item-prep-time" className="form-input" placeholder="e.g. 10 min" value={form.prepTime} onChange={(event) => setField('prepTime', event.target.value)} />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Dietary Tags</label>
            <div className="tag-group">
              {ALL_DIETARY_TAGS.slice(0, 4).map((tag) => (
                <label key={tag} className="tag-chip">
                  <input type="checkbox" hidden checked={form.dietaryTags.includes(tag)} onChange={() => toggleDietary(tag)} />
                  <span className="tag-check" />
                  <span>{tag.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('-')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="item-ingredients">Ingredients</label>
          <input type="text" id="item-ingredients" className="form-input" placeholder="e.g. pork, pineapple, onion, cilantro, corn tortillas" value={form.ingredients} onChange={(event) => setField('ingredients', event.target.value)} />
        </div>

        <div className="form-divider" />

        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-title">Mark as Popular</div>
            <div className="toggle-desc">Show a "Popular" badge on the vendor page</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={form.popular} onChange={(event) => setField('popular', event.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-title">Featured Item</div>
            <div className="toggle-desc">Highlight this item at the top of your menu</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={form.featured} onChange={(event) => setField('featured', event.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>
      </form>

      {toast ? (
        <div className="toast show">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#2D9F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{toast}</span>
        </div>
      ) : null}
    </VendorDashboardShell>
  );
}
