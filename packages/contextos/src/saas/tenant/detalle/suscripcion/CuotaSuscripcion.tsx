import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { formatearImporte } from "../../../comun/dominio.js";
import { Cuota, LineaCuota } from "../../suscripcion/diseño.js";
import { etiquetaPeriodicidad } from "../../suscripcion/dominio.js";

const metaTablaCuota: MetaTabla<LineaCuota> = [
    { id: "concepto", cabecera: "Concepto" },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
    { id: "precioUnitario", cabecera: "Precio unitario", render: (l) => formatearImporte(l.precioUnitario) },
    { id: "importe", cabecera: "Importe", render: (l) => formatearImporte(l.importe) },
];

/** Líneas de una cuota con base, descuento y total (importes como los da la API, con formato de moneda). */
export const CuotaSuscripcion = ({ titulo, cuota }: { titulo: string; cuota: Cuota }) => (
    <div className="CuotaSuscripcion">
        <h4>{titulo} ({etiquetaPeriodicidad[cuota.periodicidad]})</h4>
        <QTabla<LineaCuota>
            metaTabla={metaTablaCuota}
            datos={cuota.lineas}
            totalEntidades={cuota.lineas.length}
            cargando={false}
            orden={[]}
        />
        <dl className="totales-cuota">
            <dt>Base</dt><dd>{formatearImporte(cuota.base)}</dd>
            <dt>Descuento</dt><dd>{formatearImporte(cuota.descuento)}</dd>
            <dt>Total (sin IVA)</dt><dd><strong>{formatearImporte(cuota.total)}</strong></dd>
        </dl>
    </div>
);
