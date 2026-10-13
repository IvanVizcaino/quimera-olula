import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { Subcuenta } from "../diseño.ts";
import { etiquetaSubcuenta, metaEditarSubcuenta } from "../dominio.ts";
import { deleteSubcuenta, getSubcuenta, patchSubcuenta } from "../infraestructura.ts";

const vacia = (): Subcuenta => ({
    id: "",
    codigo: "",
    nombre: "",
    ejercicioId: "",
    cuentaId: 0,
    codigoCuenta: "",
    impuestoId: "",
    iva: 0,
    recargo: 0,
});

export const DetalleSubcuenta = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [subcuenta, setSubcuenta] = useState<Subcuenta>(vacia);
    const [confirmarBorrado, setConfirmarBorrado] = useState(false);
    const form = useModelo(metaEditarSubcuenta, { nombre: "", impuestoId: "" });

    useEffect(() => {
        if (!id) {
            setSubcuenta(vacia());
            form.init({ nombre: "", impuestoId: "" });
            return;
        }
        let activo = true;
        getSubcuenta(id).then((s) => {
            if (!activo) return;
            setSubcuenta(s);
            form.init({ nombre: s.nombre, impuestoId: s.impuestoId });
        });
        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cerrar = useCallback(() => publicar("seleccion_cancelada"), [publicar]);

    const guardar = useCallback(async () => {
        if (!subcuenta.id) return;
        await intentar(() =>
            patchSubcuenta(subcuenta.id, {
                nombre: form.modelo.nombre,
                impuestoId: form.modelo.impuestoId,
            }),
        );
        const actualizada = await getSubcuenta(subcuenta.id);
        setSubcuenta(actualizada);
        form.init({ nombre: actualizada.nombre, impuestoId: actualizada.impuestoId });
        publicar("subcuenta_cambiada", actualizada);
    }, [form, intentar, publicar, subcuenta.id]);

    const cancelar = useCallback(() => {
        form.init({ nombre: subcuenta.nombre, impuestoId: subcuenta.impuestoId });
    }, [form, subcuenta.impuestoId, subcuenta.nombre]);

    const borrarConfirmado = useCallback(async () => {
        if (!subcuenta.id) return;
        await intentar(() => deleteSubcuenta(subcuenta.id));
        setConfirmarBorrado(false);
        publicar("subcuenta_borrada", subcuenta.id);
    }, [intentar, publicar, subcuenta.id]);

    const cancelarBorrado = useCallback(() => setConfirmarBorrado(false), []);

    const [borrar, cancelarBorradoForm] = useForm(borrarConfirmado, cancelarBorrado);

    if (!subcuenta.id) return null;

    return (
        <Detalle
            id={subcuenta.id}
            obtenerTitulo={etiquetaSubcuenta}
            setEntidad={() => {}}
            entidad={subcuenta}
            cerrarDetalle={cerrar}
        >
            <Tabs
                children={[
                    <Tab key="general" label="General">
                        <quimera-formulario>
                            <QInput label="Código" nombre="codigo" valor={subcuenta.codigo} soloLectura />
                            <QInput label="Descripción" {...form.uiProps("nombre")} />
                            <QInput
                                label="Cuenta (plan)"
                                nombre="codigo_cuenta"
                                valor={subcuenta.codigoCuenta}
                                soloLectura
                            />
                            <QInput
                                label="Ejercicio"
                                nombre="ejercicio_id"
                                valor={subcuenta.ejercicioId}
                                soloLectura
                            />
                            <GrupoIvaProducto {...form.uiProps("impuestoId")} />
                            <QInput
                                label="% I.V.A."
                                nombre="iva"
                                valor={String(subcuenta.iva)}
                                soloLectura
                            />
                            <QInput
                                label="% R. Equivalencia"
                                nombre="recargo"
                                valor={String(subcuenta.recargo)}
                                soloLectura
                            />
                        </quimera-formulario>
                    </Tab>,
                ]}
            />
            <div className="botones maestro-botones">
                {form.modificado && (
                    <>
                        <QBoton onClick={guardar} deshabilitado={!form.valido}>
                            Guardar
                        </QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar} deshabilitado={!form.modificado}>
                            Cancelar
                        </QBoton>
                    </>
                )}
                <QBoton variante="texto" onClick={() => setConfirmarBorrado(true)}>
                    Borrar subcuenta
                </QBoton>
            </div>
            {confirmarBorrado && (
                <QModalConfirmacion
                    nombre="borrarSubcuenta"
                    abierto={true}
                    titulo="Borrar subcuenta"
                    mensaje={`¿Confirma borrar ${etiquetaSubcuenta(subcuenta)}? Solo es posible si no tiene partidas contables.`}
                    onCerrar={cancelarBorradoForm}
                    onAceptar={borrar}
                />
            )}
        </Detalle>
    );
};
