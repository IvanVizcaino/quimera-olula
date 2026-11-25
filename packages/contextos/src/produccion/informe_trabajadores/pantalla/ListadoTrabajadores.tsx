import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { criteriaTodos } from "../../comun/dominio.ts";
import { getSecciones } from "../../seccion/infraestructura.ts";
import { getTrabajadores } from "../../trabajador/infraestructura.ts";
import { FiltroListadoTrabajadores, FormatoHoja, GrupoSeccion, ListadoTrabajadores as Listado } from "../diseño.ts";
import { filtroListadoVacio, motivoFiltroNoValido, nombreFicheroTrabajadores, textoTotal, tituloSeccion } from "../dominio.ts";
import { getHojaTrabajadores, getListadoTrabajadores, getReportTrabajadores } from "../infraestructura.ts";
import "./ListadoTrabajadores.css";

type Ocupado = "consultar" | "pdf" | FormatoHoja | null;

type Opcion = { valor: string; descripcion: string };

/** Todos los trabajadores, también los de baja (el listado los enseña). */
const cargarTrabajadores = async (): Promise<Opcion[]> =>
    (await getTrabajadores(criteriaTodos)).datos.map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.nombre}` }));

const cargarSecciones = async (): Promise<Opcion[]> =>
    (await getSecciones(criteriaTodos)).datos.map((s) => ({ valor: s.id, descripcion: `${s.id} - ${s.descripcion}` }));

/** Opciones de un combo de filtro con «sin filtro» delante (se puede volver a elegir). */
const useOpciones = (cargar: () => Promise<Opcion[]>, sinFiltro: string): Opcion[] => {
    const [opciones, setOpciones] = useState<Opcion[]>([{ valor: "", descripcion: sinFiltro }]);
    useEffect(() => {
        cargar()
            .then((leidas) => setOpciones([{ valor: "", descripcion: sinFiltro }, ...leidas]))
            .catch(() => undefined);
    }, [cargar, sinFiltro]);
    return opciones;
};

/**
 * Producción > Listado de trabajadores: los trabajadores por sección (los que no tienen, al
 * final), filtrados por código desde/hasta y sección, con descarga en PDF, Excel y ODS.
 */
export const ListadoTrabajadores = () => {
    const { intentar } = useContext(ContextoError);
    const [filtro, setFiltro] = useState<FiltroListadoTrabajadores>(filtroListadoVacio);
    const [listado, setListado] = useState<Listado | null>(null);
    const [ocupado, setOcupado] = useState<Ocupado>(null);
    const [aviso, setAviso] = useState("");
    const desdeOpciones = useOpciones(cargarTrabajadores, "Desde el primero");
    const hastaOpciones = useOpciones(cargarTrabajadores, "Hasta el último");
    const secciones = useOpciones(cargarSecciones, "Todas");

    const cambiar = (campo: keyof FiltroListadoTrabajadores, valor: string) =>
        setFiltro((f) => ({ ...f, [campo]: valor }));

    const ejecutar = useCallback(
        async (accion: Exclude<Ocupado, null>, f: () => Promise<void>) => {
            const motivo = motivoFiltroNoValido(filtro);
            setAviso(motivo ?? "");
            if (motivo || ocupado) return;
            setOcupado(accion);
            try {
                await f();
            } catch {
                // intentar ya enseña el error.
            } finally {
                setOcupado(null);
            }
        },
        [filtro, ocupado]
    );

    const consultar = useCallback(
        () => ejecutar("consultar", async () => setListado(await intentar(() => getListadoTrabajadores(filtro)))),
        [ejecutar, filtro, intentar]
    );

    const descargar = (extension: "pdf" | FormatoHoja) =>
        ejecutar(extension, async () => {
            const blob = await intentar(() =>
                extension === "pdf" ? getReportTrabajadores(filtro) : getHojaTrabajadores(filtro, extension)
            );
            await descargarDocumento(blob, nombreFicheroTrabajadores(extension));
        });

    // Al entrar, todos.
    useEffect(() => {
        void consultar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ListadoTrabajadores">
            <h2>Listado de trabajadores</h2>
            <div className="filtros-listado">
                <quimera-formulario>
                    <QSelect
                        label="Desde el trabajador"
                        nombre="desde"
                        valor={filtro.desde}
                        opciones={desdeOpciones}
                        placeholder="Desde el primero"
                        onChange={(opcion) => cambiar("desde", opcion?.valor ?? "")}
                    />
                    <QSelect
                        label="Hasta el trabajador"
                        nombre="hasta"
                        valor={filtro.hasta}
                        opciones={hastaOpciones}
                        placeholder="Hasta el último"
                        onChange={(opcion) => cambiar("hasta", opcion?.valor ?? "")}
                    />
                    <QSelect
                        label="Sección"
                        nombre="seccion_id"
                        valor={filtro.seccionId}
                        opciones={secciones}
                        placeholder="Todas"
                        onChange={(opcion) => cambiar("seccionId", opcion?.valor ?? "")}
                    />
                </quimera-formulario>
                <div className="maestro-botones">
                    <QBoton onClick={consultar} deshabilitado={!!ocupado}>
                        {ocupado === "consultar" ? "Consultando…" : "Consultar"}
                    </QBoton>
                    <QBoton variante="borde" onClick={() => descargar("pdf")} deshabilitado={!!ocupado}>PDF</QBoton>
                    <QBoton variante="borde" onClick={() => descargar("xlsx")} deshabilitado={!!ocupado}>Excel</QBoton>
                    <QBoton variante="borde" onClick={() => descargar("ods")} deshabilitado={!!ocupado}>ODS</QBoton>
                </div>
                {aviso && <p className="aviso-listado" role="alert">{aviso}</p>}
            </div>

            {listado && (
                <div className="resultado-listado">
                    <h3>{listado.titulo}</h3>
                    <p className="criterios">
                        {[listado.subtitulo, textoTotal(listado.total)].filter(Boolean).join(" · ")}
                    </p>
                    {listado.grupos.length === 0 && <p>No hay trabajadores con estos filtros.</p>}
                    {listado.grupos.map((grupo) => (
                        <Seccion key={grupo.seccionId ?? "-"} grupo={grupo} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Seccion = ({ grupo }: { grupo: GrupoSeccion }) => (
    <section className="grupo-seccion">
        <h4>{tituloSeccion(grupo)}</h4>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {grupo.trabajadores.map((t) => (
                    <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.nombre}</td>
                        <td>{t.deBaja ? <EtiquetaEstado texto="De baja" tono="error" /> : ""}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3}>{textoTotal(grupo.total)}</td>
                </tr>
            </tfoot>
        </table>
    </section>
);
