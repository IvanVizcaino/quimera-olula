import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect, useMemo } from "react";
import { metaNuevoPeriodoIva, periodoIvaVacio } from "../dominio.ts";
import { getPeriodoIva, postPeriodoIva } from "../infraestructura.ts";

export const CrearPeriodoIva = ({
    publicar = async () => {},
    activo = false,
    impuestoId,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
    impuestoId: string;
}) => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo(() => periodoIvaVacio(impuestoId), [impuestoId]);
    const form = useModelo(metaNuevoPeriodoIva, inicial);

    useEffect(() => {
        if (activo) {
            form.init(periodoIvaVacio(impuestoId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activo, impuestoId]);

    const crear = async () => {
        const id = await intentar(() => postPeriodoIva(form.modelo));
        const periodo = await getPeriodoIva(id);
        publicar("periodo_creado", periodo);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    const fechaStr = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearPeriodoIva">
                <h2>Nuevo periodo de IVA</h2>
                <quimera-formulario>
                    <QInput nombre="impuestoId" label="Impuesto" valor={impuestoId} soloLectura />
                    <QInput
                        nombre="fechaDesde"
                        label="Fecha desde (opcional)"
                        tipo="fecha"
                        valor={fechaStr(form.modelo.fechaDesde)}
                        onChange={(v) =>
                            form.set({ ...form.modelo, fechaDesde: v ? new Date(v) : null })
                        }
                    />
                    <QInput
                        nombre="fechaHasta"
                        label="Fecha hasta (opcional)"
                        tipo="fecha"
                        valor={fechaStr(form.modelo.fechaHasta)}
                        onChange={(v) =>
                            form.set({ ...form.modelo, fechaHasta: v ? new Date(v) : null })
                        }
                    />
                    <QInput label="IVA (%)" {...form.uiProps("iva")} tipo="decimal" />
                    <QInput label="Recargo (%)" {...form.uiProps("recargo")} tipo="decimal" />
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>
                        Guardar
                    </QBoton>
                    <QBoton onClick={cancelar} variante="texto">
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </Mostrar>
    );
};
