import { ActualizarArticulosProveedor, ConfigCompras } from "./diseño.ts";

/** El valor por defecto del escritorio (facturac_general.mtd). */
export const configComprasPorDefecto: ConfigCompras = {
    actualizarArticulosProveedor: "No Actualizar",
};

export const opcionesActualizarArticulosProveedor: {
    valor: ActualizarArticulosProveedor;
    descripcion: string;
}[] = [
    { valor: "No Actualizar", descripcion: "No actualizar" },
    { valor: "Albaranes de proveedor", descripcion: "Albaranes de proveedor" },
    { valor: "Facturas de proveedor", descripcion: "Facturas de proveedor" },
];

const EXPLICACION: Record<ActualizarArticulosProveedor, string> = {
    "No Actualizar": "Los artículos de proveedor solo cambian a mano.",
    "Albaranes de proveedor": "Al guardar un albarán de proveedor, cada artículo de sus líneas queda "
        + "como artículo de ese proveedor con el coste y la divisa del albarán (se aplica en segundo plano, "
        + "unos segundos después de guardar).",
    "Facturas de proveedor": "Al guardar una factura de proveedor, cada artículo de sus líneas queda "
        + "como artículo de ese proveedor con el coste y la divisa de la factura (se aplica en segundo plano, "
        + "unos segundos después de guardar).",
};

export const explicacionActualizarArticulosProveedor = (valor: ActualizarArticulosProveedor): string =>
    EXPLICACION[valor];
