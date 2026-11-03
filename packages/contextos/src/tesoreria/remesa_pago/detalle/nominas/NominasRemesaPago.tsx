import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { NominaDeRemesaPago } from "../../diseño.js";

const metaTablaNominas: MetaTabla<NominaDeRemesaPago> = [
  { id: "empleadoId", cabecera: "Empleado" },
  { id: "nombreEmpleado", cabecera: "Nombre" },
  { id: "fechaNomina", cabecera: "F. Nómina", tipo: "fecha" },
  { id: "estado", cabecera: "Estado" },
  { id: "importe", cabecera: "Neto", tipo: "moneda" },
];

export const NominasRemesaPago = ({ nominas }: { nominas: NominaDeRemesaPago[] }) => (
  <div className="NominasRemesaPago">
    <ListadoSemiControlado
      metaTabla={metaTablaNominas}
      entidades={nominas}
      totalEntidades={nominas.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  </div>
);
