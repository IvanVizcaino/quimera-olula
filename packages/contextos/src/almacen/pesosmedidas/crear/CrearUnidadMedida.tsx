import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useMemo } from "react";
import { metaNuevaUnidadMedida, unidadMedidaVacia } from "../dominio.ts";
import { getUnidadMedida, postUnidadMedida } from "../infraestructura.ts";

export const CrearUnidadMedida = ({
    publicar = async () => {},
    activo = false,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo(unidadMedidaVacia, []);
    const form = useModelo(metaNuevaUnidadMedida, inicial);

    const crear = async () => {
        const id = await intentar(() => postUnidadMedida(form.modelo));
        const unidad = await getUnidadMedida(id);
        publicar("unidad_creada", unidad);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearUnidadMedida">
                <h2>Nueva unidad de medida</h2>
                <quimera-formulario>
                    <QInput label="Código" {...form.uiProps("id")} />
                    <QInput label="Descripción" {...form.uiProps("descripcion")} />
                    <QInput label="Magnitud" {...form.uiProps("magnitud")} />
                    <QInput label="Factor de conversión" {...form.uiProps("factorConv")} />
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>
                        Guardar
                    </QBoton>
                    <QBoton onClick={cancelar} variante="texto">
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </Mostrar>
    );
};
