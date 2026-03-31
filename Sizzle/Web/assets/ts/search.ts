// @ts-nocheck
import { VENDORS } from './vendors.js';

const toAppPath = (href) => {
	if (typeof window !== 'undefined' && typeof window.__SIZZLE_TO_APP_PATH__ === 'function') {
		return window.__SIZZLE_TO_APP_PATH__(href);
	}
	return href;
};

const vendorCardHTML = (v, options = {}) => {
	const size = options.size || 'small';
	const height = size === 'large' ? 160 : 120;
	const labelSize = size === 'large' ? 36 : 32;
	const labelOpacity = size === 'large' ? '0D' : '0F';
	const showOpen = size === 'large';

	return `
		<a class="link-reset" href="${toAppPath(`vendor.html?id=${v.id}`)}" style="flex-basis:0%;flex-grow:1;flex-shrink:1;">
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

export const initSearch = () => {
	const input = document.getElementById('search-input');
	const count = document.getElementById('results-count');
	const container = document.getElementById('search-results');
	if (!container || !input) return;

	const params = new URLSearchParams(window.location.search);
	const initialQuery = params.get('q') || '';
	input.value = initialQuery;

	const filterEls = Array.from(document.querySelectorAll('[data-filter]'));
	const filters = {
		location: params.get('location') || '',
		rating: params.get('rating') || '',
		open: params.get('open') === 'true',
	};

	const syncFilterUI = () => {
		filterEls.forEach((el) => {
			const type = el.dataset.filter;
			const value = el.dataset.value || '';
			let active = false;
			if (type === 'location') active = filters.location === value;
			if (type === 'rating') active = filters.rating === value;
			if (type === 'open') active = filters.open === true;
			if (type === 'more') active = false;
			el.classList.toggle('is-active', active);
		});
	};

	const filterVendors = (query) => {
		const q = query.trim().toLowerCase();
		return VENDORS.filter((v) => {
			const matchesQuery = !q
				|| v.name.toLowerCase().includes(q)
				|| v.cuisine.toLowerCase().includes(q)
				|| v.location.toLowerCase().includes(q)
				|| v.description.toLowerCase().includes(q)
				|| v.label.toLowerCase().includes(q);

			const matchesLocation = !filters.location || v.location === filters.location;
			const matchesRating = !filters.rating || v.rating >= Number(filters.rating);
			const matchesOpen = !filters.open || v.open === true;

			return matchesQuery && matchesLocation && matchesRating && matchesOpen;
		});
	};

	const render = (query) => {
		syncFilterUI();
		const filtered = filterVendors(query);
		if (count) {
			count.textContent = `${filtered.length} vendor${filtered.length !== 1 ? 's' : ''} found`;
		}
		if (filtered.length === 0) {
			container.innerHTML = `
				<div style="align-items:center;display:flex;flex-direction:column;gap:12px;padding-top:80px;width:100%;">
					<div style="color:#1C1917;font-size:20px;font-weight:700;">No vendors found</div>
					<div style="color:#9C9890;font-size:15px;">Try a different search term</div>
				</div>
			`;
			return;
		}

		const rows = [];
		for (let i = 0; i < filtered.length; i += 3) {
			rows.push(filtered.slice(i, i + 3));
		}

		container.innerHTML = rows.map((row) => {
			const cards = row.map((v) => vendorCardHTML(v, { size: 'large' })).join('');
			const fillers = row.length < 3
				? Array.from({ length: 3 - row.length }).map(() => '<div style="flex-basis:0%;flex-grow:1;flex-shrink:1;"></div>').join('')
				: '';
			return `<div style="display:flex;gap:20px;width:100%;">${cards}${fillers}</div>`;
		}).join('');
	};

	const syncUrlAndRender = () => {
		const nextParams = new URLSearchParams();
		const valueQuery = input.value.trim();
		if (valueQuery) nextParams.set('q', valueQuery);
		if (filters.location) nextParams.set('location', filters.location);
		if (filters.rating) nextParams.set('rating', filters.rating);
		if (filters.open) nextParams.set('open', 'true');
		const newUrl = `${window.location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;
		window.history.replaceState({}, '', newUrl);
		render(input.value);
	};

	render(initialQuery);

	const form = document.getElementById('search-form');
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			syncUrlAndRender();
		});
	}

	input.addEventListener('input', () => {
		render(input.value);
	});

	filterEls.forEach((el) => {
		el.addEventListener('click', () => {
			const type = el.dataset.filter;
			const value = el.dataset.value || '';
			if (type === 'location') {
				filters.location = filters.location === value ? '' : value;
			} else if (type === 'rating') {
				filters.rating = filters.rating === value ? '' : value;
			} else if (type === 'open') {
				filters.open = !filters.open;
			} else if (type === 'more') {
				window.location.href = toAppPath('filter-panel.html');
				return;
			}
			syncUrlAndRender();
		});
	});
};
