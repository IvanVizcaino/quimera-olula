import { TipoDocumentoAsiento } from "#/contabilidad/comun/componentes/TipoDocumentoAsiento.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import {
    Asiento,
    NuevoAsientoManual,
    PartidaManualInput,
} from "../../diseño.ts";
import { metaNuevoAsientoManual } from "../../dominio.ts";
import { patchAsientoManual } from "../../infraestructura.ts";
import { EditorPartidasManual } from "../comun/EditorPartidasManual.tsx";
import "../comun/camposAsiento.css";

const partidasDesdeAsiento = (asiento: Asiento): PartidaManualInput[] =>
    asiento.partidas.map((p) => ({
        id: p.id,
        subcuentaId: p.subcuentaId,
        codigoSubcuenta: p.codigoSubcuenta,
        debe: p.debe,
        haber: p.haber,
        concepto: p.concepto,
        esIva: p.esIva,
        baseImponible: p.baseImponible ?? undefined,
        ivaPct: p.iva ?? undefined,
        recargo: p.recargo ?? undefined,
        grupoIvaProductoId: p.grupoIvaProductoId ?? undefined,
        grupoIvaNegocioId: p.grupoIvaNegocioId ?? undefined,
        contrapartidaId: p.contrapartidaId ?? undefined,
        casilla303: p.casilla303 ?? undefined,
    }));

const modeloDesdeAsiento = (asiento: Asiento): NuevoAsientoManual => ({
    ejercicioId: asiento.ejercicioId,
    fecha: asiento.fecha,
    concepto: asiento.concepto,
    tipoDocumento: asiento.tipoDocumento,
    documento: asiento.documento,
    partidas: partidasDesdeAsiento(asiento),
});

export const CambiarAsientoManual = ({
    asiento,
    publicar,
}: {
    asiento: Asiento;
    publicar: EmitirEvento;
}) => {
    // useModelo reinicia el modelo cuando cambia la identidad del inicial: sin
    // este useMemo cualquier re-render descartaría lo que lleve escrito el usuario.
    const inicial = useMemo(() => modeloDesdeAsiento(asiento), [asiento]);
    const { modelo, set, valido } = useModelo(metaNuevoAsientoManual, inicial);

    const guardar_ = useCallback(async () => {
        await patchAsientoManual(asiento.id, {
            fecha: modelo.fecha,
            concepto: modelo.concepto,
            tipoDocumento: modelo.tipoDocumento,
            documento: modelo.documento,
            partidas: modelo.partidas,
        });
        publicar("asiento_actualizado");
    }, [asiento.id, modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_asiento_cancelado"),
        [publicar]
    );

    const [guardar, cancelar, aceptando] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarAsientoManual"
            titulo="Editar asiento manual"
            onCerrar={cancelar}
        >
            <div className="CamposAsientoManual CamposAsientoManual--cambiar">
                <quimera-formulario>
                    <QInput
                        label="Fecha"
                        nombre="fecha"
                        tipo="fecha"
                        valor={modelo.fecha.toISOString().slice(0, 10)}
                        onChange={(v) =>
                            set({ ...modelo, fecha: new Date(`${v}T12:00:00`) })
                        }
                    />
                    <TipoDocumentoAsiento
                        valor={modelo.tipoDocumento}
                        onChange={(opcion) =>
                            set({
                                ...modelo,
                                tipoDocumento: opcion?.valor ?? "",
                            })
                        }
                    />
                    <QInput
                        label="Documento"
                        nombre="documento"
                        valor={modelo.documento}
                        onChange={(v) => set({ ...modelo, documento: v })}
                        opcional
                    />
                    <QInput
                        label="Concepto"
                        nombre="concepto"
                        valor={modelo.concepto}
                        onChange={(v) => set({ ...modelo, concepto: v })}
                    />
                </quimera-formulario>
            </div>
            <EditorPartidasManual
                partidas={modelo.partidas}
                ejercicioId={modelo.ejercicioId}
                onChange={(partidas) => set({ ...modelo, partidas })}
            />
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido || aceptando}>
                    Guardar
                </QBoton>
            </div>
        </QModal>
    );
};
