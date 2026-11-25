export type CategoriaModulo = "contexto" | "plugin" | "servicio";

/**
 * Iconos (QIcono) de los módulos y límites del catálogo SaaS. Los usan el backoffice
 * (rejillas del plan) y la app de las empresas («Módulos disponibles», suscripción).
 */

const ICONO_MODULO: Record<string, string> = {
    ventas: "menu_ventas",
    compras: "menu_compras",
    almacen: "menu_almacen",
    tesoreria: "menu_tesoreria",
    contabilidad: "menu_contabilidad",
    crm: "menu_crm",
    tpv: "menu_tpv",
    rrhh: "menu_rrhh",
    documental: "carpeta",
    proyectos: "menu_proyectos",
    analisis: "tabla",
    tienda_online: "tienda",
    ia: "asistente",
    predicciones: "menu_predicciones",
    mcp: "enlace",
    multiempresa_api: "menu_empresa",
    agencia_transporte: "paquete_export",
    asignacion_reservas_stock: "paquete",
    banca: "tarjeta",
    centro_coste: "menu_grupo",
    dto_cabecera_venta: "etiqueta_compra",
    facturas_impor: "paquete_import",
    iva_incluido: "menu_fiscalidad",
    modelo_303: "menu_fiscalidad",
    modelo_340: "menu_fiscalidad",
    modelo_349: "menu_fiscalidad",
    multi_barcode: "codigo_barras",
    nomina: "usuarios",
    num_linea: "lista",
    partidas_facturacion: "lista_detalle",
    portes: "paquete_export",
    presupuesto_parcial: "checkdoble",
    produccion: "llave_inglesa",
    pub_factura: "subir",
    remesa_pago: "tarjeta",
    renumerar_asientos: "menu_contabilidad",
    sga: "menu_almacen",
    textos_lopd: "candado",
    trazabilidad: "codigo_barras",
};

const ICONO_CATEGORIA: Record<CategoriaModulo, string> = {
    contexto: "paquete",
    plugin: "llave_inglesa",
    servicio: "enlace",
};

/** Icono del módulo; los que no tienen uno propio usan el de su categoría. */
export const iconoModulo = (modulo: { id: string; categoria?: CategoriaModulo }): string =>
    ICONO_MODULO[modulo.id] ?? ICONO_CATEGORIA[modulo.categoria ?? "contexto"];

const ICONO_LIMITE: Record<string, string> = {
    usuarios: "usuarios",
    puntos_tpv: "menu_tpv",
    sociedades: "menu_empresa",
    consultas_ia: "asistente",
    llamadas_mcp: "enlace",
};

export const iconoLimite = (limite: { id: string; tipo: string }): string =>
    ICONO_LIMITE[limite.id] ?? (limite.tipo === "consumo_mensual" ? "grafico_barras" : "lista");
