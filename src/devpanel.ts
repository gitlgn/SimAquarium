/*
 * devpanel.ts — a dev-only layout tuner. Imported by main.ts under
 * import.meta.env.DEV, so it is tree-shaken out of the production build.
 *
 * It renders sliders for the numeric knobs in public/css/theme.css and writes
 * them live onto <html> as inline custom properties. "Copy CSS" builds the
 * matching `:root { … }` block so you can paste the values back into theme.css
 * and make them permanent. "Reset" drops the overrides.
 */

/** name, label, min, max, step — all values are px. */
type Knob = readonly [string, string, number, number, number];

const KNOBS: readonly Knob[] = [
	['--frame-gap', 'frame gap', 0, 24, 1],
	['--strip-pad', 'strip padding', 0, 24, 1],
	['--panel-pad', 'panel padding', 0, 32, 1],
	['--btn-size', 'button size', 24, 72, 2],
	['--btn-icon', 'button icon', 12, 56, 1],
	['--tile-min', 'shop tile min width', 72, 260, 2],
	['--tile-gap', 'shop tile gap', 0, 32, 1],
];

function readPx(name: string): number {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return parseFloat(raw) || 0;
}

export function mountDevPanel() {
	if (document.getElementById('devPanel')) return;

	const panel = document.createElement('details');
	panel.id = 'devPanel';
	panel.style.cssText = [
		'position:fixed',
		'left:8px',
		'bottom:8px',
		'z-index:9999',
		'width:250px',
		'max-height:80vh',
		'overflow:auto',
		'font:12px/1.4 Arial,sans-serif',
		'color:#eee',
		'background:rgba(12,32,48,0.95)',
		'border:1px solid #2a5a80',
		'border-radius:8px',
		'padding:6px 10px 10px',
	].join(';');

	const summary = document.createElement('summary');
	summary.textContent = '⚙ layout';
	summary.style.cssText = 'cursor:pointer;user-select:none;padding:2px 0';
	panel.append(summary);

	for (const [name, label, min, max, step] of KNOBS) {
		const row = document.createElement('label');
		row.style.cssText =
			'display:grid;grid-template-columns:1fr auto;gap:2px 6px;margin-top:8px';

		const cap = document.createElement('span');
		cap.textContent = label;

		const out = document.createElement('span');
		out.style.cssText = 'font-variant-numeric:tabular-nums;opacity:0.8';

		const range = document.createElement('input');
		range.type = 'range';
		range.min = String(min);
		range.max = String(max);
		range.step = String(step);
		range.value = String(readPx(name));
		range.style.cssText = 'grid-column:1 / -1;width:100%';
		out.textContent = range.value + 'px';

		range.addEventListener('input', () => {
			document.documentElement.style.setProperty(name, range.value + 'px');
			out.textContent = range.value + 'px';
		});

		row.append(cap, out, range);
		panel.append(row);
	}

	const buttons = document.createElement('div');
	buttons.style.cssText = 'display:flex;gap:6px;margin-top:12px';

	const copy = document.createElement('button');
	copy.type = 'button';
	copy.textContent = 'Copy CSS';
	copy.addEventListener('click', () => {
		const body = KNOBS.map(([name]) => `\t${name}: ${readPx(name)}px;`).join('\n');
		const css = `:root {\n${body}\n}`;
		void navigator.clipboard?.writeText(css);
		console.log(css);
		copy.textContent = 'Copied ✓';
		window.setTimeout(() => (copy.textContent = 'Copy CSS'), 1200);
	});

	const reset = document.createElement('button');
	reset.type = 'button';
	reset.textContent = 'Reset';
	reset.addEventListener('click', () => {
		for (const [name] of KNOBS) document.documentElement.style.removeProperty(name);
		// re-mount so every slider resyncs to the theme.css value
		panel.remove();
		mountDevPanel();
		(document.getElementById('devPanel') as HTMLDetailsElement).open = true;
	});

	buttons.append(copy, reset);
	panel.append(buttons);
	document.body.append(panel);
}
