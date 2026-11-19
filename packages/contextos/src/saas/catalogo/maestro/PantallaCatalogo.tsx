import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { BorrarExtraCatalogo } from "../borrar_extra/BorrarExtraCatalogo.js";
import { BorrarLimiteCatalogo } from "../borrar_limite/BorrarLimiteCatalogo.js";
import { Catalogo, CategoriaModulo, ExtraCatalogo, LimiteCatalogo, ModuloCatalogo } from "../diseño.js";
import { etiquetaAlSuperar, etiquetaCategoria, etiquetaTipoLimite, modulosDeCategoria, textoGrupoIva } from "../dominio.js";
import { EditarExtraCatalogo } from "../editar_extra/EditarExtraCatalogo.js";
import { EditarLimiteCatalogo } from "../editar_limite/EditarLimiteCatalogo.js";
import { EditarModuloCatalogo } from "../editar_modulo/EditarModuloCatalogo.js";
import { contextoMaestroCatalogoInicial } from "./maestro.js";
import { getMaquina } from "./maquina.js";

const si = (v: boolean) => (
    <QEtiqueta variante={v ? "exito" : "neutro"}>{v ? "Sí" : "No"}</QEtiqueta>
);

const nombreLimite = (catalogo: Catalogo, id: string) =>
    catalogo.limites.find((l) => l.id === id)?.nombre ?? id;

const metaTablaModulos = (
    catalogo: Catalogo, publicar: EmitirEvento, categoria: CategoriaModulo
): MetaTabla<ModuloCatalogo> => [
    { id: "nombre", cabecera: categoria === "plugin" ? "Plugin" : categoria === "servicio" ? "Servicio" : "Módulo", estilo: "destacado" },
    ...(categoria === "plugin"
        ? [{ id: "variante", cabecera: "Variante", render: (m: ModuloCatalogo) => m.variante ?? "" }]
        : []),
    { id: "precioMensual", cabecera: "Suelto mensual", tipo: "moneda" },
    { id: "precioAnual", cabecera: "Suelto anual", tipo: "moneda" },
    { id: "contratableSuelto", cabecera: "Suelto", render: (m) => si(m.contratableSuelto) },
    { id: "publico", cabecera: "Público", render: (m) => si(m.publico) },
    {
        id: "aporta",
        cabecera: "Aporta",
        render: (m) => Object.entries(m.aporta)
            .map(([limite, n]) => `${n} ${nombreLimite(catalogo, limite)}`)
            .join(", "),
    },
    {
        id: "acciones",
        cabecera: "",
        render: (m) => (
            <QBoton tamaño="pequeño" variante="borde" onClick={() => publicar("editar_modulo_solicitado", m)}>
                Editar
            </QBoton>
        ),
    },
];

const metaTablaLimites = (publicar: EmitirEvento): MetaTabla<LimiteCatalogo> => [
    { id: "id", cabecera: "ID" },
    { id: "nombre", cabecera: "Nombre", estilo: "destacado" },
    { id: "unidad", cabecera: "Unidad" },
    { id: "tipo", cabecera: "Tipo", render: (l) => etiquetaTipoLimite[l.tipo] },
    { id: "alSuperar", cabecera: "Al superarlo", render: (l) => etiquetaAlSuperar[l.alSuperar] },
    { id: "umbralAviso", cabecera: "Aviso al", render: (l) => `${l.umbralAviso} %` },
    { id: "orden", cabecera: "Orden", tipo: "numero" },
    {
        id: "acciones",
        cabecera: "",
        render: (l) => (
            <>
                <QBoton tamaño="pequeño" variante="borde" onClick={() => publicar("editar_limite_solicitado", l)}>
                    Editar
                </QBoton>
                <QBoton tamaño="pequeño" variante="borde" destructivo onClick={() => publicar("borrar_limite_solicitado", l)}>
                    Borrar
                </QBoton>
            </>
        ),
    },
];

const metaTablaExtras = (catalogo: Catalogo, publicar: EmitirEvento): MetaTabla<ExtraCatalogo> => [
    { id: "id", cabecera: "ID" },
    { id: "nombre", cabecera: "Nombre", estilo: "destacado" },
    {
        id: "limiteId",
        cabecera: "Amplía",
        render: (e) => (e.limiteId ? `${e.cantidad} ${nombreLimite(catalogo, e.limiteId)}` : "Nada (servicio puntual)"),
    },
    {
        id: "requiereModulo",
        cabecera: "Requiere",
        render: (e) => catalogo.modulos.find((m) => m.id === e.requiereModulo)?.nombre ?? "",
    },
    { id: "precioMensual", cabecera: "Mensual", tipo: "moneda" },
    { id: "precioAnual", cabecera: "Anual", tipo: "moneda" },
    { id: "recurrente", cabecera: "Recurrente", render: (e) => si(e.recurrente) },
    { id: "publico", cabecera: "Público", render: (e) => si(e.publico) },
    { id: "activo", cabecera: "Activo", render: (e) => si(e.activo) },
    {
        id: "acciones",
        cabecera: "",
        render: (e) => (
            <>
                <QBoton tamaño="pequeño" variante="borde" onClick={() => publicar("editar_extra_solicitado", e)}>
                    Editar
                </QBoton>
                <QBoton tamaño="pequeño" variante="borde" destructivo onClick={() => publicar("borrar_extra_solicitado", e)}>
                    Borrar
                </QBoton>
            </>
        ),
    },
];

