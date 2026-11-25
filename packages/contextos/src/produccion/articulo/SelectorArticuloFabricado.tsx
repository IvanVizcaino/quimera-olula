import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { FabricacionArticulo } from "./diseño.ts";
import { criteriaArticulosFabricados } from "./dominio.ts";
import { getFabricacionArticulos } from "./infraestructura.ts";

export type OpcionArticuloFabricado = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
    articulo: FabricacionArticulo;
};

/**
 * Artículo fabricado (`articulos.fabricado`), por código o descripción; para los lotes de las
 * órdenes de producción. Se usa con `{...uiProps("articuloId")}`.
 */
export const SelectorArticuloFabricado = ({
    valor,
    descripcion = "",
    nombre = "articuloId",
    label = "Artículo",
    onChange,
    evaluarCambio,
    soloLectura,
    deshabilitado,
    autoFocus,
}: {
    valor: unknown;
    descripcion?: string;
    nombre?: string;
    label?: string;
    onChange?: (opcion: OpcionArticuloFabricado | null) => void;
    evaluarCambio?: () => void;
    soloLectura?: boolean;
    deshabilitado?: boolean;
    autoFocus?: boolean;
}) => {
    const obtenerOpciones = async (texto: string, id?: string): Promise<OpcionArticuloFabricado[]> => {
        const { datos } = await getFabricacionArticulos(criteriaArticulosFabricados(texto, id));
        return datos.map((a) => ({
            valor: a.id,
            descripcion: `${a.id} - ${a.descripcion}`,
            descripcionOpcion: `${a.id} - ${a.descripcion}${a.tipoProceso ? ` (${a.tipoProceso})` : ""}`,
            articulo: a,
        }));
    };

    return (
        <QAutocompletar<OpcionArticuloFabricado>
            label={label}
            nombre={nombre}
            valor={valor ? String(valor) : ""}
            descripcion={descripcion}
            obtenerOpciones={obtenerOpciones}
            onChange={(opcion) => onChange?.(opcion)}
            evaluarCambio={evaluarCambio}
            soloLectura={soloLectura}
            deshabilitado={deshabilitado}
            autoFocus={autoFocus}
            placeholder="Código o descripción de un artículo fabricado"
        />
    );
};
