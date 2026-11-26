import { Registro } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { fecha, fechaHora } from "./comun.ts";

/** Petición que reciben las respuestas fijas calculadas. */
type Peticion = { url: string; cuerpo: unknown };

/**
 * La gestión documental no tiene pantalla propia en la app: sus documentos se ven en las
 * fichas a las que están vinculados. La demo usa las tareas programadas, cuya pestaña
 * «Informes» lista (y deja descargar o borrar) los documentos que genera cada ejecución.
 */

const flujo = (id: string, nombre: string, descripcionCorta: string) => ({
    id, nombre, descripcion_corta: descripcionCorta, contenido: `Instrucciones del flujo «${nombre}».`,
    activo: true, creado_por: "demo", creado_en: fechaHora(-90), actualizado_en: fechaHora(-15),
});

const FLUJOS = [
    flujo("f1", "Informe semanal de ventas", "Resume las ventas de la semana por familia y cliente"),
    flujo("f2", "Stock bajo mínimos", "Lista los artículos por debajo del stock mínimo"),
    flujo("f3", "Recibos pendientes", "Recibos vencidos y por vencer de clientes"),
    flujo("f4", "Cierre mensual", "Resumen de compras, ventas y márgenes del mes"),
];

const CREDENCIALES = [
    {
        id: "cr1", empresa_id: "1", nombre: "Buzón de administración", proveedor: "correo", tipo_auth: "basic",
        activo: true, creado_por: "demo", creado_en: fechaHora(-120), actualizado_en: fechaHora(-30),
        propietario_id: null, categoria: "conector",
    },
    {
        id: "cr2", empresa_id: "1", nombre: "Carpeta compartida", proveedor: "drive", tipo_auth: "oauth2",
        activo: true, creado_por: "demo", creado_en: fechaHora(-60), actualizado_en: fechaHora(-10),
        propietario_id: null, categoria: "conector",
    },
];

/** Días hasta el próximo `dia` de la semana (0 = domingo), contando desde mañana. */
const diasHasta = (dia: number) => (dia - new Date().getDay() + 7) % 7 || 7;

const tarea = (id: string, nombre: string, flujoId: string, cron: string, activo: boolean, proxima: number,
    hora: string, credenciales: string[] = []) => ({
    id, nombre, ia_flujo_id: flujoId, empresa_id: "1", expresion_cron: cron, activo,
    proxima_ejecucion: fechaHora(proxima, hora), usuario_id: "demo", credencial_ids: credenciales,
});

const TAREAS = [
    tarea("1", "Informe de ventas de los lunes", "f1", "0 7 * * 1", true, diasHasta(1), "07:00:00", ["cr1"]),
    tarea("2", "Aviso diario de stock", "f2", "30 6 * * *", true, 1, "06:30:00"),
    tarea("3", "Recibos vencidos", "f3", "0 8 * * 5", true, diasHasta(5), "08:00:00", ["cr1", "cr2"]),
    tarea("4", "Cierre de mes", "f4", "0 9 * * 1", false, diasHasta(1), "09:00:00", ["cr2"]),
    tarea("5", "Revisión de cobros cada hora", "f3", "0 * * * *", false, 1, "00:00:00"),
];

/** Ejecuciones de una tarea, de la más reciente a la más antigua. */
const ejecuciones = (tareaId: string, lista: [number, "ok" | "bloqueada" | "error", string][]) =>
    lista.map(([dias, estado, resumen], i) => ({
        id: `${tareaId}-${i + 1}`, tarea_id: Number(tareaId), timestamp: fechaHora(dias, "07:02:10"),
        estado, resumen, thread_id: null,
    }));

const EJECUCIONES: Record<string, ReturnType<typeof ejecuciones>> = {
    1: ejecuciones("1", [
        [-4, "ok", "Ventas de la semana: 18.420 € (+6 %). Informe en PDF y Excel."],
        [-11, "ok", "Ventas de la semana: 17.380 €. Informe en PDF y Excel."],
        [-18, "error", "No se pudo enviar el correo: buzón sin espacio."],
    ]),
    2: ejecuciones("2", [
        [0, "ok", "3 artículos bajo mínimos: limón, etiquetas y tomate en tienda."],
        [-1, "ok", "2 artículos bajo mínimos."],
        [-2, "bloqueada", "Propone un pedido a proveedor: pendiente de confirmación."],
    ]),
    3: ejecuciones("3", [
        [-2, "ok", "5 recibos vencidos por 4.310 €. Listado adjunto."],
        [-9, "ok", "3 recibos vencidos por 1.980 €."],
    ]),
    4: ejecuciones("4", [[-25, "ok", "Cierre del mes anterior: margen bruto del 38 %."]]),
};

