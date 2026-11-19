import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useMemo, useState } from "react";
import { CredencialExterna } from "../../../comun/credencial_externa/diseño.js";
import { FormPasarela, ModoPasarela, Pasarela } from "../diseño.js";
import {
    cambiarActiva, cambiarPorDefecto, cambiosDeForm, formDePasarela, credencialesDePasarela, formModificado,
} from "../dominio.js";
import "./TarjetaPasarela.css";

/** Una tarjeta por pasarela. Las claves se gestionan en Administración › Credenciales: aquí solo se elige una. */
export const TarjetaPasarela = ({
    pasarela,
    credenciales,
    mensaje,
    publicar,
}: {
    pasarela: Pasarela;
    credenciales: CredencialExterna[];
    mensaje: string;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => formDePasarela(pasarela), [pasarela]);
    const [form, setForm] = useState<FormPasarela>(inicial);
    const [origen, setOrigen] = useState<FormPasarela>(inicial);
    if (origen !== inicial) {
        setOrigen(inicial);
        setForm(inicial);
    }

    const deTipo = credencialesDePasarela(credenciales, pasarela.tipoCredencial);
    const modificado = formModificado(pasarela, form);

    return (
        <div className="TarjetaPasarela">
            <div className="pasarela-cabecera">
                <h3>{pasarela.nombre}</h3>
                <QEtiqueta variante={pasarela.activa ? "exito" : "neutro"}>{pasarela.activa ? "Activa" : "Inactiva"}</QEtiqueta>
                {pasarela.porDefecto && <QEtiqueta variante="primario">Por defecto</QEtiqueta>}
                <QEtiqueta variante={pasarela.modo === "live" ? "advertencia" : "gris"}>
                    {pasarela.modo === "live" ? "Live" : "Test"}
                </QEtiqueta>
            </div>

            <quimera-formulario>
                <QCheckbox label="Activa" nombre="activa" valor={form.activa}
                    onChange={(v) => setForm(cambiarActiva(form, v === "true"))} />
                <QCheckbox label="Por defecto" nombre="porDefecto" valor={form.porDefecto}
                    onChange={(v) => setForm(cambiarPorDefecto(form, v === "true"))} />
                {pasarela.modoDesdeCredencial ? (
                    <div className="pasarela-ayuda">Modo: {pasarela.modo} (de la credencial)</div>
                ) : (
                    <QSelect label="Modo" nombre="modo" valor={form.modo}
                        opciones={[{ valor: "test", descripcion: "Test" }, { valor: "live", descripcion: "Live" }]}
                        onChange={(o) => o && setForm({ ...form, modo: o.valor as ModoPasarela })} />
                )}
                {pasarela.tipoCredencial !== null && (
                    deTipo.length > 0 ? (
                        <QSelect label="Credencial" nombre="credencialId" valor={form.credencialId}
                            opciones={[{ valor: "", descripcion: "Ninguna" },
                            ...deTipo.map((c) => ({ valor: c.id, descripcion: c.nombre }))]}
                            onChange={(o) => o && setForm({ ...form, credencialId: o.valor })} />
                    ) : (
                        <div className="pasarela-ayuda">
                            No hay credenciales de {pasarela.tipoCredencial}. Créela en{" "}
                            <a href="/comun/credencial-externa">Administración › Credenciales</a>.
                        </div>
                    )
                )}
                {pasarela.campos.filter((c) => !c.secreto).map((c) => (
                    <div key={c.id} style={{ gridColumn: "span 12" }}>
                        <QInput
                            label={c.nombre}
                            nombre={`campo_${pasarela.id}_${c.id}`}
                            valor={form.valores[c.id] ?? ""}
                            onChange={(v) => setForm({ ...form, valores: { ...form.valores, [c.id]: v } })}
                        />
                        {c.ayuda && <div className="pasarela-ayuda">{c.ayuda}</div>}
                    </div>
                ))}
            </quimera-formulario>

            {pasarela.ultimaPrueba && (
                <div className="pasarela-prueba">
                    Última prueba:{" "}
                    <QEtiqueta variante={pasarela.ultimaPrueba.ok ? "exito" : "error"}>
                        {pasarela.ultimaPrueba.ok ? "Correcta" : "Fallida"}
                    </QEtiqueta>{" "}
                    {pasarela.ultimaPrueba.mensaje} {pasarela.ultimaPrueba.fecha && `(${pasarela.ultimaPrueba.fecha})`}
                </div>
            )}
            {mensaje && <div className="pasarela-mensaje">{mensaje}</div>}

            <div className="maestro-botones">
                <QBoton deshabilitado={!modificado}
                    onClick={() => publicar("guardar_solicitado", { id: pasarela.id, cambios: cambiosDeForm(pasarela, form) })}>
                    Guardar
                </QBoton>
                <QBoton variante="borde" deshabilitado={modificado} onClick={() => publicar("probar_solicitado", pasarela.id)}>
                    Probar conexión
                </QBoton>
                <QBoton variante="borde" deshabilitado={modificado} onClick={() => publicar("sincronizar_solicitado", pasarela.id)}>
                    Sincronizar catálogo
                </QBoton>
            </div>
        </div>
    );
};
