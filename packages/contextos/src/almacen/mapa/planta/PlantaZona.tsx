import { CapaMapa, PuntoRecorrido, UbicacionMapa, ZonaMapa } from "../diseño.ts";
import {
    geometriaZona, MEDIDAS, puntoDeModulo, resumenModulo, resumenUbicacion, tonoModulo, tonoUbicacion,
    trazoRecorrido, ubicacionesPorModulo, ubicacionesSueltas,
} from "../dominio.ts";

type Props = {
    zona: ZonaMapa;
    ubicaciones: UbicacionMapa[];
    capa: CapaMapa;
    paleta: Map<string, number>;
    pasilloId: string | null;
    ubicacionId: string | null;
    recorrido: PuntoRecorrido[];
    onPasillo: (pasilloId: string) => void;
    onUbicacion: (ubicacionId: string) => void;
};

/** Planta esquemática de una zona: pasillos por su orden, módulos a cada lado. */
export const PlantaZona = ({
    zona, ubicaciones, capa, paleta, pasilloId, ubicacionId, recorrido, onPasillo, onUbicacion,
}: Props) => {
    const { geometrias, ancho, alto } = geometriaZona(zona.pasillos);
    const sueltas = ubicacionesSueltas(ubicaciones, zona.zonaId);
    const deZona = new Set(zona.pasillos.map((p) => p.pasilloId));
    const puntos = recorrido.filter((p) => deZona.has(p.pasilloId));
    const trazo = trazoRecorrido(puntos, geometrias);

    return (
        <section className="mapa-zona">
            <h3>
                {zona.zona} <span className="mapa-zona-funcion">{zona.funcion}</span>
            </h3>
            {zona.pasillos.length > 0 && (
                <div className="mapa-planta-scroll">
                    <svg
                        className="mapa-planta"
                        viewBox={`0 0 ${ancho} ${alto}`}
                        width={ancho * 1.6}
                        height={alto * 1.6}
                        role="img"
                        aria-label={`Planta de la zona ${zona.zona}`}
                    >
                        {zona.pasillos.map((p, i) => {
                            const g = geometrias[i];
                            const porModulo = ubicacionesPorModulo(ubicaciones, p.pasilloId);
                            const seleccionado = p.pasilloId === pasilloId;
                            return (
                                <g key={p.pasilloId} className={`mapa-pasillo${seleccionado ? " seleccionado" : ""}`}>
                                    <rect
                                        className="mapa-pasillo-suelo"
                                        x={g.x + MEDIDAS.fondo}
                                        y={MEDIDAS.cabecera}
                                        width={MEDIDAS.pasillo}
                                        height={g.alto}
                                        onClick={() => onPasillo(p.pasilloId)}
                                    />
                                    <text className="mapa-pasillo-codigo" x={g.xEje} y={MEDIDAS.cabecera - 6}>
                                        {p.pasillo}
                                    </text>
                                    {g.celdas.map((c) => {
                                        const us = porModulo.get(c.modulo) ?? [];
                                        const contieneSeleccion = us.some((u) => u.ubicacionId === ubicacionId);
                                        return (
                                            <rect
                                                key={c.modulo}
                                                className={`mapa-celda tono-${tonoModulo(us, capa, paleta)}${contieneSeleccion ? " seleccionada" : ""}`}
                                                x={c.x + 1}
                                                y={c.y + 1}
                                                width={c.ancho - 2}
                                                height={c.alto - 2}
                                                rx={2}
                                                onClick={() => onPasillo(p.pasilloId)}
                                            >
                                                <title>{resumenModulo(p.pasillo, c.modulo, us)}</title>
                                            </rect>
                                        );
                                    })}
                                </g>
                            );
                        })}
                        {trazo.length > 1 && (
                            <polyline
                                className="mapa-recorrido"
                                points={trazo.map((t) => `${t.x},${t.y}`).join(" ")}
                            />
                        )}
                        {puntos.map((p) => {
                            const g = geometrias.find((x) => x.pasilloId === p.pasilloId);
                            if (!g) return null;
                            const { x, y } = puntoDeModulo(g, p.modulo);
                            return (
                                <g key={p.secuencia} className="mapa-parada">
                                    <circle cx={x} cy={y} r={7} />
                                    <text x={x} y={y}>{p.secuencia}</text>
                                    <title>{`${p.secuencia}. ${p.ubicacion}`}</title>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
            {sueltas.length > 0 && (
                <div className="mapa-sueltas">
                    {sueltas.map((u) => (
                        <button
                            key={u.ubicacionId}
                            type="button"
                            className={`mapa-ficha tono-${tonoUbicacion(u, capa, paleta)}${u.ubicacionId === ubicacionId ? " seleccionada" : ""}`}
                            title={resumenUbicacion(u)}
                            onClick={() => onUbicacion(u.ubicacionId)}
                        >
                            {u.ubicacion}
                        </button>
                    ))}
                </div>
            )}
            {zona.pasillos.length === 0 && sueltas.length === 0 && <p>Sin ubicaciones.</p>}
        </section>
    );
};
