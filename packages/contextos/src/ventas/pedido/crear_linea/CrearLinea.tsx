import { useAplicarImpuestoDefecto } from "#/almacen/config/useImpuestoDefecto.ts";
import { ArticuloLinea, CamposArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { plugin } from "@olula/lib/dominio.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import type { ModeloNuevaLinea } from "../../venta/diseño.ts";
import { postLinea, queryNuevaLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import {
    camposConCambiosServidor,
    metaNuevaLinea,
    nuevaLineaInicial
} from "./dominio.ts";

export type CrearLineaProps = {
    idPedido: string;
    publicar: ProcesarEvento;
};

export const CrearLinea = (props: CrearLineaProps) => {
    const { app } = useContext(FactoryCtx);
    const CrearLinea_ = app.Ventas.pedido_CrearLinea as typeof CrearLineaBase;

    return CrearLinea_(props);
};

export const CrearLineaBase = ({ idPedido, publicar }: CrearLineaProps) => {

    // Callback para campos QInput (cantidad…): se dispara en blur via evaluarCambio.
    // Solo llama al servidor si el campo está en camposConCambiosServidor.
    const onModeloListo = useCallback(
        async (nuevaLinea: ModeloNuevaLinea, campo?: string) => {
            if (campo && !(camposConCambiosServidor as readonly string[]).includes(campo)) {
                return;
            }
            console.log("onModeloListo", nuevaLinea);
            return await queryNuevaLinea(idPedido, nuevaLinea);
        },
        [idPedido]
    );

    const lineaArticulo = useModelo(metaNuevaLinea, nuevaLineaInicial, onModeloListo);
    useAplicarImpuestoDefecto(lineaArticulo, "idGrupoIvaProducto", "linea");

    const linea = lineaArticulo.modelo;

    const onArticuloCambiado = useCallback(
        async (cambios: Partial<CamposArticuloLinea>) => {
            const extra = cambios.idArticulo !== undefined ? { pvpUnitario: null } : {};
            lineaArticulo.set({ ...linea, ...cambios, ...extra });
        },
        [linea, lineaArticulo]
    );

    const crear_ = useCallback(async () => {
        const lineaConId = await postLinea(idPedido, lineaArticulo.modelo);
        publicar("linea_creada", lineaConId);
    }, [lineaArticulo, publicar, idPedido]);

    const cancelar_ = useCallback(
        () => publicar("crear_linea_cancelado"),
        [publicar]
    ); 

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const valido = lineaArticulo.valido;
    const [mostrarMas, setMostrarMas] = useState(false);
    const libre = linea.tipoArticulo === "libre";
    const ivaIncluidoActivo = plugin("iva_incluido") === "activo";

    return (
        <QModal
            abierto={true}
            nombre="crear_linea_pedido"
            titulo="Crear línea"
            onCerrar={cancelar}
        >
            <div className="CrearLinea">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={linea.tipoArticulo}
                        idArticulo={linea.idArticulo}
                        descripcionArticulo={linea.descripcionArticulo}
                        descripcion={linea.descripcion ?? ""}
                        nombre="idArticulo_nueva_linea_pedido"
                        onChange={onArticuloCambiado}
                    />
                    <QInput label="Cantidad" {...lineaArticulo.uiProps("cantidad")} />
                    <QInput label="PVP unitario" {...lineaArticulo.uiProps("pvpUnitario")} />
                    <QInput label="Total" {...lineaArticulo.uiProps("pvpTotal")} />

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
                            <QInput label="% Descuento" {...lineaArticulo.uiProps("dtoPorcentual")} />
                            <QInput label="Dto. lineal" {...lineaArticulo.uiProps("dtoLineal")} />

                            <div className="seccion-separador">Impuestos</div>
                            <GrupoIvaProducto {...lineaArticulo.uiProps("idGrupoIvaProducto")} soloLectura={!libre} />
                            <QInput label="% IVA" {...lineaArticulo.uiProps("tipoIva")} soloLectura />
                            <QInput label="% R.Equivalencia" {...lineaArticulo.uiProps("tipoRecargo")} soloLectura />
                            {ivaIncluidoActivo &&
                                <QCheckbox label="IVA incluido" {...lineaArticulo.uiProps("ivaIncluido")} soloLectura={!libre} />
                            }
                            <QInput label="% I.R.P.F." {...lineaArticulo.uiProps("tipoIrpf")} />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
