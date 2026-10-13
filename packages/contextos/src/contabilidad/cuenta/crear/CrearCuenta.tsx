import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect } from "react";
import { metaNuevaCuenta, nuevaCuentaVacia } from "../dominio.ts";
import { getCuenta, postCuenta } from "../infraestructura.ts";

export const CrearCuenta = ({
    publicar = async () => {},
    activo = false,
    ejercicioId,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
    ejercicioId: string;
}) => {
    const { intentar } = useContext(ContextoError);
    const form = useModelo(metaNuevaCuenta, nuevaCuentaVacia(ejercicioId));

    useEffect(() => {
        if (activo) {
            form.init(nuevaCuentaVacia(ejercicioId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activo, ejercicioId]);

    const crear = async () => {
        const id = await intentar(() => postCuenta(form.modelo));
        const cuenta = await getCuenta(id);
        publicar("cuenta_creada", cuenta);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearCuenta">
                <h2>Nueva cuenta PGC</h2>
                <quimera-formulario>
                    <QInput
                        label="Ejercicio"
                        nombre="ejercicioId"
                        valor={String(form.modelo.ejercicioId)}
                        soloLectura
                    />
                    <QInput label="Código epígrafe" {...form.uiProps("codigoEpigrafe")} />
                    <QInput label="Código cuenta" {...form.uiProps("codigo")} />
                    <QInput label="Descripción" {...form.uiProps("nombre")} />
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
