import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import {
    camposInmueble347Vacios,
    validarCamposInmueble347,
} from "../dominio.ts";
import { CamposInmueble347, Inmueble347 } from "../diseño.ts";
import {
    deleteInmuebleModelo347,
    getInmueblesModelo347,
    patchInmuebleModelo347,
    postInmuebleModelo347,
} from "../infraestructura.ts";
import "#/comun/estilos/pagina_proceso.css";

const metaTablaInmuebles: MetaTabla<Inmueble347> = [
    { id: "idregistro", cabecera: "Id" },
    { id: "nifarrendatario", cabecera: "NIF" },
    { id: "apellidosnombrers", cabecera: "Arrendatario" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
    { id: "situacion", cabecera: "Sit." },
    { id: "refcatastral", cabecera: "Ref. catastral" },
    { id: "nombrevia", cabecera: "Vía" },
    { id: "localidad", cabecera: "Localidad" },
    { id: "municipio", cabecera: "Municipio" },
    { id: "codprovincia", cabecera: "Prov." },
];

const CAMPOS_FORM: { clave: keyof ReturnType<typeof camposInmueble347Vacios>; label: string }[] = [
    { clave: "nifarrendatario", label: "NIF arrendatario" },
    { clave: "apellidosnombrers", label: "Apellidos / razón social" },
    { clave: "importe", label: "Importe" },
    { clave: "situacion", label: "Situación (1-4)" },
    { clave: "refcatastral", label: "Ref. catastral" },
    { clave: "nombrevia", label: "Nombre vía" },
    { clave: "localidad", label: "Localidad" },
    { clave: "municipio", label: "Municipio" },
    { clave: "codprovincia", label: "Cód. provincia" },
];

interface Props {
    modeloId: number | null;
    ocupadoExterno?: boolean;
}

export const InmueblesModelo347 = ({ modeloId, ocupadoExterno = false }: Props) => {
    const { intentar } = useContext(ContextoError);
    const [filas, setFilas] = useState<Inmueble347[]>([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [form, setForm] = useState(camposInmueble347Vacios);
    const [aviso, setAviso] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        if (!modeloId || cargando) return;
        setCargando(true);
        setAviso(null);
        try {
            const datos = await intentar(() => getInmueblesModelo347(modeloId));
            setFilas(datos);
        } finally {
            setCargando(false);
        }
    }, [cargando, intentar, modeloId]);

    useEffect(() => {
        setFilas([]);
        setEditandoId(null);
        setForm(camposInmueble347Vacios());
        setAviso(null);
    }, [modeloId]);

    const setCampo = (clave: string, valor: string) =>
        setForm((prev) => ({ ...prev, [clave]: valor }));

    const resetForm = () => {
        setEditandoId(null);
        setForm(camposInmueble347Vacios());
        setAviso(null);
    };

    const editar = (fila: Inmueble347) => {
        setEditandoId(fila.idregistro);
        setForm({
            nifarrendatario: fila.nifarrendatario,
            apellidosnombrers: fila.apellidosnombrers,
            importe: String(fila.importe),
            situacion: fila.situacion,
            refcatastral: fila.refcatastral,
            nombrevia: fila.nombrevia,
            localidad: fila.localidad,
            municipio: fila.municipio,
            codprovincia: fila.codprovincia,
        });
        setAviso(null);
    };

    const guardar = useCallback(async () => {
        if (!modeloId || guardando || ocupadoExterno) return;
        const error = validarCamposInmueble347(form);
        if (error) {
            setAviso(error);
            return;
        }
        const campos: CamposInmueble347 = {
            nifarrendatario: form.nifarrendatario.trim(),
            apellidosnombrers: form.apellidosnombrers.trim(),
            importe: Number(String(form.importe).replace(",", ".")),
            situacion: form.situacion.trim(),
            refcatastral: form.refcatastral.trim(),
            nombrevia: form.nombrevia.trim(),
            localidad: form.localidad.trim(),
            municipio: form.municipio.trim(),
            codprovincia: form.codprovincia.trim(),
        };
        setGuardando(true);
        setAviso(null);
        try {
            if (editandoId == null) {
                await intentar(() => postInmuebleModelo347(modeloId, campos));
            } else {
                await intentar(() => patchInmuebleModelo347(modeloId, editandoId, campos));
            }
            resetForm();
            const datos = await intentar(() => getInmueblesModelo347(modeloId));
            setFilas(datos);
        } finally {
            setGuardando(false);
        }
    }, [editandoId, form, guardando, intentar, modeloId, ocupadoExterno]);

    const borrar = useCallback(
        async (registroId: number) => {
            if (!modeloId || guardando || ocupadoExterno) return;
            setGuardando(true);
            try {
                await intentar(() => deleteInmuebleModelo347(modeloId, registroId));
                if (editandoId === registroId) resetForm();
                const datos = await intentar(() => getInmueblesModelo347(modeloId));
                setFilas(datos);
            } finally {
                setGuardando(false);
            }
        },
        [editandoId, guardando, intentar, modeloId, ocupadoExterno]
    );

    const ocupado = cargando || guardando || ocupadoExterno;

    return (
        <section className="modelo347-inmuebles">
            <h3>Inmuebles (tipo 2i)</h3>
            <p className="aviso aviso-info" role="status">
                Captura manual: la generación del 347 no borra ni recalcula estos registros; solo
                actualiza los totales de cabecera.
            </p>
            <div className="maestro-botones">
                <QBoton onClick={cargar} deshabilitado={!modeloId || ocupado}>
                    {cargando ? "Cargando…" : "Listar inmuebles"}
                </QBoton>
            </div>

            <quimera-formulario className="filtros-informe modelo347-inmueble-form">
                {CAMPOS_FORM.map(({ clave, label }) => (
                    <QInput
                        key={clave}
                        label={label}
                        nombre={clave}
                        valor={form[clave]}
                        onChange={(v) => setCampo(clave, v)}
                        tipo={clave === "importe" ? "numero" : "texto"}
                    />
                ))}
            </quimera-formulario>
            {aviso && (
                <p className="aviso aviso-advertencia" role="status">
                    {aviso}
                </p>
            )}
            <div className="maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!modeloId || ocupado}>
                    {guardando
                        ? "Guardando…"
                        : editandoId == null
                          ? "Alta inmueble"
                          : `Guardar #${editandoId}`}
                </QBoton>
                {editandoId != null && (
                    <QBoton variante="borde" onClick={resetForm} deshabilitado={ocupado}>
                        Cancelar edición
                    </QBoton>
                )}
            </div>

            {filas.length > 0 && (
                <QTabla
                    metaTabla={metaTablaInmuebles}
                    datos={filas}
                    cargando={cargando}
                    orden={["idregistro", "ASC"]}
                    totalEntidades={filas.length}
                    seleccionadaId={editandoId != null ? String(editandoId) : undefined}
                    onSeleccion={(fila) => editar(fila as Inmueble347)}
                />
            )}
            {editandoId != null && (
                <div className="maestro-botones">
                    <QBoton
                        variante="texto"
                        onClick={() => borrar(editandoId)}
                        deshabilitado={ocupado}
                    >
                        Borrar inmueble #{editandoId}
                    </QBoton>
                </div>
            )}
        </section>
    );
};
