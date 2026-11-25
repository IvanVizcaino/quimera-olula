import { useEffect, useRef, useState } from "react";
import { MENSAJE_DEMO_LISTA, urlDemo } from "../demo/registro.ts";
import "./DemoEmbebida.css";

/** Si la demo no avisa (error al cargar, red lenta…), el esqueleto se quita igualmente. */
const ESPERA_MAXIMA_MS = 20000;

/**
 * Demo de un módulo en su iframe. Hasta que la demo avisa de que su primera pantalla está
 * montada (mensaje MENSAJE_DEMO_LISTA desde demo.html) se enseña un esqueleto: el evento
 * `load` del iframe llega antes, mientras aún se cargan las pantallas.
 */
export const DemoEmbebida = ({ moduloId, nombre }: { moduloId: string; nombre: string }) => {
    const iframe = useRef<HTMLIFrameElement>(null);
    const [lista, setLista] = useState(false);

    useEffect(() => {
        const alRecibir = (e: MessageEvent) => {
            if (e.origin === window.location.origin && e.source === iframe.current?.contentWindow
                && e.data?.tipo === MENSAJE_DEMO_LISTA) {
                setLista(true);
            }
        };
        window.addEventListener("message", alRecibir);
        const espera = setTimeout(() => setLista(true), ESPERA_MAXIMA_MS);
        return () => {
            window.removeEventListener("message", alRecibir);
            clearTimeout(espera);
        };
    }, []);

    return (
        <div className={`DemoEmbebida${lista ? " lista" : ""}`} aria-busy={!lista}>
            {!lista && (
                <div className="demo-esqueleto" role="status" aria-label={`Preparando la demo de ${nombre}`}>
                    <div className="esq esq-aviso" />
                    <div className="esq-fila">
                        <div className="esq esq-titulo" />
                        <div className="esq esq-boton" />
                    </div>
                    <div className="esq-tarjetas">
                        {[0, 1, 2, 3].map((i) => <div key={i} className="esq esq-tarjeta" />)}
                    </div>
                    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="esq esq-linea" />)}
                    <p className="demo-esqueleto-texto">Preparando la demo con datos de ejemplo…</p>
                </div>
            )}
            <iframe ref={iframe} src={urlDemo(moduloId)} title={`Demo de ${nombre}`} />
        </div>
    );
};
