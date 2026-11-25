import { iconoModulo } from "#/saas_comun/iconos.ts";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useNavigate } from "react-router";
import { Periodicidad } from "../diseño.ts";
import { ModuloOfrecido, RUTA_MODULOS, textoImportePeriodo } from "../dominio.ts";
import "../modulos/TarjetasModulos.css";

/**
 * Módulo opcional del plan elegido, en la suscripción: la misma tarjeta que en «Módulos
 * disponibles», compacta. La casilla lo añade o lo quita del cambio; el resto de la tarjeta
 * abre su ficha (descripción, características y demo).
 */
export const TarjetaModuloOpcional = ({
    modulo, periodicidad, marcado, motivo, deshabilitado, onCambiar,
}: {
    modulo: ModuloOfrecido;
    periodicidad: Periodicidad;
    marcado: boolean;
    /** Por qué no se puede marcar (le faltan dependencias); null si se puede. */
    motivo: string | null;
    deshabilitado: boolean;
    onCambiar: (marcado: boolean) => void;
}) => {
    const navigate = useNavigate();
    const bloqueado = deshabilitado || (!marcado && motivo !== null);
    return (
        <article className={`tarjeta-modulo compacta ${marcado ? "estado-activo" : "estado-disponible"}`}>
            <button type="button" className="tarjeta-modulo-cuerpo"
                onClick={() => navigate(`${RUTA_MODULOS}?modulo=${encodeURIComponent(modulo.id)}`)}
                aria-label={`${modulo.nombre}. Ver ficha`}>
                <span className="tarjeta-modulo-icono"><QIcono nombre={iconoModulo(modulo)} tamaño="md" /></span>
                <span className="tarjeta-modulo-nombre">{modulo.nombre}</span>
                {modulo.descripcion && <span className="tarjeta-modulo-descripcion">{modulo.descripcion}</span>}
                <span className="tarjeta-modulo-pie">
                    <span className="tarjeta-modulo-estado">{marcado ? "Añadido" : "Opcional"}</span>
                    <span className="tarjeta-modulo-precio">+{textoImportePeriodo(modulo.precio, periodicidad)}</span>
                </span>
                {!marcado && motivo && <span className="tarjeta-modulo-descripcion">{motivo}.</span>}
            </button>
            <span className="tarjeta-modulo-accion">
                <button type="button" role="checkbox" aria-checked={marcado} className="tarjeta-modulo-check"
                    aria-label={`Añadir ${modulo.nombre}`} title={marcado ? "Quitar" : bloqueado ? motivo ?? "" : "Añadir"}
                    disabled={bloqueado} onClick={() => onCambiar(!marcado)}>
                    {marcado && <QIcono nombre="check" tamaño="sm" />}
                </button>
            </span>
        </article>
    );
};
