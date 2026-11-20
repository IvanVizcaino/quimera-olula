import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useState } from "react";
import { GrupoIvaNegocio } from "../../../../comun/componentes/grupo_iva_negocio.js";
import { DatosFiscales } from "../../suscripcion/diseño.js";
import { textoIvaAplicado } from "../../suscripcion/dominio.js";

/** Régimen de IVA de la empresa (grupo de IVA de negocio del ERP) y el IVA efectivo que resulta. */
export const DatosFiscalesSuscripcion = ({
    datos,
    editable,
    publicar,
}: {
    datos: DatosFiscales;
    editable: boolean;
    publicar: EmitirEvento;
}) => {
    const [grupo, setGrupo] = useState(datos.grupoIvaNegocioId);
    const [origen, setOrigen] = useState(datos.grupoIvaNegocioId);
    if (origen !== datos.grupoIvaNegocioId) {
        setOrigen(datos.grupoIvaNegocioId);
        setGrupo(datos.grupoIvaNegocioId);
    }
    const cambiado = grupo !== datos.grupoIvaNegocioId;

    return (
        <div className="DatosFiscalesSuscripcion">
            <h4>Datos fiscales</h4>
            <quimera-formulario>
                <GrupoIvaNegocio valor={grupo} label="Régimen de IVA"
                    onChange={(o) => o && setGrupo(o.valor)} />
            </quimera-formulario>
            <p>IVA aplicado: {textoIvaAplicado(datos.tipoIva)}</p>
            <div className="maestro-botones">
                <QBoton deshabilitado={!editable || !cambiado || grupo === ""}
                    onClick={() => publicar("datos_fiscales_guardados", grupo)}>
                    Guardar datos fiscales
                </QBoton>
            </div>
        </div>
    );
};
