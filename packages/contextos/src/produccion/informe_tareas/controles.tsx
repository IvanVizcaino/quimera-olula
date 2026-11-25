import { PropsControlInforme } from "#/comun/informe_documentos/diseño.ts";
import { ControlCliente } from "#/ventas/informe/controles.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { getLotes } from "#/almacen/lote/infraestructura.ts";
import { getCentrosCoste } from "../centro_coste/infraestructura.ts";
import { criteriaTodos } from "../comun/dominio.ts";
import { SelectorPedidoCliente } from "../orden/detalle/SelectorPedidoCliente.tsx";
import { getOrdenes } from "../orden/infraestructura.ts";
import { getTiposCentroCoste } from "../tipo_centro_coste/infraestructura.ts";

/**
 * Selectores de los criterios del informe de tareas. Pasan el cambio al modelo de la ficha
 * (que se guarda al momento) y, vacíos, no filtran. Sin la regla del maestro que listan, se
 * teclea el código.
 */

const texto = (valor: unknown): string => (valor === null || valor === undefined ? "" : String(valor));

const ControlTexto = ({ label, valor, nombre, onChange, evaluarCambio, deshabilitado, soloLectura }: PropsControlInforme) => (
    <QInput
        label={label}
        nombre={nombre}
        valor={texto(valor)}
        onChange={(v) => onChange(String(v ?? ""))}
        evaluarCambio={evaluarCambio}
        deshabilitado={deshabilitado}
        soloLectura={soloLectura}
        opcional
    />
);

const criteriaPorCodigo = (textoBuscado: string, orden: Criteria["orden"]): Criteria => ({
    ...criteriaDefecto,
    filtro: [["id", "~", textoBuscado]],
    orden,
    paginacion: { limite: 10, pagina: 1 },
});

type Opcion = { valor: string; descripcion: string };

/** Autocompletar por código de un maestro (órdenes, lotes); sin su regla, se teclea el código. */
const controlAutocompletar = (
    regla: string,
    buscar: (texto: string) => Promise<Opcion[]>,
    placeholder: string
) => {
    const Control = (props: PropsControlInforme) => {
        if (!puede(regla)) return <ControlTexto {...props} />;
        const { label, valor, nombre, onChange, evaluarCambio, deshabilitado, soloLectura } = props;
        return (
            <QAutocompletar
                label={label}
                nombre={nombre}
                valor={texto(valor)}
                descripcion={texto(valor)}
                obtenerOpciones={buscar}
                onChange={(opcion) => onChange(opcion)}
                evaluarCambio={evaluarCambio}
                deshabilitado={deshabilitado}
                soloLectura={soloLectura}
                opcional
                placeholder={placeholder}
            />
        );
    };
    return Control;
};

export const ControlOrden = controlAutocompletar(
    "produccion.orden",
    async (t) =>
        (await getOrdenes(criteriaPorCodigo(t, ["id", "DESC"]))).datos.map((o) => ({
            valor: o.id,
            descripcion: o.descripcion ? `${o.id} · ${o.descripcion}` : o.id,
        })),
    "OP…"
);

export const ControlLote = controlAutocompletar(
    "almacen.lote",
    async (t) =>
        (await getLotes(criteriaPorCodigo(t, ["id", "DESC"]))).datos.map((l) => ({
            valor: l.id,
            descripcion: l.articulo ? `${l.id} · ${l.articulo}` : l.id,
        })),
    "Código del lote"
);

/**
 * Combo de un maestro con «Todos» delante (vacío = sin filtro), como los del informe de
 * inventario: así se puede volver a quitar el filtro. Sin la regla del maestro, se teclea.
 */
const controlCombo = (regla: string, cargar: () => Promise<Opcion[]>) => {
    const Combo = (props: PropsControlInforme) => {
        const [opciones, setOpciones] = useState<Opcion[]>([{ valor: "", descripcion: "Todos" }]);
        useEffect(() => {
            cargar().then((leidas) => setOpciones([{ valor: "", descripcion: "Todos" }, ...leidas]));
        }, []);
        return <QSelect {...props} opciones={opciones} placeholder="Todos" />;
    };
    const Control = (props: PropsControlInforme) => (puede(regla) ? <Combo {...props} /> : <ControlTexto {...props} />);
    return Control;
};

export const ControlTipoCentro = controlCombo("produccion.tipo_centro_coste", async () =>
    (await getTiposCentroCoste(criteriaTodos)).datos.map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.descripcion}` }))
);

export const ControlCentro = controlCombo("produccion.centro_coste", async () =>
    (await getCentrosCoste(criteriaTodos)).datos.map((c) => ({ valor: c.id, descripcion: `${c.id} - ${c.descripcion}` }))
);

export { ControlCliente };

export const ControlPedido = ({ label, valor, nombre, onChange, evaluarCambio, soloLectura, deshabilitado }: PropsControlInforme) => (
    <SelectorPedidoCliente
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={(opcion) => onChange(opcion)}
        evaluarCambio={evaluarCambio}
        soloLectura={soloLectura || deshabilitado}
    />
);
