import { ProveedorBancarioUI, RegistroProveedoresBancarios } from "./diseño.js";
import { ConectarPlaid } from "./plaid/ConectarPlaid.js";
import { ConectarWealthReader } from "./wealthreader/ConectarWealthReader.js";

/**
 * Registro de proveedores bancarios soportados. Añadir uno nuevo es crear su
 * propia carpeta `proveedor_bancario/<nombre>/` con un `Conectar` que cumpla
 * `ProveedorBancarioUI` y darlo de alta aquí, con la clave que el backend
 * usa como nombre del proveedor.
 */
export const proveedoresBancarios: RegistroProveedoresBancarios = {
    plaid: { Conectar: ConectarPlaid },
    wealthreader: { Conectar: ConectarWealthReader, eligeTiposProducto: true },
};

export const proveedorBancarioUI = (proveedor: string): ProveedorBancarioUI | null =>
    proveedoresBancarios[proveedor] ?? null;
