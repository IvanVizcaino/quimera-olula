import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useCallback, useEffect, useState } from "react";
import { PartidaSubcuenta, SubcuentaTercero, TipoTercero } from "../diseño.ts";
import { opcionesSubcuentas, subcuentaInicial } from "../dominio.ts";
import {
    getPartidasSubcuenta,
    getSubcuentasTercero,
} from "../infraestructura.ts";
import { metaTablaPartidasSubcuenta } from "./meta.ts";
import "./TabContabilidad.css";

/** Pestaña «Contabilidad» de las fichas de cliente y proveedor (Eneboo
 * clientes.ui / proveedores.ui): subcuenta elegida arriba y, encima de sus
 * partidas, un combo con las subcuentas por ejercicio (ejercicio, subcuenta y
 * saldo) que filtra la tabla. */
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
            <div className="TabContabilidad-partidas">
                <QSelect
                    label="Subcuenta por ejercicio"
                    nombre="subcuenta_ejercicio"
                    valor={activa?.id ?? ""}
                    opciones={opcionesSubcuentas(subcuentas)}
                    deshabilitado={cargandoSubcuentas || subcuentas.length === 0}
                    onChange={(opcion) =>
                        setActiva(subcuentas.find((s) => s.id === opcion?.valor) ?? null)
                    }
                />
                <QTabla
                    metaTabla={metaTablaPartidasSubcuenta}
                    datos={partidas}
                    cargando={cargandoPartidas}
                    orden={["fecha", "ASC"]}
                    totalEntidades={partidas.length}
                />
            </div>
        </div>
    );
};
