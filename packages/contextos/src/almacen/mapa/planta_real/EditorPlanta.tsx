import { useEffect, useState } from "react";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { ElegidoPlanta, MapaAlmacen, MedidasPlanta, PlantaAlmacen, TipoElemento } from "../diseño.ts";
import {
    avisosDistancia, avisosPlanta, cambiarElemento, desvincularUbicacion, sinVincular, vincularUbicaciones, cambiarPasilloEnPlanta, colocarPasillo, girarPasillo, medidasEfectivas,
    metrosNoNegativos, metrosPositivos, moverPieza, nuevoElemento, pasillosSinColocar, quitarElemento,
    quitarPasilloDePlanta, rotuloPasillo, tiposElemento,
} from "../dominio.ts";

type Props = {
    mapa: MapaAlmacen;
    planta: PlantaAlmacen;
    elegido: ElegidoPlanta | null;
    /** `elegido`: lo que queda elegido después (sin él, lo mismo). */
    onCambiar: (planta: PlantaAlmacen, elegido?: ElegidoPlanta | null) => void;
    onGuardar: () => void;
    onCancelar: () => void;
};

/**
 * Campo en metros que se aplica al salir (o con Enter): mientras se escribe no se toca la planta.
 * `opcional`: vacío = null (la medida de la planta).
 */
const CampoMetros = ({ label, nombre, valor, opcional, ceroValido, onCambio }: {
    label: string;
    nombre: string;
    valor: number | null;
    opcional?: boolean;
    ceroValido?: boolean;
    onCambio: (valor: number | null) => void;
}) => {
    const texto = valor === null ? "" : String(valor);
    const [escrito, setEscrito] = useState(texto);
    useEffect(() => setEscrito(texto), [texto]);

    const aplicar = (v: string) => {
        if (opcional && v.trim() === "") return onCambio(null);
        const n = ceroValido ? metrosNoNegativos(v) : metrosPositivos(v);
        if (n === null) return setEscrito(texto);
        onCambio(n);
    };

    return (
        <QInput
            label={label}
            nombre={nombre}
            tipo="numero"
            valor={escrito}
            placeholder={opcional ? "De la planta" : undefined}
            onChange={(v: string) => setEscrito(v)}
            onBlur={(v: string) => aplicar(v)}
            onEnterKeyUp={(v: string) => aplicar(v)}
        />
    );
};

const textoMedida: Record<keyof MedidasPlanta, string> = {
    largoModulo: "Largo de módulo (m)",
    fondo: "Fondo de estantería (m)",
    anchoPasillo: "Ancho de pasillo (m)",
};

const CAMPOS_MEDIDA: (keyof MedidasPlanta)[] = ["largoModulo", "fondo", "anchoPasillo"];

