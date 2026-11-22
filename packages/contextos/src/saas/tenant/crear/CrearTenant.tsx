import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCatalogo } from "../../catalogo/infraestructura.js";
import { Plan } from "../../plan/diseño.js";
import { nuevoTenantVacio } from "../dominio.js";
import { postTenant } from "../infraestructura.js";
import { metaNuevoTenant, planInicialAlta } from "./crear.js";
import "./CrearTenant.css";

/**
 * Modal de alta de empresa. La empresa se provisiona en segundo plano:
 * el detalle hace polling hasta que sale del estado "provisionando".
 */
export const CrearTenant = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo: tenant, uiProps, valido, set } = useModelo(metaNuevoTenant, nuevoTenantVacio);

    // Planes activos del catálogo para elegir el de partida.
    const [planes, setPlanes] = useState<Plan[]>([]);
    const tenantRef = useRef(tenant);
    useEffect(() => { tenantRef.current = tenant; });
    useEffect(() => {
        let vivo = true;
        getCatalogo()
            .then((catalogo) => {
                if (!vivo) return;
                const activos = catalogo.planes.filter((p) => p.activo);
                setPlanes(activos);
                set({ ...tenantRef.current, planId: planInicialAlta(activos) });
            })
            .catch(() => { /* sin catálogo se da de alta con el plan por defecto del backend */ });
        return () => { vivo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const crear_ = useCallback(
        async () => {
            const id = await postTenant(tenant);
            publicar("tenant_creado", id);
        },
        [tenant, publicar]
    );

    const cancelar_ = useCallback(() => publicar("alta_de_tenant_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearTenant" titulo="Nueva empresa" onCerrar={cancelar}>
            <div className="CrearTenant">
                <quimera-formulario>
                    <QInput label="Identificador" {...uiProps("id")} ref={focus} />
                    <QInput label="Nombre" {...uiProps("nombre")} />
                    <QInput label="NIF" {...uiProps("nif")} />
                    <QInput label="Email de contacto" {...uiProps("emailContacto")} />
                    <h4>Usuario administrador</h4>
                    <QInput label="Nombre" {...uiProps("adminNombre")} />
                    <QInput label="Email" {...uiProps("adminEmail")} />
                    <QInput label="Contraseña" {...uiProps("adminContrasena")} tipo="contraseña" />
                    <h4>Plan</h4>
                    <QSelect label="Plan" {...uiProps("planId")}
                        opciones={[{ valor: "", descripcion: "Por defecto (Pro con prueba)" },
                        ...planes.map((p) => ({ valor: p.id, descripcion: p.nombre }))]} />
                    <QSelect label="Periodicidad" {...uiProps("periodicidad")}
                        opciones={[{ valor: "mensual", descripcion: "Mensual" }, { valor: "anual", descripcion: "Anual" }]} />
                    <QCheckbox label="Con prueba" {...uiProps("conPrueba")} />
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
