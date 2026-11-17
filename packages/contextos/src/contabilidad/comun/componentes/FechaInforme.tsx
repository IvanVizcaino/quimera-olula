import { QDate, QDateProps } from "@olula/componentes/atomos/qdate.tsx";

/**
 * Fecha de los criterios de un informe contable. El modelo la guarda como
 * texto ISO (aaaa-mm-dd), así que `uiProps` la marca como «texto» y, al
 * esparcirse, convertía el QDate en un cuadro de texto que enseñaba
 * «2026-01-01». Aquí se fuerza el control de fecha, que el navegador enseña
 * como dd/mm/aaaa igual que el resto de fechas de la aplicación; el valor
 * sigue siendo el mismo texto ISO.
 */
export const FechaInforme = (props: QDateProps) => (
    <QDate {...props} opcional tipo="fecha" />
);
