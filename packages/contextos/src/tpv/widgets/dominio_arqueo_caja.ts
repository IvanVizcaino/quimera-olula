import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { construirUrlConFiltro } from "#/crm/widgets/comun.ts";
import { moneda } from "#/tpv/arqueo/dominio.ts";
import { getArqueos } from "#/tpv/arqueo/infraestructura.ts";

export type EstadoCargaWidget = "cargando" | "listo";

export type ModeloWidgetArqueoCaja = {
    estado: EstadoCargaWidget;
    arqueoAbiertoId: string | null;
    codigoArqueo: string;
    pagosEfectivo: number;
    pagosTarjeta: number;
    textoEfectivo: string;
    textoTarjeta: string;
    urlArqueo: string;
    urlMaestro: string;
};

const RUTA_ARQUEOS = "/tpv/arqueo";
const PAGINACION_UNO: Paginacion = { pagina: 1, limite: 1 };
const ORDEN_APERTURA: Orden = ["fechahora_apertura", "DESC"] as unknown as Orden;

export const filtroArqueoAbierto = (): ClausulaFiltro[] => [
    ["abierto", "eq", "true"] as unknown as ClausulaFiltro,
];

export const filtroApiArqueoAbierto = (): Filtro =>
    filtroArqueoAbierto() as unknown as Filtro;

export const urlMaestroArqueos = (): string =>
    construirUrlConFiltro(RUTA_ARQUEOS, filtroArqueoAbierto(), {
        orden: ORDEN_APERTURA,
    });

export const urlDetalleArqueo = (id: string): string =>
    `${RUTA_ARQUEOS}?id=${encodeURIComponent(id)}`;

export const modeloWidgetArqueoCajaInicial: ModeloWidgetArqueoCaja = {
    estado: "cargando",
    arqueoAbiertoId: null,
    codigoArqueo: "",
    pagosEfectivo: 0,
    pagosTarjeta: 0,
    textoEfectivo: formatearMoneda(0, "EUR"),
    textoTarjeta: formatearMoneda(0, "EUR"),
    urlArqueo: RUTA_ARQUEOS,
    urlMaestro: RUTA_ARQUEOS,
};

export const cargarModeloWidgetArqueoCaja =
    async (): Promise<ModeloWidgetArqueoCaja> => {
        const filtro = filtroApiArqueoAbierto();
        const { datos, total } = await getArqueos(
            filtro,
            ORDEN_APERTURA,
            PAGINACION_UNO
        );

        if (total === 0 || datos.length === 0) {
            return {
                ...modeloWidgetArqueoCajaInicial,
                estado: "listo",
                urlMaestro: urlMaestroArqueos(),
            };
        }

        const arqueo = datos[0];

        return {
            estado: "listo",
            arqueoAbiertoId: arqueo.id,
            codigoArqueo: arqueo.id,
            pagosEfectivo: arqueo.pagosEfectivo,
            pagosTarjeta: arqueo.pagosTarjeta,
            textoEfectivo: moneda(arqueo.pagosEfectivo),
            textoTarjeta: moneda(arqueo.pagosTarjeta),
            urlArqueo: urlDetalleArqueo(arqueo.id),
            urlMaestro: urlMaestroArqueos(),
        };
    };
