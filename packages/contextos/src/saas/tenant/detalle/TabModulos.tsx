import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { CategoriaModulo } from "../../catalogo/diseño.js";
import { etiquetaCategoria } from "../../catalogo/dominio.js";
import { ModuloTenant } from "../diseño.js";
import { dependientesActivos } from "../dominio.js";
import { etiquetaOrigenModulo, varianteOrigenModulo } from "../suscripcion/dominio.js";
import "./TabModulos.css";

const CATEGORIAS: CategoriaModulo[] = ["contexto", "plugin", "servicio"];

/**
 * Lista de módulos del catálogo con alta/baja por empresa, agrupados en
 * módulos (contextos), plugins y servicios. Si el backend rechaza la
 * operación (dependencias), el error llega por el flujo estándar de errores de la máquina.
 */
export const TabModulos = ({
    modulos,
    editable,
    publicar,
}: {
    modulos: ModuloTenant[];
    editable: boolean;
    publicar: EmitirEvento;
}) => (
    <div className="TabModulos">
        {CATEGORIAS.map((categoria) => {
            const deCategoria = modulos.filter((m) => m.categoria === categoria);
            if (deCategoria.length === 0) return null;
            return (
                <section key={categoria}>
                    <h4>{etiquetaCategoria[categoria]}</h4>
                    {deCategoria.map((m) => (
                        <FilaModulo key={m.id} modulo={m} modulos={modulos} editable={editable} publicar={publicar} />
                    ))}
                </section>
            );
        })}
        {modulos.length === 0 && <p>No hay módulos.</p>}
    </div>
);

const FilaModulo = ({
    modulo: m,
    modulos,
    editable,
    publicar,
}: {
    modulo: ModuloTenant;
    modulos: ModuloTenant[];
    editable: boolean;
    publicar: EmitirEvento;
}) => {
    const dependientes = dependientesActivos(modulos, m.id);
    return (
        <div className="modulo-fila">
            <div className="modulo-info">
                <div className="modulo-nombre">
                    {m.nombre} {m.esBase && <QEtiqueta variante="gris">Base</QEtiqueta>}{" "}
                    <QEtiqueta variante={m.activo ? "exito" : "neutro"}>{m.activo ? "Activo" : "Inactivo"}</QEtiqueta>{" "}
                    {m.activo && m.origen && (
                        <QEtiqueta variante={varianteOrigenModulo(m.origen)}>
                            Origen: {etiquetaOrigenModulo(m.origen)}
                        </QEtiqueta>
                    )}
                </div>
                {m.descripcion && <div className="modulo-descripcion">{m.descripcion}</div>}
                {m.dependeDe.length > 0 && (
                    <div className="modulo-dependencias">Depende de: {m.dependeDe.join(", ")}</div>
                )}
                {m.activo && dependientes.length > 0 && (
                    <div className="modulo-dependencias">
                        Requerido por: {dependientes.map((d) => d.nombre).join(", ")}
                    </div>
                )}
            </div>
            <QBoton
                variante="borde"
                deshabilitado={!editable}
                onClick={() =>
                    publicar(m.activo ? "modulo_desactivacion_solicitada" : "modulo_activacion_solicitada", m.id)
                }
            >
                {m.activo ? "Desactivar" : "Activar"}
            </QBoton>
        </div>
    );
};
