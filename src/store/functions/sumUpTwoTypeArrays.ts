import { Type } from "../interfaces/gameTypes";
import { TypeValues } from "../interfaces/gameTypes";

export const sumUpTwoArraysByTypeCount = (...typeArrays: Type[]): Type[] =>
    Object.values(typeArrays.reduce((a, e) => {
        a[e.type] = a[e.type] || { type: e.type, count: 0 };
        a[e.type].count += e.count;
        return a;
    }, {} as Record<TypeValues, Type>));