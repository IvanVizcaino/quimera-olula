import { Articulo as ArticuloSelector } from "#/almacen/comun/componentes/Articulo.tsx";
import { UnidadMedidaSelector } from "#/almacen/comun/componentes/UnidadMedida.tsx";
import {
    ComponenteArticuloKit,
    ComponenteArticuloKitPatch,
} from "#/almacen/articulo_compuesto/diseño.ts";
import {
    getComposicionArticuloKit,
    patchComposicionArticuloKit,
} from "#/almacen/articulo_compuesto/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useCallback, useEffect, useState } from "react";
import "./TabComponentes.css";

const componenteVacio = (): ComponenteArticuloKit => ({
    id: "",
    articuloId: "",
    cantidad: 1,
    unidadId: null,
});

/** Texto literal de Eneboo (`articuloscomp_bChPreCursor`, `stockcomp`). */
export const MENSAJE_STOCK_POR_COMPONENTES =
    "Esta acción no es reversible. No podrá guardar si el artículo no tiene componentes o ya tiene movimientos de stock asociados. ¿Desea continuar?";

const aPatch = (c: ComponenteArticuloKit): ComponenteArticuloKitPatch => ({
    id: c.id || undefined,
    articuloId: c.articuloId,
    cantidad: c.cantidad,
    unidadId: c.unidadId,
});

