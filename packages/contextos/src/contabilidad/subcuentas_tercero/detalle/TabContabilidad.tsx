import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useCallback, useEffect, useState } from "react";
import { PartidaSubcuenta, SubcuentaTercero, TipoTercero } from "../diseño.ts";
import { subcuentaInicial } from "../dominio.ts";
import {
    getPartidasSubcuenta,
    getSubcuentasTercero,
} from "../infraestructura.ts";
import {
    metaTablaPartidasSubcuenta,
    metaTablaSubcuentasTercero,
} from "./meta.ts";
import "./TabContabilidad.css";

/** Pestaña «Contabilidad» de las fichas de cliente y proveedor (Eneboo
 * clientes.ui / proveedores.ui): subcuenta elegida arriba, subcuentas por
 * ejercicio a la izquierda y sus partidas a la derecha. */
export const TabContabilidad = ({
    tipo,
    terceroId,
    codigoSubcuenta,
}: {
    tipo: TipoTercero;
    terceroId: string;
    /** `clientes.codsubcuenta` / `proveedores.codsubcuenta`, por si el tercero
     * aún no tiene subcuentas por ejercicio. */
    codigoSubcuenta?: string | null;
}) => {
    const [subcuentas, setSubcuentas] = useState<SubcuentaTercero[]>([]);
    const [cargandoSubcuentas, setCargandoSubcuentas] = useState(true);
    const [activa, setActiva] = useState<SubcuentaTercero | null>(null);
    const [partidas, setPartidas] = useState<PartidaSubcuenta[]>([]);
    const [cargandoPartidas, setCargandoPartidas] = useState(false);

    useEffect(() => {
        let vigente = true;
        setCargandoSubcuentas(true);
        getSubcuentasTercero(tipo, terceroId)
            .then((lista) => {
                if (!vigente) return;
                setSubcuentas(lista);
                setActiva(subcuentaInicial(lista));
            })
            .finally(() => vigente && setCargandoSubcuentas(false));
        return () => {
            vigente = false;
        };
    }, [tipo, terceroId]);

    const cargarPartidas = useCallback(async (subcuentaId: string) => {
        setCargandoPartidas(true);
        try {
            setPartidas(await getPartidasSubcuenta(subcuentaId));
        } finally {
            setCargandoPartidas(false);
        }
    }, []);

    useEffect(() => {
        if (activa) {
            cargarPartidas(activa.subcuentaId);
        } else {
            setPartidas([]);
        }
    }, [activa, cargarPartidas]);

    return (
        <div className="TabContabilidad">
            <quimera-formulario>
                <QInput
                    label="Subcuenta"
                    nombre="codigo_subcuenta"
                    valor={activa?.codigoSubcuenta ?? codigoSubcuenta ?? ""}
                    deshabilitado
                />
                <QInput
                    label="Descripción"
                    nombre="descripcion_subcuenta"
                    valor={activa?.descripcion ?? ""}
                    deshabilitado
                />
            </quimera-formulario>
            <div className="TabContabilidad-tablas">
                <div className="TabContabilidad-subcuentas">
                    <h4>Subcuentas por ejercicio</h4>
                    <QTabla
                        metaTabla={metaTablaSubcuentasTercero}
                        datos={subcuentas}
                        cargando={cargandoSubcuentas}
                        seleccionadaId={activa?.id}
                        onSeleccion={setActiva}
                        orden={["ejercicioId", "ASC"]}
                        totalEntidades={subcuentas.length}
                    />
                </div>
                <div className="TabContabilidad-partidas">
                    <h4>
                        Partidas
                        {activa ? ` de ${activa.codigoSubcuenta} (${activa.ejercicioId})` : ""}
                    </h4>
                    <QTabla
                        metaTabla={metaTablaPartidasSubcuenta}
                        datos={partidas}
                        cargando={cargandoPartidas}
                        orden={["fecha", "ASC"]}
                        totalEntidades={partidas.length}
                    />
                </div>
            </div>
        </div>
    );
};
