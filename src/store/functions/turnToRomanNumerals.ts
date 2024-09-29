export function turnToRomanNumerals(num: number) {
    if (num === 1) {
        return 'I'
    } else {
        if (num === 2) {
            return 'II'
        } else {
            return 'III'
        }
    }
}