import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MacroTrack - Dinh Dưỡng & Thể Hình Chuẩn Khoa Học',
  description: 'Nền tảng theo dõi dinh dưỡng, thích ứng chuyển hóa TDEE và tập luyện thể hình thế hệ mới',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MacroTrack',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090A0F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex justify-center">
        {/* Mobile Device Frame Container (max-w-md center-aligned for desktop view) */}
        <div className="w-full max-w-md min-h-screen flex flex-col relative pb-20 shadow-2xl border-x border-border/40">
          {children}
        </div>

        {/* PWA Service Worker Registration & Cache Invalidation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (var i = 0; i < names.length; i++) {
                    if (names[i].indexOf('v2') === -1) {
                      caches.delete(names[i]);
                    }
                  }
                });
              }
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      registration.update();
                      console.log('MacroTrack PWA ServiceWorker active');
                    },
                    function(err) {
                      console.log('MacroTrack SW registration note: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
