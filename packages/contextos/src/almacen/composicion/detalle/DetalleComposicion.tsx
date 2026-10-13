import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo as ArticuloSelector } from "#/almacen/comun/componentes/Articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BorrarComposicion } from "../borrar/BorrarComposicion.tsx";
import { Composicion, LineaComposicion } from "../diseño.ts";
import {
    CabeceraComposicion,
    cambiosCabecera,
    lineaComposicionVacia,
    lineasModificadas,
    lineasValidas,
    metaCabeceraComposicion,
} from "../dominio.ts";
import { patchComposicion } from "../infraestructura.ts";
import { contextoComposicionInicial } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (c: Composicion) => `${c.id} - ${c.descripcion || c.articuloId}`;

const cabeceraDe = (c: Composicion): CabeceraComposicion => ({
    almacenId: c.almacenId,
    cantidad: c.cantidad,
    fecha: c.fecha,
    hora: c.hora,
});

export const MENSAJE_GENERAR_COMPOSICION =
    "Se borrarán todas las líneas y se volverán a generar a partir de los componentes del artículo con la cantidad indicada. ¿Desea continuar?";

export const DetalleComposicion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const editable = puede("almacen.composicion");

    const { ctx, emitir } = useMaquina(getMaquina, contextoComposicionInicial(), publicar);

    const cabecera = useMemo(() => cabeceraDe(ctx.composicion), [ctx.composicion]);
    const form = useModelo(metaCabeceraComposicion, cabecera);

    // Líneas editadas en local; se envían completas al guardar (diff por id en el backend).
    const [lineas, setLineas] = useState<LineaComposicion[]>(ctx.composicion.lineas);
    useEffect(() => setLineas(ctx.composicion.lineas), [ctx.composicion]);

    useEffect(() => {
        emitir("composicion_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const lineasCambiadas = lineasModificadas(ctx.composicion.lineas, lineas);
    const modificado = form.modificado || lineasCambiadas;

    const actualizarLinea = (indice: number, cambios: Partial<LineaComposicion>) =>
        setLineas((prev) => prev.map((l, i) => (i === indice ? { ...l, ...cambios } : l)));

    const quitarLinea = (indice: number) =>
        setLineas((prev) => prev.filter((_, i) => i !== indice));

    const anadirLinea = () =>
        setLineas((prev) => [...prev, lineaComposicionVacia(form.modelo.almacenId)]);

    const guardar = useCallback(async () => {
        const cambios = cambiosCabecera(ctx.composicion, form.modelo);
        await intentar(() =>
            patchComposicion(ctx.composicion.id, {
                ...cambios,
                ...(lineasCambiadas ? { lineas: lineasValidas(lineas) } : {}),
            }),
        );
        emitir("composicion_guardada");
    }, [ctx.composicion, emitir, form.modelo, intentar, lineas, lineasCambiadas]);

    const generar = useCallback(async () => {
        // Eneboo genera con la cantidad/almacén del buffer del formulario.
        const cambios = cambiosCabecera(ctx.composicion, form.modelo);
        await intentar(() =>
            patchComposicion(ctx.composicion.id, { ...cambios, regenerarLineas: true }),
        );
        emitir("composicion_generada");
    }, [ctx.composicion, emitir, form.modelo, intentar]);

    const cancelar = useCallback(() => {
        setLineas(ctx.composicion.lineas);
        emitir("cancelar_edicion");
    }, [ctx.composicion.lineas, emitir]);

    if (!ctx.composicion.id) return null;

    return (
        <Detalle
            id={ctx.composicion.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.composicion}
            cerrarDetalle={() => emitir("cancelar_seleccion")}
        >
            <>
                {editable && (
                    <div className="maestro-botones">
                        <QBoton onClick={() => emitir("generar_solicitada")}>Generar composición</QBoton>
                        <QBoton onClick={() => emitir("borrar")}>Borrar</QBoton>
                    </div>
                )}
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Identificador" nombre="id" valor={ctx.composicion.id} soloLectura />
                                <QInput label="Fecha" {...form.uiProps("fecha")} tipo="fecha" soloLectura={!editable} />
                                <QInput label="Hora" {...form.uiProps("hora")} tipo="hora" soloLectura={!editable} />
                                <QInput label="Responsable" nombre="usuario_id" valor={ctx.composicion.usuarioId} soloLectura />
                                <QInput
                                    label="Artículo"
                                    nombre="articulo_id"
                                    valor={`${ctx.composicion.articuloId} - ${ctx.composicion.descripcion}`}
                                    soloLectura
                                />
                                <QInput
                                    label="Cantidad"
                                    {...form.uiProps("cantidad")}
                                    soloLectura={!editable}
                                />
                                <Almacen {...form.uiProps("almacenId")} nombre="almacenId" />
                            </quimera-formulario>
                        </Tab>,
                        <Tab key="lineas" label="Componentes usados">
                            {editable && (
                                <div className="maestro-botones">
                                    <QBoton onClick={anadirLinea} variante="borde">
                                        Añadir línea
                                    </QBoton>
                                </div>
                            )}
                            {lineas.length === 0 ? (
                                <p>Sin componentes. Use «Generar composición» para crearlos.</p>
                            ) : (
                                <table className="LineasComposicion">
                                    <thead>
                                        <tr>
                                            <th>Artículo</th>
                                            <th>Cantidad</th>
                                            <th>Almacén</th>
                                            {editable && <th aria-label="Acciones" />}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineas.map((linea, indice) => (
                                            <tr key={linea.id || `nueva-${indice}`}>
                                                <td>
                                                    <ArticuloSelector
                                                        valor={linea.articuloId}
                                                        descripcion={linea.descripcion}
                                                        nombre={`articulo_${indice}`}
                                                        label=""
                                                        soloLectura={!editable}
                                                        onChange={(opcion) =>
                                                            actualizarLinea(indice, {
                                                                articuloId: opcion?.valor ?? "",
                                                                descripcion: opcion?.descripcion,
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <QInput
                                                        label=""
                                                        nombre={`cantidad_${indice}`}
                                                        tipo="decimal"
                                                        valor={String(linea.cantidad)}
                                                        soloLectura={!editable}
                                                        onChange={(v) =>
                                                            actualizarLinea(indice, {
                                                                cantidad: Number.parseFloat(v) || 0,
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Almacen
                                                        valor={linea.almacenId}
                                                        nombre={`almacen_${indice}`}
                                                        label=""
                                                        deshabilitado={!editable}
                                                        onChange={(opcion) =>
                                                            actualizarLinea(indice, {
                                                                almacenId: opcion?.valor ?? "",
                                                            })
                                                        }
                                                    />
                                                </td>
                                                {editable && (
                                                    <td>
                                                        <QBoton
                                                            variante="texto"
                                                            tamaño="pequeño"
                                                            destructivo
                                                            props={{ title: "Quitar" }}
                                                            onClick={() => quitarLinea(indice)}
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
                        </Tab>,
                    ]}
                />
                {editable && modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!form.valido && form.modificado}>
                            Guardar
                        </QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar}>
                            Cancelar
                        </QBoton>
                    </div>
                )}
                <QModalConfirmacion
                    nombre="confirmarGenerarComposicion"
                    abierto={ctx.estado === "Generando"}
                    titulo="Generar composición"
                    mensaje={MENSAJE_GENERAR_COMPOSICION}
                    onCerrar={() => emitir("generacion_cancelada")}
                    onAceptar={generar}
                />
                <BorrarComposicion
                    publicar={emitir}
                    activo={ctx.estado === "Borrando"}
                    composicion={ctx.composicion}
                />
            </>
        </Detalle>
    );
};