export const TabComponentes = ({ articuloId }: { articuloId: string }) => {
    const editable = puede("almacen.articulo");
    const conPesosMedidas = pluginActivo("pesos_medidas");

    const [componentes, setComponentes] = useState<ComponenteArticuloKit[]>([]);
    // `stockcomp` guardado en BD (deshabilita el campo) y activación pendiente de guardar.
    const [stockCompGuardado, setStockCompGuardado] = useState(false);
    const [stockCompPendiente, setStockCompPendiente] = useState(false);
    const [confirmandoStockComp, setConfirmandoStockComp] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorCarga, setErrorCarga] = useState<string | null>(null);
    const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
    const [guardadoOk, setGuardadoOk] = useState(false);

    const recargar = useCallback(async () => {
        setCargando(true);
        setErrorCarga(null);
        setGuardadoOk(false);
        try {
            const comp = await getComposicionArticuloKit(articuloId);
            setComponentes(comp.componentes);
            setStockCompGuardado(comp.stockPorComponentes);
            setStockCompPendiente(false);
        } catch (e) {
            const msg =
                e && typeof e === "object" && "descripcion" in e
                    ? String((e as { descripcion: string }).descripcion)
                    : "No se pudo cargar la composición";
            setErrorCarga(msg);
            setComponentes([]);
            setStockCompGuardado(false);
            setStockCompPendiente(false);
        } finally {
            setCargando(false);
        }
    }, [articuloId]);

    useEffect(() => {
        recargar();
    }, [recargar]);

    const actualizarFila = (indice: number, cambios: Partial<ComponenteArticuloKit>) => {
        setComponentes((prev) =>
            prev.map((fila, i) => (i === indice ? { ...fila, ...cambios } : fila)),
        );
        setGuardadoOk(false);
    };

    const quitarFila = (indice: number) => {
        setComponentes((prev) => prev.filter((_, i) => i !== indice));
        setGuardadoOk(false);
    };

    const anadirFila = () => {
        setComponentes((prev) => [...prev, componenteVacio()]);
        setGuardadoOk(false);
    };

    const guardar = async () => {
        setGuardando(true);
        setErrorGuardado(null);
        setGuardadoOk(false);
        try {
            const validos = componentes.filter((c) => c.articuloId.trim() !== "");
            await patchComposicionArticuloKit(
                articuloId,
                validos.map(aPatch),
                stockCompPendiente && !stockCompGuardado,
            );
            setGuardadoOk(true);
            await recargar();
        } catch (e) {
            const msg =
                e && typeof e === "object" && "descripcion" in e
                    ? String((e as { descripcion: string }).descripcion)
                    : "No se pudo guardar";
            setErrorGuardado(msg);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return <p className="TabComponentes__estado">Cargando componentes…</p>;
    }

    return (
        <div className="TabComponentes">
            <p className="TabComponentes__ayuda">
                Componentes del kit (cantidad por unidad vendida del artículo compuesto). No incluye
                opciones variables de TPV ni ensamblados en almacén.
            </p>

            {errorCarga && (
                <QAviso variante="advertencia">
                    <strong>API no disponible.</strong> {errorCarga}
                    <p className="TabComponentes__contrato">
                        Backend pendiente: GET/PATCH{" "}
                        <code>/almacen/articulo/{articuloId}/compuesto</code> → comando{" "}
                        <code>almacen.articulo_compuesto.cambiar</code>.
                    </p>
                </QAviso>
            )}

            {errorGuardado && (
                <QAviso variante="error">
                    <strong>Error al guardar.</strong> {errorGuardado}
                </QAviso>
            )}

            {guardadoOk && <p className="TabComponentes__ok">Componentes actualizados.</p>}

            <QCheckbox
                label="Control stock componentes"
                nombre="stock_por_componentes"
                valor={stockCompGuardado || stockCompPendiente}
                deshabilitado={stockCompGuardado || !editable || Boolean(errorCarga)}
                onChange={(v) => {
                    if (v === "true") setConfirmandoStockComp(true);
                    else setStockCompPendiente(false);
                    setGuardadoOk(false);
                }}
            />
            <QModalConfirmacion
                nombre="confirmarStockPorComponentes"
                abierto={confirmandoStockComp}
                titulo="Control stock componentes"
                mensaje={MENSAJE_STOCK_POR_COMPONENTES}
                labelAceptar="Sí"
                labelCancelar="No"
                onCerrar={() => setConfirmandoStockComp(false)}
                onAceptar={() => {
                    setStockCompPendiente(true);
                    setConfirmandoStockComp(false);
                }}
            />

            <div className="TabComponentes__cabecera">
                {editable && (
                    <QBoton onClick={anadirFila} variante="borde">
                        Añadir componente
                    </QBoton>
                )}
                {editable && (
                    <QBoton onClick={guardar} deshabilitado={guardando || Boolean(errorCarga)}>
                        Guardar componentes
                    </QBoton>
                )}
            </div>

            {componentes.length === 0 ? (
                <p>Sin componentes definidos.</p>
            ) : (
                <table className="TabComponentes__tabla">
                    <thead>
                        <tr>
                            <th>Componente</th>
                            <th>Cantidad</th>
                            {conPesosMedidas && <th>Unidad</th>}
                            {editable && <th aria-label="Acciones" />}
                        </tr>
                    </thead>
                    <tbody>
                        {componentes.map((fila, indice) => (
                            <tr key={fila.id || `nuevo-${indice}`}>
                                <td>
                                    <ArticuloSelector
                                        valor={fila.articuloId}
                                        descripcion={fila.descripcionArticulo}
                                        onChange={(opcion) =>
                                            actualizarFila(indice, {
                                                articuloId: opcion?.valor ?? "",
                                                descripcionArticulo: opcion?.descripcion,
                                            })
                                        }
                                        soloLectura={!editable}
                                    />
                                </td>
                                <td>
                                    <QInput
                                        label=""
                                        nombre={`cantidad_${indice}`}
                                        tipo="decimal"
                                        valor={String(fila.cantidad)}
                                        soloLectura={!editable}
                                        onChange={(v) =>
                                            actualizarFila(indice, {
                                                cantidad: Number.parseFloat(v) || 0,
                                            })
                                        }
                                    />
                                </td>
                                {conPesosMedidas && (
                                    <td>
                                        <UnidadMedidaSelector
                                            valor={fila.unidadId ?? ""}
                                            nombre={`unidad_${indice}`}
                                            label=""
                                            soloLectura={!editable}
                                            onChange={(opcion) =>
                                                actualizarFila(indice, {
                                                    unidadId: opcion?.valor || null,
                                                })
                                            }
                                        />
                                    </td>
                                )}
                                {editable && (
                                    <td>
                                        <QBoton
                                            variante="texto"
                                            tamaño="pequeño"
                                            destructivo
                                            props={{ title: "Quitar" }}
                                            onClick={() => quitarFila(indice)}
                                        >
                                            <QIcono nombre="eliminar" tamaño="sm" />
                                        </QBoton>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
