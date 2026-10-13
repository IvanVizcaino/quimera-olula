import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect } from "react";
import { CuentaSelector } from "#/contabilidad/comun/componentes/CuentaSelector.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { metaNuevaSubcuenta, nuevaSubcuentaVacia } from "../dominio.ts";
import { getSubcuenta, postSubcuenta } from "../infraestructura.ts";

export const CrearSubcuenta = ({
    publicar = async () => {},
    activo = false,
    ejercicioId,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
    ejercicioId: string;
}) => {
    const { intentar } = useContext(ContextoError);
    const form = useModelo(metaNuevaSubcuenta, nuevaSubcuentaVacia(ejercicioId));

    useEffect(() => {
        if (activo) {
            form.init(nuevaSubcuentaVacia(ejercicioId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activo, ejercicioId]);

    const crear = async () => {
        const id = await intentar(() => postSubcuenta(form.modelo));
        const subcuenta = await getSubcuenta(id);
        publicar("subcuenta_creada", subcuenta);
        form.init();
    };

    const cancelar = () => {
        form.init();
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearSubcuenta">
                <h2>Nueva subcuenta</h2>
                <quimera-formulario>
                    <QInput
                        label="Ejercicio"
                        nombre="ejercicioId"
                        valor={String(form.modelo.ejercicioId)}
                        soloLectura
                    />
                    <CuentaSelector
                        ejercicioId={ejercicioId}
                        {...form.uiProps("codigoCuenta")}
                        onChange={(op) =>
                            form.set(
                                { ...form.modelo, codigoCuenta: op?.valor ?? "" },
                                "codigoCuenta",
                            )
                        }
                    />
                    <QInput label="Código subcuenta" {...form.uiProps("codigo")} />
                    <QInput label="Descripción" {...form.uiProps("nombre")} />
                    <GrupoIvaProducto {...form.uiProps("impuestoId")} />
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
