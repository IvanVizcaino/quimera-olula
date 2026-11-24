import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QEtiqueta, Tab, Tabs } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { QTarjetaGenerica } from "@olula/componentes/moleculas/qtarjeta_generica.tsx";
import { ListaActivaEntidades, listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect } from "react";
import { FamiliaLectra, TipoFamiliaLectra } from "../diseño.ts";
import { metaTablaFamiliaLectra } from "./maestro.ts";
import { getMaquina } from "./maquina.ts";

const ListadoFamilias = ({
  tipo,
  familias,
  marcarPorDefecto,
}: {
  tipo: TipoFamiliaLectra;
  familias: ListaActivaEntidades<FamiliaLectra>;
  marcarPorDefecto: (tipo: TipoFamiliaLectra, referencia: string) => void;
}) => (
  <Listado<FamiliaLectra>
    metaTabla={metaTablaFamiliaLectra}
    tarjeta={(familia) => (
      <QTarjetaGenerica
        arribaIzquierda={familia.referencia}
        arribaDerecha={
          familia.valorDefecto ? (
            <QEtiqueta variante="exito">Por defecto</QEtiqueta>
          ) : (
            <QBoton variante="texto" onClick={() => marcarPorDefecto(tipo, familia.referencia)}>
              Marcar por defecto
            </QBoton>
          )
        }
      />
    )}
    criteria={familias.criteria}
    modo={"tarjetas"}
    entidades={familias.lista}
    totalEntidades={familias.total}
    onSeleccion={() => undefined}
    onCriteriaChanged={() => undefined}
  />
);

export const MaestroFamiliasLectra = () => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    anidado: listaActivaEntidadesInicial<FamiliaLectra>(),
    corte: listaActivaEntidadesInicial<FamiliaLectra>(),
    suministro: listaActivaEntidadesInicial<FamiliaLectra>(),
  });

  const marcarPorDefecto = (tipo: TipoFamiliaLectra, referencia: string) =>
    emitir("familia_marcada_por_defecto", { tipo, referencia });

  useEffect(() => {
    emitir("recarga_de_familias_solicitada");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="FamiliasLectra">
      <h2>Familias de Lectra</h2>
      <div className="maestro-botones">
        <QBoton onClick={() => emitir("actualizacion_de_familias_solicitada")}>
          Actualizar familias
        </QBoton>
      </div>
      <Tabs>
        <Tab label="Anidado">
          <ListadoFamilias tipo="anidado" familias={ctx.anidado} marcarPorDefecto={marcarPorDefecto} />
        </Tab>
        <Tab label="Corte">
          <ListadoFamilias tipo="corte" familias={ctx.corte} marcarPorDefecto={marcarPorDefecto} />
        </Tab>
        <Tab label="Suministro">
          <ListadoFamilias tipo="suministro" familias={ctx.suministro} marcarPorDefecto={marcarPorDefecto} />
        </Tab>
      </Tabs>
    </div>
  );
};
