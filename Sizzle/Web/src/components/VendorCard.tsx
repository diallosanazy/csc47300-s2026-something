import { Link } from 'react-router-dom';

export type VendorCardData = {
  id: number | string;
  name: string;
  cuisine: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  distance: string;
  description: string;
  bgColor: string;
  label: string;
  open: boolean;
};

export function VendorCard({ vendor, size = 'small' }: { vendor: VendorCardData; size?: 'small' | 'large' }) {
  const height = size === 'large' ? 160 : 120;
  const labelSize = size === 'large' ? 36 : 32;
  const labelOpacity = size === 'large' ? '0D' : '0F';
  const showOpen = size === 'large';

  return (
    <Link className="link-reset" to={`/vendor?id=${vendor.id}`} style={{ flexBasis: '0%', flexGrow: 1, flexShrink: 1 }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E6E1', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ alignItems: 'center', backgroundColor: vendor.bgColor, display: 'flex', flexShrink: 0, height, justifyContent: 'center', position: 'relative', width: '100%' }}>
          <div style={{ color: `#FFFFFF${labelOpacity}`, fontSize: labelSize, fontWeight: 900, lineHeight: `${labelSize + 8}px` }}>{vendor.label}</div>
          {showOpen ? (
            <div style={{ backgroundColor: vendor.open ? '#2D9F6F' : '#9C9890', borderRadius: 6, display: 'flex', left: 12, padding: '4px 10px', position: 'absolute', top: 12 }}>
              <div style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600, lineHeight: '14px' }}>{vendor.open ? 'Open Now' : 'Closed'}</div>
            </div>
          ) : null}
          <div style={{ backgroundColor: '#00000080', borderRadius: 100, display: 'flex', padding: '4px 10px', position: 'absolute', right: 12, top: 12 }}>
            <div style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600, lineHeight: '14px' }}>{vendor.distance}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#1C1917', fontSize: 17, fontWeight: 700, lineHeight: '22px' }}>{vendor.name}</div>
            {size === 'large' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B2C" /></svg>
                <div style={{ color: '#1C1917', fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>{vendor.rating}</div>
                <div style={{ color: '#9C9890', fontSize: 13, lineHeight: '16px' }}>({vendor.reviews})</div>
              </div>
            ) : null}
          </div>
          <div style={{ color: '#9C9890', fontSize: 14, lineHeight: '20px' }}>{vendor.cuisine} · {vendor.location} · {vendor.price}</div>
          <div style={{ color: '#9C9890', fontSize: 13, lineHeight: '16px' }}>{vendor.description}</div>
        </div>
      </div>
    </Link>
  );
}
