import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { CategoriaReglas, ReglaAnidada, ReglaConValor } from "../../diseño.ts";
import { calcularClasesExtra } from "../../dominio.ts";
import "./AccionesRegla.css";

export const AccionesRegla = ({
  reglaPadre,
  regla,
  reglaGeneral,
  emitir,
}: {
  reglaPadre?: ReglaAnidada;
  regla: ReglaConValor | ReglaAnidada;
  reglaGeneral?: CategoriaReglas;
  grupoId: string;
  emitir: EmitirEvento;
}) => {
  const clasesExtra = calcularClasesExtra(regla, reglaPadre, reglaGeneral);

  return (
    <div className="AccionesRegla">
      <div className={`boton-nulo ${regla.valor === null ? "activo" : ""}`}>
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("BORRAR_REGLA", regla);
          }}
        >
          <QIcono nombre="minus" tamaño="sm" />
        </QBoton>
      </div>
      <div
        className={`boton-cancelar ${regla.valor === false ? "activo" : ""} ${
          clasesExtra.cancelar
        }`}
      >
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("CANCELAR_REGLA", regla);
          }}
        >
          <QIcono nombre="x_circle" tamaño="sm" />
        </QBoton>
      </div>
      <div
        className={`boton-permitir ${regla.valor === true ? "activo" : ""} ${
          clasesExtra.permitir
        }`}
      >
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("PERMITIR_REGLA", regla);
          }}
        >
          <QIcono nombre="check" tamaño="sm" />
        </QBoton>
      </div>
    </div>
  );
};

export const AccionesCategoria = ({
  categoria,
  emitir,
}: {
  categoria: CategoriaReglas;
  grupoId: string;
  emitir: EmitirEvento;
  reglaGeneral?: CategoriaReglas;
}) => {
  const clasesExtra = "";

  return (
    <div className="AccionesRegla">
      <div className={`boton-nulo ${categoria.valor === null ? "activo" : ""}`}>
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("BORRAR_REGLA_CATEGORIA", categoria);
          }}
        >
          <QIcono nombre="minus" tamaño="sm" />
        </QBoton>
      </div>
      <div
        className={`boton-cancelar ${
          categoria.valor === false ? "activo" : ""
        } ${clasesExtra}`}
      >
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("CANCELAR_REGLA_CATEGORIA", categoria);
          }}
        >
          <QIcono nombre="x_circle" tamaño="sm" />
        </QBoton>
      </div>
      <div
        className={`boton-permitir ${
          categoria.valor === true ? "activo" : ""
        } ${clasesExtra}`}
      >
        <QBoton
          variante="borde"
          onClick={() => {
            emitir("PERMITIR_REGLA_CATEGORIA", categoria);
          }}
        >
          <QIcono nombre="check" tamaño="sm" />
        </QBoton>
      </div>
    </div>
  );
};
