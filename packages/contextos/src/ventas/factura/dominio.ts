import { MetaTabla } from "@olula/componentes/index.js";
import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import {
    cambioClienteVentaVacio,
    clienteVentaVacio,
    nuevaVentaVacia,
    ventaVacia
} from "../venta/dominio.ts";
import {
    CambioClienteFactura,
    EstadoExpedicion,
    Factura,
    NuevaFactura
} from "./diseño.ts";

/**
 * Estados que puede mandar el servidor, ya normalizados (mayúsculas y guiones
 * bajos). "Pte. Firma" se colapsa en EMITIDA: una factura pendiente de firma se
 * comporta igual que una emitida.
 */
const ESTADOS_EXPEDICION: Record<string, EstadoExpedicion> = {
    BORRADOR: "BORRADOR",
    EMITIDA: "EMITIDA",
    PTE_FIRMA: "EMITIDA",
    PENDIENTE_FIRMA: "EMITIDA",
    FIRMADA: "FIRMADA",
    FIRMADO: "FIRMADA",
    ERROR_FIRMA: "ERROR_FIRMA",
    PRE_VERIFACTU: "PRE_VERIFACTU",
};

export const estadoExpedicionDesdeApi = (valor: string | null | undefined): EstadoExpedicion => {
    const clave = (valor ?? "").trim().toUpperCase().replace(/[\s.-]+/g, "_");
    return ESTADOS_EXPEDICION[clave] ?? "";
};

export const descripcionEstadoExpedicion: Record<EstadoExpedicion, string> = {
    "": "Sin expedir",
    BORRADOR: "Borrador",
    EMITIDA: "Emitida",
    FIRMADA: "Firmada",
    ERROR_FIRMA: "Error de firma",
    PRE_VERIFACTU: "Pre Verifactu",
};

/**
 * Con el plugin de expedición activo la firma es la que cierra la factura, no
 * la emisión.
 *
 * En el paquete común solo vale la variante "activo", que el backend no manda
 * hoy (manda "basico", "firma", "inactivo" o "NoConfigurado"): para todas las
 * apps el efecto es el de siempre, solo el borrador es editable. La regla
 * "editable hasta firmada" para la variante "firma" es cosa de cada app y se
 * inyecta con `factura_reglaEditable` en la factoría de Ventas (ver
 * `reglaEditableHastaFirmada` y apps/crema_cafe).
 */
export const conPluginExpedicion = (): boolean =>
    pluginActivo("estado_expedicion_factura", "activo");

export type ReglaFacturaEditable = (factura: Factura) => boolean;

/**
 * Sin plugin solo se edita el borrador. Con plugin una factura emitida (o con
 * error de firma) sigue siendo editable y solo la firmada queda bloqueada.
 */
export const reglaEditableBase: ReglaFacturaEditable = (factura) => {
    if (!factura.estadoExpedicion) return false;
    if (factura.estadoExpedicion === "BORRADOR") return true;

    return conPluginExpedicion() && factura.estadoExpedicion !== "FIRMADA";
};

/**
 * Regla para apps cuyo plugin de expedición es la variante "firma": una
 * emitida (o con error de firma) se edita hasta que se firma. Si el backend no
 * manda el plugin o manda otra variante se cae a la regla base (fallback).
 */
export const reglaEditableHastaFirmada: ReglaFacturaEditable = (factura) => {
    if (pluginActivo("estado_expedicion_factura", ["firma", "activo"])) {
        if (!factura.estadoExpedicion) return false;
        return factura.estadoExpedicion !== "FIRMADA";
    }
    return reglaEditableBase(factura);
};

export const facturaEditable = (factura: Factura): boolean => {
    const regla = FactoryObj.app.Ventas?.factura_reglaEditable as
        | ReglaFacturaEditable
        | undefined;
    return (regla ?? reglaEditableBase)(factura);
};

/**
 * Se emite el borrador y se reintenta la emisión de lo que falló al firmar; el
 * resto de estados ya están emitidos.
 */
export const facturaEmitible = (factura: Factura): boolean =>
    factura.estadoExpedicion === "BORRADOR" ||
    factura.estadoExpedicion === "ERROR_FIRMA";

/** Un reintento tras un error de firma, no una primera emisión. */
export const emisionEsReintento = (factura: Factura): boolean =>
    factura.estadoExpedicion === "ERROR_FIRMA";

// La columna de estado la añade el maestro, que es quien pinta el círculo.
export const metaTablaFactura: MetaTabla<Factura> = conColumnaImpreso([
    {
        id: "codigo",
        cabecera: "Código",
        prioridad: "alta",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        prioridad: "alta",
        render: (f) => f.cliente.nombre_cliente,
    },
    {
        id: "fecha",
        cabecera: "Fecha",
        tipo: "fecha",
        prioridad: "alta",
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
        prioridad: "alta",
        divisa: (factura) => factura.divisa_id,
    },
    {
        id: "nombre_agente",
        cabecera: "Agente",
        prioridad: "baja",
    },
    {
        id: "almacen_id",
        cabecera: "Almacén",
        prioridad: "baja",
        render: (f) => f.nombre_almacen || f.almacen_id,
    },
]);

export const facturaVacia = (): Factura => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    editable: false,
    por_comision: 0,
    estadoExpedicion: "",
});

export const nuevaFacturaVacia: NuevaFactura = nuevaVentaVacia;

export const cambioClienteFacturaVacio: CambioClienteFactura = cambioClienteVentaVacio;