/** Panel del editor de la planta: nave, medidas, pieza elegida, pasillos sin colocar y avisos. */
export const EditorPlanta = ({ mapa, planta, elegido, onCambiar, onGuardar, onCancelar }: Props) => {
    const sinColocar = pasillosSinColocar(mapa, planta);
    const avisos = [...avisosDistancia(mapa, planta), ...avisosPlanta(mapa, planta)];
    const colocacion = elegido?.tipo === "PASILLO"
        ? planta.pasillos.find((c) => c.pasilloId === elegido.pasilloId) ?? null
        : null;
    const indiceElemento = elegido?.tipo === "ELEMENTO" ? elegido.indice : null;
    const elemento = indiceElemento !== null ? planta.elementos[indiceElemento] ?? null : null;

    return (
        <section className="mapa-panel mapa-editor-planta" aria-label="Editor de la planta">
            <div className="mapa-panel-cabecera">
                <h3>Editar planta</h3>
            </div>

            <p className="mapa-editor-ayuda">
                Arrastra los pasillos y elementos (o elígelos y usa las flechas): se encajan cada 0,5 m.
            </p>

            <fieldset>
                <legend>Nave y medidas por defecto</legend>
                <quimera-formulario>
                    <CampoMetros label="Ancho de la nave (m)" nombre="naveAncho" valor={planta.ancho}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, ancho: v })} />
                    <CampoMetros label="Largo de la nave (m)" nombre="naveLargo" valor={planta.largo}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, largo: v })} />
                    {CAMPOS_MEDIDA.map((campo) => (
                        <CampoMetros key={campo} label={textoMedida[campo]} nombre={`planta-${campo}`}
                            valor={planta.medidas[campo]}
                            onCambio={(v) => v !== null && onCambiar({ ...planta, medidas: { ...planta.medidas, [campo]: v } })} />
                    ))}
                    <CampoMetros label="Metros por nivel" nombre="metrosNivel" valor={planta.metrosNivel}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, metrosNivel: v })} />
                </quimera-formulario>
                <p className="mapa-editor-nota">
                    Metros a pie que equivalen a subir o bajar un nivel al medir la distancia a la salida.
                </p>
            </fieldset>

            {colocacion && (
                <fieldset>
                    <legend>Pasillo {rotuloPasillo(mapa, colocacion.pasilloId)}</legend>
                    <quimera-formulario>
                        <CampoMetros label="X (m)" nombre="pasilloX" valor={colocacion.x} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, v, colocacion.y))} />
                        <CampoMetros label="Y (m)" nombre="pasilloY" valor={colocacion.y} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, colocacion.x, v))} />
                        {CAMPOS_MEDIDA.map((campo) => (
                            <CampoMetros key={campo} label={textoMedida[campo]} nombre={`pasillo-${campo}`} opcional
                                valor={colocacion.medidas[campo] ?? null}
                                onCambio={(v) => {
                                    const medidas = { ...colocacion.medidas };
                                    if (v === null) delete medidas[campo];
                                    else medidas[campo] = v;
                                    onCambiar(cambiarPasilloEnPlanta(planta, colocacion.pasilloId, { medidas }));
                                }} />
                        ))}
                    </quimera-formulario>
                    <p className="mapa-editor-nota">
                        Giro {colocacion.giro}°. Medidas en uso:{" "}
                        {(() => {
                            const m = medidasEfectivas(planta.medidas, colocacion.medidas);
                            return `módulo ${m.largoModulo} m, fondo ${m.fondo} m, pasillo ${m.anchoPasillo} m`;
                        })()}
                    </p>
                    <div className="botones">
                        <QBoton variante="borde" onClick={() => onCambiar(girarPasillo(mapa, planta, colocacion.pasilloId))}>
                            Girar 90°
                        </QBoton>
                        <QBoton variante="texto" onClick={() => onCambiar(quitarPasilloDePlanta(planta, colocacion.pasilloId), null)}>
                            Quitar de la planta
                        </QBoton>
                    </div>
                </fieldset>
            )}

            {elemento && indiceElemento !== null && (
                <fieldset>
                    <legend>{elemento.nombre}</legend>
                    <quimera-formulario>
                        <QSelect
                            label="Tipo"
                            nombre="elementoTipo"
                            valor={elemento.tipo}
                            opciones={tiposElemento}
                            onChange={(o) => o && onCambiar(cambiarElemento(planta, indiceElemento, { tipo: o.valor as TipoElemento }))}
                        />
                        <QInput
                            label="Nombre"
                            nombre="elementoNombre"
                            valor={elemento.nombre}
                            onChange={(v: string) => onCambiar(cambiarElemento(planta, indiceElemento, { nombre: v }))}
                        />
                        <CampoMetros label="X (m)" nombre="elementoX" valor={elemento.x} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, v, elemento.y))} />
                        <CampoMetros label="Y (m)" nombre="elementoY" valor={elemento.y} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, elemento.x, v))} />
                        <CampoMetros label="Ancho (m)" nombre="elementoAncho" valor={elemento.ancho}
                            onCambio={(v) => v !== null && onCambiar(cambiarElemento(planta, indiceElemento, { ancho: v }))} />
                        <CampoMetros label="Largo (m)" nombre="elementoLargo" valor={elemento.largo}
                            onCambio={(v) => v !== null && onCambiar(cambiarElemento(planta, indiceElemento, { largo: v }))} />
                    </quimera-formulario>
                    <UbicacionesElemento
                        mapa={mapa}
                        planta={planta}
                        indice={indiceElemento}
                        onCambiar={(p) => onCambiar(p)}
                    />
                    <div className="botones">
                        <QBoton variante="texto" onClick={() => onCambiar(quitarElemento(planta, indiceElemento), null)}>
                            Quitar elemento
                        </QBoton>
                    </div>
                </fieldset>
            )}

            <div className="botones">
                <QBoton variante="borde" onClick={() => {
                    const nueva = nuevoElemento(planta);
                    onCambiar(nueva, { tipo: "ELEMENTO", indice: nueva.elementos.length - 1 });
                }}>
                    Añadir elemento
                </QBoton>
            </div>

            {sinColocar.length > 0 && (
                <div className="mapa-editor-sin-colocar">
                    <h4>Pasillos sin colocar</h4>
                    <ul>
                        {sinColocar.map((p) => (
                            <li key={p.pasilloId}>
                                <span>{rotuloPasillo(mapa, p.pasilloId)}</span>
                                <QBoton variante="texto" onClick={() =>
                                    onCambiar(colocarPasillo(mapa, planta, p), { tipo: "PASILLO", pasilloId: p.pasilloId })}>
                                    Colocar
                                </QBoton>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {avisos.length > 0 && (
                <ul className="mapa-editor-avisos" aria-label="Avisos">
                    {avisos.map((a) => <li key={a}>{a}</li>)}
                </ul>
            )}

            <div className="botones mapa-editor-acciones">
                <QBoton onClick={onGuardar}>Guardar planta</QBoton>
                <QBoton variante="texto" onClick={onCancelar}>Cancelar</QBoton>
            </div>
        </section>
    );
};

/**
 * Ubicaciones sin pasillo situadas en el elemento (muelles, playas): les da posición en la planta y,
 * por la función de su zona, hacen del elemento un punto de salida o de entrada.
 */
const UbicacionesElemento = ({ mapa, planta, indice, onCambiar }: {
    mapa: MapaAlmacen;
    planta: PlantaAlmacen;
    indice: number;
    onCambiar: (planta: PlantaAlmacen) => void;
}) => {
    const elemento = planta.elementos[indice];
    const porId = new Map(mapa.ubicaciones.map((u) => [u.ubicacionId, u]));
    const zonaDe = (zonaId: string) => mapa.zonas.find((z) => z.zonaId === zonaId);
    const libres = sinVincular(mapa, planta);
    const zonasLibres = [...new Set(libres.map((u) => u.zonaId))].flatMap((id) => {
        const z = zonaDe(id);
        return z ? [z] : [];
    });

    return (
        <div className="mapa-editor-ubicaciones">
            <h4>Ubicaciones en el elemento</h4>
            {elemento.ubicaciones.length === 0 && (
                <p className="mapa-editor-nota">Ninguna. Vincula aquí los muelles o playas que están en este sitio.</p>
            )}
            <ul>
                {elemento.ubicaciones.map((id) => {
                    const u = porId.get(id);
                    const z = u && zonaDe(u.zonaId);
                    return (
                        <li key={id}>
                            <span>
                                {u?.ubicacion ?? id}
                                {z && <span className="mapa-editor-nota"> · {z.zona} ({z.funcion.toLowerCase()})</span>}
                            </span>
                            <QBoton variante="texto" onClick={() => onCambiar(desvincularUbicacion(planta, indice, id))}>
                                Quitar
                            </QBoton>
                        </li>
                    );
                })}
            </ul>
            {libres.length > 0 && (
                <>
                    <quimera-formulario>
                        <QSelect
                            label="Añadir ubicación"
                            nombre="elementoUbicacion"
                            valor=""
                            opciones={[
                                { valor: "", descripcion: "Elegir…" },
                                ...libres.map((u) => ({
                                    valor: u.ubicacionId,
                                    descripcion: `${u.ubicacion} · ${zonaDe(u.zonaId)?.zona ?? ""}`,
                                })),
                            ]}
                            onChange={(o) => o?.valor && onCambiar(vincularUbicaciones(planta, indice, [o.valor]))}
                        />
                    </quimera-formulario>
                    <div className="botones">
                        {zonasLibres.map((z) => (
                            <QBoton
                                key={z.zonaId}
                                variante="texto"
                                onClick={() => onCambiar(vincularUbicaciones(
                                    planta, indice, libres.filter((u) => u.zonaId === z.zonaId).map((u) => u.ubicacionId)))}
                            >
                                Todas las de {z.zona}
                            </QBoton>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
