import { Asiento } from "../../diseño.ts";
import { getAsiento } from "../../infraestructura.ts";
import { CabeceraAsiento } from "./CabeceraAsiento.tsx";
import { PartidasAsientoLista } from "./PartidasAsientoLista.tsx";
import { useEffect, useState } from "react";

/** El asiento de un documento (factura de compra o de venta), para su pestaña
 * de Contabilidad. Recibe solo el id: la factura no trae el asiento. */
interface AsientoDeDocumentoProps {
    asientoId: string | null;
}

export const AsientoDeDocumento = ({ asientoId }: AsientoDeDocumentoProps) => {
    const [asiento, setAsiento] = useState<Asiento | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!asientoId) {
            setAsiento(null);
            return;
        }
        setCargando(true);
        setError("");
        getAsiento(asientoId)
            .then(setAsiento)
            // El asiento puede haberse borrado desde contabilidad y devolver 404:
            // mejor un mensaje que una promesa rechazada sin gestionar.
            .catch(() => setError("No se ha podido cargar el asiento de esta factura."))
            .finally(() => setCargando(false));
    }, [asientoId]);

    if (!asientoId) {
        return <p>Esta factura todavía no está contabilizada.</p>;
    }

    if (cargando) return <p>Cargando asiento…</p>;
    if (error) return <p>{error}</p>;
    if (!asiento) return null;

    return (
        <div className="AsientoDeDocumento">
            <CabeceraAsiento asiento={asiento} />
            <PartidasAsientoLista partidas={asiento.partidas} />
        </div>
    );
};
