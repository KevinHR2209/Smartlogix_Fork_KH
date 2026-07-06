export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-white/60">
          Accede para comprar o administrar productos.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm">Correo</label>
            <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm">Contraseña</label>
            <input type="password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
          </div>

          <button className="w-full rounded-xl bg-white px-4 py-3 font-medium text-neutral-950">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}