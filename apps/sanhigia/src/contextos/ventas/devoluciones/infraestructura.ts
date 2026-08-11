import {
    LegacyAPI,
    legacyFilterFromCriteria,
    legacyUrl,
} from "@olula/lib/api/legacy_api.ts";
import {
    Filtro,
    Orden,
    Paginacion,
    RespuestaLista,
} from "@olula/lib/diseño.ts";
import {
    CrearDevolucionPedidoPayload,
    DevolucionPedido,
    DevolucionPedidoAPI,
    FacturaDevolucion,
    FacturaDevolucionAPI,
    LineaDevolucionPedido,
    LineaDevolucionPedidoAPI,
    LineaFacturaDevolucion,
    LineaFacturaDevolucionAPI,
    PrepararDevolucionPedidoPayload,
    RespuestaFacturaDevolucionAPI,
} from "./diseño.ts";

const baseUrl = "pedidoscli";
const facturasBaseUrl = "facturascli";
const fieldsDetallePedido = [
    "idpedido",
    "codigo",
    "fecha",
    "nombrecliente",
    "codcliente",
    "total",
    "totaliva",
    "neto",
    "dirtipovia",
    "direccion",
    "dirnum",
    "dirotros",
    "codpostal",
    "ciudad",
    "provincia",
    "coddir",
    "codagente",
    "cifnif",
    "editable",
    "servido",
    "observaciones",
    "sh_ctrlestadoborr",
    "sh_estadopedidopda",
    "email",
    "codevento",
    "sh_nombreevento",
];

const devolucionPedidoDesdeApi = (
    devolucion: DevolucionPedidoAPI
): DevolucionPedido => ({
    id: String(devolucion.idpedido),
    codigo: devolucion.codigo,
    codCliente: devolucion.codcliente,
    nombrecliente: devolucion.nombrecliente,
    servido: devolucion.servido,
    estadopago: devolucion.sh_estadopago,
    fecha: devolucion.fecha ? new Date(Date.parse(devolucion.fecha)) : null,
    total: Number(devolucion.total ?? 0),
});

const normalizarDevolucionPedidoRespuesta = async (
    respuesta: unknown
): Promise<DevolucionPedido> => {
    if (typeof respuesta === "string") {
        return getDevolucionPedido(respuesta);
    }

    if (respuesta && typeof respuesta === "object") {
        const posibleId = (respuesta as { id?: string | number; idpedido?: string | number }).id
            ?? (respuesta as { id?: string | number; idpedido?: string | number }).idpedido;

        if (posibleId !== undefined && posibleId !== null) {
            const tieneFormaPedido = "codigo" in respuesta && "codcliente" in respuesta;
            if (!tieneFormaPedido) {
                return getDevolucionPedido(String(posibleId));
            }
        }

        return devolucionPedidoDesdeApi(respuesta as DevolucionPedidoAPI);
    }

    throw new Error("La API de devoluciones no devolvió una respuesta válida");
};

const lineaDevolucionPedidoDesdeApi = (
    linea: LineaDevolucionPedidoAPI
): LineaDevolucionPedido => {
    const cantidadFactura = Number(linea.cantidad_factura ?? linea.cantidad ?? 0);
    const cantidadOkApi = Number(linea.cantidadok ?? 0);
    const cantidadKoApi = Number(linea.cantidadko ?? 0);
    const cantidadLegacy = cantidadOkApi + cantidadKoApi;
    const cantidadDevolverApi =
        linea.cantidad_devolver !== undefined && linea.cantidad_devolver !== null
            ? Number(linea.cantidad_devolver)
            : 0;

    const cantidadDevolverInicial = cantidadDevolverApi || cantidadLegacy;
    const cantidadOk = cantidadLegacy > 0 ? cantidadOkApi : cantidadDevolverInicial;
    const cantidadKo = cantidadLegacy > 0 ? cantidadKoApi : 0;

    return {
        id: String(linea.id),
        referencia: linea.referencia ?? linea.codigo ?? "",
        codigo: linea.codigo ?? "",
        descripcion: linea.descripcion ?? "",
        cantidad: cantidadFactura,
        cantidadOk,
        cantidadKo,
        cantidadDevolver: cantidadOk + cantidadKo,
        precio: Number(linea.precio ?? 0),
        total: Number(linea.total ?? 0),
        codLote: linea.codlote ?? "",
        fechaCaducidadIso: linea.fechacaducidad ?? undefined,
        fechaCaducidad: linea.fechacaducidad
            ? new Date(Date.parse(linea.fechacaducidad))
            : null,
        idLineaPc: linea.idlineapc,
    };
};

