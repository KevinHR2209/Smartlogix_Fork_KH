import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-black text-white py-16 px-4 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8">SMARTLOGIX</h2>

            <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm font-medium uppercase tracking-widest">
                <Link href="/productos" className="hover:text-gray-400 transition-colors">Catálogo</Link>
                <Link href="/sobre-nosotros" className="hover:text-gray-400 transition-colors">Nosotros</Link>
                <a href="#" className="hover:text-gray-400 transition-colors">Instagram</a>
                <a href="#" className="hover:text-gray-400 transition-colors">Contacto</a>
            </div>

            <p className="text-gray-500 text-xs tracking-widest uppercase">
                © {new Date().getFullYear()} SMARTLOGIX. Todos los derechos reservados.
            </p>
        </footer>
    );
}