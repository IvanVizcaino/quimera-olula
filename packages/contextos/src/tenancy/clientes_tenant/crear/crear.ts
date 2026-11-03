import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoClienteTenant } from "../diseño.js";

export const metaNuevoClienteTenant: MetaModelo<NuevoClienteTenant> = {
    campos: {
        id: { requerido: true, minimo: 1 },
        nombre: { requerido: true, minimo: 2 },
        cadenaConexion: { requerido: true, minimo: 1 },
        activo: { requerido: true },
    },
};

export const nuevoClienteTenantInicial = (): NuevoClienteTenant => ({
    id: "",
    nombre: "",
    cadenaConexion: "",
    activo: true,
});
