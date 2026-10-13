import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearDireccionUnaLinea } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useState } from "react";
import { CambiarDireccionEmpresa } from "../cambiar_direccion/CambiarDireccionEmpresa.js";
import { Empresa } from "../diseño.js";
import "./TabGeneral.css";

interface TabGeneralProps {
    form: HookModelo<Empresa>;
    publicar: EmitirEvento;
}

export const TabGeneral = ({ form, publicar }: TabGeneralProps) => {

    const { uiProps, modelo } = form;
    const [editandoDireccion, setEditandoDireccion] = useState(false);

    const direccionResumen = formatearDireccionUnaLinea({
        tipo_via: modelo.tipoVia,
        nombre_via: modelo.nombreVia,
        numero: modelo.numero,
        otros: modelo.otros,
        cod_postal: modelo.codPostal,
        ciudad: modelo.ciudad,
        provincia_id: Number(modelo.provinciaId),
        provincia: modelo.provincia,
        pais_id: modelo.paisId,
        apartado: modelo.apartado,
        telefono: modelo.telefonoDireccion,
    }).trim();

    const direccionSinDefinir =
        direccionResumen.replace(/[,\s]/g, "").length === 0;

    const conRegistroSanitario = pluginActivo("registro_sanitario");

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Nombre" {...uiProps("nombre")} />
                <QInput label="Administrador" {...uiProps("administrador")} />
                <QInput label="CIF / NIF" {...uiProps("cifNif")} />
                <QInput label="Teléfono" {...uiProps("telefono")} />
                <QInput label="Email" {...uiProps("email")} />
                <QInput label="Web" {...uiProps("web")} />
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                {conRegistroSanitario && (
                    <QInput label="Registro Sanitario" {...uiProps("registroSanitario")} />
                )}

                <section className="TabGeneral-direccion-resumen">
                    <div className="TabGeneral-direccion-resumen-label">
                        Dirección
                    </div>
                    <div className="TabGeneral-direccion-resumen-contenido">
                        <span>
                            {direccionSinDefinir
                                ? "Dirección sin definir"
                                : direccionResumen}
                        </span>
                        <QBoton
                            tamaño="pequeño"
                            variante="texto"
                            onClick={() => setEditandoDireccion(true)}
                        >
                            Editar
                        </QBoton>
                    </div>
                </section>
            </quimera-formulario>

            {editandoDireccion && (
                <CambiarDireccionEmpresa
                    empresa={modelo}
                    publicar={publicar}
                    onCerrar={() => setEditandoDireccion(false)}
                />
            )}
        </div>
    );
};
