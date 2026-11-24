import { IndicadorGuardado } from "#/ventas/comun/componentes/IndicadorGuardado.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CampoFecha } from "../../comun/componentes/CampoFecha.tsx";
import { AccionesCicloVida, cabeAccion, motivoAccion } from "../../comun/ciclo_vida.ts";
import { BorrarSimple } from "../../comun/maestro_simple/BorrarSimple.tsx";
import { getMaquinaDetalleSimple } from "../../comun/maestro_simple/maquina_detalle.ts";
import { OrdenProduccion } from "../diseño.ts";
import { EstadoOrden } from "../EstadoOrden.tsx";
import {
    accionesMotorOrden,
    cambiosOrden,
    COMANDO,
    formatearCantidad,
    metaOrden,
    ordenVacia,
    tituloOrden,
} from "../dominio.ts";
import { deleteOrden, getAccionesOrden, getOrden, patchOrden, postLanzarOrden } from "../infraestructura.ts";
import { SacarProcesoOrden } from "../sacar_proceso/SacarProcesoOrden.tsx";
import { TerminarOrden } from "../terminar/TerminarOrden.tsx";
import { LoteOrdenProduccion } from "./LoteOrdenProduccion.tsx";
import { MovimientosOrden } from "./MovimientosOrden.tsx";
import { SelectorPedidoCliente } from "./SelectorPedidoCliente.tsx";
import { TareasOrden } from "./TareasOrden.tsx";

const getMaquina = getMaquinaDetalleSimple(getOrden, ordenVacia);
const contextoInicial = { estado: "INICIAL" as const, entidad: ordenVacia() };


/**
 * Detalle de la orden de producción: cabecera con autoguardado (fuera de PTE solo descripción,
 * observaciones y fecha de entrega), su lote, sus tareas con sus acciones, sus movimientos de
 * stock y observaciones. Lanzar, Terminar orden, Sacar proceso y Borrar se habilitan con las
 * acciones del ciclo de vida de la orden; tras cada una se recarga la orden.
 */
