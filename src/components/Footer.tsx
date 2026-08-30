export function Footer({
  storeName,
  showReseller = true,
}: {
  storeName: string;
  showReseller?: boolean;
}) {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white py-8 text-center text-sm text-gray-500">
      <p>
        © {new Date().getFullYear()} {storeName}
        {showReseller ? ". Venta por catálogo con revendedoras." : "."}
      </p>
      <p className="mt-1 flex items-center justify-center gap-4">
        {showReseller && (
          <a href="/revendedora" className="hover:text-brand-600">
            ¿Querés ser revendedora?
          </a>
        )}
        <a href="/cancha" className="hover:text-brand-600">
          Reservar cancha
        </a>
        <a href="/admin" className="hover:text-brand-600">
          Acceso administrador
        </a>
      </p>
    </footer>
  );
}
