import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EstadoBorradorJornada } from "../diseño.ts";
import "./BotoneraJornadaBorrador.css";

export const BotoneraJornadaBorrador = ({
    estadoBorrador,
    onPausa,
    onStop,
    onPlay,
}: {
    estadoBorrador: EstadoBorradorJornada;
    onPausa: () => void;
    onStop: () => void;
    onPlay: () => void;
}) => {
    if (estadoBorrador === "ACTIVA") {
        return (
            <div className="BotoneraJornadaBorrador">
                <QBoton advertencia ancho tamaño="grande" onClick={onPausa}>Pausar</QBoton>
                <QBoton destructivo ancho tamaño="grande" onClick={onStop}>Terminar</QBoton>
            </div>
        );
    }
    if (estadoBorrador === "PAUSADA") {
        return (
            <div className="BotoneraJornadaBorrador">
                <QBoton exito ancho tamaño="grande" onClick={onPlay}>Reanudar</QBoton>
            </div>
        );
    }
    return null;
};
