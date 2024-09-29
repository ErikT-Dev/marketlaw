import { Combo } from "../interfaces/combo"
import { Type } from "../interfaces/gameTypes"

export function claimComboWorkforce(currentWorkforce: number, combo: Combo) {
    if (combo.gainsType !== 'workforce') { return currentWorkforce }
    else { return currentWorkforce + combo.gainsN }
}

export function claimComboQuality(currentQuality: number, combo: Combo) {
    if (combo.gainsType !== 'quality') { return currentQuality }
    else { return currentQuality + combo.gainsN }
}
export function claimComboSatisfation(currentSatisfation: number, combo: Combo) {
    if (combo.gainsType !== 'satisfaction') { return currentSatisfation }
    else { return currentSatisfation + combo.gainsN }
}

export function updateCombo(playedCombos: Combo[], thisCombo: Combo, reqTypeCount: number | undefined) {
    const combosInPlay = [...playedCombos]
    if (thisCombo.infinite && reqTypeCount) {
        return combosInPlay.map((combo) => {
            if (combo.comboId === thisCombo.comboId) {
                return {
                    ...combo,
                    claims: combo.claims + 1,
                    complete: reqTypeCount >= combo.reqN * (combo.claims + 1) ? true : false
                }
            } else {
                return combo
            }
        })
    } else {
        return combosInPlay.filter(e => e.comboId !== thisCombo.comboId)
    }
}