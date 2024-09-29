export function formatUsesRemaining(remainingUses: number) {
    if (remainingUses === 1) {
        return '(1 use remaining)'
    } else {
        return `(${remainingUses} uses remaining)`
    }
}