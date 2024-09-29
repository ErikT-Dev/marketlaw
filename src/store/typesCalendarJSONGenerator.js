const typesBonusPoints = Object.values(require('../../TypeBonusPoints.json'))

typesBonusPoints.forEach(e => e.appearances = 0)

const typesCalendar = []

/* function getDaysInMonthUTC(month, year) {
    var date = new Date(Date.UTC(year, month, 1));
    var days = [];
    while (date.getUTCMonth() === month) {
        days.push(new Date(date).toLocaleString('en-GB', {
            dateStyle: 'medium',
            timeZone: 'Etc/GMT-8',
        }));
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return days
} */

//using a manual map of the month names, otherwise ran into inconsistencies due to differeneces in runtime environements
function getDaysInMonthUTC(month, year) {
    // Manual month abbreviation mapping
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var date = new Date(Date.UTC(year, month, 1));
    var days = [];

    while (date.getUTCMonth() === month) {
        // Extract the day, month abbreviation, and year manually
        const day = date.getUTCDate();
        const monthAbbreviation = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        // Construct the formatted date string manually
        const formattedDate = `${day} ${monthAbbreviation} ${year}`;

        // Push the manually formatted date string into the days array
        days.push(formattedDate);

        // Move to the next day
        date.setUTCDate(date.getUTCDate() + 1);
    }

    return days;
}

//Choose which months and which year you want the data for:
for (let i = 7; i < 12; i++) {
    getDaysInMonthUTC(i, 2024).forEach(date => typesCalendar.push({ date }))
}

let typesOfPreviousDay = []
typesCalendar.forEach(date => {
    const minAppearances = typesBonusPoints.reduce(function (prev, curr) {
        return prev.appearances < curr.appearances ? prev : curr;
    }).appearances
    const possibleTypes1 = typesBonusPoints
        .filter(type => type.appearances <= minAppearances)
        .filter(type => type.type !== typesOfPreviousDay[0] && type.type !== typesOfPreviousDay[1])
    const randIndex1 = Math.floor(Math.random() * possibleTypes1.length)
    possibleTypes1[randIndex1].appearances += 1
    date.type1 = possibleTypes1[randIndex1].type
    date.bonusPoints1 = possibleTypes1[randIndex1].bonusPoints
    const possibleTypes2 = typesBonusPoints
        .filter(type => type.type !== possibleTypes1[randIndex1].type)
        .filter(type => type.appearances <= minAppearances + 1)
        .filter(type => type.type !== typesOfPreviousDay[0] && type.type !== typesOfPreviousDay[1])
    const randIndex2 = Math.floor(Math.random() * possibleTypes2.length)
    possibleTypes2[randIndex2].appearances += 1
    date.type2 = possibleTypes2[randIndex2].type
    date.bonusPoints2 = possibleTypes2[randIndex2].bonusPoints
    typesOfPreviousDay = [possibleTypes1[randIndex1].type, possibleTypes2[randIndex2].type]
})

console.log(typesBonusPoints)
console.log(JSON.stringify(typesCalendar))
//Paste the log into a JSON file.