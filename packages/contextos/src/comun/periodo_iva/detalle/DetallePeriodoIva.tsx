import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { PeriodoIva } from "../diseño.ts";
import { patchPeriodoIva } from "../infraestructura.ts";
import { BorrarPeriodoIva } from "../borrar/BorrarPeriodoIva.tsx";
import { metaPeriodoIva, periodoIvaVacioDetalle } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (p: PeriodoIva) =>
    p.fechaDesde
        ? `${p.fechaDesde.toISOString().slice(0, 10)} — ${p.iva}%`
        : `Periodo ${p.id}`;

const fechaInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export const DetallePeriodoIva = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacio = periodoIvaVacioDetalle();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", periodo: vacio, periodoInicial: vacio },
        publicar,
    );

    const form = useModelo(metaPeriodoIva, ctx.periodo);

    useEffect(() => {
        emitir("periodo_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() =>
            patchPeriodoIva(form.modelo.id, {
                fechaDesde: form.modelo.fechaDesde,
                fechaHasta: form.modelo.fechaHasta,
                iva: form.modelo.iva,
                recargo: form.modelo.recargo,
            }),
        );
        emitir("periodo_guardado");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.periodo.id) return null;

    return (
        <Detalle
            id={ctx.periodo.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.periodo}
            cerrarDetalle={() => emitir("cancelar_seleccion")}
        >
            <>
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrar")}>Borrar</QBoton>
                </div>
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Impuesto" nombre="impuestoId" valor={ctx.periodo.impuestoId} soloLectura />
                                <QInput
                                    nombre="fechaDesde"
                                    label="Fecha desde"
                                    tipo="fecha"
                                    valor={fechaInput(form.modelo.fechaDesde)}
                                    onChange={(v) =>
                                        form.set({ ...form.modelo, fechaDesde: v ? new Date(v) : null })
                                    }
                                />
                                <QInput
                                    nombre="fechaHasta"
                                    label="Fecha hasta"
                                    tipo="fecha"
                                    valor={fechaInput(form.modelo.fechaHasta)}
                                    onChange={(v) =>
                                        form.set({ ...form.modelo, fechaHasta: v ? new Date(v) : null })
                                    }
                                />
                                <QInput label="IVA (%)" {...form.uiProps("iva")} tipo="decimal" />
                                <QInput label="Recargo (%)" {...form.uiProps("recargo")} tipo="decimal" />
                            </quimera-formulario>
                        </Tab>,
                    ]}
                />
                {form.modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!form.valido}>
                            Guardar
                        </QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar} deshabilitado={!form.modificado}>
                            Cancelar
                        </QBoton>
                    </div>
                )}
                <BorrarPeriodoIva
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    periodo={ctx.periodo}
                />
            </>
        </Detalle>
    );
};
