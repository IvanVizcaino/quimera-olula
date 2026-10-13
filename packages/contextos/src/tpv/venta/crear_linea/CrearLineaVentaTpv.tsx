import { ArticuloLinea, CamposArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import type { TagArticulo } from "#/ventas/articulo/diseño.ts";
import type { ModeloNuevaLinea } from "#/ventas/venta/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { plugin } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { VentaTpv } from "../diseño.ts";
import { postLinea, queryNuevaLinea } from "../infraestructura.ts";
import "./CrearLineaVentaTpv.css";
import { camposConCambiosServidor, metaNuevaLinea, nuevaLineaInicial } from "./crear_linea.ts";

export const CrearLineaVentaTpv = ({
    venta,
    publicar,
}: {
    venta: VentaTpv;
    publicar: EmitirEvento;
}) => {
    const onModeloListo = useCallback(
        async (nuevaLinea: ModeloNuevaLinea, campo?: string) => {
            if (campo && !(camposConCambiosServidor as readonly string[]).includes(campo)) return;
            return await queryNuevaLinea(venta.id, nuevaLinea);
        },
        [venta.id]
    );

    const lineaArticulo = useModelo(metaNuevaLinea, nuevaLineaInicial, onModeloListo);
    const linea = lineaArticulo.modelo;

    const onArticuloCambiado = useCallback(
        (cambios: Partial<CamposArticuloLinea>) => {
            const extra = cambios.idArticulo !== undefined ? { pvpUnitario: null } : {};
            lineaArticulo.set({ ...linea, ...cambios, ...extra });
        },
        [linea, lineaArticulo]
    );

    const crear_ = useCallback(async () => {
        const lineaConId = await postLinea(venta.id, lineaArticulo.modelo);
        publicar("linea_creada", lineaConId);
    }, [lineaArticulo, publicar, venta.id]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const valido = lineaArticulo.valido;
    const [mostrarMas, setMostrarMas] = useState(false);
    const libre = linea.tipoArticulo === "libre";
    // Slot de factoría TPV: formato del texto de cada artículo en el buscador (CC-02 en crema_cafe).
    const formatoOpcion = FactoryObj.app.TPV?.articulo_formatoOpcion as
        | ((articulo: TagArticulo) => string)
        | undefined;
    const ivaIncluidoActivo = plugin("iva_incluido") === "activo";

    return (
        <QModal
            abierto={true}
            nombre="crear_linea_tpv"
            titulo="Crear línea"
            onCerrar={cancelar}
        >
            <div className="CrearLineaVentaTpv">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={linea.tipoArticulo}
                        idArticulo={linea.idArticulo}
                        descripcionArticulo={linea.descripcionArticulo}
                        descripcion={linea.descripcion ?? ""}
                        nombre="idArticulo_nueva_linea_tpv"
                        onChange={onArticuloCambiado}
                        formatoOpcion={formatoOpcion}
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
                            <GrupoIvaProducto
                                {...lineaArticulo.uiProps("idGrupoIvaProducto")} 
                                soloLectura={!libre}
                            />
                            <QInput label="% IVA" {...lineaArticulo.uiProps("tipoIva")} soloLectura />
                            <QInput label="% R.Equivalencia" {...lineaArticulo.uiProps("tipoRecargo")} soloLectura />
                            {ivaIncluidoActivo &&
                                <QCheckbox label="IVA incluido" {...lineaArticulo.uiProps("ivaIncluido")} soloLectura={!libre} />
                            }
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
