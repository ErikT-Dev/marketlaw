export const convertUTCtoDate = (UTCdate: string) => {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeZone: 'Etc/GMT-8',
    }).format(new Date(Date.parse(UTCdate)))
}


