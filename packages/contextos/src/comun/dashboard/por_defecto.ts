import { ComponenteDashboard, ConsultaComponente, TipoComponente } from "./diseño.ts";

/**
 * Dashboards por defecto: la Inicio y uno por módulo. Viven en código (no en la base
 * de datos): el usuario ve el de por defecto hasta que guarda su versión (`clave`).
 * Cada consulta se valida en el servidor al guardar; los tests lo comprueban con las
 * mismas reglas de forma.
 *
 * Alturas en medias filas (`ALTO_FILA_DASHBOARD`): tarjeta h=2 (88 px, como los widgets del maestro).
 */
export type DashboardPorDefecto = {
  nombre: string;
  componentes: ComponenteDashboard[];
};

const PENDIENTES_SERVIR = [{ campo: "servido", operador: "in", valor: ["No", "Parcial"] }];
const PENDIENTES_RECIBIR = [{ campo: "recibido", operador: "in", valor: ["No", "Parcial"] }];
const RECIBOS_PENDIENTES = [
  { campo: "estado_recibo", operador: "in", valor: ["Emitido", "Devuelto"] },
];

const componente = (
  id: string,
  tipo: TipoComponente,
  titulo: string,
  [x, y, w, h]: [number, number, number, number],
  consulta: ConsultaComponente
): ComponenteDashboard => ({ id, tipo, titulo, x, y, w, h, consultas: [consulta], opciones: {} });

const facturadoMes = (recurso: string, titulo: string, x: number) =>
  componente("facturado_mes", "tarjeta", titulo, [x, 0, 3, 2], {
    recurso,
    metricas: "suma:total",
    periodo: "fecha:este_mes",
    comparar: "año_anterior",
  });

const evolucionMensual = (recurso: string, titulo: string, medida = "total", fecha = "fecha") =>
  componente("evolucion", "temporal", titulo, [0, 2, 8, 8], {
    recurso,
    metricas: `suma:${medida}`,
    agrupar: `${fecha}:mes`,
    periodo: `${fecha}:ultimos_12_meses`,
    comparar: "año_anterior",
    limite: 100,
  });

const mapaVentas = (y: number) =>
  componente("mapa_ventas", "mapa", "Ventas y clientes del año por provincia", [0, y, 12, 12], {
    recurso: "ventas.factura",
    metricas: "suma:total,conteo_distinto:cliente",
    agrupar: "provincia",
    periodo: "fecha:este_año",
    limite: 100,
  });

const recibosPendientes = (recurso: string, titulo: string, x: number) =>
  componente(`${recurso.split(".")[1]}_pendientes`, "tarjeta", titulo, [x, 0, 3, 2], {
    recurso,
    metricas: "suma:importe",
    filtros: RECIBOS_PENDIENTES,
  });

