import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useMemo, useState } from "react";
import { Asiento, PartidaManualInput } from "../../diseño.ts";
import { asientoCuadrado } from "../../dominio.ts";
import { patchAsientoManual } from "../../infraestructura.ts";
import { EditorPartidasManual } from "../comun/EditorPartidasManual.tsx";

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

export const CambiarAsientoManual = ({
    asiento,
    publicar,
}: {
    asiento: Asiento;
    publicar: EmitirEvento;
}) => {
    const [fecha, setFecha] = useState(asiento.fecha);
    const [concepto, setConcepto] = useState(asiento.concepto);
    const [partidas, setPartidas] = useState<PartidaManualInput[]>(() => partidasDesdeAsiento(asiento));

    const valido = useMemo(
        () =>
            concepto.trim().length > 0 &&
            partidas.length >= 2 &&
            asientoCuadrado(partidas) &&
            partidas.every((p) => p.subcuentaId > 0),
        [concepto, partidas]
    );

    const guardar_ = useCallback(async () => {
        await patchAsientoManual(asiento.id, { fecha, concepto, partidas });
        publicar("asiento_actualizado");
    }, [asiento.id, concepto, fecha, partidas, publicar]);

    const cancelar_ = useCallback(() => publicar("cambio_de_asiento_cancelado"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="cambiarAsientoManual" titulo="Editar asiento manual" onCerrar={cancelar}>
            <quimera-formulario>
                <QInput
                    label="Fecha"
                    nombre="fecha"
                    tipo="fecha"
                    valor={fecha.toISOString().slice(0, 10)}
                    onChange={(v) => setFecha(new Date(`${v}T12:00:00`))}
                />
                <QInput label="Concepto" nombre="concepto" valor={concepto} onChange={setConcepto} />
            </quimera-formulario>
            <EditorPartidasManual
                partidas={partidas}
                ejercicioId={asiento.ejercicioId}
                onChange={setPartidas}
            />
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>
                    Guardar
                </QBoton>
            </div>
        </QModal>
    );
};
