import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useState } from "react";
import { Pedido } from "../diseño.ts";
import { mensajeCierreHastaFecha } from "./maestro.ts";
import { getPedidos, postCerrarPedidosHastaFecha } from "../infraestructura.ts";

const MAX_LISTADOS = 100;

type Simulacion = { fecha: string; total: number; pedidos: Pedido[] };

/**
 * Eneboo `cerrarPedidosCli` ("Cerrar pedidos de cliente hasta una fecha"):
 * pide la fecha, muestra los pedidos afectados (simulación) y, tras confirmar,
 * los cierra.
 */
export const CerrarPedidosHastaFecha = ({ publicar }: { publicar: EmitirEvento }) => {
    const [fecha, setFecha] = useState("");
    const [simulacion, setSimulacion] = useState<Simulacion | null>(null);
    const [trabajando, setTrabajando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ejecutar = async (accion: () => Promise<void>) => {
        setTrabajando(true);
        setError(null);
        try {
            await accion();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setTrabajando(false);
        }
    };

    const simular = () =>
        !fecha ? undefined : ejecutar(async () => {
            const resultado = await postCerrarPedidosHastaFecha(new Date(fecha), true);
            const ids = resultado.pedidoIds.slice(0, MAX_LISTADOS);
            let datos: Pedido[] = [];
            if (ids.length) {
                try {
                    datos = (
                        await getPedidos(
                            [["id", "in", ids.map(Number) as unknown as string]],
                            ["fecha", "ASC"],
                            { pagina: 1, limite: MAX_LISTADOS }
                        )
                    ).datos;
                } catch {
                    datos = []; // el recuento de la simulación sigue siendo válido
                }
            }
            setSimulacion({ fecha, total: resultado.total, pedidos: datos });
        });

    const cerrar = () =>
        !simulacion || simulacion.total === 0 ? undefined : ejecutar(async () => {
            await postCerrarPedidosHastaFecha(new Date(simulacion!.fecha), false);
            await publicar("pedidos_cerrados_hasta_fecha");
        });

    const cancelar = () => {
        if (!trabajando) publicar("cierre_hasta_fecha_cancelado");
    };

    return (
        <QModal
            nombre="cerrarPedidosHastaFecha"
            abierto={true}
            titulo="Cerrar pedidos hasta fecha"
            onCerrar={cancelar}
            bloquearCierre={trabajando}
        >
            <quimera-formulario>
                <QInput
                    label="Fecha hasta (inclusive)"
                    nombre="fechaHasta"
                    tipo="fecha"
                    valor={fecha}
                    deshabilitado={trabajando}
                    onChange={(valor) => {
                        setFecha(valor);
                        setSimulacion(null);
                    }}
                />
            </quimera-formulario>

            {simulacion && (
                <div className="resultado-simulacion">
                    <div className="mensaje">
                        {mensajeCierreHastaFecha(simulacion.total, simulacion.fecha)}
                    </div>
                    {simulacion.pedidos.length > 0 && (
                        <ul>
                            {simulacion.pedidos.map((p) => (
                                <li key={p.id}>
                                    {`${p.codigo} · ${p.cliente.nombre_cliente} · ${p.fecha.toISOString().slice(0, 10)}`}
                                </li>
                            ))}
                            {simulacion.total > simulacion.pedidos.length && (
                                <li>{`… y ${simulacion.total - simulacion.pedidos.length} más`}</li>
                            )}
                        </ul>
                    )}
                </div>
            )}

            {error && <div className="mensaje error">{error}</div>}

            <div className="botones">
                <QBoton variante="texto" tipo="reset" onClick={cancelar} deshabilitado={trabajando}>
                    Cancelar
                </QBoton>
                <QBoton onClick={simular} deshabilitado={trabajando || !fecha}>
                    Simular
                </QBoton>
                <QBoton
                    onClick={cerrar}
                    deshabilitado={trabajando || !simulacion || simulacion.total === 0}
                    destructivo
                >
                    {simulacion && simulacion.total > 0
                        ? `Cerrar ${simulacion.total} pedidos`
                        : "Cerrar pedidos"}
                </QBoton>
            </div>
        </QModal>
    );
};
