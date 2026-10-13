import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { getSubcuenta, getSubcuentas } from "#/contabilidad/subcuenta/infraestructura.ts";

interface SubcuentaSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionDesdeSubcuenta = (sc: { id: string; codigo: string; nombre: string }) => ({
    valor: sc.id,
    descripcion: sc.codigo,
    descripcionOpcion: `${sc.codigo} — ${sc.nombre}`,
});

export const SubcuentaSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "subcuenta_id",
    label = "Subcuenta",
    onChange,
    ...props
}: SubcuentaSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            try {
                const sc = await getSubcuenta(id);
                return [opcionDesdeSubcuenta(sc)];
            } catch {
                return [];
            }
        }

        if (!ejercicioId) {
            return [];
        }

        const filtro: Filtro = texto.trim().length
            ? {
                  and: [
                      ["ejercicio_id", ejercicioId],
                      {
                          or: [
                              ["codigo", "~", texto],
                              ["nombre", "~", texto],
                          ],
                      },
                  ],
              }
            : [["ejercicio_id", ejercicioId]];

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["codigo", "ASC"],
            paginacion: { pagina: 1, limite: 20 },
        };

        const { datos } = await getSubcuentas(criteria);
        return datos.map(opcionDesdeSubcuenta);
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={1}
            {...props}
        />
    );
};
