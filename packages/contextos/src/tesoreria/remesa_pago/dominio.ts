import { RemesaPago } from "./diseño.ts";

/** Formatos soportados por `GET …/export_fichero` (plugin `norma34_remesa_pago`). */
export type FormatoExportFicheroRemesaPago =
    | "csb34_sepa_txt"
    | "csb34_sepa_xml"
    | "csb34_clasico_txt";

export const FORMATO_EXPORT_FICHERO_REMESA_PAGO: FormatoExportFicheroRemesaPago =
    "csb34_sepa_txt";

export const FORMATOS_EXPORT_FICHERO_REMESA_PAGO: {
    formato: FormatoExportFicheroRemesaPago;
    etiqueta: string;
    extension: string;
}[] = [
    { formato: "csb34_sepa_txt", etiqueta: "SEPA texto", extension: "txt" },
    { formato: "csb34_sepa_xml", etiqueta: "SEPA XML", extension: "xml" },
    { formato: "csb34_clasico_txt", etiqueta: "Norma 34 clásico", extension: "txt" },
];

const ESTADOS_REMESA_EXPORT_FICHERO = new Set(["emitida", "pagada"]);

/** Visible si la remesa está Emitida o Pagada (estados de dominio backend). */
export const remesaPagoPuedeExportFicheroBanco = (remesa: RemesaPago): boolean =>
    !!remesa.id &&
    ESTADOS_REMESA_EXPORT_FICHERO.has(remesa.estado.trim().toLowerCase());

/** Mismo criterio que `nombre_fichero_sugerido` en el plugin norma34. */
export const nombreFicheroExportFicheroRemesaPago = (
    remesa: Pick<RemesaPago, "id">,
    hoy: Date = new Date(),
    extension = "txt",
): string => {
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, "0");
    const d = String(hoy.getDate()).padStart(2, "0");
    return `${y}${m}${d}_${remesa.id}.${extension}`;
};

export const remesaPagoConPago = (remesa: RemesaPago): boolean => remesa.pagos.length > 0;

export const remesaPagoPagable = (remesa: RemesaPago): boolean =>
    !!remesa.id && !remesaPagoConPago(remesa);

/** Remesa emitida sin pago de cabecera: admite asociar y excluir recibos. */
export const remesaPagoRecibosEditable = (remesa: RemesaPago): boolean =>
    remesaPagoPagable(remesa) &&
    remesa.estado.trim().toLowerCase() === "emitida";

export const puedeExcluirReciboDeRemesaPago = (
    remesa: RemesaPago,
    reciboId: string
): boolean =>
    remesaPagoRecibosEditable(remesa) &&
    remesa.recibos.length > 1 &&
    remesa.recibos.some((recibo) => recibo.id === reciboId);
