import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { TipoInformeContableReport } from "../../diseño.ts";
import { nombreFicheroPdfInforme } from "../../dominio.ts";
import { getReportInformeContable } from "../../infraestructura.ts";

interface BotonDescargarPdfInformeProps {
    tipo: TipoInformeContableReport;
    criteria: Criteria;
    deshabilitado?: boolean;
    ocupadoExterno?: boolean;
}

export const BotonDescargarPdfInforme = ({
    tipo,
    criteria,
    deshabilitado = false,
    ocupadoExterno = false,
}: BotonDescargarPdfInformeProps) => {
    const { intentar } = useContext(ContextoError);
    const [descargando, setDescargando] = useState(false);

    const descargar = useCallback(async () => {
        if (deshabilitado || descargando || ocupadoExterno) return;

        setDescargando(true);
        try {
            const blob = await intentar(() => getReportInformeContable(tipo, criteria));
            await descargarDocumento(blob, nombreFicheroPdfInforme(tipo));
        } finally {
            setDescargando(false);
        }
    }, [criteria, deshabilitado, descargando, intentar, ocupadoExterno, tipo]);

    return (
        <QBoton
            variante="borde"
            onClick={descargar}
            deshabilitado={deshabilitado || descargando || ocupadoExterno}
        >
            {descargando ? "Descargando…" : "Descargar PDF"}
        </QBoton>
    );
};
