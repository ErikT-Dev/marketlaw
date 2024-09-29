export function parseLocaleDateString(dateString: string) {
    const day = parseInt(dateString.split(' ')[0]) as number
    const monthLetters = dateString.split(' ')[1] as 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sept' | 'Oct' | 'Nov' | 'Dec'
    const year = parseInt(dateString.split(' ')[2]) as number
    const months = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sept: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12
    }
    const month = months[monthLetters]
    //METHOD DOES NOT GIVE ACCURATE TIME, ONLY WORKS TO SEE WHCIH DATE IS MORE RECENT
    return (year - 1970) * 31556952000 + (month - 1) * 2629746000 + (day - 1) * 86400000
}