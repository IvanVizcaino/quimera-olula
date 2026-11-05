import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoUsuarioTenant } from "../diseño.js";

export const metaNuevoUsuarioTenant: MetaModelo<NuevoUsuarioTenant> = {
    campos: {
        email: { requerido: true, minimo: 3 },
        nombre: { requerido: true, minimo: 2 },
        clienteId: { requerido: true },
        activo: { requerido: true },
    },
};

export const nuevoUsuarioTenantInicial = (): NuevoUsuarioTenant => ({
    id: crypto.randomUUID(),
    email: "",
    nombre: "",
    clienteId: "",
    activo: true,
});
