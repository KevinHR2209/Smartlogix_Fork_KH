import "./globals.css";
// Importamos tus contextos para que el useAuth y useCart funcionen en toda la app
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";

export const metadata = {
    title: "Smartlogix",
    description: "Catálogo de Perfumes",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
        <body className="antialiased bg-white text-black">
        {/* Envolvemos toda la aplicación con los Providers */}
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}