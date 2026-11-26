import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormEvent, useState } from "react";
import { FichaModuloEmpresa, Periodicidad, RespuestaRecomendador } from "../diseño.ts";
import { fichasRecomendadas } from "../dominio.ts";
import { postRecomendar } from "../infraestructura.ts";
import { TarjetaModulo } from "./TarjetaModulo.tsx";

/**
 * «Cuéntanos qué necesitas»: el servidor recomienda módulos del catálogo (con IA si la hay,
 * si no por palabras) y cada uno trae el motivo. Al pulsar una recomendación se abre su ficha.
 */
export const RecomendadorModulos = ({
    fichas, periodicidad, onAbrir,
}: {
    fichas: FichaModuloEmpresa[];
    periodicidad: Periodicidad;
    onAbrir: (moduloId: string) => void;
}) => {
    const [necesidad, setNecesidad] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [respuesta, setRespuesta] = useState<RespuestaRecomendador | null>(null);
    const [error, setError] = useState("");

    const recomendar = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!necesidad.trim() || buscando) return;
        setBuscando(true);
        setError("");
        try {
            setRespuesta(await postRecomendar(necesidad));
        } catch (err) {
            const x = err as { descripcion?: string; message?: string };
            setError(x.descripcion || x.message || "No hemos podido buscar recomendaciones.");
        } finally {
            setBuscando(false);
        }
    };

    const recomendadas = respuesta ? fichasRecomendadas(fichas, respuesta.recomendaciones) : [];

    return (
        <section className="recomendador-modulos" aria-labelledby="recomendador-titulo">
            <h3 id="recomendador-titulo"><QIcono nombre="asistente" tamaño="md" /> ¿Qué necesitas?</h3>
            <form onSubmit={recomendar} className="recomendador-formulario">
                <QInput label="Cuéntanos qué quieres hacer y te decimos qué módulos te ayudan" nombre="necesidad"
                    placeholder="Ej.: quiero vender por internet y que el stock se actualice solo"
                    valor={necesidad} onChange={setNecesidad} />
                <QBoton tipo="submit" deshabilitado={!necesidad.trim() || buscando}>
                    {buscando ? "Buscando…" : "Recomendar"}
                </QBoton>
            </form>

            {error && <p className="recomendador-error" role="alert">{error}</p>}

            {respuesta && !buscando && (
                <div aria-live="polite">
                    {recomendadas.length === 0 ? (
                        <p className="recomendador-vacio">No hemos encontrado módulos para eso. Prueba a contarlo de otra forma o explora el catálogo.</p>
                    ) : (
                        <>
                            <p className="recomendador-origen">
                                {respuesta.origen === "ia" ? "Recomendado por el asistente" : "Módulos que coinciden con lo que buscas"}
                            </p>
                            <div className="rejilla-modulos">
                                {recomendadas.map(({ ficha, motivo }) => (
                                    <TarjetaModulo key={ficha.modulo.id} ficha={ficha} periodicidad={periodicidad}
                                        onAbrir={() => onAbrir(ficha.modulo.id)}
                                        pie={motivo ? <span className="tarjeta-modulo-motivo">{motivo}</span> : undefined} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
};
