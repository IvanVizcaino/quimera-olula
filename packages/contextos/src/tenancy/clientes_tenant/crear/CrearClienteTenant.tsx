import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { postClienteTenant } from "../infraestructura.js";
import { metaNuevoClienteTenant, nuevoClienteTenantInicial } from "./crear.js";

const EJEMPLO_CADENA = JSON.stringify(
    { nombre: "nombre_bd", servidor: "localhost", puerto: 5432, usuario: "postgres", contraseña: "contraseña" },
    null, 2
);

export const CrearClienteTenant = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevoClienteTenantInicial, []);

    const { modelo: cliente, uiProps, valido } = useModelo(
        metaNuevoClienteTenant,
        inicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postClienteTenant(cliente);
            publicar("cliente_creado", id);
        },
        [cliente, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_cliente_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();
    const [copiado, setCopiado] = useState(false);

    const copiarEjemplo = useCallback(() => {
        navigator.clipboard.writeText(EJEMPLO_CADENA);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }, []);

    return (
        <QModal
            abierto={true}
            nombre="crearClienteTenant"
            titulo="Crear cliente tenant"
            onCerrar={cancelar}
        >
            <div className="CrearClienteTenant">
                <quimera-formulario>
                    <QInput label="ID" {...uiProps("id")} ref={focus} />
                    <QInput label="Nombre" {...uiProps("nombre")} />
                    <QTextArea label="Cadena de conexión (JSON en claro)" rows={5} {...uiProps("cadenaConexion")} />
                </quimera-formulario>

                <details style={{ marginTop: "0.5rem", fontSize: "0.85em" }}>
                    <summary style={{ cursor: "pointer", color: "var(--color-primario, #1976d2)" }}>
                        Ver formato de la cadena de conexión
                    </summary>
                    <div style={{ position: "relative", marginTop: "0.5rem" }}>
                        <pre style={{
                            background: "var(--color-fondo-secundario, #f5f5f5)",
                            padding: "0.75rem",
                            borderRadius: "4px",
                            overflowX: "auto",
                            margin: 0,
                        }}>
                            {EJEMPLO_CADENA}
                        </pre>
                        <span style={{ position: "absolute", top: "0.4rem", right: "0.4rem", fontSize: "0.75em" }}>
                            <QBoton onClick={copiarEjemplo} tamaño="pequeño">
                                {copiado ? "Copiado" : "Copiar"}
                            </QBoton>
                        </span>
                    </div>
                </details>

                <div className="botones maestro-botones" style={{ marginTop: "1rem" }}>
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
