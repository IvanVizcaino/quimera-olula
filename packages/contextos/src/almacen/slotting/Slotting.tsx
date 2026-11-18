import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { AjusteMigracion, ArticuloAbc, ClaseAbc, FilaPickingFijo, PropuestaUbicacion, Recolocacion } from "./diseño.ts";
import {
    clasesPicking, COBERTURA_POR_DEFECTO, DIAS_POR_DEFECTO, enteroPositivo, errorValidacionFila,
    explicacionAbc, explicacionCantidadesPicking, filaPickingMarcable, filasPickingACrear,
    origenesRotacion, puedeUbicarMigracion, REPOSICION_POR_DEFECTO, resumenMigracion,
    textoDestinoRecolocacion, todasPickingMarcadas,
} from "./dominio.ts";
import "#/comun/estilos/pagina_proceso.css";
import "./Slotting.css";
import { contextoSlottingInicial, getMaquina } from "./maquina.ts";

const varianteClase = { A: "exito", B: "advertencia", C: "error" } as const;

export const InsigniaClase = ({ clase }: { clase: ClaseAbc }) => (
    <QEtiqueta variante={varianteClase[clase]}>{clase}</QEtiqueta>
);

export const Slotting = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoSlottingInicial);
    const { almacenId } = ctx;

    return (
        <div className="Slotting PaginaProceso">
            <h2>Slotting</h2>

            <quimera-formulario>
                <Almacen
                    label="Almacén"
                    nombre="almacenId"
                    valor={almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
                <QSelect
                    label="Rotación según"
                    nombre="origen"
                    valor={ctx.origen}
                    opciones={origenesRotacion}
                    onChange={(opcion) => emitir("origen_cambiado", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            <Tabs
                children={[
                    <Tab key="abc" label="ABC">
                        <div className="slotting-explicacion">
                            <strong>Cómo se calcula</strong>
                            <ul>
                                {explicacionAbc(ctx.origen, enteroPositivo(ctx.diasAbc, DIAS_POR_DEFECTO)).map((t) => (
                                    <li key={t}>{t}</li>
                                ))}
                            </ul>
                        </div>
                        <quimera-formulario>
                            <QInput
                                label="Días" nombre="diasAbc" tipo="numero" valor={ctx.diasAbc}
                                onChange={(v: string) => emitir("dias_abc_cambiados", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("abc_solicitado")}>
                                Calcular
                            </QBoton>
                        </div>
                        {ctx.abc && (ctx.abc.length === 0 ? <p>No hay movimiento en el periodo.</p> : <TablaAbc abc={ctx.abc} />)}
                    </Tab>,
                    <Tab key="picking" label="Asignar picking fijo">
                        <div className="slotting-explicacion">
                            <strong>Cómo se calculan las cantidades</strong>
                            <ul>
                                {explicacionCantidadesPicking(
                                    enteroPositivo(ctx.coberturaPicking, COBERTURA_POR_DEFECTO),
                                    enteroPositivo(ctx.reposicionPicking, REPOSICION_POR_DEFECTO)
                                ).map((t) => <li key={t}>{t}</li>)}
                            </ul>
                        </div>
                        <quimera-formulario>
                            <QInput
                                label="Días" nombre="diasPicking" tipo="numero" valor={ctx.diasPicking}
                                onChange={(v: string) => emitir("dias_picking_cambiados", v)}
                            />
                            <QSelect
                                label="Clases" nombre="clasesPicking" valor={ctx.clasesPicking}
                                opciones={clasesPicking}
                                onChange={(opcion) => emitir("clases_picking_cambiadas", opcion?.valor ?? "")}
                            />
                            <QInput
                                label="Cobertura (días)" nombre="coberturaPicking" tipo="numero"
                                valor={ctx.coberturaPicking}
                                onChange={(v: string) => emitir("cobertura_picking_cambiada", v)}
                            />
                            <QInput
                                label="Reposición (días)" nombre="reposicionPicking" tipo="numero"
                                valor={ctx.reposicionPicking}
                                onChange={(v: string) => emitir("reposicion_picking_cambiada", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("picking_solicitado")}>
                                Proponer
                            </QBoton>
                            {ctx.filasPicking && ctx.filasPicking.some(filaPickingMarcable) && (
                                <QBoton
                                    variante="texto"
                                    onClick={() => emitir(
                                        "seleccion_picking_cambiada",
                                        !todasPickingMarcadas(ctx.filasPicking ?? [])
                                    )}
                                >
                                    {todasPickingMarcadas(ctx.filasPicking) ? "Desmarcar todos" : "Marcar todos"}
                                </QBoton>
                            )}
                            {ctx.filasPicking && (
                                <QBoton
                                    deshabilitado={filasPickingACrear(ctx.filasPicking).length === 0}
                                    onClick={() => emitir("picking_fijo_creacion_solicitada")}
                                >
                                    Crear picking fijo seleccionados
                                </QBoton>
                            )}
                        </div>
                        {ctx.resumenPicking && <p className="resumen-picking">{ctx.resumenPicking}</p>}
                        {ctx.filasPicking && (ctx.filasPicking.length === 0
                            ? <p>No hay artículos sin picking fijo para proponer.</p>
                            : <TablaPickingFijo
                                filas={ctx.filasPicking}
                                onCambio={(articuloId, cambios) => emitir("fila_picking_cambiada", { articuloId, cambios })}
                            />)}
                    </Tab>,
                    <Tab key="propuesta" label="Propuesta de ubicación">
                        <quimera-formulario>
                            <Articulo
                                valor={ctx.articuloId}
                                onChange={(opcion) => emitir("articulo_cambiado", opcion?.valor ?? "")}
                            />
                            <QInput
                                label="Límite" nombre="limitePropuesta" tipo="numero" valor={ctx.limitePropuesta}
                                onChange={(v: string) => emitir("limite_propuesta_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton
                                deshabilitado={!almacenId || !ctx.articuloId}
                                onClick={() => emitir("propuesta_solicitada")}
                            >
                                Proponer
                            </QBoton>
                        </div>
                        {ctx.propuesta && <ResultadoPropuesta propuesta={ctx.propuesta} />}
                    </Tab>,
                    <Tab key="recolocacion" label="Recolocación">
                        <quimera-formulario>
                            <QInput
                                label="Días" nombre="diasRecolocacion" tipo="numero" valor={ctx.diasRecolocacion}
                                onChange={(v: string) => emitir("dias_recolocacion_cambiados", v)}
                            />
                            <QInput
                                label="Límite" nombre="limiteRecolocacion" tipo="numero" valor={ctx.limiteRecolocacion}
                                onChange={(v: string) => emitir("limite_recolocacion_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton deshabilitado={!almacenId} onClick={() => emitir("recolocacion_solicitada")}>
                                Calcular
                            </QBoton>
                        </div>
                        {ctx.recolocaciones &&
                            (ctx.recolocaciones.length === 0
                                ? <p>No hay recolocaciones que proponer.</p>
                                : <TablaRecolocacion recolocaciones={ctx.recolocaciones} />)}
                    </Tab>,
                    <Tab key="migracion" label="Migración">
                        <div className="slotting-explicacion">
                            <strong>Ubicar el stock sin ubicar</strong>
                            <ul>
                                <li>Mueve a la ubicación elegida (p. ej. MIGRACION, en una zona de reserva) el stock del almacén que no está en ninguna ubicación, para que reposición y slotting lo vean.</li>
                                <li>Por cada artículo crea un par de movimientos que suman cero: no cambia el stock ni toca los movimientos anteriores.</li>
                                <li>Artículos por lotes: por lote, con el saldo de cada lote. Resto: el stock del almacén.</li>
                                <li>Se puede repetir: ubica lo nuevo y retira de esa ubicación lo vendido sin SGA.</li>
                            </ul>
                        </div>
                        <quimera-formulario>
                            <Ubicacion
                                label="Ubicación destino" nombre="ubicacionMigracion"
                                valor={ctx.ubicacionMigracionId} descripcion={ctx.ubicacionMigracion}
                                onChange={(opcion) => emitir("ubicacion_migracion_cambiada", opcion)}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton
                                variante="texto"
                                deshabilitado={!almacenId || !ctx.ubicacionMigracionId}
                                onClick={() => emitir("migracion_simulada")}
                            >
                                Simular
                            </QBoton>
                            <QBoton
                                deshabilitado={!puedeUbicarMigracion(ctx.resultadoMigracion)}
                                onClick={() => emitir("migracion_solicitada")}
                            >
                                Ubicar
                            </QBoton>
                        </div>
                        {ctx.resultadoMigracion && (
                            <>
                                <p className="resumen-picking">{resumenMigracion(ctx.resultadoMigracion)}</p>
                                {ctx.resultadoMigracion.ajustes.length > 0 && (
                                    <TablaMigracion ajustes={ctx.resultadoMigracion.ajustes} />
                                )}
                            </>
                        )}
                    </Tab>,
                ]}
            />
        </div>
    );
};

type Fila<T> = Entidad & T;

const conId = <T,>(filas: T[], id: (f: T, i: number) => string): Fila<T>[] =>
    filas.map((f, i) => ({ ...f, id: id(f, i) }) as Fila<T>);

const metaTablaAbc: MetaTabla<Fila<ArticuloAbc>> = [
    { id: "articuloId", cabecera: "Artículo", estilo: "destacado" },
    { id: "descripcion", cabecera: "Descripción", ancho: "40%" },
    { id: "lineas", cabecera: "Líneas", tipo: "numero" },
    { id: "unidades", cabecera: "Unidades", tipo: "numero" },
    { id: "porcentajeAcumulado", cabecera: "% acumulado", tipo: "numero" },
    { id: "clase", cabecera: "Clase", render: (a) => <InsigniaClase clase={a.clase} /> },
];

const TablaAbc = ({ abc }: { abc: ArticuloAbc[] }) => (
    <QTabla<Fila<ArticuloAbc>>
        metaTabla={metaTablaAbc}
        datos={conId(abc, (a) => a.articuloId)}
        cargando={false}
        orden={[]}
    />
);

type UbicacionPropuestaFila = PropuestaUbicacion["ubicaciones"][number];

const metaTablaPropuesta: MetaTabla<Fila<UbicacionPropuestaFila>> = [
    { id: "ubicacion", cabecera: "Ubicación", estilo: "destacado" },
    { id: "zona", cabecera: "Zona" },
    { id: "accesibilidad", cabecera: "Accesibilidad", tipo: "numero" },
    { id: "claseUbicacion", cabecera: "Clase", render: (u) => <InsigniaClase clase={u.claseUbicacion} /> },
];

const ResultadoPropuesta = ({ propuesta }: { propuesta: PropuestaUbicacion }) => (
    <div className="resultado-propuesta">
        <p>Clase del artículo: <InsigniaClase clase={propuesta.clase} /></p>
        {propuesta.ubicaciones.length === 0 ? (
            <p>No hay ubicaciones vacías disponibles.</p>
        ) : (
            <QTabla<Fila<UbicacionPropuestaFila>>
                metaTabla={metaTablaPropuesta}
                datos={conId(propuesta.ubicaciones, (u) => u.ubicacionId)}
                cargando={false}
                orden={[]}
            />
        )}
    </div>
);

const metaTablaRecolocacion: MetaTabla<Fila<Recolocacion>> = [
    { id: "articuloId", cabecera: "Artículo", estilo: "destacado" },
    { id: "clase", cabecera: "Clase", render: (r) => <InsigniaClase clase={r.clase} /> },
    { id: "ubicacion", cabecera: "Ubicación actual" },
    { id: "claseUbicacion", cabecera: "Clase ubicación", render: (r) => <InsigniaClase clase={r.claseUbicacion} /> },
    { id: "accion", cabecera: "Acción", render: (r) => (r.accion === "INTERCAMBIAR" ? "Intercambiar" : "Mover") },
    { id: "destino", cabecera: "Destino", render: (r) => textoDestinoRecolocacion(r) },
    { id: "beneficio", cabecera: "Beneficio", tipo: "numero" },
];

const TablaRecolocacion = ({ recolocaciones }: { recolocaciones: Recolocacion[] }) => (
    <QTabla<Fila<Recolocacion>>
        metaTabla={metaTablaRecolocacion}
        datos={conId(recolocaciones, (r, i) => `${r.articuloId}-${r.ubicacion}-${i}`)}
        cargando={false}
        orden={[]}
    />
);

const InputNumero = ({ valor, deshabilitado, onCambio }: {
    valor: number; deshabilitado: boolean; onCambio: (n: number) => void;
}) => (
    <input
        type="number" className="slotting-input-numero" value={Number.isNaN(valor) ? "" : valor}
        disabled={deshabilitado}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onCambio(e.target.value === "" ? NaN : Number(e.target.value))}
    />
);

const estadoFila = (f: FilaPickingFijo) => {
    if (f.estado === "CREADO") return <QEtiqueta variante="exito">Creado</QEtiqueta>;
    if (f.estado === "ERROR") return <span className="slotting-error">{f.errorCreacion}</span>;
    const error = f.ubicacionId ? errorValidacionFila(f) : null;
    return error ? <span className="slotting-error">{error}</span> : null;
};

const TablaPickingFijo = ({ filas, onCambio }: {
    filas: FilaPickingFijo[];
    onCambio: (articuloId: string, cambios: Partial<FilaPickingFijo>) => void;
}) => {
    const metaTabla: MetaTabla<Fila<FilaPickingFijo>> = [
        {
            id: "seleccionada", cabecera: "", ancho: "40px",
            render: (f) => (
                <input
                    type="checkbox" checked={f.seleccionada} disabled={!filaPickingMarcable(f)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onCambio(f.articuloId, { seleccionada: e.target.checked })}
                />
            ),
        },
        { id: "articuloId", cabecera: "Artículo", estilo: "destacado" },
        { id: "descripcion", cabecera: "Descripción", ancho: "25%" },
        { id: "clase", cabecera: "Clase", render: (f) => <InsigniaClase clase={f.clase} /> },
        { id: "lineas", cabecera: "Líneas", tipo: "numero" },
        {
            id: "ubicacion", cabecera: "Ubicación",
            render: (f) => f.ubicacion ?? <span className="slotting-sin-hueco">Sin hueco libre</span>,
        },
        { id: "zona", cabecera: "Zona", render: (f) => f.zona ?? "" },
        ...(["minimo", "maximo", "unidadReposicion"] as const).map((campo) => ({
            id: campo,
            cabecera: { minimo: "Mínimo", maximo: "Máximo", unidadReposicion: "Unidad" }[campo],
            render: (f: Fila<FilaPickingFijo>) => (
                <InputNumero
                    valor={f[campo]} deshabilitado={!filaPickingMarcable(f)}
                    onCambio={(n) => onCambio(f.articuloId, { [campo]: n, estado: "PENDIENTE", errorCreacion: null })}
                />
            ),
        })),
        { id: "estado", cabecera: "Estado", ancho: "20%", render: estadoFila },
    ];
    return (
        <QTabla<Fila<FilaPickingFijo>>
            metaTabla={metaTabla}
            datos={conId(filas, (f) => f.articuloId)}
            cargando={false}
            orden={[]}
        />
    );
};

const metaTablaMigracion: MetaTabla<Fila<AjusteMigracion>> = [
    { id: "articuloId", cabecera: "Artículo", estilo: "destacado" },
    { id: "loteId", cabecera: "Lote", render: (a) => a.loteId ?? "" },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
    { id: "accion", cabecera: "", render: (a) => (a.cantidad > 0 ? "Ubicar" : "Retirar") },
];

const TablaMigracion = ({ ajustes }: { ajustes: AjusteMigracion[] }) => (
    <QTabla<Fila<AjusteMigracion>>
        metaTabla={metaTablaMigracion}
        datos={conId(ajustes, (a) => `${a.stockId}-${a.loteId ?? ""}`)}
        cargando={false}
        orden={[]}
    />
);
