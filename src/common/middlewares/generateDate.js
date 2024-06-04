function generateDates(days) {
    const dates = [];
    let currentDate = new Date();
    for (let i = 0; i < days; i++) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

module.exports = generateDates;