import { Header } from "@/components/layout/header";
import { CartSheet } from "@/features/cart/components/cart-sheet";
import { Footer } from "@/components/layout/footer"; // (Descomenta esto si agregaste el componente Footer que te di antes)

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* El Header con z-40 que no bloquea el carrito */}
            <Header />

            {/* El panel lateral del Carrito que reacciona a los botones */}
            <CartSheet />

            {/* El contenido de la página (Catálogo, Detalle, etc.) */}
            <main className="flex-grow">
                {children}
            </main>

            <Footer />
        </div>
    );
}