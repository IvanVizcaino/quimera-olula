import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { TarjetaPuntos } from "../diseño.ts";
import { tarjetaPuntosVacia } from "../dominio.ts";
import { patchTarjetaPuntos } from "../infraestructura.ts";
import { metaTarjetaPuntos } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (t: TarjetaPuntos) => t.nombre || t.id;

export const DetalleTarjetaPuntos = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const vacia = tarjetaPuntosVacia();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", tarjeta: vacia, tarjetaInicial: vacia },
        publicar,
    );

    const form = useModelo(metaTarjetaPuntos, ctx.tarjeta);

    useEffect(() => {
        emitir("tarjeta_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const guardar = useCallback(async () => {
        await intentar(() =>
            patchTarjetaPuntos(form.modelo.id, {
                nombre: form.modelo.nombre,
                idFiscal: form.modelo.idFiscal,
                direccion: form.modelo.direccion,
                codPostal: form.modelo.codPostal,
                ciudad: form.modelo.ciudad,
                provincia: form.modelo.provincia,
                activa: form.modelo.activa,
            })
        );
        emitir("tarjeta_guardada");
    }, [emitir, form, intentar]);

    const cancelar = useCallback(() => emitir("cancelar_edicion"), [emitir]);

    if (!ctx.tarjeta.id) return null;

    return (
        <Detalle
            id={ctx.tarjeta.id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.tarjeta}
            cerrarDetalle={() => emitir("cancelar_seleccion")}
        >
            <>
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Código" nombre="id" valor={ctx.tarjeta.id} soloLectura />
                                <QInput label="Nombre titular" {...form.uiProps("nombre")} />
                                <QInput label="NIF" {...form.uiProps("idFiscal")} />
                                <QInput label="Dirección" {...form.uiProps("direccion")} />
                                <QInput label="Código Postal" {...form.uiProps("codPostal")} />
                                <QInput label="Ciudad" {...form.uiProps("ciudad")} />
                                <QInput label="Provincia" {...form.uiProps("provincia")} />
                                <QCheckbox label="Activa" {...form.uiProps("activa")} />
                                <QInput
                                    label="Saldo (puntos)"
                                    nombre="saldo"
                                    valor={String(ctx.tarjeta.saldo)}
                                    soloLectura
                                />
                            </quimera-formulario>
                        </Tab>,
                    ]}
                />
                {form.modificado && (
                    <div className="botones maestro-botones">
                        <QBoton onClick={guardar} deshabilitado={!form.valido}>Guardar</QBoton>
                        <QBoton tipo="reset" variante="texto" onClick={cancelar} deshabilitado={!form.modificado}>Cancelar</QBoton>
                    </div>
                )}
            </>
        </Detalle>
    );
};
