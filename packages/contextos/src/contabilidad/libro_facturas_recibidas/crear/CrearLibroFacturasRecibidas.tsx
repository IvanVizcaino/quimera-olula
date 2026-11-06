import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { admiteNumeroDesde, admitePorcentaje } from "../dominio.ts";
import { postLibroFacturasRecibidas } from "../infraestructura.ts";
import {
    metaNuevoLibroFacturasRecibidas,
    nuevoLibroFacturasRecibidasInicial,
} from "./crear.ts";

export const CrearLibroFacturasRecibidas = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const inicial = useMemo(
        () => nuevoLibroFacturasRecibidasInicial(ejercicioId),
        [ejercicioId]
    );

    const {
        modelo: informe,
        uiProps,
        valido,
    } = useModelo(metaNuevoLibroFacturasRecibidas, inicial);

    const crear_ = useCallback(async () => {
        const id = await postLibroFacturasRecibidas(informe);
        publicar("informe_creado", id);
    }, [informe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_informe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearLibroFacturasRecibidas"
            titulo="Nuevo libro de facturas recibidas"
            onCerrar={cancelar}
        >
            <div className="CrearLibroFacturasRecibidas">
                <quimera-formulario>
                    <QInput
                        label="Descripción"
                        {...uiProps("descripcion")}
                        ref={focus}
                    />
                    <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                    <QDate
                        label="Desde fecha"
                        {...uiProps("fechaDesde")}
                        opcional
                    />
                    <QDate
                        label="Hasta fecha"
                        {...uiProps("fechaHasta")}
                        opcional
                    />
                    <QCheckbox
                        label="Todos los tipos de I.V.A."
                        {...uiProps("todos")}
                    />
                    <QInput
                        label="% de I.V.A."
                        {...uiProps("porcentaje")}
                        soloLectura={!admitePorcentaje(informe)}
                        opcional
                    />
                    <QCheckbox label="Solo con I.V.A." {...uiProps("conIva")} />
                    <QInput
                        label="Serie"
                        {...uiProps("codigoSerie")}
                        opcional
                    />
                    <QCheckbox
                        label="Mostrar total factura"
                        {...uiProps("mostrarTotalFactura")}
                    />
                    <QCheckbox label="Mostrar NIF" {...uiProps("mostrarNif")} />
                    <QCheckbox
                        label="Mostrar documento"
                        {...uiProps("mostrarDocumento")}
                    />
                    <QCheckbox
                        label="Mostrar asiento"
                        {...uiProps("mostrarAsiento")}
                    />
                    <QCheckbox
                        label="Numeración automática"
                        {...uiProps("numeracionAutomatica")}
                    />
                    <QInput
                        label="Numerar desde"
                        {...uiProps("numeroDesde")}
                        soloLectura={!admiteNumeroDesde(informe)}
                        opcional
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
