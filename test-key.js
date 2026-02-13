function getGermanyTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(now);
    const d = {};
    parts.forEach(p => d[p.type] = p.value);
    return d;
}

const { day, month, year, hour } = getGermanyTime();
const expected = `6446${day}${month}${year}${hour}`;
console.log(`Current Time: ${new Date().toISOString()}`);
console.log(`Parts: Day=${day}, Month=${month}, Year=${year}, Hour=${hour}`);
console.log(`Expected Key: ${expected}`);
