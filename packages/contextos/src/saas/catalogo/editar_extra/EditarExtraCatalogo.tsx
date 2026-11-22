import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { ExtraCatalogo, LimiteCatalogo, ModuloCatalogo } from "../diseño.js";
import { extraAForm, formAExtra, metaExtra, nuevoExtraVacio } from "../dominio.js";
import { putExtra } from "../infraestructura.js";

/** Alta (extra = null) y edición de un extra: ambas son un PUT. */
export const EditarExtraCatalogo = ({
    publicar,
    extra,
    limites,
    modulos,
    idsExistentes,
}: {
    publicar: EmitirEvento;
    extra: ExtraCatalogo | null;
    limites: LimiteCatalogo[];
    modulos: ModuloCatalogo[];
    idsExistentes: string[];
}) => {
    const nuevo = extra === null;
    const inicial = useMemo(() => (extra ? extraAForm(extra) : nuevoExtraVacio), [extra]);
    const meta = useMemo(() => metaExtra(nuevo, idsExistentes), [nuevo, idsExistentes]);
    const { modelo, uiProps, valido } = useModelo(meta, inicial);

    const guardar_ = useCallback(
        async () => {
            await putExtra(formAExtra(modelo));
            publicar("extra_guardado");
        },
        [modelo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("edicion_cancelada"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="editarExtraCatalogo" titulo={nuevo ? "Nuevo extra" : `Extra ${extra.nombre}`} onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Identificador" {...uiProps("id")} deshabilitado={!nuevo} />
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QSelect label="Límite que amplía" {...uiProps("limiteId")}
                    opciones={[{ valor: "", descripcion: "Ninguno (servicio puntual)" },
                    ...limites.map((l) => ({ valor: l.id, descripcion: l.nombre }))]} />
                <QInput label="Cantidad por unidad" {...uiProps("cantidad")} tipo="entero" />
                <QSelect label="Módulo requerido" {...uiProps("requiereModulo")}
                    opciones={[{ valor: "", descripcion: "Ninguno" },
                    ...modulos.map((m) => ({ valor: m.id, descripcion: m.nombre }))]} />
                <QInput label="Precio mensual" {...uiProps("precioMensual")} tipo="moneda" />
                <QInput label="Precio anual" {...uiProps("precioAnual")} tipo="moneda" />
                <QInput label="Orden" {...uiProps("orden")} tipo="entero" />
                <QCheckbox label="Recurrente" {...uiProps("recurrente")} />
                <QCheckbox label="Público" {...uiProps("publico")} />
                <QCheckbox label="Activo" {...uiProps("activo")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>Guardar</QBoton>
            </div>
        </QModal>
    );
};
