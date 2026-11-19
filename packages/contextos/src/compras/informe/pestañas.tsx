import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { OPCIONES_INTERVALO } from "#/comun/informe_documentos/dominio.ts";
import { ControlProveedor } from "./controles.tsx";

/**
 * Pestañas de Compras > Informes: los criterios de `i_pedidosprov`,
 * `i_albaranesprov` e `i_facturasprov` de Eneboo, en filas como en sus
 * formularios. Los nombres son los de la API.
 */

const opciones = (valores: string[]) => valores.map((valor) => ({ valor, descripcion: valor }));

const ORDENES = opciones(["No ordenar", "Código", "Cod.Proveedor", "Proveedor", "Fecha", "Total"]);
const SENTIDOS = opciones(["Ascendente", "Descendente"]);

const TODOS_SI_NO = opciones(["Todos", "Sí", "No"]);

const TIPOS_INFORME = opciones(["Moneda original", "Moneda original y euros", "Euros"]);

const texto = (id: string, label: string): CampoInforme => ({ id, label, tipo: "texto" });

const casilla = (id: string, label: string, activo?: CampoInforme["activo"]): CampoInforme => ({
    id,
    label,
    tipo: "casilla",
    activo,
});

const combo = (id: string, label: string, valores: CampoInforme["opciones"]): CampoInforme => ({
    id,
    label,
    tipo: "opciones",
    opciones: valores,
});

const filasComunes = (documento: string): CampoInforme[][] => [
    [combo("tipo_informe", "Tipo de informe", TIPOS_INFORME)],
    [texto("codigo_desde", `Desde ${documento} Nº`), texto("codigo_hasta", `Hasta ${documento} Nº`)],
    [
        texto("ejercicio_id", "Ejercicio"),
        combo("intervalo", "Intervalo", OPCIONES_INTERVALO),
        { id: "fecha_desde", label: "Fecha desde", tipo: "fecha" },
        { id: "fecha_hasta", label: "Fecha hasta", tipo: "fecha" },
    ],
    [{ id: "proveedor_id", label: "Proveedor", tipo: "propio", Control: ControlProveedor }],
];

const filasOrden = (documentos: string): CampoInforme[][] => [
    [combo("orden1", `${documentos} por (1)`, ORDENES), combo("tipo_orden1", "Orden", SENTIDOS)],
    [combo("orden2", `${documentos} por (2)`, ORDENES), combo("tipo_orden2", "Orden", SENTIDOS)],
];

const INICIAL_COMUN = {
    tipo_informe: "Moneda original",
    intervalo: "",
    orden1: "No ordenar",
    tipo_orden1: "Ascendente",
    orden2: "No ordenar",
    tipo_orden2: "Ascendente",
};

/** «Calcular detalle», «Calcular resumen» y «Calcular resumen por líneas». */
const MODOS_PEDIDOS: PestañaInforme["modos"] = [
    { modo: "detalle", etiqueta: "Calcular detalle" },
    { modo: "resumen", etiqueta: "Calcular resumen" },
    { modo: "resumen_lineas", etiqueta: "Calcular resumen por líneas" },
];

export const PEDIDOS: PestañaInforme = {
    clave: "pedidos",
    titulo: "Pedidos",
    url: "/compras/informe/pedidos",
    regla: "compras.pedido",
    filas: [
        ...filasComunes("pedido"),
        [
            combo("intervalo_entrada", "Intervalo E.", OPCIONES_INTERVALO),
            { id: "fecha_entrada_desde", label: "Entrada desde", tipo: "fecha" },
            { id: "fecha_entrada_hasta", label: "Entrada hasta", tipo: "fecha" },
        ],
        [combo("servido", "Servidos", opciones(["Todos", "Pendiente", "Sí", "No", "Parcial"]))],
        [
            casilla("mostrar_lineas", "Mostrar líneas"),
            casilla("solo_pendientes", "Mostrar sólo líneas pendientes albaranar"),
        ],
        ...filasOrden("Pedidos"),
    ],
    inicial: {
        ...INICIAL_COMUN,
        intervalo_entrada: "",
        servido: "Todos",
        mostrar_lineas: false,
        solo_pendientes: false,
    },
    modos: MODOS_PEDIDOS,
};

export const ALBARANES: PestañaInforme = {
    clave: "albaranes",
    titulo: "Albaranes",
    url: "/compras/informe/albaranes",
    regla: "compras.albaran",
    filas: [
        ...filasComunes("albarán"),
        [combo("pte_factura", "Pte. factura", TODOS_SI_NO)],
        ...filasOrden("Albaranes"),
    ],
    inicial: { ...INICIAL_COMUN, pte_factura: "Todos" },
};

const filtraImportes = (ficha: FichaInforme) => ficha.filtrar_importes === true;

const esAcumulado = (ficha: FichaInforme) => ficha.acumulado === true;

/** `habilitarPorFiltroImportes`: sin «Filtrar por importe» los importes se vacían. */
const ajustarFacturas = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "filtrar_importes" && !ficha.filtrar_importes
        ? { ...ficha, importe_desde: "", importe_hasta: "" }
        : ficha;

export const FACTURAS: PestañaInforme = {
    clave: "facturas",
    titulo: "Facturas",
    url: "/compras/informe/facturas",
    regla: "compras.factura",
    filas: [
        ...filasComunes("factura"),
        [
            combo("pte_pago", "Ptes. de pago", TODOS_SI_NO),
            texto("serie_id", "Serie"),
            combo("regimen_iva", "Régimen I.V.A.", opciones(["Todos", "General", "Importaciones", "UE", "Exento"])),
        ],
        [casilla("de_abono", "Sólo facturas de abono")],
        [
            casilla("filtrar_importes", "Filtrar por importe"),
            { id: "importe_desde", label: "Desde importe", tipo: "decimal", activo: filtraImportes },
            { id: "importe_hasta", label: "Hasta importe", tipo: "decimal", activo: filtraImportes },
        ],
        [
            casilla("acumulado", "Acumulado"),
            { ...combo("orden_acumulado", "Orden A.", opciones(["DESC", "ASC"])), activo: esAcumulado },
            { id: "limite_acumulado", label: "Límite A.", tipo: "entero", activo: esAcumulado },
        ],
        ...filasOrden("Facturas"),
    ],
    inicial: {
        ...INICIAL_COMUN,
        pte_pago: "Todos",
        regimen_iva: "Todos",
        de_abono: false,
        filtrar_importes: false,
        acumulado: false,
        orden_acumulado: "DESC",
    },
    ajustar: ajustarFacturas,
};

export const PESTAÑAS_COMPRAS: PestañaInforme[] = [PEDIDOS, ALBARANES, FACTURAS];
