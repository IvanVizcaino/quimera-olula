import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useMemo } from "react";
import { agenteVacio, metaNuevoAgenteTpv } from "../dominio.ts";
import { getAgenteTpv, postAgenteTpv } from "../infraestructura.ts";

export const CrearAgenteTpv = ({
    publicar = async () => {},
    activo = false,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo(agenteVacio, []);
    const form = useModelo(metaNuevoAgenteTpv, inicial);

    const crear = async () => {
        const id = await intentar(() => postAgenteTpv(form.modelo));
        const agente = await getAgenteTpv(id);
        publicar("agente_creado", agente);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearAgenteTpv">
                <h2>Nuevo agente TPV</h2>
                <quimera-formulario>
                    <QInput label="Nombre" {...form.uiProps("nombre")} />
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
