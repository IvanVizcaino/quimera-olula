import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { cambioClienteVentaVacio, clienteVentaVacio, ventaVacia } from "../venta/dominio.ts";
import { CambioClientePedido, Pedido } from "./diseño.ts";

export const metaTablaPedido: MetaTabla<Pedido> = conColumnaImpreso([
    {
        id: "codigo",
        cabecera: "Código",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        render: (p) => p.cliente.nombre_cliente,
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
        divisa: (pedido) => pedido.divisa_id,
    },
]);


export const pedidoVacio = (): Pedido => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    servido: 'No',
    por_comision: 0,
    fecha_salida: null,
    almacen_id: '',
    nombre_almacen: '',
    lineas: [],
});

export const cambioClientePedidoVacio: CambioClientePedido = cambioClienteVentaVacio;

export const cambioCliente = (pedido: Pedido): CambioClientePedido => ({
    cliente_id: pedido.cliente.cliente_id ?? "",
    direccion_id: pedido.cliente.direccion_id ?? "",
});

/** El detalle devuelve `TOTAL`; el listado, el literal de BD (`Sí`). */
export const pedidoServidoTotal = (pedido: { servido?: string }): boolean => {
    const servido = pedido.servido?.toUpperCase();
    return servido === 'TOTAL' || servido === 'SERVIDO' || servido === 'SÍ' || servido === 'SI';
};

export const pedidoEsEditable = (pedido: { servido?: string }): boolean =>
    !pedidoServidoTotal(pedido);

export type ModoCierrePedido = 'cerrar' | 'abrir';

/**
 * Eneboo `abrirCerrarPedido`: con líneas cerradas se ofrece abrirlas; si no,
 * se cierra salvo que el pedido ya esté servido completamente (no editable).
 */
export const modoCierrePedido = (
    pedido: { servido?: string; lineas: { cerrada?: boolean }[] }
): ModoCierrePedido | null => {
    if (pedido.lineas.some((linea) => linea.cerrada)) return 'abrir';
    return pedidoEsEditable(pedido) ? 'cerrar' : null;
};

export const mensajeCierrePedido = (modo: ModoCierrePedido): string =>
    modo === 'abrir'
        ? 'El pedido seleccionado tiene líneas cerradas.\n¿Seguro que desea abrirlas?'
        : 'Se va a cerrar el pedido y no podrá terminar de servirse.\n¿Desea continuar?';


