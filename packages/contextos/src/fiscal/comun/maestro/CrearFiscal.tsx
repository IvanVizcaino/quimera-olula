import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad, Modelo } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { ConfigMaestroFiscal } from "./diseño.ts";
import { conConfirmacion, postUno } from "./infraestructura.ts";

export const CrearFiscal = <T extends Entidad & Modelo, N extends Modelo>({
    config, publicar,
}: {
    config: ConfigMaestroFiscal<T, N>;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => config.nuevoVacio(), [config]);
    const { modelo, uiProps, valido } = useModelo(config.metaNuevo, inicial);

    const crear_ = useCallback(async () => {
        const id = await conConfirmacion(
            (extra) => postUno(config, { ...config.nuevoAApi(modelo), ...extra }),
            config.confirmacion,
        );
        if (id) publicar("entidad_creada", id);
    }, [config, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_cancelada"), [publicar]);
    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();
    const Campos = config.CamposNuevo;
    const codigo = <QInput label="Código" {...uiProps("id")} ref={focus} />;

    return (
        <QModal abierto={true} nombre={`crear_${config.nombre}`}
            titulo={`Nuevo: ${config.nombre}`} onCerrar={cancelar}>
            <div className="CrearFiscal">
                <quimera-formulario>
                    {!config.codigoEnCampos && codigo}
                    {Campos && <Campos uiProps={uiProps} codigo={config.codigoEnCampos ? codigo : undefined} />}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>Crear</QBoton>
                </div>
            </div>
        </QModal>
    );
};
