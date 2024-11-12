// public/js/daterange.js

function formatDateUTC(date) {
    // Asegúrate de que la fecha esté en formato YYYY-MM-DD (sin hora) en UTC.
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function filterByPeriod(period) {
    const today = new Date();
    let startDate;
    let endDate;

    switch (period) {
        case 'day':
            startDate = formatDateUTC(today);
            endDate = startDate;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setUTCDate(today.getUTCDate() - 7);  // Usamos setUTCDate para evitar la diferencia de zona horaria.
            startDate = formatDateUTC(weekStart);
            endDate = formatDateUTC(today);
            break;
        case 'month':
            const monthStart = new Date(today);
            monthStart.setUTCMonth(today.getUTCMonth() - 1);  // Igual con setUTCMonth para evitar la zona horaria.
            startDate = formatDateUTC(monthStart);
            endDate = formatDateUTC(today);
            break;
    }

    // Redirigir con las fechas en formato UTC.
    window.location.href = `/dashboard?startDate=${startDate}&endDate=${endDate}`;
}

function filterByDate() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Redirigir con las fechas en formato UTC.
    window.location.href = `/dashboard?startDate=${startDate}&endDate=${endDate}`;
}
