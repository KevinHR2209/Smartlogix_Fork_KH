import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'SmartLogix | Minimal',
  description: 'Demostración técnica del backend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex h-screen bg-[#F9F9F6] text-zinc-800 font-sans tracking-tight">
        
        {/* Barra Lateral Oscura Minimalista */}
        <aside className="w-64 bg-zinc-950 text-stone-300 flex flex-col shadow-2xl z-10">
          <div className="p-8 text-2xl font-black text-white tracking-tighter border-b border-zinc-800/50">
            SmartLogix.
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2">
            <Link href="/" className="block px-4 py-3 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 font-medium text-sm">
              🛍️ Tienda
            </Link>
            
            <div className="pt-8 pb-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              Administración
            </div>
            <Link href="/admin/productos" className="block px-4 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 text-sm">
              📦 Inventario
            </Link>
            <Link href="/admin/clientes" className="block px-4 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 text-sm">
              👥 Clientes
            </Link>
            <Link href="/admin/transportistas" className="block px-4 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 text-sm">
              🚚 Flota
            </Link>
            <Link href="/admin/ventas" className="block px-4 py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 text-sm">
              📋 Transacciones
            </Link>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-10">
            {children}
          </div>
        </main>

      </body>
    </html>
  )
}