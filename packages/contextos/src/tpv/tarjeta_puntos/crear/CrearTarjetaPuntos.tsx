import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useMemo } from "react";
import { metaNuevaTarjetaPuntos, nuevaTarjetaPuntosVacia } from "../dominio.ts";
import { getTarjetaPuntos, postTarjetaPuntos } from "../infraestructura.ts";

export const CrearTarjetaPuntos = ({
    publicar = async () => {},
    activo = false,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo(nuevaTarjetaPuntosVacia, []);
    const form = useModelo(metaNuevaTarjetaPuntos, inicial);

    const crear = async () => {
        const id = await intentar(() => postTarjetaPuntos(form.modelo));
        const tarjeta = await getTarjetaPuntos(id);
        publicar("tarjeta_creada", tarjeta);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearTarjetaPuntos">
                <h2>Nueva Tarjeta de Puntos</h2>
                <quimera-formulario>
                    <QInput label="Código" {...form.uiProps("id")} />
                    <QInput label="Nombre titular" {...form.uiProps("nombre")} />
                    <QInput label="NIF" {...form.uiProps("idFiscal")} />
                    <QInput label="Dirección" {...form.uiProps("direccion")} />
                    <QInput label="Código Postal" {...form.uiProps("codPostal")} />
                    <QInput label="Ciudad" {...form.uiProps("ciudad")} />
                    <QInput label="Provincia" {...form.uiProps("provincia")} />
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>Guardar</QBoton>
                    <QBoton onClick={cancelar} variante="texto">Cancelar</QBoton>
                </div>
            </div>
        </Mostrar>
    );
};
