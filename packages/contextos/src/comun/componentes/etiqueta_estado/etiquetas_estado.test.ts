import { etiquetaEstadoAlbaran as etiquetaAlbaranCompra } from "#/compras/albaran/dominio.ts";
import { Albaran as AlbaranCompra } from "#/compras/albaran/diseño.ts";
import { etiquetaEstadoFactura as etiquetaFacturaCompra } from "#/compras/factura/dominio.ts";
import { Factura as FacturaCompra } from "#/compras/factura/diseño.ts";
import { etiquetaEstadoPedido as etiquetaPedidoCompra } from "#/compras/pedido/dominio.ts";
import { Pedido as PedidoCompra } from "#/compras/pedido/diseño.ts";
import { etiquetaEstadoAlbaran } from "#/ventas/albaran/dominio.ts";
import { etiquetaEstadoFactura } from "#/ventas/factura/dominio.ts";
import { Factura } from "#/ventas/factura/diseño.ts";
import { etiquetaEstadoPedido } from "#/ventas/pedido/maestro/maestro.ts";
import { etiquetaEstadoPresupuesto } from "#/ventas/presupuesto/dominio.ts";
import { Presupuesto } from "#/ventas/presupuesto/diseño.ts";

describe("etiquetas de estado de documentos", () => {
  test("presupuesto de venta: pendiente o aprobado", () => {
    const presupuesto = (estado_aprobado: string) =>
      ({ estado_aprobado }) as unknown as Presupuesto;

    expect(etiquetaEstadoPresupuesto(presupuesto("No"))).toEqual({
      texto: "Pendiente",
      tono: "pendiente",
    });
    expect(etiquetaEstadoPresupuesto(presupuesto("TOTAL"))).toEqual({
      texto: "Aprobado",
      tono: "completado",
    });
  });

  test("pedido de venta: según lo servido", () => {
    expect(etiquetaEstadoPedido({ servido: "No" })).toEqual({
      texto: "Pendiente",
      tono: "pendiente",
    });
    expect(etiquetaEstadoPedido({ servido: "Parcial" }).tono).toBe("parcial");
    expect(etiquetaEstadoPedido({ servido: "Total" })).toEqual({
      texto: "Servido",
      tono: "completado",
    });
  });

  test("albarán de venta: pendiente o facturado", () => {
    expect(etiquetaEstadoAlbaran({ facturado: false }).texto).toBe("Pendiente");
    expect(etiquetaEstadoAlbaran({ facturado: true })).toEqual({
      texto: "Facturado",
      tono: "completado",
    });
  });

  test("factura de venta: borrador en gris, error de firma en rojo", () => {
    const factura = (estadoExpedicion: string) =>
      ({ estadoExpedicion }) as unknown as Factura;

    expect(etiquetaEstadoFactura(factura("BORRADOR"))).toEqual({
      texto: "Borrador",
      tono: "borrador",
    });
    // Sin plugin de expedición la emitida ya no se toca: completada
    expect(etiquetaEstadoFactura(factura("EMITIDA"))).toEqual({
      texto: "Emitida",
      tono: "completado",
    });
    expect(etiquetaEstadoFactura(factura("ERROR_FIRMA")).tono).toBe("error");
  });

  test("pedido de compra: según lo recibido", () => {
    const pedido = (recibido: string | null) =>
      ({ recibido }) as unknown as PedidoCompra;

    expect(etiquetaPedidoCompra(pedido(null)).texto).toBe("Pendiente");
    expect(etiquetaPedidoCompra(pedido("Parcial")).tono).toBe("parcial");
    expect(etiquetaPedidoCompra(pedido("Sí"))).toEqual({
      texto: "Recibido",
      tono: "completado",
    });
  });

  test("albarán de compra: facturado si tiene factura", () => {
    const albaran = (facturaId: string | null) =>
      ({ facturaId }) as unknown as AlbaranCompra;

    expect(etiquetaAlbaranCompra(albaran(null)).tono).toBe("pendiente");
    expect(etiquetaAlbaranCompra(albaran("F1")).texto).toBe("Facturado");
  });

  test("factura de compra: borrador o registrada", () => {
    const factura = (estadoExpedicion: string) =>
      ({ estadoExpedicion }) as unknown as FacturaCompra;

    expect(etiquetaFacturaCompra(factura("BORRADOR")).tono).toBe("borrador");
    expect(etiquetaFacturaCompra(factura("REGISTRADA"))).toEqual({
      texto: "Registrada",
      tono: "completado",
    });
  });
});