export const DASHBOARDS_POR_DEFECTO: Record<string, DashboardPorDefecto> = {
  inicio: {
    nombre: "Inicio",
    componentes: [
      facturadoMes("ventas.factura", "Facturado este mes", 0),
      componente("pedidos_pendientes", "tarjeta", "Pedidos pendientes de servir", [3, 0, 3, 2], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_SERVIR,
      }),
      recibosPendientes("tesoreria.recibo_cobro", "Cobros pendientes", 6),
      recibosPendientes("tesoreria.recibo_pago", "Pagos pendientes", 9),
      evolucionMensual("ventas.factura", "Facturación mensual"),
      componente("pedidos_estado", "circular", "Pedidos del año por estado", [8, 2, 4, 8], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        agrupar: "servido",
        periodo: "fecha:este_año",
        limite: 10,
      }),
      componente("top_clientes", "ranking", "Mejores clientes del año", [0, 10, 6, 8], {
        recurso: "ventas.factura",
        metricas: "suma:total",
        agrupar: "cliente",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("cobros_antiguos", "tabla", "Cobros pendientes más antiguos", [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_cobro",
        columnas: "recibo,nombre_cliente,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
      mapaVentas(18),
    ],
  },

  ventas: {
    nombre: "Ventas",
    componentes: [
      facturadoMes("ventas.factura", "Facturado este mes", 0),
      componente("ticket_medio", "tarjeta", "Factura media del año", [3, 0, 3, 2], {
        recurso: "ventas.factura",
        metricas: "promedio:total",
        periodo: "fecha:este_año",
        comparar: "año_anterior",
      }),
      componente("presupuestos_mes", "tarjeta", "Presupuestos este mes", [6, 0, 3, 2], {
        recurso: "ventas.presupuesto",
        metricas: "conteo",
        periodo: "fecha:este_mes",
        comparar: "año_anterior",
      }),
      componente("pedidos_pendientes", "tarjeta", "Pedidos pendientes de servir", [9, 0, 3, 2], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_SERVIR,
      }),
      evolucionMensual("ventas.factura", "Facturación mensual"),
      componente("por_agente", "circular", "Facturado por agente este año", [8, 2, 4, 8], {
        recurso: "ventas.factura",
        metricas: "suma:total",
        agrupar: "agente",
        periodo: "fecha:este_año",
        limite: 20,
      }),
      componente("top_articulos", "ranking", "Artículos más vendidos del año", [0, 10, 6, 8], {
        recurso: "ventas.factura.linea",
        metricas: "suma:importe",
        agrupar: "articulo",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("pedidos_por_servir", "tabla", "Pedidos pendientes de servir", [6, 10, 6, 8], {
        recurso: "ventas.pedido",
        columnas: "pedido,nombre_cliente,fecha,total",
        filtros: PENDIENTES_SERVIR,
        orden: "fecha:asc",
        limite: 8,
      }),
      mapaVentas(18),
    ],
  },

  compras: {
    nombre: "Compras",
    componentes: [
      facturadoMes("compras.factura", "Compras este mes", 0),
      componente("pedidos_pendientes", "tarjeta", "Pedidos pendientes de recibir", [3, 0, 3, 2], {
        recurso: "compras.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_RECIBIR,
      }),
      recibosPendientes("tesoreria.recibo_pago", "Pagos pendientes", 6),
      componente("albaranes_sin_facturar", "tarjeta", "Albaranes sin facturar", [9, 0, 3, 2], {
        recurso: "compras.albaran",
        metricas: "suma:total",
        filtros: [{ campo: "facturado", operador: "=", valor: false }],
      }),
      evolucionMensual("compras.factura", "Compras por mes"),
      {
        ...componente("ciclo_compra", "embudo", "Ciclo de compra del año", [8, 2, 4, 8], {
          recurso: "compras.pedido",
          metricas: "suma:total",
          periodo: "fecha:este_año",
        }),
        consultas: ["compras.pedido", "compras.albaran", "compras.factura"].map((recurso) => ({
          recurso,
          metricas: "suma:total",
          periodo: "fecha:este_año",
        })),
        opciones: { circuito: "compras", formato: "moneda" },
      },
      componente("top_proveedores", "ranking", "Principales proveedores del año", [0, 10, 6, 8], {
        recurso: "compras.factura",
        metricas: "suma:total",
        agrupar: "proveedor",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("pagos_antiguos", "tabla", "Pagos pendientes más antiguos", [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_pago",
        columnas: "recibo,nombre_proveedor,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
    ],
  },

  almacen: {
    nombre: "Almacén",
    componentes: [
      componente("unidades", "tarjeta", "Unidades en stock", [0, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
      }),
      componente("reservadas", "tarjeta", "Unidades reservadas", [3, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:reservada",
      }),
      componente("pendientes", "tarjeta", "Pendientes de recibir", [6, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:pendiente_recibir",
      }),
      componente("sin_disponible", "tarjeta", "Artículos sin disponible", [9, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "conteo",
        filtros: [{ campo: "disponible", operador: "<=", valor: 0 }],
      }),
      componente("por_almacen", "barras", "Stock por almacén", [0, 2, 6, 8], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
        agrupar: "almacen",
        limite: 20,
      }),
      componente("por_familia", "ranking", "Stock por familia", [6, 2, 6, 8], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
        agrupar: "familia",
        limite: 10,
      }),
      componente("agotados", "tabla", "Artículos sin disponible", [0, 10, 12, 8], {
        recurso: "almacen.stock",
        columnas: "articulo,descripcion_articulo,almacen,disponible,pendiente_recibir",
        filtros: [{ campo: "disponible", operador: "<=", valor: 0 }],
        orden: "disponible:asc",
        limite: 10,
      }),
    ],
  },

  tesoreria: {
    nombre: "Tesorería",
    componentes: [
      recibosPendientes("tesoreria.recibo_cobro", "Cobros pendientes", 0),
      recibosPendientes("tesoreria.recibo_pago", "Pagos pendientes", 3),
      componente("cobrado_mes", "tarjeta", "Cobrado este mes", [6, 0, 3, 2], {
        recurso: "tesoreria.recibo_cobro",
        metricas: "suma:importe",
        periodo: "fecha_pago:este_mes",
        comparar: "año_anterior",
      }),
      componente("pagado_mes", "tarjeta", "Pagado este mes", [9, 0, 3, 2], {
        recurso: "tesoreria.recibo_pago",
        metricas: "suma:importe",
        periodo: "fecha_pago:este_mes",
        comparar: "año_anterior",
      }),
      evolucionMensual("tesoreria.recibo_cobro", "Cobros por mes", "importe", "fecha_pago"),
      componente("cobros_estado", "circular", "Recibos de cobro por estado", [8, 2, 4, 8], {
        recurso: "tesoreria.recibo_cobro",
        metricas: "suma:importe",
        agrupar: "estado_recibo",
        periodo: "fecha_emision:este_año",
        limite: 10,
      }),
      componente("cobros_antiguos", "tabla", "Cobros pendientes más antiguos", [0, 10, 6, 8], {
        recurso: "tesoreria.recibo_cobro",
        columnas: "recibo,nombre_cliente,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
      componente("pagos_antiguos", "tabla", "Pagos pendientes más antiguos", [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_pago",
        columnas: "recibo,nombre_proveedor,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
    ],
  },

  crm: {
    nombre: "CRM",
    componentes: [
      componente("oportunidades", "tarjeta", "Oportunidades", [0, 0, 3, 2], {
        recurso: "crm.oportunidad_venta",
        metricas: "conteo",
      }),
      componente("importe_oportunidades", "tarjeta", "Importe en oportunidades", [3, 0, 3, 2], {
        recurso: "crm.oportunidad_venta",
        metricas: "suma:total_venta",
      }),
      componente("leads", "tarjeta", "Leads", [6, 0, 3, 2], {
        recurso: "crm.lead",
        metricas: "conteo",
      }),
      componente("incidencias", "tarjeta", "Incidencias este mes", [9, 0, 3, 2], {
        recurso: "crm.incidencia",
        metricas: "conteo",
        periodo: "fecha:este_mes",
        comparar: "periodo_anterior",
      }),
      componente("oportunidades_estado", "circular", "Oportunidades por estado", [0, 2, 4, 8], {
        recurso: "crm.oportunidad_venta",
        metricas: "suma:total_venta",
        agrupar: "estado",
        limite: 10,
      }),
      componente("leads_estado", "barras", "Leads por estado", [4, 2, 4, 8], {
        recurso: "crm.lead",
        metricas: "conteo",
        agrupar: "estado",
        limite: 10,
      }),
      componente("incidencias_prioridad", "barras", "Incidencias por prioridad", [8, 2, 4, 8], {
        recurso: "crm.incidencia",
        metricas: "conteo",
        agrupar: "prioridad",
        limite: 10,
      }),
      componente("acciones_mes", "temporal", "Acciones comerciales por mes", [0, 10, 12, 8], {
        recurso: "crm.accion",
        metricas: "conteo",
        agrupar: "fecha:mes",
        periodo: "fecha:ultimos_12_meses",
        comparar: "año_anterior",
        limite: 100,
      }),
    ],
  },
};

export const CLAVES_MODULO = ["ventas", "compras", "almacen", "tesoreria", "crm"] as const;
