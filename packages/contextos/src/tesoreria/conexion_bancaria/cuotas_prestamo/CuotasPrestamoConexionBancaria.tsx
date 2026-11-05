import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { AmortizacionPrestamo, PrestamoBancario } from "../diseño.js";

const SIN_ORDEN = ["", ""];

/** Cuotas cobradas y programadas del préstamo, tal como las reporta el banco. */
export const CuotasPrestamoConexionBancaria = ({
    prestamo,
    publicar,
}: {
    prestamo: PrestamoBancario;
    publicar: EmitirEvento;
}) => {
    const divisa = prestamo.divisa ?? "EUR";
    const metaTabla: MetaTabla<AmortizacionPrestamo> = [
        { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
        { id: "capital", cabecera: "Capital", render: (a) => formatearMoneda(a.capital, divisa) },
        { id: "intereses", cabecera: "Intereses", render: (a) => formatearMoneda(a.intereses, divisa) },
        { id: "total", cabecera: "Total", render: (a) => formatearMoneda(a.total, divisa) },
        {
            id: "capitalPendiente",
            cabecera: "Capital pendiente",
            render: (a) => (a.capitalPendiente !== null ? formatearMoneda(a.capitalPendiente, divisa) : "-"),
        },
        {
            id: "asientoId",
            cabecera: "Estado",
            render: (a) => (a.programada
                ? <QEtiqueta variante="gris">Programada</QEtiqueta>
                : a.asientoId !== null
                    ? <QEtiqueta variante="exito">Contabilizada</QEtiqueta>
                    : <QEtiqueta variante="advertencia">Sin contabilizar</QEtiqueta>),
        },
    ];

    return (
        <QModal abierto={true} nombre="cuotasPrestamoConexionBancaria"
            titulo={`Cuotas del préstamo ${prestamo.contrato ?? prestamo.nombre}`}
            onCerrar={() => publicar("cuotas_prestamo_cerradas")}>
            <QTabla<AmortizacionPrestamo>
                metaTabla={metaTabla}
                datos={prestamo.amortizaciones}
                cargando={false}
                orden={SIN_ORDEN}
            />
        </QModal>
    );
};
