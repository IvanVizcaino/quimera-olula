import { OrigenRotacion, PropuestaUbicacion, Recolocacion } from "./diseño.ts";

export const DIAS_POR_DEFECTO = 90;
export const LIMITE_PROPUESTA_POR_DEFECTO = 5;
export const LIMITE_RECOLOCACION_POR_DEFECTO = 20;

export const ORIGEN_POR_DEFECTO: OrigenRotacion = "ORDENES";

export const origenesRotacion: { valor: OrigenRotacion; descripcion: string }[] = [
    { valor: "ORDENES", descripcion: "Órdenes de salida" },
    { valor: "VENTAS", descripcion: "Ventas (albaranes)" },
];

/** El valor del selector, o el origen por defecto si no es uno conocido. */
export const origenRotacion = (valor: string | null | undefined): OrigenRotacion =>
    origenesRotacion.find((o) => o.valor === valor)?.valor ?? ORIGEN_POR_DEFECTO;

export const propuestaVacia: PropuestaUbicacion = { articuloId: "", clase: "C", ubicaciones: [] };

/** Entero positivo a partir del texto de un input; si no es válido, el valor por defecto. */
export const enteroPositivo = (texto: string, porDefecto: number): number => {
    const n = parseInt(texto, 10);
    return isNaN(n) || n < 1 ? porDefecto : n;
};

/** Construye la query string a partir de los parámetros no vacíos. */
export const construirQuery = (parametros: Record<string, string | number | null | undefined>): string => {
    const partes = Object.entries(parametros)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return partes.length ? `?${partes.join("&")}` : "";
};

/** Texto de "con quién o adónde" de una recolocación. */
export const textoDestinoRecolocacion = (r: Pick<Recolocacion, "accion" | "conArticuloId" | "conUbicacion">): string => {
    if (r.accion === "INTERCAMBIAR") {
        return `con ${r.conArticuloId ?? "?"} (${r.conUbicacion ?? "?"})`;
    }
    return r.conUbicacion ? `a ${r.conUbicacion}` : "";
};
