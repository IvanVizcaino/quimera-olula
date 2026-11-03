import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { StockItem } from "../diseño.ts";

export type EstadoMaestroStock = "INICIAL";

export type ContextoMaestroStock = {
    estado: EstadoMaestroStock;
    stocks: ListaActivaEntidades<StockItem>;
};

const formatearNumero = (valor: number) => valor?.toLocaleString("es-ES") ?? "";

export const metaTablaStock: MetaTabla<StockItem> = [
    {
        id: "articulo",
        cabecera: "Artículo",
        render: (s) => [s.articulo, s.articuloId].filter(Boolean).join(" - "),
    },
    { id: "almacen", cabecera: "Almacén" },
    {
        id: "cantidad_fisica",
        cabecera: "Cantidad física",
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadFisica),
    },
    {
        id: "cantidad_disponible",
        cabecera: "Disponible",
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadDisponible),
    },
    {
        id: "cantidad_reservada",
        cabecera: "Reservada",
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadReservada),
    },
    {
        id: "cantidad_pendiente",
        cabecera: "Por recibir",
        tipo: "numero",
        render: (s) => formatearNumero(s.cantidadPendiente),
    },
];
