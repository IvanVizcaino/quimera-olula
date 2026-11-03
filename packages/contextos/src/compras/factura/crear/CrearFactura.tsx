import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { EmpresaActual } from "#/comun/componentes/empresaActual.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { postFactura } from "../infraestructura.ts";
import {
    metaNuevaFactura,
    metaNuevaFacturaProveedorNoRegistrado,
    nuevaFacturaInicial,
    nuevaFacturaProveedorNoRegistradoInicial,
} from "./crear.ts";
import "./CrearFactura.css";

export const CrearFactura = ({ publicar }: { publicar: EmitirEvento }) => {
    const [modoNoRegistrado, setModoNoRegistrado] = useState(false);

    const inicialRegistrado = useMemo(nuevaFacturaInicial, []);
    const inicialNoRegistrado = useMemo(nuevaFacturaProveedorNoRegistradoInicial, []);

    const registrado = useModelo(metaNuevaFactura, inicialRegistrado);
    const noRegistrado = useModelo(
        metaNuevaFacturaProveedorNoRegistrado,
        inicialNoRegistrado
    );

    const alternarModo = () => {
        setModoNoRegistrado((modo) => !modo);
        registrado.init(inicialRegistrado);
        noRegistrado.init(inicialNoRegistrado);
    };

    const crear_ = useCallback(async () => {
        const modelo = modoNoRegistrado ? noRegistrado.modelo : registrado.modelo;
        const id = await postFactura(modelo);
        publicar("factura_creada", id);
    }, [modoNoRegistrado, noRegistrado.modelo, registrado.modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_factura_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const form = modoNoRegistrado ? noRegistrado : registrado;

    return (
        <QModal
            abierto={true}
            nombre="crearFacturaCompra"
            titulo="Crear factura de compra"
            onCerrar={cancelar}
        >
            <div className="modo-proveedor">
                <QBoton onClick={alternarModo} variante="texto" tipo="button">
                    {modoNoRegistrado ? "Proveedor registrado" : "Proveedor no registrado"}
                </QBoton>
            </div>
            <div className="CrearFactura">
                <quimera-formulario>
                    <EmpresaActual />
                    {modoNoRegistrado ? (
                        <>
                            <QInput
                                label="Nombre del proveedor"
                                {...noRegistrado.uiProps("nombre")}
                            />
                            <QInput label="Id Fiscal" {...noRegistrado.uiProps("idFiscal")} />
                        </>
                    ) : (
                        <Proveedor
                            {...registrado.uiProps("proveedorId", "nombreProveedor")}
                            nombre="proveedorFactura"
                        />
                    )}
                    <QInput
                        label="Nº factura del proveedor"
                        {...form.uiProps("numeroProveedor")}
                    />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
