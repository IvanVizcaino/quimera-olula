import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import {
    FORMATOS_EXPORT_FICHERO_REMESA_PAGO,
    FormatoExportFicheroRemesaPago,
    nombreFicheroExportFicheroRemesaPago,
} from "../dominio.js";
import { RemesaPago } from "../diseño.js";
import { getExportFicheroRemesaPago } from "../infraestructura.js";

export const DescargarFicheroBancoRemesaPago = ({ remesa }: { remesa: RemesaPago }) => {
    const { intentar } = useContext(ContextoError);
    const [descargando, setDescargando] = useState<FormatoExportFicheroRemesaPago | null>(
        null,
    );

    const descargar = useCallback(
        async (formato: FormatoExportFicheroRemesaPago, extension: string) => {
            if (!remesa.id || descargando) return;

            setDescargando(formato);
            try {
                const blob = await intentar(() =>
                    getExportFicheroRemesaPago(remesa.id, formato),
                );
                await descargarDocumento(
                    blob,
                    nombreFicheroExportFicheroRemesaPago(remesa, new Date(), extension),
                );
            } finally {
                setDescargando(null);
            }
        },
        [descargando, intentar, remesa],
    );

    return (
        <div className="DescargarFicheroBancoRemesaPago maestro-botones">
            {FORMATOS_EXPORT_FICHERO_REMESA_PAGO.map(({ formato, etiqueta, extension }) => (
                <QBoton
                    key={formato}
                    onClick={() => descargar(formato, extension)}
                    deshabilitado={descargando !== null}
                >
                    {descargando === formato
                        ? "Descargando…"
                        : `Descargar ${etiqueta}`}
                </QBoton>
            ))}
        </div>
    );
};