export const PantallaCatalogo = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoMaestroCatalogoInicial);
    const { estado, catalogo } = ctx;

    useEffect(() => {
        emitir("recarga_de_catalogo_solicitada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!catalogo) return <div className="Catalogo"><h2>Catálogo</h2></div>;

    // Las columnas de precio leen campos planos.
    const modulos = catalogo.modulos.map((m) => ({ ...m, precioMensual: m.precio.mensual, precioAnual: m.precio.anual }));
    const extras = catalogo.extras.map((e) => ({ ...e, precioMensual: e.precio.mensual, precioAnual: e.precio.anual }));

    return (
        <div className="Catalogo">
            <h2>Catálogo</h2>
            {ctx.ajustes && (
                <div className="ajustes-iva">
                    <h4>IVA de las cuotas</h4>
                    <QSelect label="Grupo de IVA" nombre="ivaCuotas" valor={ctx.ajustes.ivaCuotas}
                        opciones={ctx.ajustes.gruposIvaProducto.map((g) => ({ valor: g.id, descripcion: textoGrupoIva(g) }))}
                        onChange={(o) => o && o.valor !== ctx.ajustes?.ivaCuotas && emitir("iva_cuotas_cambiado", o.valor)} />
                    <p style={{ fontSize: "0.85em", opacity: 0.7 }}>
                        Grupo de IVA de producto que llevan las cuotas del SaaS. El régimen de cada empresa
                        (general, U.E., exento…) se elige en su ficha.
                    </p>
                </div>
            )}
            <Tabs children={[
                ...(["contexto", "plugin", "servicio"] as CategoriaModulo[]).map((categoria) => {
                    const datos = modulosDeCategoria(modulos, categoria);
                    return (
                        <Tab label={etiquetaCategoria[categoria]} key={`tab-${categoria}`} children={
                            <>
                                {categoria === "plugin" && (
                                    <p style={{ fontSize: "0.85em", opacity: 0.7 }}>
                                        Todos los plugins están instalados. Una empresa usa los que tiene
                                        contratados (en su plan, como extra o activados en su ficha) y el resto
                                        funcionan como inactivos. Ponles precio y márcalos como públicos para
                                        que las empresas puedan contratarlos desde la app.
                                    </p>
                                )}
                                <QTabla<ModuloCatalogo>
                                    metaTabla={metaTablaModulos(catalogo, emitir, categoria)}
                                    datos={datos}
                                    totalEntidades={datos.length}
                                    cargando={false}
                                    orden={[]}
                                />
                            </>
                        } />
                    );
                }),
                <Tab label="Límites" key="tab-limites" children={
                    <>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("alta_de_limite_solicitada", null)}>Nuevo límite</QBoton>
                        </div>
                        <QTabla<LimiteCatalogo>
                            metaTabla={metaTablaLimites(emitir)}
                            datos={catalogo.limites}
                            totalEntidades={catalogo.limites.length}
                            cargando={false}
                            orden={[]}
                        />
                    </>
                } />,
                <Tab label="Extras" key="tab-extras" children={
                    <>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("alta_de_extra_solicitada", null)}>Nuevo extra</QBoton>
                        </div>
                        <QTabla<ExtraCatalogo>
                            metaTabla={metaTablaExtras(catalogo, emitir)}
                            datos={extras}
                            totalEntidades={extras.length}
                            cargando={false}
                            orden={[]}
                        />
                    </>
                } />,
            ]} />

            {estado === "EDITANDO_MODULO" && ctx.modulo && (
                <EditarModuloCatalogo modulo={ctx.modulo} limites={catalogo.limites} publicar={emitir} />
            )}
            {estado === "EDITANDO_LIMITE" && (
                <EditarLimiteCatalogo limite={ctx.limite} idsExistentes={catalogo.limites.map((l) => l.id)} publicar={emitir} />
            )}
            {estado === "BORRANDO_LIMITE" && ctx.limite && (
                <BorrarLimiteCatalogo limite={ctx.limite} publicar={emitir} />
            )}
            {estado === "EDITANDO_EXTRA" && (
                <EditarExtraCatalogo extra={ctx.extra} limites={catalogo.limites} modulos={catalogo.modulos}
                    idsExistentes={catalogo.extras.map((e) => e.id)} publicar={emitir} />
            )}
            {estado === "BORRANDO_EXTRA" && ctx.extra && (
                <BorrarExtraCatalogo extra={ctx.extra} publicar={emitir} />
            )}
        </div>
    );
};
