import "./EuroDenominacion.css";

type EuroDenominacionProps = {
  valor: number;
};

const colorBillete: Record<number, string> = {
  5: "#a8a8a8",
  10: "#d73b3b",
  20: "#3b7fd4",
  50: "#e8882e",
  100: "#3aab5e",
  200: "#d4b03b",
  500: "#8b5fb3",
};

const etiquetaBillete = (valor: number): string => {
  return `${valor}€`;
};

const etiquetaMoneda = (valor: number): string => {
  if (valor >= 1) return `${valor}€`;
  return `${Math.round(valor * 100)}c`;
};

const EuroBillete = ({ valor }: { valor: number }) => {
  const color = colorBillete[valor] ?? "#888";
  const colorOscuro = color + "cc";
  const etiqueta = etiquetaBillete(valor);

  return (
    <svg
      className="euro-billete"
      viewBox="0 0 80 45"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Billete de ${etiqueta}`}
    >
      {/* Fondo principal */}
      <rect x="0" y="0" width="80" height="45" rx="4" ry="4" fill={color} />

      {/* Franja central semitransparente */}
      <rect x="0" y="16" width="80" height="13" fill="rgba(255,255,255,0.15)" />

      {/* Borde interior */}
      <rect
        x="2"
        y="2"
        width="76"
        height="41"
        rx="3"
        ry="3"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />

      {/* Banda de seguridad vertical */}
      <rect x="62" y="0" width="6" height="45" fill={colorOscuro} opacity="0.4" />

      {/* Estrellas UE (círculos pequeños) — corona centrada en (40, 13) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
        const r = 7;
        return (
          <circle
            key={i}
            cx={40 + r * Math.cos(angle)}
            cy={13 + r * Math.sin(angle)}
            r="1"
            fill="rgba(255,255,255,0.8)"
          />
        );
      })}

      {/* Valor principal */}
      <text
        x="40"
        y="32"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        fill="white"
        fontFamily="sans-serif"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
      >
        {etiqueta}
      </text>
    </svg>
  );
};

const EuroMoneda = ({ valor }: { valor: number }) => {
  const esBimetalica = valor === 1 || valor === 2;
  const esCobre = valor < 0.1;
  const colorExterno = esBimetalica
    ? "#b8b8b8"
    : esCobre
      ? "#b87333"
      : "#c9a832";
  const colorInterno = esBimetalica ? "#c9a832" : colorExterno;
  const colorBorde = esBimetalica ? "#999" : esCobre ? "#8a5520" : "#a07d10";
  const etiqueta = etiquetaMoneda(valor);
  const fontSize = etiqueta.length > 3 ? "9" : "11";

  return (
    <svg
      className="euro-moneda"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Moneda de ${etiqueta}`}
    >
      {/* Sombra exterior */}
      <circle cx="24" cy="25" r="21" fill="rgba(0,0,0,0.2)" />

      {/* Círculo exterior */}
      <circle cx="24" cy="24" r="21" fill={colorExterno} />

      {/* Borde exterior */}
      <circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke={colorBorde}
        strokeWidth="1.5"
      />

      {/* Círculo interior (bimetálico) */}
      {esBimetalica && (
        <circle cx="24" cy="24" r="14" fill={colorInterno} />
      )}

      {/* Brillo */}
      <ellipse
        cx="19"
        cy="17"
        rx="6"
        ry="4"
        fill="rgba(255,255,255,0.25)"
        transform="rotate(-30 19 17)"
      />

      {/* Valor */}
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill="white"
        fontFamily="sans-serif"
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}
      >
        {etiqueta}
      </text>
    </svg>
  );
};

export const EuroDenominacion = ({ valor }: EuroDenominacionProps) => {
  if (valor >= 5) {
    return <EuroBillete valor={valor} />;
  }
  return <EuroMoneda valor={valor} />;
};
