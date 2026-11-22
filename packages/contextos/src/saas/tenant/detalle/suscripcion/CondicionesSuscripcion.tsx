import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useMemo, useState } from "react";
import { FormCondiciones, PasarelaSuscripcion, SuscripcionTenant } from "../../suscripcion/diseño.js";
import { cambiosCondiciones, descuentoValido, formCondiciones, hayCambiosCondiciones } from "../../suscripcion/dominio.js";

/**
 * Condiciones comerciales de la empresa: descuento, precio fijado, notas, pasarela, ampliar la prueba
 * y fecha de fin del periodo (regalar días). Se guardan con el botón; solo viajan los campos cambiados.
 */
export const CondicionesSuscripcion = ({
    suscripcion,
    pasarelas,
    editable,
    publicar,
}: {
    suscripcion: SuscripcionTenant;
    pasarelas: PasarelaSuscripcion[];
    editable: boolean;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => formCondiciones(suscripcion), [suscripcion]);
    const [form, setForm] = useState<FormCondiciones>(inicial);
    const [origen, setOrigen] = useState<FormCondiciones>(inicial);
    if (origen !== inicial) {
        setOrigen(inicial);
        setForm(inicial);
    }

    const cambiado = hayCambiosCondiciones(suscripcion, form);
    const valido = descuentoValido(form.descuentoPct);
    const campo = (c: Partial<FormCondiciones>) => setForm({ ...form, ...c });

    return (
        <div className="CondicionesSuscripcion">
            <h4>Condiciones</h4>
            <quimera-formulario>
                <QInput label="Descuento (%)" nombre="descuentoPct" tipo="decimal" valor={form.descuentoPct}
                    deshabilitado={!editable} erroneo={!valido} textoValidacion={valido ? "" : "Entre 0 y 100"}
                    onChange={(v) => campo({ descuentoPct: v })} />
                <QDate label="Precio fijado hasta" nombre="precioFijadoHasta" valor={form.precioFijadoHasta} opcional
                    deshabilitado={!editable} onChange={(v) => campo({ precioFijadoHasta: v })} />
                <QSelect label="Pasarela" nombre="pasarelaId" valor={form.pasarelaId} deshabilitado={!editable}
                    opciones={[{ valor: "", descripcion: "Ninguna" },
                    ...pasarelas.map((p) => ({ valor: p.id, descripcion: p.nombre }))]}
                    onChange={(o) => o && campo({ pasarelaId: o.valor })} />
                {suscripcion.estado === "prueba" && (
                    <QDate label="Fin de la prueba (ampliar)" nombre="finPrueba" valor={form.finPrueba}
                        deshabilitado={!editable} onChange={(v) => campo({ finPrueba: v })} />
                )}
                <QDate label="Fin del periodo (regalar días)" nombre="finPeriodo" valor={form.finPeriodo}
                    deshabilitado={!editable} onChange={(v) => campo({ finPeriodo: v })} />
                <QTextArea label="Notas" nombre="notas" valor={form.notas} deshabilitado={!editable}
                    onChange={(v) => campo({ notas: v })} />
            </quimera-formulario>
            <div className="maestro-botones">
                <QBoton deshabilitado={!editable || !cambiado || !valido}
                    onClick={() => publicar("condiciones_guardadas", cambiosCondiciones(suscripcion, form))}>
                    Guardar condiciones
                </QBoton>
                {cambiado && <QBoton variante="borde" onClick={() => setForm(inicial)}>Descartar</QBoton>}
            </div>
        </div>
    );
};
