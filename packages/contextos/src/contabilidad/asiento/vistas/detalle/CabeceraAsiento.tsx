import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { Asiento } from "../../diseño.ts";
import "./CabeceraAsiento.css";

export const CabeceraAsiento = ({ asiento }: { asiento: Asiento }) => (
    <div className="CabeceraAsiento">
        <quimera-formulario>
            <QInput label="Ejercicio" nombre="ejercicio" valor={asiento.ejercicioId} soloLectura />
            <QInput label="Número" nombre="numero" valor={String(asiento.numero)} soloLectura />
            <QInput
                label="Fecha"
                nombre="fecha"
                valor={formatearFechaDate(asiento.fecha)}
                soloLectura
            />
            <QInput
                label="Origen"
                nombre="manual"
                valor={asiento.manual ? "Manual" : "Automático"}
                soloLectura
            />
            <QInput
                label="Tipo de documento"
                nombre="tipoDocumento"
                valor={asiento.tipoDocumento}
                soloLectura
            />
            <QInput
                label="Documento"
                nombre="documento"
                valor={asiento.documento}
                soloLectura
            />
            <QInput label="Concepto" nombre="concepto" valor={asiento.concepto} soloLectura />
        </quimera-formulario>
    </div>
);
