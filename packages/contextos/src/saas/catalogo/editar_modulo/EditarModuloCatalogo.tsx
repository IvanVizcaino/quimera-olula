import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { LimiteCatalogo, ModuloCatalogo } from "../diseño.js";
import { claveAporta, formAModulo, metaModulo, moduloAForm } from "../dominio.js";
import { putModulo } from "../infraestructura.js";

export const EditarModuloCatalogo = ({
    publicar,
    modulo,
    limites,
}: {
    publicar: EmitirEvento;
    modulo: ModuloCatalogo;
    limites: LimiteCatalogo[];
}) => {
    const inicial = useMemo(() => moduloAForm(modulo, limites), [modulo, limites]);
    const meta = useMemo(() => metaModulo(limites), [limites]);
    const { modelo, uiProps, valido } = useModelo(meta, inicial);

    const guardar_ = useCallback(
        async () => {
            await putModulo(formAModulo(modulo, modelo, limites));
            publicar("modulo_guardado");
        },
        [modulo, modelo, limites, publicar]
    );
    const cancelar_ = useCallback(() => publicar("edicion_cancelada"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="editarModuloCatalogo" titulo={`${modulo.plugin ? "Plugin" : "Módulo"} ${modulo.nombre}`} onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Precio suelto mensual" {...uiProps("precioMensual")} tipo="moneda" />
                <QInput label="Precio suelto anual" {...uiProps("precioAnual")} tipo="moneda" />
                <QCheckbox label="Contratable suelto" {...uiProps("contratableSuelto")} />
                <QCheckbox label="Público" {...uiProps("publico")} />
                {modulo.plugin && (
                    <>
                        <QSelect label="Variante al contratarlo" {...uiProps("variante")}
                            opciones={modulo.variantes.map((v) => ({ valor: v, descripcion: v }))} />
                        <p style={{ fontSize: "0.85em", opacity: 0.7 }}>
                            Plugin <code>{modulo.plugin}</code>: instalado para todas las empresas; las que no lo
                            tienen contratado usan la variante inactiva.
                        </p>
                    </>
                )}
                <h4>Aporta al límite</h4>
                {limites.map((l) => (
                    <QInput key={l.id} label={`${l.nombre} (${l.unidad})`}
                        {...uiProps(claveAporta(l.id))} tipo="entero" opcional />
                ))}
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>Guardar</QBoton>
            </div>
        </QModal>
    );
};
