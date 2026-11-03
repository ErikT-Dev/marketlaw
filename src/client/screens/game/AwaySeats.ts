import { createContext } from "react";
import type { SeatNumber } from "../../../shared/SeatNumber";

export const AwaySeats = createContext<ReadonlyArray<SeatNumber>>([]);
