import { OlulaStacked, OlulaWordmark } from "../tema/Olula.jsx";

export const FondoInicio = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px"}}>
        <OlulaStacked color="#14191a" oFill="#edf84b" aFill="#63aebb" className="" style={{ width: " 50%", display: "block" }} />
        <OlulaWordmark color="#1a1714" bowlColor="#1a1714" className="" style={{ width: "50%", display: "block" }} />
      </div>
    </div>
  );
};
