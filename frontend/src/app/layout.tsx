import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { validateConfig } from '../lib/config/env';
import { ReactQueryProvider } from "@/lib/react-query";


// Configurar la fuente Inter
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};




// Metadata de la aplicación
export const metadata: Metadata = {
  title: 'Control de Almacén',
  description: 'Sistema integral para la gestión y control de inventarios, órdenes de trabajo y solicitudes de materiales',
  keywords: ['inventario', 'almacén', 'control', 'stock', 'gestión'],
  authors: [{ name: 'Sistema Control de Almacén' }],
  creator: 'Control de Almacén',
  publisher: 'Control de Almacén',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9090'),
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: '/',
    title: 'Control de Almacén',
    description: 'Sistema integral para la gestión y control de inventarios',
    siteName: 'Control de Almacén',
  },
  robots: {
    index: false, // No indexar en buscadores (aplicación interna)
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  /*
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  */
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validar configuración al inicializar
  if (typeof window === 'undefined') {
    try {
      validateConfig();
    } catch (error) {
      console.error('Error en configuración:', error);
    }
  }

  return (
    <html lang="es"  data-scroll-behavior="smooth" className={inter.variable}>
      <head>

        
        {/* Preconnect para optimizar carga de fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon y iconos de la app */}
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color para browsers móviles */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Prevenir zoom automático en iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />


      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Wrapper principal de la aplicación */}

        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        
        {/* Portal para modales */}
        <div id="modal-root" />
        
        {/* Portal para toasts */}
        <div id="toast-root" />
        
        {/* Script para tema oscuro (futuro) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </body>
    </html>
  );
}