import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useEffect, useState } from "react";
import { SecuenciaContabilidad } from "../diseño.ts";
import { getSecuenciasContabilidad } from "../infraestructura.ts";

const metaTabla: MetaTabla<SecuenciaContabilidad> = [
    { id: "nombre", cabecera: "Nombre" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "valor", cabecera: "Valor", tipo: "numero" },
    { id: "valorout", cabecera: "Valor sin bloqueo", tipo: "numero" },
];

/** Pestaña «Secuencias contabilidad» de ejercicios.ui: co_secuencias del
 * ejercicio (la numeración de asientos, `nasiento`). */
export const SecuenciasContabilidad = ({ ejercicioId }: { ejercicioId: string }) => {
    const [secuencias, setSecuencias] = useState<SecuenciaContabilidad[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let vigente = true;
        setCargando(true);
        getSecuenciasContabilidad(ejercicioId)
            .then((s) => vigente && setSecuencias(s))
            .catch(() => vigente && setSecuencias([]))
            .finally(() => vigente && setCargando(false));
        return () => { vigente = false; };
    }, [ejercicioId]);

    if (!cargando && secuencias.length === 0) {
        return <p>El ejercicio todavía no tiene secuencias de contabilidad (se crean con el primer asiento).</p>;
    }
    return (
        <QTabla metaTabla={metaTabla} datos={secuencias} cargando={cargando}
            orden={["nombre", "ASC"]} totalEntidades={secuencias.length} />
    );
};