const lineaFacturaDesdeApi = (
    linea: LineaFacturaDevolucionAPI
): LineaFacturaDevolucion => ({
    id: String(linea.id ?? linea.idlinea ?? ""),
    referencia: linea.referencia ?? "",
    descripcion: linea.descripcion ?? "",
    cantidad: Number(linea.cantidad ?? 0),
    precio: Number(linea.precio ?? linea.importe ?? 0),
    total: Number(linea.total ?? linea.importe ?? 0),
    importe: Number(linea.importe ?? linea.total ?? linea.precio ?? 0),
    esKit: Boolean(linea.esKit ?? false),
    cantidadDevolver: Number(
        linea.cantidadDevolver ?? linea.cantidad_devolver ?? 0
    ),
});

const parseFecha = (fecha?: string | null): Date | null => {
    if (!fecha) return null;

    const fechaDirecta = new Date(Date.parse(fecha));
    if (!Number.isNaN(fechaDirecta.getTime())) return fechaDirecta;

    const partes = fecha.split("-");
    if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
        return Number.isNaN(fechaLocal.getTime()) ? null : fechaLocal;
    }

    return null;
};

const facturaDevolucionDesdeApi = (
    factura: FacturaDevolucionAPI
): FacturaDevolucion => ({
    cabeceraFactura: {
        id: String(factura.cabeceraFactura.id),
        codigo: factura.cabeceraFactura.codigo,
        nombrecliente: factura.cabeceraFactura.nombrecliente,
        codCliente: factura.cabeceraFactura.codcliente,
        fecha: parseFecha(factura.cabeceraFactura.fecha),
        total: Number(factura.cabeceraFactura.total ?? 0),
    },
    lineas: factura.lineas.map(lineaFacturaDesdeApi),
});

const filtroBase = [
    ["idfacturarec", "gt", 0],
    ["editable", "eq", true],
    ["sh_estadopago", "neq", "''"],
] as unknown as Filtro;

const ordenLegacyDesdeOrden = (orden: Orden): string => {
    if (!Array.isArray(orden) || orden.length === 0) {
        return "fecha DESC";
    }

    const fieldUI = String(orden[0] ?? "");
    const direction = String(orden[1] ?? "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const mapaCamposOrden: Record<string, string> = {
        id: "idpedido",
        codCliente: "codcliente",
    };

    const field = mapaCamposOrden[fieldUI] ?? fieldUI;

    if (!field) return "fecha DESC";

    return `${field} ${direction}`;
};

export const getDevolucionesPedidos = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): RespuestaLista<DevolucionPedido> => {
    const filtroFinal = legacyFilterFromCriteria(
        filtro,
        filtroBase as unknown as [string, string, unknown?][]
    );

    const fieldsListado = [
        "idpedido",
        "codigo",
        "codcliente",
        "servido",
        "sh_estadopago",
        "fecha",
        "total",
        "nombrecliente",
    ];

    const ordenFinal = ordenLegacyDesdeOrden(orden);

    const respuesta = await LegacyAPI.get<{ data: DevolucionPedidoAPI[]; page?: { count?: number } }>(
        legacyUrl(baseUrl, {
            id: "static",
            action: "total_devoluciones",
            params: {
                fields: fieldsListado,
                filter: filtroFinal,
                order: ordenFinal,
            },
        })
    );

    // Algunos backends legacy devuelven solo el total en esta acción estática.
    // Si no llegan filas aquí, cargamos el listado en el endpoint base.
    let datos = (respuesta.data ?? []).map(devolucionPedidoDesdeApi);

    if (!datos.length) {
        const respuestaListado = await LegacyAPI.get<{ data: DevolucionPedidoAPI[] }>(
            legacyUrl(baseUrl, {
                params: {
                    fields: fieldsListado,
                    filter: filtroFinal,
                    order: ordenFinal,
                    page: {
                        limit: paginacion.limite,
                        page: paginacion.pagina,
                    },
                },
            })
        );

        datos = (respuestaListado.data ?? []).map(devolucionPedidoDesdeApi);
    }

    return {
        datos,
        total: Number(respuesta.page?.count ?? -1),
    };
};

export const getDevolucionPedido = async (idPedido: string): Promise<DevolucionPedido> => {
    const respuesta = await LegacyAPI.get<{ data?: DevolucionPedidoAPI[] } | DevolucionPedidoAPI>(
        legacyUrl(baseUrl, {
            id: idPedido,
            params: {
                fields: fieldsDetallePedido,
                order: "fecha DESC",
            },
        })
    );

    if ("data" in respuesta && Array.isArray(respuesta.data) && respuesta.data.length > 0) {
        return devolucionPedidoDesdeApi(respuesta.data[0]);
    }

    return devolucionPedidoDesdeApi(respuesta as DevolucionPedidoAPI);
};

