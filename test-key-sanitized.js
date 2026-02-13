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
    parts.forEach(p => {
        if (p.type !== 'literal') {
            // Check for hidden characters
            const raw = p.value;
            const cleaned = raw.replace(/\D/g, '');
            if (raw !== cleaned) {
                console.log(`Warning: Hidden characters detected in ${p.type} ("${raw}")`);
            }
            d[p.type] = cleaned;
        }
    });

    // Normalize hour
    if (d.hour === '24') d.hour = '00';
    return d;
}

const { day, month, year, hour } = getGermanyTime();
const expected = `6446${day}${month}${year}${hour}`;
console.log(`Sanitized Key: ${expected}`);
console.log(`Length: ${expected.length}`);
