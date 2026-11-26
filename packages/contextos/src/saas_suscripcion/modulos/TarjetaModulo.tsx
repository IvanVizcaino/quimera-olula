import { iconoModulo } from "#/saas_comun/iconos.ts";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { ReactNode } from "react";
import { FichaModuloEmpresa, Periodicidad } from "../diseño.ts";
import { etiquetaEstadoModulo, textoPrecioFicha } from "../dominio.ts";
import "./TarjetasModulos.css";

/**
 * Tarjeta de un módulo para la empresa: icono, nombre, descripción corta, situación y precio.
 * Se usa en «Módulos disponibles» y, más compacta, en la suscripción. Al pulsarla se abre la ficha.
 */
export const TarjetaModulo = ({
    ficha, periodicidad, onAbrir, accion, pie, compacta = false,
}: {
    ficha: FichaModuloEmpresa;
    periodicidad: Periodicidad;
    onAbrir: () => void;
    /** Arriba a la derecha (p. ej. la casilla de la suscripción). */
    accion?: ReactNode;
    /** Debajo del precio (p. ej. el motivo del recomendador). */
    pie?: ReactNode;
    compacta?: boolean;
}) => {
    const { modulo, estado } = ficha;
    return (
        <article className={`tarjeta-modulo estado-${estado}${compacta ? " compacta" : ""}`}>
            <button type="button" className="tarjeta-modulo-cuerpo" onClick={onAbrir}
                aria-label={`${modulo.nombre}: ${etiquetaEstadoModulo[estado]}. Ver ficha`}>
                <span className="tarjeta-modulo-icono"><QIcono nombre={iconoModulo(modulo)} tamaño="lg" /></span>
                <span className="tarjeta-modulo-nombre">{modulo.nombre}</span>
                {!compacta && modulo.descripcion && <span className="tarjeta-modulo-descripcion">{modulo.descripcion}</span>}
                <span className="tarjeta-modulo-pie">
                    <span className="tarjeta-modulo-estado">{etiquetaEstadoModulo[estado]}</span>
                    <span className="tarjeta-modulo-precio">{textoPrecioFicha(ficha, periodicidad)}</span>
                </span>
                {pie}
            </button>
            {accion && <span className="tarjeta-modulo-accion">{accion}</span>}
        </article>
    );
};
