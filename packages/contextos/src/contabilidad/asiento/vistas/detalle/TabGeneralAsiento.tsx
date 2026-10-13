import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Asiento } from "../../diseño.ts";

export const TabGeneralAsiento = ({ asiento }: { asiento: Asiento }) => (
    <quimera-formulario>
        <QInput label="Ejercicio" nombre="ejercicio" valor={asiento.ejercicioId} soloLectura />
        <QInput label="Número" nombre="numero" valor={String(asiento.numero)} soloLectura />
        <QInput
            label="Fecha"
            nombre="fecha"
            tipo="fecha"
            valor={asiento.fecha.toISOString().slice(0, 10)}
            soloLectura
        />
        <QInput label="Concepto" nombre="concepto" valor={asiento.concepto} soloLectura />
        <QInput
            label="Importe (debe)"
            nombre="importe"
            tipo="moneda"
            valor={String(asiento.importe)}
            soloLectura
        />
        <QInput
            label="Origen"
            nombre="manual"
            valor={asiento.manual ? "Manual" : "Automático"}
            soloLectura
        />
    </quimera-formulario>
);
