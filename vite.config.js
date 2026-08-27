import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// SimAquarium — Vite config. The game is ES modules under /src (bundled) plus
// static assets under /public. vite-plugin-pwa emits the service worker and
// web manifest; the manifest below also feeds Bubblewrap for the Android TWA
// (see docs/ANDROID.md).
export default defineConfig({
	root: '.',
	publicDir: 'public',
	server: {
		port: 5173,
		open: false,
	},
	build: {
		outDir: 'dist',
		target: 'es2020',
		sourcemap: true,
	},
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['gfx/favicon.png', 'gfx/apple-touch-icon.png'],
			workbox: {
				globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2}'],
				// the game preloads ~120 small sprites; raise the default 2 MiB cap
				maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
			},
			manifest: {
				id: '/',
				name: 'SimAquarium',
				short_name: 'SimAquarium',
				description: 'Aquarium simulation game — buy, breed and sell fish.',
				lang: 'en',
				dir: 'ltr',
				categories: ['games', 'entertainment'],
				theme_color: '#0e4e7a',
				background_color: '#0e4e7a',
				display: 'standalone',
				orientation: 'any',
				start_url: '/',
				scope: '/',
				icons: [
					{ src: 'gfx/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: 'gfx/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{
						src: 'gfx/pwa-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
		}),
	],
});
