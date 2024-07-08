function generateDates(days) {
    const dates = [];
    let now  = new Date();
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        dates.push(date.toISOString());
    }
    return dates;
}

module.exports = generateDates;