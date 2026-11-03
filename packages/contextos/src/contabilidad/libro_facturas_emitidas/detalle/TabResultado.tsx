import { FilaLibroIva, ResultadoLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { nombreFicheroLibroFacturasEmitidas } from "../dominio.ts";
import { getReportLibroFacturasEmitidas } from "../infraestructura.ts";

/** Las columnas replican las del `.kut`, incluidas las que las opciones de
 * la ficha pueden quitar. */
const columnas = (
    informe: LibroFacturasEmitidas
): MetaTabla<FilaLibroIva> => [
    { id: "codigoFactura", cabecera: "Factura" },
    { id: "fechaAsiento", cabecera: "Fecha as.", tipo: "fecha" },
    ...(informe.mostrarAsiento
        ? ([{ id: "asientoNumero", cabecera: "As.", tipo: "numero" }] as const)
        : []),
    ...(informe.mostrarDocumento
        ? ([{ id: "documento", cabecera: "Documento" }] as const)
        : []),
    ...(informe.mostrarNif
        ? ([{ id: "cifNif", cabecera: "CIF/NIF" }] as const)
        : []),
    { id: "nombreTercero", cabecera: "Tercero" },
    { id: "baseImponible", cabecera: "Base", tipo: "moneda" },
    { id: "cuotaIva", cabecera: "Cuota IVA", tipo: "moneda" },
    { id: "porcentajeIva", cabecera: "% IVA", tipo: "numero" },
];

export const TabResultado = ({
    informe,
    resultado,
    emitir,
}: {
    informe: LibroFacturasEmitidas;
    resultado: ResultadoLibroIva | null;
    emitir: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const metaTabla = useMemo(() => columnas(informe), [informe]);

    const calcular = useCallback(async () => {
        if (calculando) return;
        setCalculando(true);
        try {
            await emitir("calculo_solicitado");
        } finally {
            setCalculando(false);
        }
    }, [calculando, emitir]);

    const descargar = useCallback(async () => {
        if (descargando) return;
        setDescargando(true);
        try {
            const blob = await intentar(() =>
                getReportLibroFacturasEmitidas(informe.id)
            );
            await descargarDocumento(
                blob,
                nombreFicheroLibroFacturasEmitidas(informe)
            );
        } finally {
            setDescargando(false);
        }
    }, [descargando, informe, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? "Calculando…" : "Calcular"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    Descargar PDF
                </QBoton>
            </div>

            {!resultado && <p>Pulsa «Calcular» para obtener el libro.</p>}

            {resultado && (
                <QTabla
                    metaTabla={metaTabla}
                    datos={resultado.datos}
                    cargando={calculando}
                    orden={["fechaAsiento", "ASC"]}
                    totalEntidades={resultado.total}
                />
            )}
        </div>
    );
};
