import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearImporte } from "../../../comun/dominio.js";
import { FacturaSuscripcion } from "../../suscripcion/diseño.js";
import { facturaPendiente, varianteEstadoFactura } from "../../suscripcion/dominio.js";

const getMetaTabla = (publicar: EmitirEvento): MetaTabla<FacturaSuscripcion> => [
    { id: "concepto", cabecera: "Concepto" },
    { id: "periodoDesde", cabecera: "Desde", tipo: "fecha" },
    { id: "periodoHasta", cabecera: "Hasta", tipo: "fecha" },
    { id: "total", cabecera: "Total", render: (f) => formatearImporte(f.total) },
    {
        id: "estado",
        cabecera: "Estado",
        render: (f) => <QEtiqueta variante={varianteEstadoFactura(f.estado)}>{f.estado}</QEtiqueta>,
    },
    {
        id: "acciones",
        cabecera: "",
        render: (f) => facturaPendiente(f) ? (
            <>
                <QBoton tamaño="pequeño" variante="borde"
                    onClick={() => publicar("estado_factura_solicitado", { id: f.id, estado: "pagada" })}>
                    Marcar pagada
                </QBoton>
                <QBoton tamaño="pequeño" variante="borde" destructivo
                    onClick={() => publicar("estado_factura_solicitado", { id: f.id, estado: "devuelta" })}>
                    Devuelta
                </QBoton>
            </>
        ) : (f.error ?? ""),
    },
];

export const FacturasSuscripcion = ({
    facturas,
    publicar,
}: {
    facturas: FacturaSuscripcion[];
    publicar: EmitirEvento;
}) => (
    <div className="FacturasSuscripcion">
        <h4>Facturas</h4>
        {facturas.length === 0
            ? <p>Sin facturas.</p>
            : (
                <QTabla<FacturaSuscripcion>
                    metaTabla={getMetaTabla(publicar)}
                    datos={facturas}
                    totalEntidades={facturas.length}
                    cargando={false}
                    orden={[]}
                />
            )}
    </div>
);
