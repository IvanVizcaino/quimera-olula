import { opcionesTipoIdFiscalCompras } from "#/compras/comun/valores.ts";
import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postProveedor } from "../infraestructura.ts";
import { metaNuevoProveedor, nuevoProveedorInicial } from "./crear.ts";
import "./CrearProveedor.css";

export const CrearProveedor = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoProveedorInicial, []);

    const { modelo: proveedor, uiProps, valido } = useModelo(metaNuevoProveedor, inicial);

    const crear_ = useCallback(async () => {
        const id = await postProveedor(proveedor);
        publicar("proveedor_creado", id);
    }, [proveedor, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_proveedor_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearProveedor"
            titulo="Crear proveedor"
            onCerrar={cancelar}
        >
            <div className="CrearProveedor">
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
                    <TipoIdFiscal
                        {...uiProps("tipoIdFiscal")}
                        opciones={opcionesTipoIdFiscalCompras}
                    />
                    <QInput label="Id Fiscal" {...uiProps("idFiscal")} />
                </quimera-formulario>
                {!proveedor.empresaId && (
                    <QAviso>
                        Sin empresa activa. Selecciónala en la cabecera para poder guardar.
                    </QAviso>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
