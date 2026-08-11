import { puede } from "@olula/lib/dominio.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";
import "./home.css";

export const Home = () => {
  const { widgets } = useContext(FactoryCtx);
  const visibles = widgets.filter(
    (widget) => !widget.regla || puede(widget.regla)
  );

  return (
    <div className="home-grid">
      {visibles.map(({ id, Componente }) => (
        <section key={id} className="home-widget">
          <Componente />
        </section>
      ))}
    </div>
  );
};
