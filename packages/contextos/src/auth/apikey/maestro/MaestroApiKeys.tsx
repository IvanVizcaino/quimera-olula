import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { RevocarApiKey } from "../borrar/RevocarApiKey.tsx";
import { ClaveCreada } from "../crear/ClaveCreada.tsx";
import { CrearApiKey } from "../crear/CrearApiKey.tsx";
import { ApiKey } from "../diseño.ts";
import "./MaestroApiKeys.css";
import { getMaquina } from "./maquina.ts";

const SIN_ORDEN: [string, "ASC" | "DESC"] = ["creada", "DESC"];

const metaTabla = (emitir: EmitirEvento): MetaTabla<ApiKey> => [
    { id: "nombre", cabecera: "Nombre", estilo: "destacado" },
    { id: "creada", cabecera: "Creada", tipo: "fecha" },
    { id: "caduca", cabecera: "Caduca", tipo: "fecha" },
    {
        id: "caducada",
        cabecera: "Estado",
        render: (c: ApiKey) => (c.caducada ? "Caducada" : "Activa"),
    },
    {
        id: "acciones",
        cabecera: "",
        render: (c: ApiKey) => (
            <QBoton
                tamaño="pequeño"
                variante="texto"
                destructivo
                onClick={() => emitir("revocar_clave_solicitado", c)}
            >
                Revocar
            </QBoton>
        ),
    },
];

/**
 * Claves de API del usuario que ha iniciado sesión: crearlas, verlas y revocarlas.
 * Se aparta de la plantilla maestro-detalle porque una clave no tiene detalle que
 * editar y el servidor devuelve la lista entera, sin filtros ni paginación.
 */
export const MaestroApiKeys = () => {
    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        claves: null,
        claveNueva: null,
        claveARevocar: null,
    });

    const { estado, claves, claveNueva, claveARevocar } = ctx;

    useEffect(() => {
        emitir("recarga_de_claves_solicitada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="MaestroApiKeys">
            <h2>Claves de API</h2>
            <p className="explicacion">
                Una clave de API deja que un agente, como Claude Code, use Olula en tu nombre y con
                tus permisos. Crea una por cada sitio donde la uses y revoca las que ya no necesites.
            </p>
            <div className="maestro-botones">
                <QBoton onClick={() => emitir("crear_clave_solicitado")}>Nueva clave</QBoton>
            </div>
            {claves !== null && claves.length === 0 ? (
                <p className="vacio">Todavía no tienes claves de API.</p>
            ) : (
                <QTabla<ApiKey>
                    metaTabla={metaTabla(emitir)}
                    datos={claves ?? []}
                    cargando={claves === null}
                    orden={SIN_ORDEN}
                />
            )}

            {estado === "CREANDO" && <CrearApiKey publicar={emitir} />}
            {estado === "CREADA" && claveNueva && (
                <ClaveCreada clave={claveNueva} onCerrar={() => emitir("clave_nueva_cerrada")} />
            )}
            {estado === "REVOCANDO" && claveARevocar && (
                <RevocarApiKey clave={claveARevocar} publicar={emitir} />
            )}
        </div>
    );
};