export const getLineasDevolucionPedido = async (
    idPedido: string
): Promise<LineaDevolucionPedido[]> => {
    const idPedidoNumerico = Number(idPedido);
    const respuesta = await LegacyAPI.get<{ data: LineaDevolucionPedidoAPI[] }>(
        legacyUrl(baseUrl, {
            action: "get_lotes_devolucion",
            staticAction: true,
            params: {
                fields: [
                    "id",
                    "referencia",
                    "descripcion",
                    "codigo",
                    "codlote",
                    "fechacaducidad",
                    "cantidad_factura",
                    "cantidadok",
                    "cantidadko",
                    "idlineapc",
                ],
                filter: { and: [Number.isNaN(idPedidoNumerico) ? idPedido : idPedidoNumerico] },
                page: { limit: 9999 },
            },
        })
    );

    return (respuesta.data ?? []).map(lineaDevolucionPedidoDesdeApi);
};

export const getFacturaDevolucion = async (idFactura: string): Promise<FacturaDevolucion> => {
    const respuesta = await LegacyAPI.get<RespuestaFacturaDevolucionAPI>(
        legacyUrl(facturasBaseUrl, {
            id: "static",
            action: "dame_objeto_factura",
            params: {
                fields: ["idfactura", "codigo"],
                filter: { idfactura: idFactura },
            },
        })
    );

    return facturaDevolucionDesdeApi({
        cabeceraFactura: {
            id: String(respuesta.cabecera?.id ?? respuesta.cabecera?.idfactura ?? idFactura),
            codigo: respuesta.cabecera?.codigo ?? "",
            nombrecliente: respuesta.cabecera?.nombre ?? respuesta.cabecera?.nombrecliente ?? "",
            codcliente: respuesta.cabecera?.codcliente,
            fecha: respuesta.cabecera?.fecha ?? null,
            total: Number(respuesta.cabecera?.total ?? 0),
        },
        lineas: respuesta.lineas ?? [],
    });
};

export const prepararDevolucionPedido = async (payload: PrepararDevolucionPedidoPayload): Promise<DevolucionPedido> => {
    const lineasLotesDevolucion = payload.lineasDevolucion.map((linea) => ({
        id: Number(linea.id),
        referencia: linea.referencia,
        codigo: linea.codigo,
        descripcion: linea.descripcion,
        codLote: linea.codLote ?? "",
        fechaCaducidad: linea.fechaCaducidadIso
            ?? (linea.fechaCaducidad
                ? `${linea.fechaCaducidad.getFullYear()}-${String(linea.fechaCaducidad.getMonth() + 1).padStart(2, "0")}-${String(linea.fechaCaducidad.getDate()).padStart(2, "0")}T00:00:00`
                : null),
        cantidadFactura: Number(linea.cantidad ?? 0),
        cantidadOk: Number(linea.cantidadOk ?? 0),
        cantidadKo: Number(linea.cantidadKo ?? 0),
        idLineaPc: linea.idLineaPc ?? null,
    }));

    const respuesta = await LegacyAPI.post<{
        lineasLotesDevolucion: Array<{
            id: number;
            referencia: string;
            codigo: string;
            descripcion: string;
            codLote: string;
            fechaCaducidad: string | null;
            cantidadFactura: number;
            cantidadOk: number;
            cantidadKo: number;
            idLineaPc: number | null;
        }>
    }, unknown>(
        legacyUrl(baseUrl, {
            action: "preparar_devolucion",
            staticAction: true,
        }) + "?",
        { lineasLotesDevolucion }
    );

    if (respuesta === true) {
        return getDevolucionPedido(payload.idPedido);
    }

    return normalizarDevolucionPedidoRespuesta(respuesta);
};

export const crearDevolucionPedido = async (payload: CrearDevolucionPedidoPayload): Promise<DevolucionPedido> => {
    const lineasConDevolucionesLegacy = payload.lineasConDevoluciones
        .filter((linea) => Number(linea.cantidad ?? 0) > 0)
        .map((linea) => ({
            idlinea: Number(linea.idlinea),
            referencia: linea.referencia,
            descripcion: linea.descripcion,
            cantidadDevolver: linea.cantidad,
            esKit: linea.esKit,
        }));

    const respuesta = await LegacyAPI.post<{
        idFactura: number;
        idMotivo: number;
        razonDevolucion: string;
        lineasConDevoluciones: string;
    }, unknown>(
        legacyUrl(baseUrl, {
            action: "crear_devolucion",
            staticAction: true,
        }) + "?",
        {
            idFactura: Number(payload.idFactura),
            idMotivo: Number(payload.idMotivo),
            razonDevolucion: payload.razonDevolucion,
            lineasConDevoluciones: JSON.stringify(lineasConDevolucionesLegacy),
        }
    );

    return normalizarDevolucionPedidoRespuesta(respuesta);
};
