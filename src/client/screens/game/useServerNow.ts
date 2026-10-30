import { useContext, useEffect, useState } from "react";
import { ServerClockOffset } from "./ServerClockOffset";

const TICK_MS = 250;

export function useServerNow(): number {
  const offsetMs = useContext(ServerClockOffset);
  const [now, setNow] = useState(() => Date.now() + offsetMs);
  useEffect(() => {
    setNow(Date.now() + offsetMs);
    const timer = setInterval(() => {
      setNow(Date.now() + offsetMs);
    }, TICK_MS);
    return () => {
      clearInterval(timer);
    };
  }, [offsetMs]);
  return now;
}