export const DetalleOrden = ({ id, publicar = async () => {} }: { id?: string; publicar?: EmitirEvento }) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);
    const orden = ctx.entidad;
    const [acciones, setAcciones] = useState<AccionesCicloVida | null>(null);
    const [operacion, setOperacion] = useState<"terminar" | "sacar" | null>(null);
    const [lanzando, setLanzando] = useState(false);
    const { intentar } = useContext(ContextoError);

    useEffect(() => {
        emitir("id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Las acciones se vuelven a leer cada vez que se recarga la orden.
    useEffect(() => {
        setAcciones(null);
        if (!orden.id) return;
        let vigente = true;
        getAccionesOrden(orden.id)
            .then((a) => vigente && setAcciones(a))
            .catch(() => vigente && setAcciones(null));
        return () => {
            vigente = false;
        };
    }, [orden]);

    const recargar = useCallback(() => emitir("entidad_guardada"), [emitir]);

    const lanzar = useCallback(async () => {
        setLanzando(true);
        try {
            await intentar(() => postLanzarOrden(orden.id));
        } catch {
            // `intentar` ya muestra el error (p. ej. 409: la orden no se puede lanzar y por qué).
        } finally {
            setLanzando(false);
            await recargar();
        }
    }, [intentar, orden.id, recargar]);

    const autoGuardar = useCallback(
        async (cambiada: OrdenProduccion) => {
            const cambios = cambiosOrden(orden, cambiada);
            if (Object.keys(cambios).length === 0) return;
            try {
                await patchOrden(orden.id, cambios);
            } finally {
                // Con error, se vuelve a lo que hay en el servidor.
                await recargar();
            }
        },
        [orden, recargar]
    );

    const meta = useMemo(() => metaOrden(acciones), [acciones]);
    const modelo = useModelo(meta, orden, autoGuardar);
    const { uiProps } = modelo;

    if (!orden.id) return null;

    const pendiente = orden.estado === "PTE";
    const puedeBorrar = cabeAccion(acciones, COMANDO.borrar, pendiente);
    const motor = accionesMotorOrden(orden, acciones);
    const cambiaTodo = cabeAccion(acciones, COMANDO.cambiar, pendiente);

    return (
        <Detalle
            id={id}
            obtenerTitulo={tituloOrden}
            obtenerEstado={(o: OrdenProduccion) => <EstadoOrden orden={o} />}
            setEntidad={() => {}}
            entidad={orden}
            cerrarDetalle={() => emitir("entidad_deseleccionada", null, true)}
        >
            <div className="DetalleOrdenProduccion FormOrdenProduccion">
                <div className="fila-acciones-orden">
                    <IndicadorGuardado modificado={modelo.modificado} error={modelo.errorGuardado} guardados={modelo.guardados} />
                    <div className="maestro-botones">
                        <span title={motivoAccion(acciones, COMANDO.lanzar)}>
                            <QBoton deshabilitado={!motor.lanzar || lanzando} onClick={lanzar}>
                                {lanzando ? "Lanzando..." : "Lanzar"}
                            </QBoton>
                        </span>
                        <span title={motivoAccion(acciones, COMANDO.terminar)}>
                            <QBoton deshabilitado={!motor.terminar} onClick={() => setOperacion("terminar")}>
                                Terminar orden
                            </QBoton>
                        </span>
                        <span title={motivoAccion(acciones, COMANDO.sacarProceso)}>
                            <QBoton advertencia deshabilitado={!motor.sacarProceso} onClick={() => setOperacion("sacar")}>
                                Sacar proceso
                            </QBoton>
                        </span>
                        <QBoton
                            destructivo
                            deshabilitado={!puedeBorrar}
                            onClick={() => emitir("borrado_solicitado")}
                        >
                            Borrar
                        </QBoton>
                    </div>
                </div>
                {!puedeBorrar && (
                    <p className="nota-orden">
                        {motivoAccion(acciones, COMANDO.borrar) ?? "Solo se borran las órdenes pendientes."}
                    </p>
                )}

                <Tabs>
                    <Tab label="Datos">
                        {!cambiaTodo && (
                            <p className="nota-orden">
                                La orden no está pendiente: solo se cambian la descripción, la fecha de entrega y las observaciones.
                            </p>
                        )}
                        <quimera-formulario>
                            <QInput label="Código" nombre="id" valor={orden.id} soloLectura />
                            <CampoFecha label="Fecha" {...uiProps("fecha")} />
                            <CampoFecha label="Fecha de entrega" {...uiProps("fechaEntrega")} />
                            <QInput label="Descripción" {...uiProps("descripcion")} />
                            <Cliente
                                {...uiProps("clienteId", "cliente")}
                                nombre="clienteId"
                                valor={modelo.modelo.clienteId ?? ""}
                                descripcion={modelo.modelo.cliente ?? ""}
                                deshabilitado={!cambiaTodo}
                                opcional
                            />
                            <SelectorPedidoCliente
                                {...uiProps("pedidoId")}
                                clienteId={modelo.modelo.clienteId || undefined}
                                soloLectura={!cambiaTodo}
                                onChange={(opcion) => {
                                    if (!opcion) {
                                        uiProps("pedidoId").onChange(null);
                                        return;
                                    }
                                    // El pedido trae su cliente si la orden aún no tiene.
                                    const conCliente = !modelo.modelo.clienteId && opcion.clienteId
                                        ? { clienteId: opcion.clienteId, cliente: opcion.nombreCliente }
                                        : {};
                                    modelo.set({ ...modelo.modelo, pedidoId: opcion.valor, ...conCliente }, "pedidoId");
                                }}
                            />
                            <QInput label="Total lotes" nombre="totalLotes" valor={formatearCantidad(orden.totalLotes)} soloLectura />
                            <QInput label="Total unidades" nombre="totalUds" valor={formatearCantidad(orden.totalUds)} soloLectura />
                        </quimera-formulario>
                    </Tab>
                    <Tab label={orden.lotes.length > 1 ? `Lotes (${orden.lotes.length})` : "Lote"}>
                        <LoteOrdenProduccion orden={orden} acciones={acciones} recargar={recargar} />
                    </Tab>
                    <Tab label={orden.tareas.length ? `Tareas (${orden.tareas.length})` : "Tareas"}>
                        <TareasOrden orden={orden} recargar={recargar} />
                    </Tab>
                    <Tab label="Movimientos">
                        <MovimientosOrden orden={orden} />
                    </Tab>
                    <Tab label="Observaciones">
                        <quimera-formulario>
                            <QTextArea label="Observaciones" rows={6} {...uiProps("observaciones")} />
                        </quimera-formulario>
                    </Tab>
                </Tabs>
            </div>

            {operacion === "terminar" && (
                <TerminarOrden orden={orden} cerrar={() => setOperacion(null)} recargar={recargar} />
            )}
            {operacion === "sacar" && (
                <SacarProcesoOrden orden={orden} cerrar={() => setOperacion(null)} recargar={recargar} />
            )}

            {ctx.estado === "BORRANDO" && (
                <BorrarSimple
                    publicar={emitir}
                    titulo="Borrar orden de producción"
                    mensaje={orden.lanzada
                        ? `La orden ${orden.id} está lanzada: se saca su proceso y se borra con su lote. ¿Continuar?`
                        : `¿Está seguro de que desea borrar la orden ${orden.id} con su lote?`}
                    borrar={() => deleteOrden(orden.id)}
                />
            )}
        </Detalle>
    );
};
