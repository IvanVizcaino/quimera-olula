import { FacturaCompra } from "#/compras/comun/componentes/factura.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo, useState } from "react";
import { Factura, ImportacionFactura } from "../diseño.ts";
import { cambiosImportacion, filtroFacturasImportacion, importacionVacia, metaImportacion, validaDua } from "../dominio.ts";

const opcionesTratamiento = [
    { valor: "Total", descripcion: "Total" },
    { valor: "Reversión", descripcion: "Reversión" },
];

/**
 * Pestaña «Importación» (plugin `facturas_impor`; Eneboo `facturasprov.ui`).
 * Guarda de forma explícita; avisa si el DUA no tiene 18 caracteres
 * (`frasImport_validateCursor` / `formUTIL.validaDUA`).
 * Botón «Crear línea» = Eneboo `tbnCrearLinea` / `frasImport_crearLinea`.
 */
export const TabImportacion = ({
    factura,
    onGuardar,
    onCrearLineaIva,
}: {
    factura: Factura;
    onGuardar: (cambios: Partial<ImportacionFactura>) => Promise<void>;
    onCrearLineaIva?: () => Promise<void>;
}) => {
    const original = factura.importacion;
    const inicial = useMemo(() => original ?? importacionVacia(), [original]);
    const form = useModelo(metaImportacion, inicial);
    const { modelo, uiProps } = form;
    const [avisoDua, setAvisoDua] = useState(false);
    const [codigoImport, setCodigoImport] = useState("");
    const [creandoLinea, setCreandoLinea] = useState(false);

    const cambios = cambiosImportacion(original, modelo);
    const hayCambios = Object.keys(cambios).length > 0;

    const guardar = async () => {
        setAvisoDua(false);
        await onGuardar(cambios);
    };

    const solicitarGuardar = async () => {
        if (!hayCambios) return;
        if (!validaDua(modelo.dua)) {
            setAvisoDua(true);
            return;
        }
        await guardar();
    };

    const crearLineaIva = async () => {
        if (!onCrearLineaIva || creandoLinea) return;
        // Eneboo usa el buffer del cursor (cuotaimport ya tipada); aquí
        // persistimos cambios pendientes antes de crear la línea.
        if (hayCambios) {
            if (!validaDua(modelo.dua)) {
                setAvisoDua(true);
                return;
            }
            await guardar();
        }
        setCreandoLinea(true);
        try {
            await onCrearLineaIva();
        } finally {
            setCreandoLinea(false);
        }
    };

    return (
        <div className="TabImportacion">
            <quimera-formulario>
                <FacturaCompra
                    label="Fra. importación"
                    nombre="facturaImportacionId"
                    valor={modelo.facturaImportacionId ?? ""}
                    descripcion={codigoImport}
                    deshabilitado={!factura.editable}
                    filtroExtra={filtroFacturasImportacion(factura.id)}
                    onChange={(opcion) => {
                        setCodigoImport(opcion?.descripcion ?? "");
                        form.set({ ...modelo, facturaImportacionId: opcion?.valor || null });
                    }}
                />
                <QInput label="DUA" {...uiProps("dua")} />
                <QInput label="Fecha DUA" {...uiProps("fechaDua")} />
                <QInput label="Base" {...uiProps("base")} />
                <QInput label="% I.V.A." {...uiProps("tipoIva")} />
                <QInput label="Cuota" {...uiProps("cuota")} />
                <QSelect
                    label="Tratamiento IVA import."
                    {...uiProps("tratamiento")}
                    opciones={opcionesTratamiento}
                />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={solicitarGuardar} deshabilitado={!hayCambios}>
                    Guardar importación
                </QBoton>
                {onCrearLineaIva && (
                    <QBoton
                        onClick={crearLineaIva}
                        deshabilitado={!factura.editable || creandoLinea}
                    >
                        Crear línea
                    </QBoton>
                )}
            </div>
            {avisoDua && (
                <QModalConfirmacion
                    nombre="confirmarDuaNo18"
                    abierto={true}
                    titulo="DUA"
                    mensaje={
                        "Está introduciendo un DUA distinto de 18 caracteres.\n¿Desea continuar?"
                    }
                    onCerrar={() => setAvisoDua(false)}
                    onAceptar={guardar}
                />
            )}
        </div>
    );
};
