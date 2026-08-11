import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroStock, EstadoMaestroStock } from "./diseño.ts";
import { ampliarStocks, recargarStocks, Stocks } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroStock, ContextoMaestroStock> = () => {
    return {
        INICIAL: {
            stock_seleccionado: [Stocks.activar],
            stock_deseleccionado: [Stocks.desactivar],

            stock_cambiado: [Stocks.cambiar],

            recarga_de_stocks_solicitada: recargarStocks,

            criteria_cambiado: [Stocks.filtrar, recargarStocks],

            siguiente_pagina: [Stocks.filtrar, ampliarStocks],
        },
    };
};
