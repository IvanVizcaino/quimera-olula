import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento, Modelo } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { ReactNode, useCallback } from "react";

/** Modal de alta de un maestro sencillo de producción; publica `entidad_creada` (id) o `alta_cancelada`. */
export const CrearSimple = <T extends Modelo>({
    publicar,
    nombre,
    titulo,
    clase,
    meta,
    vacio,
    crear,
    campos,
}: {
    publicar: EmitirEvento;
    nombre: string;
    titulo: string;
    clase: string;
    meta: MetaModelo<T>;
    /** Constante estable (no se crea en cada render). */
    vacio: T;
    /** Crea la entidad y devuelve su id. */
    crear: (nuevo: T) => Promise<string>;
    /** Campos del formulario; `focus` va en el primero. */
    campos: (modelo: HookModelo<T>, focus: ReturnType<typeof useFocus>) => ReactNode;
}) => {
    const modelo = useModelo(meta, vacio);

    const crear_ = useCallback(async () => {
        const id = await crear(modelo.modelo);
        publicar("entidad_creada", id);
    }, [modelo.modelo, publicar, crear]);

    const cancelar_ = useCallback(() => publicar("alta_cancelada"), [publicar]);

    const [aceptar, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre={nombre} titulo={titulo} onCerrar={cancelar}>
            <div className={clase}>
                <quimera-formulario>{campos(modelo, focus)}</quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={aceptar} deshabilitado={!modelo.valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
