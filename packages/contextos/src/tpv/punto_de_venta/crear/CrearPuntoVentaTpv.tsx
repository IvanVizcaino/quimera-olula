import { AgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { TiendaTpv } from "#/tpv/comun/componentes/TiendaTpv.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useMemo } from "react";
import { metaNuevoPuntoVentaTpv, puntoVentaVacio } from "../dominio.ts";
import { getPuntoVentaTpv, postPuntoVentaTpv } from "../infraestructura.ts";

export const CrearPuntoVentaTpv = ({
    publicar = async () => {},
    activo = false,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo(puntoVentaVacio, []);
    const form = useModelo(metaNuevoPuntoVentaTpv, inicial);

    const crear = async () => {
        const id = await intentar(() => postPuntoVentaTpv(form.modelo));
        const punto = await getPuntoVentaTpv(id);
        publicar("punto_creado", punto);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearPuntoVentaTpv">
                <h2>Nuevo punto de venta</h2>
                <quimera-formulario>
                    <QInput label="Código" {...form.uiProps("id")} />
                    <QInput label="Nombre" {...form.uiProps("nombre")} />
                    <QInput label="Serie" {...form.uiProps("serieId")} />
                    <TiendaTpv
                        label="Tienda"
                        {...form.uiProps("tiendaId")}
                        nombre="tienda_id"
                    />
                    <AgenteTpv
                        label="Agente por defecto"
                        {...form.uiProps("agenteId")}
                        nombre="agente_id"
                    />
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
