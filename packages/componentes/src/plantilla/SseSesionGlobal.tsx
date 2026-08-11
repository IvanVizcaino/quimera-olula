import { retainGlobalServerSentEventsConnection } from "@olula/lib/api/server_sent_events_session.ts";
import { useEffect } from "react";

export const SseSesionGlobal = () => {
  useEffect(() => {
    const liberarConexion = retainGlobalServerSentEventsConnection();

    return () => {
      liberarConexion();
    };
  }, []);

  return null;
};
