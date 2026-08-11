import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { DetalleGrupo } from "../detalle/DetalleGrupo.tsx";
import { Grupo } from "../diseño.ts";
import { AltaGrupo } from "./AltaGrupo.tsx";
import { ContextoMaestroGrupo, EstadoMaestroGrupo } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

const metaTablaGrupos = [
  { id: "nombre", cabecera: "Nombre" },
  { id: "id", cabecera: "Grupo" },
];

const criteriaBaseGrupos: Criteria = {
  ...criteriaDefecto,
  orden: ["nombre", "ASC"],
};

export const MaestroConDetalleGruposReglas = () => {
  const { id, criteria } = getUrlParams();
  const criteriaInicial: Criteria = {
    ...criteriaBaseGrupos,
    ...criteria,
    orden: criteria?.orden?.length ? criteria.orden : criteriaBaseGrupos.orden,
  };

  const { ctx, emitir } = useMaquina<EstadoMaestroGrupo, ContextoMaestroGrupo>(
    getMaquina,
    {
      estado: "LISTA",
      grupos: listaActivaEntidadesInicial<Grupo>(id, criteriaInicial),
    }
  );

  useUrlParams(ctx.grupos.activo, ctx.grupos.criteria);

  useEffect(() => {
    // Forzar orden ASC al cargar: criteria_cambiado actualiza ctx.grupos.criteria además de recargar
    // emitir("recarga_de_grupos_solicitada", criteriaBaseGrupos);
    emitir("criteria_cambiado", criteriaBaseGrupos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grupoSeleccionado =
    ctx.grupos.lista.find(
      (grupo) => String(grupo.id) === String(ctx.grupos.activo)
    ) ?? null;

  return (
    <div className="GruposReglas">
      <MaestroDetalle
        seleccionada={ctx.grupos.activo}
        Maestro={
          <>
            <h2>Grupos</h2>
            <Listado<Grupo>
              metaTabla={metaTablaGrupos}
              criteria={ctx.grupos.criteria}
              criteriaInicial={criteriaInicial}
              modo="tarjetas"
              entidades={ctx.grupos.lista}
              totalEntidades={ctx.grupos.total}
              seleccionada={ctx.grupos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("ALTA_INICIADA")}>
                    Nuevo Grupo
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("grupo_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        modoDisposicion="maestro-50"
        Detalle={<DetalleGrupo grupoSeleccionado={grupoSeleccionado} publicar={emitir} />}
      />

      <QModal
        nombre="modal"
        abierto={ctx.estado === "ALTA"}
        onCerrar={() => emitir("ALTA_CANCELADA")}
      >
        {ctx.estado === "ALTA" && <AltaGrupo emitir={emitir} />}
      </QModal>
    </div>
  );
};
