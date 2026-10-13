import { ClausulaFiltro, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { construirUrlConFiltro } from "#/crm/widgets/comun.ts";
import { getPedidos } from "#/ventas/pedido/infraestructura.ts";

export type EstadoCargaWidget = "cargando" | "listo";

export type ModeloWidgetPedidosPendientes = {
    estado: EstadoCargaWidget;
    totalPendientes: number;
    urlVer: string;
};

const RUTA_PEDIDOS = "/ventas/pedido";
const PAGINACION_CONTEO: Paginacion = { pagina: 1, limite: 1 };
const ORDEN_DEFECTO: Orden = ["fecha", "DESC"] as unknown as Orden;

/** Pedidos aún pendientes o parcialmente servidos (excluye servido total). */
export const filtroPedidosPendientesServir = (): ClausulaFiltro[] => [
    ["servido", "!in", "Sí,TOTAL,SERVIDO"] as unknown as ClausulaFiltro,
];

export const filtroApiPedidosPendientes = (): Filtro =>
    filtroPedidosPendientesServir() as unknown as Filtro;

export const urlListadoPedidosPendientes = (): string =>
    construirUrlConFiltro(RUTA_PEDIDOS, filtroPedidosPendientesServir(), {
        orden: ORDEN_DEFECTO,
    });

export const modeloWidgetPedidosPendientesInicial: ModeloWidgetPedidosPendientes =
    {
        estado: "cargando",
        totalPendientes: 0,
        urlVer: RUTA_PEDIDOS,
    };

export const cargarModeloWidgetPedidosPendientes =
    async (): Promise<ModeloWidgetPedidosPendientes> => {
        const filtro = filtroApiPedidosPendientes();
        const { total } = await getPedidos(
            filtro,
            ORDEN_DEFECTO,
            PAGINACION_CONTEO
        );

        return {
            estado: "listo",
            totalPendientes: total,
            urlVer: urlListadoPedidosPendientes(),
        };
    };
