import { CampoInforme, FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { OPCIONES_INTERVALO } from "#/comun/informe_documentos/dominio.ts";
import { ControlAgente, ControlCliente } from "./controles.tsx";

/**
 * Pestañas de Ventas > Informes: los criterios de `i_presupuestoscli`,
 * `i_pedidoscli`, `i_albaranescli` e `i_facturascli` de Eneboo, en filas como
 * en sus formularios. Los nombres son los de la API.
 */

const opciones = (valores: string[]) => valores.map((valor) => ({ valor, descripcion: valor }));

const ORDENES = opciones(["No ordenar", "Código", "Cod.Cliente", "Cliente", "Fecha", "Total"]);
const SENTIDOS = opciones(["Ascendente", "Descendente"]);
const TODOS_SI_NO = opciones(["Todos", "Sí", "No"]);

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
    [texto("codigo_desde", `Desde ${documento} Nº`), texto("codigo_hasta", `Hasta ${documento} Nº`)],
    [
        texto("ejercicio_id", "Ejercicio"),
        combo("intervalo", "Intervalo", OPCIONES_INTERVALO),
        { id: "fecha_desde", label: "Fecha desde", tipo: "fecha" },
        { id: "fecha_hasta", label: "Fecha hasta", tipo: "fecha" },
    ],
    [
        { id: "cliente_id", label: "Cliente", tipo: "propio", Control: ControlCliente },
        { id: "agente_id", label: "Agente", tipo: "propio", Control: ControlAgente },
    ],
];

const filasOrden = (documentos: string): CampoInforme[][] => [
    [combo("orden1", `${documentos} por (1)`, ORDENES), combo("tipo_orden1", "Orden", SENTIDOS)],
    [combo("orden2", `${documentos} por (2)`, ORDENES), combo("tipo_orden2", "Orden", SENTIDOS)],
];

const INICIAL_COMUN = {
    intervalo: "",
    orden1: "No ordenar",
    tipo_orden1: "Ascendente",
    orden2: "No ordenar",
    tipo_orden2: "Ascendente",
};

export const PRESUPUESTOS: PestañaInforme = {
    clave: "presupuestos",
    titulo: "Presupuestos",
    url: "/ventas/informe/presupuestos",
    regla: "ventas.presupuesto.leer",
    filas: [
        ...filasComunes("presupuesto"),
        [combo("pte_aprobar", "Pte. aprobar", TODOS_SI_NO)],
        ...filasOrden("Presupuestos"),
    ],
    inicial: { ...INICIAL_COMUN, pte_aprobar: "Todos" },
};

export const PEDIDOS: PestañaInforme = {
    clave: "pedidos",
    titulo: "Pedidos",
    url: "/ventas/informe/pedidos",
    regla: "ventas.pedido.leer",
    filas: [
        ...filasComunes("pedido"),
        [
            combo("servido", "Servido", opciones(["Todos", "Pendiente", "Sí", "No", "Parcial"])),
            texto("serie_id", "Serie"),
            texto("referencia", "Referencia"),
        ],
        [casilla("mostrar_lineas", "Mostrar líneas"), casilla("solo_pendientes", "Sólo pendientes")],
        ...filasOrden("Pedidos"),
    ],
    inicial: { ...INICIAL_COMUN, servido: "Todos", mostrar_lineas: false, solo_pendientes: false },
};

export const ALBARANES: PestañaInforme = {
    clave: "albaranes",
    titulo: "Albaranes",
    url: "/ventas/informe/albaranes",
    regla: "ventas.albaran.leer",
    filas: [
        ...filasComunes("albarán"),
        [combo("pte_factura", "Pte. factura", TODOS_SI_NO)],
        ...filasOrden("Albaranes"),
    ],
    inicial: { ...INICIAL_COMUN, pte_factura: "Todos" },
};

const filtraImportes = (ficha: FichaInforme) => ficha.filtrar_importes === true;
const esAcumulado = (ficha: FichaInforme) => ficha.acumulado === true;

/** `habilitarPorFiltroImportes` de `i_facturascli.qs`: sin «Filtrar por
 * importe» los importes se vacían. */
const ajustarFacturas = (ficha: FichaInforme, campo: string): FichaInforme =>
    campo === "filtrar_importes" && !ficha.filtrar_importes
        ? { ...ficha, importe_desde: "", importe_hasta: "" }
        : ficha;

export const FACTURAS: PestañaInforme = {
    clave: "facturas",
    titulo: "Facturas",
    url: "/ventas/informe/facturas",
    regla: "ventas.factura.leer",
    filas: [
        ...filasComunes("factura"),
        [
            texto("grupo_cliente_id", "Grupo de clientes"),
            combo("regimen_iva", "Régimen I.V.A.", opciones(["Todos", "General", "Exportaciones", "U.E.", "Exento"])),
        ],
        [combo("pte_pago", "Ptes. de pago", TODOS_SI_NO), texto("serie_id", "Serie")],
        [casilla("de_abono", "Sólo facturas de abono"), casilla("incluir_borradores", "Incluir borradores")],
        [
            casilla("filtrar_importes", "Filtrar por importe"),
            { id: "importe_desde", label: "Desde importe", tipo: "decimal", activo: filtraImportes },
            { id: "importe_hasta", label: "Hasta importe", tipo: "decimal", activo: filtraImportes },
        ],
        [combo("tipo_informe", "Tipo de informe", opciones(["Moneda original", "Moneda original y euros", "Euros"]))],
        [
            casilla("acumulado", "Acumulado"),
            { ...combo("orden_acumulado", "Orden A.", opciones(["DESC", "ASC"])), activo: esAcumulado },
            { id: "limite_acumulado", label: "Límite A.", tipo: "entero", activo: esAcumulado },
        ],
        ...filasOrden("Facturas"),
    ],
    inicial: {
        ...INICIAL_COMUN,
        regimen_iva: "Todos",
        pte_pago: "Todos",
        de_abono: false,
        incluir_borradores: false,
        filtrar_importes: false,
        tipo_informe: "Moneda original",
        acumulado: false,
        orden_acumulado: "DESC",
    },
    ajustar: ajustarFacturas,
};

export const PESTAÑAS_VENTAS: PestañaInforme[] = [PRESUPUESTOS, PEDIDOS, ALBARANES, FACTURAS];
