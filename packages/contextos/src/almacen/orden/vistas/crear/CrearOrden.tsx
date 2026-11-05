import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { Almacen } from "../../../comun/componentes/Almacen.tsx";
import { TipoOrden } from "../../../comun/componentes/TipoOrden.tsx";
import { postOrden } from "../../infraestructura.ts";
import "./CrearOrden.css";
import { nuevaOrdenAlmacenVacia } from "./crear.ts";
import { metaNuevaOrden } from "./diseño.ts";

export const CrearOrden = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(
        metaNuevaOrden,
        nuevaOrdenAlmacenVacia
    );

    const [pasosPick, setPasosPick] = useState<string | null>(null);

    const crear_ = useCallback(
        async () => {
            const pasosDrop = (modelo.tipoOrden === "TRASPASO" && pasosPick)
                ? "CAJAS-UBICACION"
                : null;
            const id = await postOrden({
                ...modelo,
                pasosPick: pasosPick ?? null,
                pasosDrop,
            });
            publicar("modulo_creado", id);
        },
        [modelo, pasosPick, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_modulo_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    console.log('modelo', modelo);

    return (
        <QModal
            abierto={true}
            nombre="crearOrden"
            titulo="Nueva Orden"
            onCerrar={cancelar}
        >
            <div className="CrearOrden">
                <quimera-formulario>
                    <TipoOrden {...uiProps("tipoOrden")} />
                    <Almacen {...uiProps("almacenId")} />
                    <QInput label="Abierta" {...uiProps("abierta")} />
                    {modelo.tipoOrden === "TRASPASO" && (
                        <div>
                            <label>Tipo de pick (palé)</label>
                            <select
                                value={pasosPick ?? ""}
                                onChange={(e) => setPasosPick(e.target.value || null)}
                            >
                                <option value="">Sin pick especial</option>
                                <option value="LOTE-CAJAS">Palé c/lotes → cajas</option>
                                <option value="CAJA-CAJAS">Palé s/lotes → cajas</option>
                            </select>
                        </div>
                    )}
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