// --- Documentos ---------------------------------------------------------------------------

/** Documento generado por una tarea (vinculado con ia_tarea_programada_id). */
const documento = (id: string, tareaId: string, nombre: string, dias: number, hora: string) => {
    const extension = nombre.split(".").pop() ?? null;
    return {
        id, nombre, codigo: id.toUpperCase(), fecha_creacion: fecha(dias), hora_creacion: hora,
        version_actual_id: `${id}-v1`, tipo_id: "Documento", extension,
        origen: { tipo: "ia_tarea_programada", origen_id: tareaId }, ia_tarea_programada_id: tareaId,
    };
};

/** Lista viva de documentos: la pestaña la filtra por tarea y el borrado la modifica. */
const documentos: Registro[] = [
    documento("d01", "1", "Ventas semana 47.pdf", -4, "07:02:45"),
    documento("d02", "1", "Ventas semana 47.xlsx", -4, "07:02:47"),
    documento("d03", "1", "Ventas semana 46.pdf", -11, "07:02:31"),
    documento("d04", "1", "Ventas semana 46.xlsx", -11, "07:02:33"),
    documento("d05", "2", "Stock bajo mínimos.pdf", 0, "06:31:05"),
    documento("d06", "2", "Stock bajo mínimos (ayer).pdf", -1, "06:31:12"),
    documento("d07", "2", "Propuesta de pedido a proveedor.pdf", -2, "06:31:40"),
    documento("d08", "3", "Recibos vencidos.xlsx", -2, "08:01:20"),
    documento("d09", "3", "Recibos vencidos (semana anterior).xlsx", -9, "08:01:18"),
    documento("d10", "4", "Cierre de octubre.pdf", -25, "09:03:02"),
];

/** Pares campo-valor del filtro (?q=), con o sin operador: [campo, valor] o [campo, "=", valor]. */
const igualdades = (url: string): [string, string][] => {
    try {
        const q = JSON.parse(new URL(url, "http://demo").searchParams.get("q") ?? "{}") as { filtro?: unknown };
        if (!Array.isArray(q.filtro)) return [];
        return q.filtro.flatMap((c): [string, string][] => {
            if (!Array.isArray(c)) return [];
            if (c.length === 2) return [[String(c[0]), String(c[1])]];
            return ["=", "==", "eq"].includes(c[1]) ? [[String(c[0]), String(c[2])]] : [];
        });
    } catch {
        return [];
    }
};

const RUTA_DOCUMENTO = /^documental\/documento\/([^/]+)$/;

export const demo: DemoModulo = {
    pantallas: [{ nombre: "Informes de tareas", ruta: "/comun/ia-tarea-programada" }],
    guia: "Abre una tarea y entra en la pestaña «Informes» para ver los documentos que ha generado o borrar alguno.",
    colecciones: {
        "comun/ia-tarea-programada": TAREAS,
        ...Object.fromEntries(Object.entries(EJECUCIONES).map(([id, lista]) =>
            [`comun/ia-tarea-programada/${id}/ejecuciones`, lista])),
        "comun/ia-tarea-programada/5/ejecuciones": [],
        "comun/ia-flujo": FLUJOS,
        "comun/credencial-externa": CREDENCIALES,
    },
    fijas: [
        {
            metodo: "GET", ruta: "documental/documento",
            cuerpo: ({ url }: Peticion) => {
                const filtro = igualdades(url);
                const datos = documentos.filter((d) => filtro.every(([campo, valor]) => String(d[campo]) === valor));
                return { datos, total: datos.length };
            },
        },
        {
            metodo: "DELETE", ruta: RUTA_DOCUMENTO,
            cuerpo: ({ url }: Peticion) => {
                const id = RUTA_DOCUMENTO.exec(url.split("?")[0].replace(/^.*?(?=documental\/)/, ""))?.[1];
                const i = documentos.findIndex((d) => d.id === id);
                if (i >= 0) documentos.splice(i, 1);
                return {};
            },
        },
        // La descarga es un fichero: en la demo, un texto que lo explica.
        {
            metodo: "GET", ruta: /^documental\/documento\/[^/]+\/descargar$/,
            cuerpo: "Documento de ejemplo de la demo: en tu empresa aquí se descarga el fichero real.",
        },
    ],
};
