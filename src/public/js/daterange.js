// public/js/daterange.js

function filterByPeriod(period) {
    const today = new Date();
    let startDate;
    let endDate;

    switch (period) {
        case 'day':
            startDate = today.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case 'week':
            startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
            break;
        case 'month':
            startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
            break;
    }

    window.location.href = `/dashboard?startDate=${startDate}&endDate=${endDate}`;
}

function filterByDate() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    window.location.href = `/dashboard?startDate=${startDate}&endDate=${endDate}`;
}
