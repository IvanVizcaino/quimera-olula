import { pitidoError } from "#/almacen/comun/audio.ts";
import {
    CajaUbicacion,
    ResultadoCajaUbicacion,
} from "#/almacen/comun/componentes/CajaUbicacion.tsx";
import { CajaCompletaResuelta } from "#/almacen/comun/voz_resolvers.ts";
import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturaCajaOrden, registrarLecturasOrden } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useEffect, useState } from "react";

type CajaMemoizada =
    | { tipo: "caja"; caja: CajaCompletaResuelta; lineas: LineaOrdenAlmacen[] }
    | { tipo: "palet"; caja: CajaCompletaResuelta };

const encontrarLineasParaCajaColo = (
    caja: CajaCompletaResuelta,
    lineas: LineaOrdenAlmacen[],
): LineaOrdenAlmacen[] => {
    const lineasDirectas = lineas.filter((linea) => {
        if (linea.idCajaOrigen === caja.id) return true;
        if (linea.idCajaOrigen !== null) return false;
        if (linea.sku && caja.sku !== linea.sku) return false;
        if (linea.loteId && caja.idLote !== linea.loteId) return false;
        return true;
    });

    if (lineasDirectas.length > 0) return lineasDirectas;

    return lineas.filter((linea) =>
        linea.lecturas.some((lectura) => lectura.idCajaDestino === caja.id)
    );
};

export const LeerCajasColocacion = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [cajasLeidas, setCajasLeidas] = useState<CajaMemoizada[]>([]);
    const [resultado, setResultado] = useState<{ exito: boolean; mensaje: string } | null>(null);
    const [clave, setClave] = useState(0);

    useEffect(() => {
        if (orden.estado === "TERMINADA") publicar("lectura_cajas_colocacion_cancelada");
    }, [orden.estado]);

    const resetear = () => setClave((k) => k + 1);

    const procesarLectura = useCallback(
        async (lectura: ResultadoCajaUbicacion | null) => {
            if (!lectura) {
                pitidoError();
                setResultado({ exito: false, mensaje: "Código no reconocido" });
                resetear();
                return;
            }

            if (lectura.tipo === "caja") {
                const caja = lectura;
                if (cajasLeidas.some((c) => c.caja.id === caja.id)) {
                    setResultado({ exito: false, mensaje: `La caja ${caja.lpn} ya está registrada` });
                    resetear();
                    return;
                }
                if (!caja.sku) {
                    // PALET: se registrará vía lectura_caja al leer la ubicación
                    setCajasLeidas((prev) => [...prev, { tipo: "palet", caja }]);
                    setResultado({ exito: true, mensaje: `Palé ${caja.lpn} pendiente de ubicación` });
                    resetear();
                    return;
                }
                const lineasEncontradas = encontrarLineasParaCajaColo(caja, orden.lineas);
                if (lineasEncontradas.length === 0) {
                    pitidoError();
                    setResultado({
                        exito: false,
                        mensaje: `La caja ${caja.lpn} no corresponde a ninguna línea de la orden`,
                    });
                    resetear();
                    return;
                }
                setCajasLeidas((prev) => [...prev, { tipo: "caja", caja, lineas: lineasEncontradas }]);
                const primera = lineasEncontradas[0];
                setResultado({
                    exito: true,
                    mensaje:
                        lineasEncontradas.length === 1
                            ? `Caja ${caja.lpn} registrada (${primera.sku} - ${primera.articulo})`
                            : `Caja ${caja.lpn} registrada (${lineasEncontradas.length} líneas)`,
                });
                resetear();
                return;
            }

            // Es una ubicación
            const ubicacion = lectura;
            if (cajasLeidas.length === 0) {
                pitidoError();
                setResultado({ exito: false, mensaje: "No hay cajas registradas para colocar" });
                resetear();
                return;
            }

            let registrado = false;
            await intentar(async () => {
                const todasLasLecturas = cajasLeidas
                    .filter((e): e is Extract<CajaMemoizada, { tipo: "caja" }> => e.tipo === "caja")
                    .flatMap(({ caja, lineas }) =>
                        lineas.map((linea) => ({
                            sku: caja.sku ?? linea.sku,
                            articulo: linea.articulo,
                            idLote: linea.loteId ? linea.loteId : caja.idLote,
                            idLinea: linea.id,
                            cajaCompleta: true,
                            cantidad: caja.capacidad ?? linea.cantidadPrevista,
                            idCajaOrigen: caja.id,
                            idUbicacionOrigen: null,
                            idCajaDestino: null,
                            idUbicacionDestino: ubicacion.id,
                            fase: 'DROP' as const,
                        }))
                    );
                if (todasLasLecturas.length > 0) {
                    await registrarLecturasOrden(orden.id, todasLasLecturas);
                }
                for (const entrada of cajasLeidas.filter((e) => e.tipo === "palet")) {
                    await registrarLecturaCajaOrden(orden.id, {
                        cajaId: entrada.caja.id,
                        cajaCompleta: true,
                        idUbicacionDestino: ubicacion.id,
                        idCajaDestino: null,
                    });
                }
                registrado = true;
            });

            if (registrado) {
                const n = cajasLeidas.length;
                setCajasLeidas([]);
                setResultado({
                    exito: true,
                    mensaje: `${n} caja${n > 1 ? "s" : ""} colocada${n > 1 ? "s" : ""} en ${ubicacion.codigo}`,
                });
                await publicar("lectura_registrada");
            } else {
                pitidoError();
            }
            resetear();
        },
        [cajasLeidas, orden, intentar],
    );

    return (
        <QModal
            abierto={true}
            nombre="leerCajasColocacion"
            titulo="Colocación de cajas"
            onCerrar={() => publicar("lectura_cajas_colocacion_cancelada")}
        >
            <div className="LeerCajasColocacion">
                <quimera-formulario>
                    <CajaUbicacion
                        key={clave}
                        label="Caja / Ubicación"
                        onChange={procesarLectura}
                        autoFocus
                    />
                </quimera-formulario>
                {resultado && (
                    <p className="LeerCajasColocacion__resultado">
                        {resultado.exito ? (
                            <QEtiqueta variante="exito">{resultado.mensaje}</QEtiqueta>
                        ) : (
                            <span className="q-texto-error">{resultado.mensaje}</span>
                        )}
                    </p>
                )}
                {cajasLeidas.length > 0 && (
                    <ul className="LeerCajasColocacion__lista">
                        {cajasLeidas.map((entrada) => (
                            <li key={entrada.caja.id}>
                                {entrada.caja.lpn}
                                {entrada.tipo === "caja"
                                    ? entrada.lineas.length === 1
                                        ? ` — ${entrada.lineas[0].sku} ${entrada.lineas[0].articulo}`
                                        : ` — ${entrada.lineas.length} líneas`
                                    : " (palé)"}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={() => publicar("lectura_cajas_colocacion_cancelada")}>
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
