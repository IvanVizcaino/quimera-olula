const numeroARomano = (num: string): string => {
    const n = parseInt(num, 10);
    const romanosMap = [
        { valor: 1000, romano: "M" },
        { valor: 900, romano: "CM" },
        { valor: 500, romano: "D" },
        { valor: 400, romano: "CD" },
        { valor: 100, romano: "C" },
        { valor: 90, romano: "XC" },
        { valor: 50, romano: "L" },
        { valor: 40, romano: "XL" },
        { valor: 10, romano: "X" },
        { valor: 9, romano: "IX" },
        { valor: 5, romano: "V" },
        { valor: 4, romano: "IV" },
        { valor: 1, romano: "I" },
    ];

    let resultado = "";
    let numero = n;

    for (const { valor, romano } of romanosMap) {
        while (numero >= valor) {
            resultado += romano;
            numero -= valor;
        }
    }

    return resultado;
};

export const formateaCategoria = (categoria: string) => numeroARomano(categoria)

import { pedidoVacio } from "#/ventas/pedido/detalle/detalle.ts";
import { QIcono } from "@olula/componentes/index.js";
import { PedidoNrj } from "./diseño.ts";





export const formateaEstado = (estado: string) => {
    switch (estado) {
        case "1": return QIcono(
            {
                nombre: "pendiente-nrj", // pendiente // Son de https://www.iconbolt.com
                tamaño: "md",
                color: "var(--color-error-oscuro)",
            });
        case "2": return QIcono(
            {
                nombre: "parcial-nrj",
                tamaño: "md",
                color: "var(--color-advertencia-claro)",
            });
        case "3": return QIcono(
            {
                nombre: "preparado-nrj",
                tamaño: "md",
                color: "var(--color-exito-oscuro)",
            });
        //case "4": return "Para enviar";
        case "4": return QIcono(
            {
                nombre: "para-enviar-nrj",
                tamaño: "md",
                color: "var(--color-error-oscuro)",
            });
        case "5": return QIcono(
            {
                nombre: "enviado-nrj",
                tamaño: "md",
                color: "var(--color-exito-oscuro)",
            });
        /* case "5": return QIcono(
            {
                nombre: "truck",
                tamaño: "md",
                color: "var(--color-exito-oscuro)",
            }); */

    }
}

export const pedidoVacioNrj = (): PedidoNrj => ({
    ...pedidoVacio(),
    portes_cliente: false,
    transportista_id: "",
    estado_envio_palets: "1",
})

