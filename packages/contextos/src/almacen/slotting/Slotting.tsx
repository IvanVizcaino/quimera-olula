import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { ArticuloAbc, ClaseAbc, PropuestaUbicacion, Recolocacion } from "./diseño.ts";
import { origenesRotacion, textoDestinoRecolocacion } from "./dominio.ts";
import { contextoSlottingInicial, getMaquina } from "./maquina.ts";

const colorClase: Record<ClaseAbc, string> = { A: "#2e7d32", B: "#f9a825", C: "#c62828" };

export const InsigniaClase = ({ clase }: { clase: ClaseAbc }) => (
    <span
        className={`insignia-clase clase-${clase}`}
        style={{
            background: colorClase[clase], color: "#fff", borderRadius: 4,
            padding: "0 8px", fontWeight: "bold",
        }}
    >
        {clase}
    </span>
);

export const Slotting = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoSlottingInicial);
    const { almacenId } = ctx;

    return (
        <div className="Slotting">
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
                ]}
            />
        </div>
    );
};

const TablaAbc = ({ abc }: { abc: ArticuloAbc[] }) => (
    <table className="tabla-abc">
        <thead>
            <tr>
                <th>Artículo</th><th>Descripción</th><th>Líneas</th><th>Unidades</th><th>% acumulado</th><th>Clase</th>
            </tr>
        </thead>
        <tbody>
            {abc.map((a) => (
                <tr key={a.articuloId}>
                    <td>{a.articuloId}</td>
                    <td>{a.descripcion}</td>
                    <td>{a.lineas}</td>
                    <td>{a.unidades}</td>
                    <td>{a.porcentajeAcumulado}</td>
                    <td><InsigniaClase clase={a.clase} /></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const ResultadoPropuesta = ({ propuesta }: { propuesta: PropuestaUbicacion }) => (
    <div className="resultado-propuesta">
        <p>Clase del artículo: <InsigniaClase clase={propuesta.clase} /></p>
        {propuesta.ubicaciones.length === 0 ? (
            <p>No hay ubicaciones vacías disponibles.</p>
        ) : (
            <table className="tabla-propuesta">
                <thead>
                    <tr><th>Ubicación</th><th>Zona</th><th>Accesibilidad</th><th>Clase</th></tr>
                </thead>
                <tbody>
                    {propuesta.ubicaciones.map((u) => (
                        <tr key={u.ubicacionId}>
                            <td>{u.ubicacion}</td>
                            <td>{u.zona}</td>
                            <td>{u.accesibilidad}</td>
                            <td><InsigniaClase clase={u.claseUbicacion} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const TablaRecolocacion = ({ recolocaciones }: { recolocaciones: Recolocacion[] }) => (
    <table className="tabla-recolocacion">
        <thead>
            <tr>
                <th>Artículo</th><th>Clase</th><th>Ubicación actual</th><th>Clase ubicación</th>
                <th>Acción</th><th>Destino</th><th>Beneficio</th>
            </tr>
        </thead>
        <tbody>
            {recolocaciones.map((r, i) => (
                <tr key={`${r.articuloId}-${r.ubicacion}-${i}`}>
                    <td>{r.articuloId}</td>
                    <td><InsigniaClase clase={r.clase} /></td>
                    <td>{r.ubicacion}</td>
                    <td><InsigniaClase clase={r.claseUbicacion} /></td>
                    <td>{r.accion}</td>
                    <td>{textoDestinoRecolocacion(r)}</td>
                    <td>{r.beneficio}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
