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
import { Cuenta } from "../diseño.ts";
import { etiquetaCuenta, metaEditarCuenta } from "../dominio.ts";
import { deleteCuenta, getCuenta, patchCuenta } from "../infraestructura.ts";

const vacia = (): Cuenta => ({
    id: "",
    codigo: "",
    nombre: "",
    ejercicioId: "",
    codigoEpigrafe: null,
    nivel: 0,
});

export const DetalleCuenta = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [cuenta, setCuenta] = useState<Cuenta>(vacia);
    const [confirmarBorrado, setConfirmarBorrado] = useState(false);
    const form = useModelo(metaEditarCuenta, { nombre: "" });

    useEffect(() => {
        if (!id) {
            setCuenta(vacia());
            form.init({ nombre: "" });
            return;
        }
        let activo = true;
        getCuenta(id).then((c) => {
            if (!activo) return;
            setCuenta(c);
            form.init({ nombre: c.nombre });
        });
        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cerrar = useCallback(() => publicar("seleccion_cancelada"), [publicar]);

    const guardar = useCallback(async () => {
        if (!cuenta.id) return;
        await intentar(() => patchCuenta(cuenta.id, { nombre: form.modelo.nombre }));
        const actualizada = await getCuenta(cuenta.id);
        setCuenta(actualizada);
        form.init({ nombre: actualizada.nombre });
        publicar("cuenta_cambiada", actualizada);
    }, [form, intentar, publicar, cuenta.id]);

    const cancelar = useCallback(() => {
        form.init({ nombre: cuenta.nombre });
    }, [form, cuenta.nombre]);

    const borrarConfirmado = useCallback(async () => {
        if (!cuenta.id) return;
        await intentar(() => deleteCuenta(cuenta.id));
        setConfirmarBorrado(false);
        publicar("cuenta_borrada", cuenta.id);
    }, [intentar, publicar, cuenta.id]);

    const cancelarBorrado = useCallback(() => setConfirmarBorrado(false), []);

    const [borrar, cancelarBorradoForm] = useForm(borrarConfirmado, cancelarBorrado);

    if (!cuenta.id) return null;

    return (
        <Detalle
            id={cuenta.id}
            obtenerTitulo={etiquetaCuenta}
            setEntidad={() => {}}
            entidad={cuenta}
            cerrarDetalle={cerrar}
        >
            <Tabs
                children={[
                    <Tab key="general" label="General">
                        <quimera-formulario>
                            <QInput label="Código" nombre="codigo" valor={cuenta.codigo} soloLectura />
                            <QInput label="Descripción" {...form.uiProps("nombre")} />
                            <QInput
                                label="Epígrafe"
                                nombre="codigo_epigrafe"
                                valor={cuenta.codigoEpigrafe ?? ""}
                                soloLectura
                            />
                            <QInput
                                label="Ejercicio"
                                nombre="ejercicio_id"
                                valor={cuenta.ejercicioId}
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
                    Borrar cuenta
                </QBoton>
            </div>
            {confirmarBorrado && (
                <QModalConfirmacion
                    nombre="borrarCuenta"
                    abierto={true}
                    titulo="Borrar cuenta"
                    mensaje={`¿Confirma borrar ${etiquetaCuenta(cuenta)}? Solo es posible si no tiene subcuentas asociadas.`}
                    onCerrar={cancelarBorradoForm}
                    onAceptar={borrar}
                />
            )}
        </Detalle>
    );
};
