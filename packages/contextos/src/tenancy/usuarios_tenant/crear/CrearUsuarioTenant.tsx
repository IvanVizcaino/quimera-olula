import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { ClienteTenant } from "../../comun/componentes/clienteTenant.js";
import { postUsuarioTenant } from "../infraestructura.js";
import { metaNuevoUsuarioTenant, nuevoUsuarioTenantInicial } from "./crear.js";

export const CrearUsuarioTenant = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevoUsuarioTenantInicial, []);

    const { modelo: usuario, uiProps, valido } = useModelo(
        metaNuevoUsuarioTenant,
        inicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postUsuarioTenant(usuario);
            publicar("usuario_creado", id);
        },
        [usuario, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_usuario_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    const clienteIdProps = uiProps("clienteId");

    return (
        <QModal
            abierto={true}
            nombre="crearUsuarioTenant"
            titulo="Crear usuario tenant"
            onCerrar={cancelar}
        >
            <div className="CrearUsuarioTenant">
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
                    <QInput label="Email" {...uiProps("email")} tipo="email" />
                    <ClienteTenant
                        valor={clienteIdProps.valor as string}
                        onChange={(opcion) =>
                            (clienteIdProps.onChange as (v: string) => void)(opcion?.valor ?? "")
                        }
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
