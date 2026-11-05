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
import { Albaran, NuevaLineaAlbaran } from "../diseño.ts";
import {
    camposConCambiosServidor,
    metaNuevaLineaAlbaran,
    nuevaLineaAlbaranVacia,
} from "../dominio.ts";
import { postLineaAlbaran, queryNuevaLineaAlbaran } from "../infraestructura.ts";
import "./CrearLineaAlbaran.css";

export const CrearLineaAlbaran = ({
    albaran,
    publicar,
}: {
    albaran: Albaran;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevaLineaAlbaranVacia, []);

    const onModeloListo = useCallback(
        async (linea: NuevaLineaAlbaran, campo?: string) => {
            if (
                campo &&
                !(camposConCambiosServidor as readonly string[]).includes(campo)
            ) {
                return;
            }
            return await queryNuevaLineaAlbaran(albaran.id, linea);
        },
        [albaran.id]
    );

    const { modelo, uiProps, valido, set } = useModelo(
        metaNuevaLineaAlbaran,
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
        const idLinea = await postLineaAlbaran(albaran.id, modelo);
        publicar("linea_creada", idLinea);
    }, [modelo, albaran.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const [mostrarMas, setMostrarMas] = useState(false);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaAlbaranCompra"
            titulo="Crear línea"
            onCerrar={cancelar}
        >
            <div className="CrearLineaAlbaran">
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={modelo.tipoArticulo}
                        referencia={modelo.referencia}
                        descripcionArticulo={modelo.descripcionArticulo}
                        descripcion={modelo.descripcion}
                        nombre="referenciaNuevaLineaAlbaranCompra"
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
