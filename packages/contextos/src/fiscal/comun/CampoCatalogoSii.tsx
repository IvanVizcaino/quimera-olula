import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { CATALOGOS_SII, filtrarCatalogo, leer, opcion, OpcionSii } from "./catalogo_sii.ts";

export interface CampoCatalogoSiiProps {
    catalogo: keyof typeof CATALOGOS_SII;
    label: string;
    nombre: string;
    valor?: unknown;
    onChange?: (opcion: OpcionSii) => void;
    evaluarCambio?: () => void;
    deshabilitado?: boolean;
    soloLectura?: boolean;
    erroneo?: boolean;
    textoValidacion?: string;
}

/**
 * Campo con búsqueda en un catálogo del SII: se escribe parte del código o de
 * la descripción y al elegir queda «código — descripción». El valor del
 * modelo es el código; vaciarlo deja "".
 */
export const CampoCatalogoSii = ({ catalogo, valor, onChange, ...props }: CampoCatalogoSiiProps) => {
    const url = CATALOGOS_SII[catalogo];
    const codigo = valor === null || valor === undefined ? "" : String(valor);

    const obtenerOpciones = async (texto: string, id?: string) => {
        const elementos = await leer(url).catch(() => []);
        return (id ? elementos.filter((e) => e.id === id) : filtrarCatalogo(elementos, texto)).map(opcion);
    };

    return (
        <QAutocompletar<OpcionSii>
            {...props}
            valor={codigo}
            obtenerOpciones={obtenerOpciones}
            onChange={(elegida) => onChange?.(elegida ?? { valor: "", descripcion: "" })}
            longitudMinima={0}
            opcional
        />
    );
};
