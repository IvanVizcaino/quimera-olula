import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import { abrirPdf } from "../../comun/pdf.ts";
import { motivoRangoHojasNoValido, nombreHojaOrden } from "../dominio.ts";
import { getHojaOrden } from "../infraestructura.ts";

/**
 * «Imprimir hojas» del maestro de órdenes: las hojas de orden de un rango de códigos (como
 * mucho 200) en un solo PDF, una orden tras otra. Sin «hasta», solo la de «desde».
 */
export const ImprimirHojasOrden = ({ inicial = "", cerrar }: { inicial?: string; cerrar: () => void }) => {
    const [desde, setDesde] = useState(inicial);
    const [hasta, setHasta] = useState("");
    const [aviso, setAviso] = useState("");
    const { intentar } = useContext(ContextoError);

    const imprimir = async () => {
        const motivo = motivoRangoHojasNoValido(desde, hasta);
        if (motivo) {
            setAviso(motivo);
            return;
        }
        setAviso("");
        try {
            await intentar(() => abrirPdf(() => getHojaOrden(desde, hasta), nombreHojaOrden(desde, hasta)));
            cerrar();
        } catch {
            // `intentar` ya muestra el error (p. ej. 404: ninguna orden en el rango); el modal sigue abierto.
        }
    };

    return (
        <QModalConfirmacion
            nombre="imprimirHojasOrden"
            abierto={true}
            titulo="Imprimir hojas de orden"
            mensaje="Las hojas de las órdenes de «desde» a «hasta» (por código, como mucho 200), en un solo PDF."
            labelAceptar="Imprimir"
            onCerrar={cerrar}
            onAceptar={imprimir}
        >
            <quimera-formulario>
                <QInput label="Desde la orden" nombre="hojaDesde" valor={desde} onChange={(v) => setDesde(String(v ?? ""))} placeholder="OP…" />
                <QInput label="Hasta la orden" nombre="hojaHasta" valor={hasta} onChange={(v) => setHasta(String(v ?? ""))} opcional placeholder="OP…" />
            </quimera-formulario>
            {aviso && <p className="nota-orden" role="alert">{aviso}</p>}
        </QModalConfirmacion>
    );
};
