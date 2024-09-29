import { TypeValues, StatsTypes } from "./gameTypes";

export interface Combo {
    comboId: string;
    complete: boolean;
    reqN: number;
    reqType: TypeValues | null;
    reqCard: number | null;
    gainsN: number;
    gainsType: StatsTypes;
    infinite: boolean;
    claims: number;
    infiniteReqTypeCount: number;
    regularReqTypeCount: number;
}