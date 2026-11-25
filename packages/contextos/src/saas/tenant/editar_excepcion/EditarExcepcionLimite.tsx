import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { DerechoLimite, ExcepcionLimite, FormExcepcion } from "../suscripcion/diseño.js";
import { cuerpoExcepcion, excepcionValida, formDeExcepcion, formExcepcionVacio } from "../suscripcion/dominio.js";
import { putExcepcionLimite } from "../suscripcion/infraestructura.js";

/** Alta (excepcion = null) y edición de una excepción de límite: ambas son un PUT. */
export const EditarExcepcionLimite = ({
    publicar,
    idTenant,
    excepcion,
    limites,
}: {
    publicar: EmitirEvento;
    idTenant: string;
    excepcion: ExcepcionLimite | null;
    limites: DerechoLimite[];
}) => {
    const nueva = excepcion === null;
    const [form, setForm] = useState<FormExcepcion>(() =>
        excepcion ? formDeExcepcion(excepcion) : formExcepcionVacio(limites[0]?.id ?? "")
    );

    const guardar_ = useCallback(
        async () => {
            await putExcepcionLimite(idTenant, form.limiteId, cuerpoExcepcion(form));
            publicar("excepcion_guardada");
        },
        [idTenant, form, publicar]
    );
    const cancelar_ = useCallback(() => publicar("edicion_de_excepcion_cancelada"), [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal abierto={true} nombre="editarExcepcionLimite"
            titulo={nueva ? "Nueva excepción de límite" : "Editar excepción de límite"} onCerrar={cancelar}>
            <quimera-formulario>
                <QSelect label="Límite" nombre="limiteId" valor={form.limiteId} deshabilitado={!nueva}
                    opciones={limites.map((l) => ({ valor: l.id, descripcion: l.nombre }))}
                    onChange={(o) => o && setForm({ ...form, limiteId: o.valor })} />
                <QCheckbox label="Ilimitado" nombre="ilimitado" valor={form.ilimitado}
                    onChange={(v) => setForm({ ...form, ilimitado: v === "true" })} />
                <QInput label="Valor" nombre="valor" tipo="entero" valor={form.valor} deshabilitado={form.ilimitado}
                    onChange={(v) => setForm({ ...form, valor: v })} />
                <QInput label="Motivo (obligatorio)" nombre="motivo" valor={form.motivo}
                    onChange={(v) => setForm({ ...form, motivo: v })} />
                <QDate label="Caduca el (opcional)" nombre="hasta" valor={form.hasta} opcional
                    onChange={(v) => setForm({ ...form, hasta: v })} />
            </quimera-formulario>
            <p>La excepción manda sobre el valor del plan.</p>
            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!excepcionValida(form)}>Guardar</QBoton>
            </div>
        </QModal>
    );
};
