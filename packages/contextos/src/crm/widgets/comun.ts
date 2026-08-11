import { ClausulaFiltro, Orden } from "@olula/lib/diseño.ts";

export type EstadoCargaWidget = "cargando" | "listo";


export const fechaLocalStr = (fecha: Date): string => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const construirUrlConFiltro = (
    ruta: string,
    filtro: ClausulaFiltro[],
    opciones?: {
        orden?: Orden;
        params?: Record<string, string>;
    }
): string => {
    const params = new URLSearchParams();

    if (opciones?.params) {
        Object.entries(opciones.params).forEach(([clave, valor]) => {
            params.set(clave, valor);
        });
    }

    for (const [campo, operador, valor] of filtro) {
        params.append(
            campo,
            valor === undefined ? operador : `${operador}__${valor}`
        );
    }

    if (opciones?.orden && opciones.orden.length > 0) {
        const partes: string[] = [];
        for (let i = 0; i < opciones.orden.length; i += 2) {
            const campo = opciones.orden[i];
            const direccion = opciones.orden[i + 1];
            partes.push(direccion === "ASC" ? campo : `-${campo}`);
        }

        if (partes.length > 0) {
            params.set("orden", partes.join(","));
        }
    }

    const query = params.toString();
    return query ? `${ruta}?${query}` : ruta;
};