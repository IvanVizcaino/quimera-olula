import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { aBooleano } from "#/comun/informe_documentos/dominio.ts";
import { ControlAlmacen, ControlFamilia } from "./controles.tsx";
import { ResultadoInventario } from "./resultado/ResultadoInventario.tsx";

/**
 * Criterios de `i_inventario` de Eneboo, en filas como su formulario. Los nombres son los de la API.
 */

const opciones = (valores: string[]) => valores.map((valor) => ({ valor, descripcion: valor }));

export const ORDENES_ALMACEN = opciones(["No ordenar", "Código", "Nombre"]);
// «Descripcion» sin tilde: es el valor que guarda Eneboo.
export const ORDENES_ARTICULO = [
    { valor: "No ordenar", descripcion: "No ordenar" },
    { valor: "Referencia", descripcion: "Referencia" },
    { valor: "Descripcion", descripcion: "Descripción" },
];
export const SENTIDOS = opciones(["Ascendente", "Descendente"]);

const combo = (id: string, label: string, valores: CampoInforme["opciones"]): CampoInforme => ({
    id,
    label,
    tipo: "opciones",
    opciones: valores,
});

/** Sin «Actual» se pide la fecha (`habilitarAFecha` de Eneboo). */
const sinActual = (ficha: FichaInforme) => !aBooleano(ficha.actual);

/** Al marcar «Actual» la fecha deja de usarse y se vacía. */
export const ajustarInventario = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "actual" && aBooleano(ficha.actual) ? { ...ficha, a_fecha: "" } : ficha;

const filasComunes: CampoInforme[][] = [
    [
        { id: "almacen_id", label: "Almacén", tipo: "propio", Control: ControlAlmacen },
        { id: "familia_id", label: "Familia", tipo: "propio", Control: ControlFamilia },
        { id: "marca_id", label: "Marca", tipo: "texto" },
    ],
    [
        { id: "actual", label: "Actual", tipo: "casilla" },
        { id: "a_fecha", label: "A fecha", tipo: "fecha", activo: sinActual },
        { id: "incluir_sin_stock", label: "Incluir sin stock", tipo: "casilla" },
    ],
    [combo("orden_almacen", "Almacenes por", ORDENES_ALMACEN), combo("tipo_orden_almacen", "Orden", SENTIDOS)],
    [combo("orden_articulo", "Artículos por", ORDENES_ARTICULO), combo("tipo_orden_articulo", "Orden", SENTIDOS)],
];

const INICIAL = {
    almacen_id: "",
    familia_id: "",
    marca_id: "",
    actual: true,
    a_fecha: "",
    incluir_sin_stock: true,
    orden_almacen: "No ordenar",
    tipo_orden_almacen: "Ascendente",
    orden_articulo: "No ordenar",
    tipo_orden_articulo: "Ascendente",
};

export const INFORME_INVENTARIO: PestañaInforme = {
    clave: "inventario",
    titulo: "Informe inventario",
    url: "/almacen/informe/inventario",
    regla: "almacen.informe_inventario",
    filas: filasComunes,
    inicial: INICIAL,
    ajustar: ajustarInventario,
    Resultado: ResultadoInventario,
};
