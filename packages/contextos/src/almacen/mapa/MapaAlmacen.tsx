import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { DIAS_POR_DEFECTO, enteroPositivo, origenesRotacion } from "#/almacen/slotting/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { AlzadoPasillo } from "./alzado/AlzadoPasillo.tsx";
import { DetalleUbicacionMapa } from "./detalle/DetalleUbicacionMapa.tsx";
import {
    capasMapa, leyenda, paletaClases, paradasSinPasillo, puntosRecorrido,
} from "./dominio.ts";
import { contextoMapaInicial, getMaquina } from "./maquina.ts";
import { PlantaZona } from "./planta/PlantaZona.tsx";
import "#/comun/estilos/pagina_proceso.css";
import "./MapaAlmacen.css";

export const MapaAlmacen = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoMapaInicial);
    const { mapa, capa } = ctx;
    const paleta = mapa ? paletaClases(mapa) : new Map<string, number>();
    const zonas = mapa ? mapa.zonas.filter((z) => !ctx.zonaId || z.zonaId === ctx.zonaId) : [];
    const pasillo = mapa?.zonas.flatMap((z) => z.pasillos).find((p) => p.pasilloId === ctx.pasilloId) ?? null;
    const ubicacion = mapa?.ubicaciones.find((u) => u.ubicacionId === ctx.ubicacionId) ?? null;
    const puntos = mapa && ctx.recorrido ? puntosRecorrido(ctx.recorrido, mapa) : [];
    const sinPasillo = mapa && ctx.recorrido ? paradasSinPasillo(ctx.recorrido, mapa) : [];

    return (
        <div className="MapaAlmacen PaginaProceso">
            <h2>Mapa del almacén</h2>

            <quimera-formulario>
                <Almacen
                    label="Almacén"
                    nombre="almacenId"
                    valor={ctx.almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
                <QSelect
                    label="Zona"
                    nombre="zonaId"
                    valor={ctx.zonaId}
                    opciones={[
                        { valor: "", descripcion: "Todas" },
                        ...(mapa?.zonas ?? []).map((z) => ({ valor: z.zonaId, descripcion: `${z.zona} · ${z.funcion}` })),
                    ]}
                    deshabilitado={!mapa}
                    onChange={(opcion) => emitir("zona_cambiada", opcion?.valor ?? "")}
                />
                <QSelect
                    label="Capa"
                    nombre="capa"
                    valor={capa}
                    opciones={capasMapa}
                    onChange={(opcion) => emitir("capa_cambiada", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            <div className="mapa-barra">
                <div className="mapa-barra-campos">
                    <quimera-formulario>
                        <QSelect
                            label="Rotación según"
                            nombre="origen"
                            valor={ctx.origen}
                            opciones={origenesRotacion}
                            onChange={(opcion) => emitir("origen_cambiado", opcion?.valor ?? "")}
                        />
                        <QInput
                            label="Días" nombre="dias" tipo="numero" valor={ctx.dias}
                            onChange={(v: string) => emitir("dias_cambiados", v)}
                        />
                    </quimera-formulario>
                </div>
                <div className="botones">
                    <QBoton deshabilitado={!ctx.almacenId} onClick={() => emitir("actualizacion_solicitada")}>
                        {mapa ? `Recalcular (${enteroPositivo(ctx.dias, DIAS_POR_DEFECTO)} días)` : "Cargar"}
                    </QBoton>
                </div>
            </div>

            <div className="mapa-barra">
                <div className="mapa-barra-campos">
                    <quimera-formulario>
                        <QInput
                            label="Recorrido de la orden" nombre="ordenId" valor={ctx.ordenId}
                            deshabilitado={!mapa}
                            onChange={(v: string) => emitir("orden_cambiada", v)}
                        />
                    </quimera-formulario>
                </div>
                <div className="botones">
                    <QBoton
                        variante="borde"
                        deshabilitado={!mapa || !ctx.ordenId.trim()}
                        onClick={() => emitir("recorrido_solicitado")}
                    >
                        Ver recorrido
                    </QBoton>
                    {ctx.recorrido && (
                        <QBoton variante="texto" onClick={() => emitir("recorrido_quitado")}>
                            Quitar recorrido
                        </QBoton>
                    )}
                </div>
            </div>

            {mapa && (
                <ul className="mapa-leyenda" aria-label="Leyenda">
                    {leyenda(capa, paleta).map((e) => (
                        <li key={e.tono}>
                            <span className={`mapa-muestra tono-${e.tono}`} aria-hidden="true" />
                            {e.texto}
                        </li>
                    ))}
                    {ctx.recorrido && (
                        <li>
                            <span className="mapa-muestra mapa-muestra-recorrido" aria-hidden="true" />
                            Recorrido {ctx.recorrido.ordenId}: {ctx.recorrido.paradas.length} paradas,{" "}
                            {ctx.recorrido.modulosRecorridos} módulos
                        </li>
                    )}
                </ul>
            )}

            {sinPasillo.length > 0 && (
                <p className="mapa-aviso">
                    Paradas fuera de pasillo: {sinPasillo.map((p) => `${p.secuencia}. ${p.ubicacion}`).join(", ")}
                </p>
            )}

            {mapa && mapa.zonas.length === 0 && <p>El almacén no tiene zonas.</p>}

            <div className="mapa-vistas">
                <div className="mapa-zonas" aria-label="Zonas del almacén" role="group">
                    {zonas.map((z) => (
                        <PlantaZona
                            key={z.zonaId}
                            zona={z}
                            ubicaciones={mapa!.ubicaciones}
                            capa={capa}
                            paleta={paleta}
                            pasilloId={ctx.pasilloId}
                            ubicacionId={ctx.ubicacionId}
                            recorrido={puntos}
                            onPasillo={(id) => emitir("pasillo_seleccionado", id)}
                            onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                        />
                    ))}
                </div>

                {mapa && pasillo && (
                    <section className="mapa-panel mapa-panel-alzado">
                        <div className="mapa-panel-cabecera">
                            <h3>Pasillo {pasillo.pasillo}</h3>
                            <QBoton variante="texto" onClick={() => emitir("pasillo_seleccionado", null)}>
                                Cerrar
                            </QBoton>
                        </div>
                        <AlzadoPasillo
                            pasillo={pasillo}
                            ubicaciones={mapa.ubicaciones}
                            capa={capa}
                            paleta={paleta}
                            ubicacionId={ctx.ubicacionId}
                            onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                        />
                    </section>
                )}
            </div>

            {ubicacion && (
                <DetalleUbicacionMapa
                    ubicacion={ubicacion}
                    onCerrar={() => emitir("ubicacion_seleccionada", null)}
                />
            )}
        </div>
    );
};
