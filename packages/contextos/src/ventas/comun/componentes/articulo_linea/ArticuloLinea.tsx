import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import type { TagArticulo } from "#/ventas/articulo/diseño.ts";
import { TipoArticuloLinea } from "#/ventas/venta/diseño.ts";
import { QIcono, QInput } from "@olula/componentes/index.js";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useEffect, useRef } from "react";
import "./ArticuloLinea.css";

export type CamposArticuloLinea = {
    tipoArticulo: TipoArticuloLinea;
    idArticulo: string | null;
    descripcionArticulo: string | null;
    descripcion: string;
    porLotes?: boolean;
};

interface ArticuloLineaProps extends CamposArticuloLinea {
    nombre?: string;
    onChange: (cambios: Partial<CamposArticuloLinea>) => void;
    ref?: React.RefObject<HTMLInputElement | null>;
    bloqueado?: boolean;
    /** Texto de cada opción del buscador de artículos (por defecto, el de la base). */
    formatoOpcion?: (articulo: TagArticulo) => string;
}

export const ArticuloLinea = ({
    tipoArticulo,
    idArticulo,
    descripcionArticulo,
    descripcion,
    nombre = "idArticulo",
    onChange,
    bloqueado = false,
    formatoOpcion,
}: ArticuloLineaProps) => {
    const descripcionMultilinea = pluginActivo("lineas_largas");
    const CampoDescripcion = descripcionMultilinea ? QTextArea : QInput;

    const refArticulo = useRef<HTMLInputElement | null>(null);
    const refDescripcionRegistrado = useRef<HTMLInputElement | null>(null);
    const refDescripcionLibre = useRef<HTMLInputElement | null>(null);
    const montado = useRef(false);

    useEffect(() => {
        if (!montado.current) {
            montado.current = true;
            return;
        }
        if (tipoArticulo === "generico") {
            refDescripcionRegistrado.current?.focus();
            refDescripcionRegistrado.current?.select();
        } else if (tipoArticulo === "libre") {
            refDescripcionLibre.current?.focus();
            refDescripcionLibre.current?.select();
        } else if (tipoArticulo === "registrado") {
            refArticulo.current?.focus();
        }
    }, [tipoArticulo]);

    const toggleDescripcion = () => {
        const nuevoTipo = tipoArticulo === "registrado" ? "generico" : "registrado";
        onChange({
            tipoArticulo: nuevoTipo,
            descripcion: descripcionArticulo!
        });
    };

    const abrir = () => {
        onChange({ tipoArticulo: "libre", idArticulo: null, descripcionArticulo: null, descripcion: "" });
    };

    const cerrar = () => {
        onChange({ tipoArticulo: "registrado", idArticulo: null, descripcionArticulo: null, descripcion: "" });
    };

    if (tipoArticulo !== "libre") {
        return (
            <>
                <div className="ArticuloLinea-campo">
                    <Articulo
                        valor={idArticulo ?? ""}
                        descripcion={descripcionArticulo ?? ""}
                        nombre={nombre}
                        onChange={(opcion) =>
                            onChange({
                                idArticulo: opcion?.valor ?? null,
                                descripcionArticulo: opcion?.descripcion ?? null,
                                porLotes: opcion?.datos?.porLotes ?? false,
                            })
                        }
                        ref={refArticulo}
                        soloLectura={bloqueado}
                        formatoOpcion={formatoOpcion}
                    />
                    {idArticulo && !bloqueado && (
                        <button
                            type="button"
                            onClick={toggleDescripcion}
                            title="Editar descripción"
                            aria-label="Editar descripción"
                            className="ArticuloLinea-boton-candado"
                        >
                            <QIcono nombre="editar_2" tamaño="sm" />
                        </button>
                    )}
                    {!bloqueado &&
                        <button
                            type="button"
                            onClick={abrir}
                            title="Abrir descripción libre"
                            aria-label="Abrir descripción libre"
                            className="ArticuloLinea-boton-candado"
                        >
                            <QIcono nombre="candado_abierto" tamaño="sm" />
                        </button>
                    }
                </div>
                {tipoArticulo === "generico" && (
                    <CampoDescripcion
                        nombre="descripcion"
                        label="Descripción personalizada"
                        valor={descripcion ?? ""}
                        onChange={(val) => onChange({ descripcion: val })}
                        valido={!!descripcion}
                        ref={refDescripcionRegistrado}
                        {...(descripcionMultilinea ? { rows: 3 } : {})}
                    />
                )}
            </>
        );
    }

    return (
        <div className="ArticuloLinea-campo">
            <CampoDescripcion
                nombre="descripcion"
                label="Descripción"
                valor={descripcion ?? ""}
                erroneo={!descripcion}
                onChange={(val) => onChange({ descripcion: val })}
                ref={refDescripcionLibre}
                {...(descripcionMultilinea ? { rows: 3 } : {})}
            />
            {!bloqueado &&
                <button
                    type="button"
                    onClick={cerrar}
                    title="Cerrar descripción libre"
                    aria-label="Cerrar descripción libre"
                    className="ArticuloLinea-boton-candado"
                >
                    <QIcono nombre="candado" tamaño="sm" />
                </button>
            }
        </div>
    );
};
