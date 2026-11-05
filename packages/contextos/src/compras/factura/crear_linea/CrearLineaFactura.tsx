import {
    ArticuloLinea,
    CamposArticuloLinea,
} from "#/compras/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { Factura, NuevaLineaFactura } from "../diseño.ts";
import {
    camposConCambiosServidor,
    metaNuevaLineaFactura,
    nuevaLineaFacturaVacia,
} from "../dominio.ts";
import { postLineaFactura, queryNuevaLineaFactura } from "../infraestructura.ts";
import "./CrearLineaFactura.css";

export const CrearLineaFactura = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevaLineaFacturaVacia, []);

    const onModeloListo = useCallback(
        async (linea: NuevaLineaFactura, campo?: string) => {
            if (
                campo &&
                !(camposConCambiosServidor as readonly string[]).includes(campo)
            ) {
                return;
            }
            return await queryNuevaLineaFactura(factura.id, linea);
        },
        [factura.id]
    );

    const { modelo, uiProps, valido, set } = useModelo(
        metaNuevaLineaFactura,
        inicial,
        onModeloListo
    );

    const onArticuloCambiado = useCallback(
        (cambios: Partial<CamposArticuloLinea>) => {
            set({
                ...modelo,
                ...cambios,
                ...(cambios.referencia !== undefined ? { pvpUnitario: null } : {}),
            });
        },
        [modelo, set]
    );

    const crear_ = useCallback(async () => {
        const idLinea = await postLineaFactura(factura.id, modelo);
        publicar("linea_creada", idLinea);
    }, [modelo, factura.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const [mostrarMas, setMostrarMas] = useState(false);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaFacturaCompra"
            titulo="Crear línea"
            onCerrar={cancelar}
        >
            <div className="CrearLineaFactura">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={modelo.tipoArticulo}
                        referencia={modelo.referencia}
                        descripcionArticulo={modelo.descripcionArticulo}
                        descripcion={modelo.descripcion}
                        nombre="referenciaNuevaLineaFacturaCompra"
                        onChange={onArticuloCambiado}
                        autoFocus
                    />
                    <QInput label="Cantidad" {...uiProps("cantidad")} />
                    <QInput label="Coste unitario" {...uiProps("pvpUnitario")} />
                    <QInput label="Total" {...uiProps("pvpTotal")} soloLectura />

                    <div className="mostrar-mas-fila">
                        <button
                            type="button"
                            className="mostrar-mas-btn"
                            onClick={() => setMostrarMas((v) => !v)}
                        >
                            {mostrarMas ? "▲ Menos opciones" : "▼ Más opciones"}
                        </button>
                    </div>

                    {mostrarMas && (
                        <>
                            <div className="seccion-separador">Descuento</div>
                            <QInput label="% Descuento" {...uiProps("dtoPorcentual")} />
                            <QInput label="Descuento lineal" {...uiProps("dtoLineal")} />

                            <div className="seccion-separador">Impuestos</div>
                            <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
                            <QInput label="% IVA" {...uiProps("tipoIva")} soloLectura />
                            <QInput
                                label="% R.Equivalencia"
                                {...uiProps("tipoRecargo")}
                                soloLectura
                            />
                            <QInput label="% I.R.P.F." {...uiProps("tipoIrpf")} />
                        </>
                    )}
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
