import "./qetiqueta.css";

type EtiquetaVariante = "exito" | "error" | "advertencia" | "primario";

interface QEtiquetaProps {
  variante?: EtiquetaVariante;
  tamaño?: "sm" | "md";
  className?: string;
}

export const QEtiqueta = ({
  variante = "primario",
  tamaño = "sm",
  className = "",
  children,
}: React.PropsWithChildren<QEtiquetaProps>) => {
  return (
    <span className={`q-etiqueta ${variante} ${tamaño} ${className}`}>
      {children}
    </span>
  );
};
