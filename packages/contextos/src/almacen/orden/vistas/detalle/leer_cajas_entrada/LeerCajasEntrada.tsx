import { pitidoError } from "#/almacen/comun/audio.ts";
import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturaCajaOrden, registrarLecturasOrden } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { desbloquearTTS } from "@olula/lib/voz/useSintesisVoz.ts";
import { ComponentProps, useCallback, useContext, useEffect, useState } from "react";
import "./LeerCajasEntrada.css";

type OpcionCaja = NonNullable<Parameters<ComponentProps<typeof Caja>["onChange"]>[0]>;

// Llamar desde el click de "Leer cajas" para desbloquear speechSynthesis.
// A diferencia de AudioContext / HTMLAudioElement, speechSynthesis en
// Chromium desktop no requiere activación transitoria para llamadas
// posteriores: basta con hablar una vez desde el gesto de usuario.
export const iniciarAudioLectura = () => {
    desbloquearTTS();
};

const encontrarLineasParaCaja = (
    caja: Pick<OpcionCaja, "sku" | "idLote">,
    lineas: LineaOrdenAlmacen[],
): LineaOrdenAlmacen[] =>
    lineas.filter((linea) => {
        if (linea.sku && caja.sku !== linea.sku) return false;
        if (caja.idLote && caja.idLote !== linea.loteId) return false;
        return true;
    });

export const LeerCajasEntrada = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [claveCaja, setClaveCaja] = useState<number>(0);
    const [resultado, setResultado] = useState<{ exito: boolean; mensaje: string } | null>(null);

    useEffect(() => {
        if (orden.estado === "TERMINADA") publicar("lectura_cajas_entrada_cancelada");
    }, [orden.estado]);

    const procesarCaja = useCallback(
        async (opcion: OpcionCaja) => {
            if (!opcion.sku) {
                // PALET: el servidor genera movimientos recursivamente por sub-cajas
                let registrado = false;
                await intentar(async () => {
                    await registrarLecturaCajaOrden(orden.id, {
                        cajaId: opcion.id,
                        cajaCompleta: true,
                        idUbicacionDestino: null,
                        idCajaDestino: null,
                    });
                    registrado = true;
                    setResultado({ exito: true, mensaje: `Palé ${opcion.lpn} registrado` });
                    await publicar("lectura_registrada");
                });
                if (!registrado) pitidoError();
                setClaveCaja((k) => k + 1);
                return;
            }

            const lineasEncontradas = encontrarLineasParaCaja(opcion, orden.lineas);
            if (lineasEncontradas.length === 0) {
                pitidoError();
                setResultado({
                    exito: false,
                    mensaje: `La caja ${opcion.lpn} no contiene material o lotes esperados en esta orden`,
                });
                setClaveCaja((k) => k + 1);
                return;
            }

            let registrado = false;
            console.log("Opcion caja:", opcion);
            await intentar(async () => {
                await registrarLecturasOrden(orden.id, lineasEncontradas.map((linea) => ({
                    sku: opcion.sku ?? linea.sku,
                    articulo: linea.articulo,
                    idLote: opcion.idLote ? opcion.idLote : linea.loteId,
                    idLinea: linea.id,
                    cajaCompleta: true,
                    cantidad: opcion.capacidad || linea.cantidadPrevista,
                    idCajaOrigen: null,
                    idUbicacionOrigen: null,
                    idCajaDestino: opcion.id,
                    idUbicacionDestino: linea.idUbicacionDestino,
                })));
                registrado = true;
                const primera = lineasEncontradas[0];
                setResultado({
                    exito: true,
                    mensaje:
                        lineasEncontradas.length === 1
                            ? `Caja ${opcion.lpn} registrada (${opcion.capacidad || primera.cantidadPrevista} uds · ${primera.sku} - ${primera.articulo})`
                            : `Caja ${opcion.lpn} registrada en ${lineasEncontradas.length} líneas`,
                });
                await publicar("lectura_registrada");
            });
            if (!registrado) pitidoError();
            setClaveCaja((k) => k + 1);
        },
        [orden, intentar],
    );

    return (
        <QModal
            abierto={true}
            nombre="leerCajasEntrada"
            titulo="Leer cajas de entrada"
            onCerrar={() => publicar("lectura_cajas_entrada_cancelada")}
        >
            <div className="LeerCajasEntrada">
                <quimera-formulario>
                    <Caja
                        key={claveCaja}
                        label="Caja"
                        nombre="cajaId"
                        valor=""
                        onChange={(opcion) => {
                            if (opcion) procesarCaja(opcion);
                        }}
                        autoFocus
                    />
                </quimera-formulario>
                {resultado && (
                    <p className="LeerCajasEntrada__resultado">
                        {resultado.exito ? (
                            <QEtiqueta variante="exito">{resultado.mensaje}</QEtiqueta>
                        ) : (
                            <span className="q-texto-error">{resultado.mensaje}</span>
                        )}
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={() => publicar("lectura_cajas_entrada_cancelada")}>
                        Cerrar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
