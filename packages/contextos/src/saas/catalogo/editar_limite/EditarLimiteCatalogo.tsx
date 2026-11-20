import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { AlSuperar, LimiteCatalogo, TipoLimite } from "../diseño.js";
import { etiquetaAlSuperar, etiquetaTipoLimite, formALimite, limiteAForm, metaLimite, nuevoLimiteVacio } from "../dominio.js";
import { putLimite } from "../infraestructura.js";

/** Alta (limite = null) y edición de un límite: ambas son un PUT. */
export const EditarLimiteCatalogo = ({
    publicar,
    limite,
    idsExistentes,
}: {
    publicar: EmitirEvento;
    limite: LimiteCatalogo | null;
    idsExistentes: string[];
}) => {
    const nuevo = limite === null;
    const inicial = useMemo(() => (limite ? limiteAForm(limite) : nuevoLimiteVacio), [limite]);
    const meta = useMemo(() => metaLimite(nuevo, idsExistentes), [nuevo, idsExistentes]);
    const { modelo, uiProps, valido } = useModelo(meta, inicial);

    const guardar_ = useCallback(
        async () => {
            await putLimite(formALimite(modelo));
            publicar("limite_guardado");
        },
        [modelo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("edicion_cancelada"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="editarLimiteCatalogo" titulo={nuevo ? "Nuevo límite" : `Límite ${limite.nombre}`} onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Identificador" {...uiProps("id")} deshabilitado={!nuevo} />
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Unidad" {...uiProps("unidad")} />
                <QSelect label="Tipo" {...uiProps("tipo")}
                    opciones={(Object.keys(etiquetaTipoLimite) as TipoLimite[])
                        .map((t) => ({ valor: t, descripcion: etiquetaTipoLimite[t] }))} />
                <QSelect label="Al superarlo" {...uiProps("alSuperar")}
                    opciones={(Object.keys(etiquetaAlSuperar) as AlSuperar[])
                        .map((a) => ({ valor: a, descripcion: etiquetaAlSuperar[a] }))} />
                <QInput label="Umbral de aviso (%)" {...uiProps("umbralAviso")} tipo="entero" />
                <QInput label="Orden" {...uiProps("orden")} tipo="entero" />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>Guardar</QBoton>
            </div>
        </QModal>
    );
};
