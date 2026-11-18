import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosProvincia, NuevaProvincia, Provincia } from "./diseño.ts";

export const REGLA_PROVINCIA = "comun.provincia";

export const nuevoProvinciaVacio = (): NuevaProvincia => ({ nombre: "", paisId: "", codigo: "" });

export const provinciaVacio = (): Provincia => ({ id: "", nombrePais: "", ...nuevoProvinciaVacio() });

export const etiquetaProvincia = (p: Provincia): string =>
    p.codigo ? `${p.codigo} — ${p.nombre}` : p.nombre;

const campos = {
    nombre: { requerido: true, maximo: 50 },
    paisId: { requerido: true, tipo: "autocompletar" as const },
    codigo: { requerido: false, maximo: 2 },
};

export const metaProvincia: MetaModelo<Provincia> = { campos };

export const metaNuevoProvincia: MetaModelo<NuevaProvincia> = { campos };

export const cambiosProvincia = (previa: Provincia, actual: Provincia): CambiosProvincia => {
    const cambios: CambiosProvincia = {};
    for (const campo of ["nombre", "paisId", "codigo"] as const) {
        if (actual[campo] !== previa[campo]) cambios[campo] = actual[campo];
    }
    return cambios;
};
