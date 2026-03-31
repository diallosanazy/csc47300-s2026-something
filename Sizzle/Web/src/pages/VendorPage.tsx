import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CustomerTopBar } from '../components/CustomerTopBar';
import { getVendorById as getStaticVendor } from '../../assets/ts/vendors';
import { getVendorById as getDbVendor, getLiveVendors } from '../lib/services/vendors';
import { getMenuItemsByVendor } from '../lib/services/menuItems';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { toggleFavorite, isFavorited } from '../lib/services/favorites';

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const BG_COLORS = ['#1C1917', '#2C3E2E', '#3B2D4A', '#1E3A5F', '#4A3728', '#2D3436', '#6B3A2E'];

type VendorData = {
  id: string | number;
  name: string;
  open: boolean;
  closesAt?: string;
  rating: number;
  reviews: number;
  cuisineLabel: string;
  location: string;
  distance: string;
  fullDescription: string;
  bgColor: string;
  menu: { name: string; description: string; price: number; popular?: boolean; soldOut?: boolean }[];
  reviewsList: { name: string; initial: string; avatarBg: string; avatarColor: string; stars: number; text: string; time: string }[];
};

export function VendorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, totalItems } = useCart();
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const { user } = useAuth();
  const vendorId = params.get('id') || '1';

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load vendor — try static first, then DB
  useEffect(() => {
    const isNumericId = /^\d+$/.test(vendorId);

    if (isNumericId) {
      const staticVendor = getStaticVendor(vendorId);
      if (staticVendor) {
        // If a DB vendor exists with the same name, prefer its menu (so seeded items show up)
        getLiveVendors()
          .then(async (all) => {
            const match = all.find((v) => v.name.toLowerCase().trim() === staticVendor.name.toLowerCase().trim());
            if (match) {
              const menuItems = await getMenuItemsByVendor(match.id).catch(() => []);
              setVendor({
                id: match.id,
                name: match.name,
                open: match.is_live && !match.is_busy,
                rating: match.rating ?? staticVendor.rating,
                reviews: match.review_count ?? staticVendor.reviews,
                cuisineLabel: match.cuisine || staticVendor.cuisineLabel,
                location: match.location_text || staticVendor.location,
                distance: '',
                fullDescription: match.description || staticVendor.fullDescription,
                bgColor: BG_COLORS[match.name.length % BG_COLORS.length],
                menu: menuItems.map((item) => ({
                  name: item.name,
                  description: item.description || '',
                  price: (item.price_cents ?? 0) / 100,
                  popular: item.popular ?? false,
                  soldOut: !(item.is_available ?? true),
                })),
                reviewsList: [],
              });
            } else {
              setVendor({
                id: staticVendor.id,
                name: staticVendor.name,
                open: staticVendor.open,
                closesAt: staticVendor.closesAt,
                rating: staticVendor.rating,
                reviews: staticVendor.reviews,
                cuisineLabel: staticVendor.cuisineLabel,
                location: staticVendor.location,
                distance: staticVendor.distance,
                fullDescription: staticVendor.fullDescription,
                bgColor: staticVendor.bgColor,
                menu: staticVendor.menu,
                reviewsList: staticVendor.reviewsList,
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
        return;
      }
    }

    // Fetch from DB
    getDbVendor(vendorId)
      .then(async (dbVendor) => {
        const menuItems = await getMenuItemsByVendor(dbVendor.id).catch(() => []);
        setVendor({
          id: dbVendor.id,
          name: dbVendor.name,
          open: dbVendor.is_live && !dbVendor.is_busy,
          rating: dbVendor.rating ?? 0,
          reviews: dbVendor.review_count ?? 0,
          cuisineLabel: dbVendor.cuisine || 'Street Food',
          location: dbVendor.location_text || 'Nearby',
          distance: '',
          fullDescription: dbVendor.description || `${dbVendor.cuisine || 'Street food'} vendor on Sizzle.`,
          bgColor: BG_COLORS[dbVendor.name.length % BG_COLORS.length],
          menu: menuItems.map((item) => ({
            name: item.name,
            description: item.description || '',
            price: (item.price_cents ?? 0) / 100,
            popular: item.popular ?? false,
            soldOut: !(item.is_available ?? true),
          })),
          reviewsList: [],
        });
      })
      .catch(() => setVendor(null))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // Check if vendor is favorited
  useEffect(() => {
    if (!user || !vendor) return;
    isFavorited(String(vendor.id)).then(setIsFav).catch(() => {});
  }, [user, vendor?.id]);

  const handleAddItem = (itemName: string, itemPrice: number) => {
    if (!vendor) return;
    addItem(String(vendor.id), vendor.name, { name: itemName, price: itemPrice });
    setAddedItem(itemName);
    setTimeout(() => setAddedItem(null), 900);
  };

  if (loading) {
    return (
      <div className="c8ad40ac4">
        <CustomerTopBar mode="vendor" />
        <div style={{ color: '#9C9890', fontSize: 15, padding: 80, textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div id="vendor-not-found" className="ceefea0f9" style={{ display: 'flex' }}>
        <div className="c50d8477c">Vendor not found</div>
        <div className="c39846d5c">The vendor you're looking for doesn't exist.</div>
        <Link className="link-reset c7a003534" to="/search">Browse Vendors</Link>
      </div>
    );
  }

  return (
    <div className="c8ad40ac4">
      <CustomerTopBar mode="vendor" />
      <div className="c09a26644">
        <div id="vendor-hero" className="c05fac337" style={{ backgroundColor: vendor.bgColor }}>
          <div className="c894b8c9b">
            <div className="c042c85a1">
              <div className="c4537f25f">
                <div className="c693b5ace">{vendor.open ? 'Open Now' : 'Closed'}</div>
              </div>
              <div className="c688c61d4">{vendor.open ? (vendor.closesAt ? `Closes at ${vendor.closesAt}` : 'Open for orders') : 'Opens tomorrow'}</div>
            </div>
            <div className="c8a790dca">{vendor.name}</div>
            <div className="cee54018c">
              <div className="c72dd1a62">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B2C" />
                </svg>
                <div className="ca0488f65">{vendor.rating}</div>
                <div className="c14340012">({vendor.reviews} reviews)</div>
              </div>
              <div className="c12236b85">|</div>
              <div className="c14340012">{vendor.cuisineLabel}</div>
              <div className="c12236b85">|</div>
              <div className="c14340012">{vendor.location}{vendor.distance ? ` · ${vendor.distance}` : ''}</div>
            </div>
            <div className="c82eb3365">{vendor.fullDescription}</div>
          </div>
          <div className="cfbe42bd1">
            <button
              className="link-reset c1ba56b16"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => totalItems > 0 ? navigate('/cart') : document.getElementById('vendor-menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="c154a3b24">{totalItems > 0 ? `View Order (${totalItems})` : 'Order Now'}</div>
            </button>
            <button
              className="c7fb41ffb"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={async () => {
                if (!user) { navigate('/login'); return; }
                const nowFav = await toggleFavorite(String(vendor!.id));
                setIsFav(nowFav);
              }}
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#FF6B2C' : 'none'}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="c76012322">
        <div className="cc867063a">
          <div id="vendor-menu" className="c10236220">Menu</div>
          {vendor.menu.length === 0 ? (
            <div style={{ color: '#9C9890', fontSize: 14, padding: '24px 0' }}>This vendor hasn't added menu items yet.</div>
          ) : (
            <div>
              {vendor.menu.map((item, idx) => {
                const isLast = idx === vendor.menu.length - 1;
                const soldOut = !!item.soldOut;
                return (
                  <div key={item.name} style={{ alignItems: 'center', borderBottom: isLast ? '0' : '1px solid #EEEDE9', display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: soldOut ? '#9C9890' : '#1C1917', fontSize: 15, fontWeight: 600, lineHeight: '18px' }}>{item.name}</div>
                        {item.popular ? (
                          <div style={{ backgroundColor: '#FFF4EE', borderRadius: 4, padding: '2px 8px' }}>
                            <div style={{ color: '#FF6B2C', fontSize: 11, fontWeight: 600, lineHeight: '14px' }}>Popular</div>
                          </div>
                        ) : null}
                      </div>
                      <div style={{ color: soldOut ? '#C5C5C0' : '#9C9890', fontSize: 13, lineHeight: '18px' }}>{item.description}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ color: soldOut ? '#9C9890' : '#1C1917', fontSize: 15, fontWeight: 700, lineHeight: '18px' }}>{formatPrice(item.price)}</div>
                      {soldOut ? (
                        <div style={{ alignItems: 'center', backgroundColor: '#F0EFEC', borderRadius: 8, display: 'flex', height: 32, justifyContent: 'center', padding: '0 10px' }}>
                          <div style={{ color: '#9C9890', fontSize: 12, fontWeight: 500, lineHeight: '16px' }}>Sold out</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item.name, item.price)}
                          style={{
                            alignItems: 'center',
                            background: addedItem === item.name ? '#FF6B2C' : '#fff',
                            border: addedItem === item.name ? '1.5px solid #FF6B2C' : '1.5px solid #E8E6E1',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            height: 32,
                            justifyContent: 'center',
                            width: 32,
                            transition: 'background 0.15s, border-color 0.15s',
                            padding: 0,
                          }}
                        >
                          {addedItem === item.name ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {vendor.reviewsList.length > 0 && (
          <div className="c9ec9aeb4">
            <div className="c10236220">Reviews</div>
            <div>
              {vendor.reviewsList.map((review) => (
                <div key={`${review.name}-${review.time}`} style={{ borderBottom: '1px solid #EEEDE9', display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ alignItems: 'center', backgroundColor: review.avatarBg, borderRadius: '50%', display: 'flex', height: 28, justifyContent: 'center', width: 28 }}>
                        <div style={{ color: review.avatarColor, fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>{review.initial}</div>
                      </div>
                      <div style={{ color: '#1C1917', fontSize: 14, fontWeight: 600, lineHeight: '18px' }}>{review.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={i + 1 <= review.stars ? '#FF6B2C' : '#E8E6E1'} />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div style={{ color: '#6B6963', fontSize: 13, lineHeight: '20px' }}>{review.text}</div>
                  <div style={{ color: '#B5B5B0', fontSize: 12, lineHeight: '16px' }}>{review.time}</div>
                </div>
              ))}
            </div>
            <button
              className="link-reset c6b4d832f"
              type="button"
              onClick={() => document.getElementById('vendor-menu')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%' }}
            >
              <div className="cc8d9a637">Back to top</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
