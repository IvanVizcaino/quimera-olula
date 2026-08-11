import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";

export const PieBase = () => {
  const año = new Date().getFullYear();
  return (
    <footer>
      <p>{año}. YeboYebo SLU</p>
    </footer>
  );
};

export const Pie = () => {
  const { app } = useContext(FactoryCtx);
  const PieCustom = app.Componentes?.pie as (() => React.ReactNode) | undefined;

  return PieCustom ? <PieCustom /> : <PieBase />;
};
