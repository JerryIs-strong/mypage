function init() {
    var css_link = document.createElement('link');
    css_link.rel = 'stylesheet';
    css_link.href = 'src/data/style/dcount.css';
    document.head.appendChild(css_link);
    styleInfo("[Plugins] Day Counter:", "Resources initialized", '#98f3d8', "auto");
}

function calculateDayCount(startDate, isAnnual) {
    const today = new Date();
    let eventDate;
    if (isAnnual) {
        const [month, day] = startDate.split('-').map(Number);
        if (month < today.getMonth() + 1 || (month === today.getMonth() + 1 && day < today.getDate())) {
            eventDate = new Date(today.getFullYear() + 1, month - 1, day);
        }
        else {
            eventDate = new Date(today.getFullYear(), month - 1, day);
        }
    } else {
        eventDate = new Date(startDate);
        eventDate.setHours(0, 0, 0, 0);
    }
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function isEventClosed(endDate) {
    if (!endDate) return false;
    const today = new Date();
    const eventEndDate = new Date(endDate);
    eventEndDate.setHours(23, 59, 59, 999);
    return today > eventEndDate;
}

function calculateProgress(startDate, endDate, isAnnual) {
    if (!endDate) return null;
    const today = new Date();
    let start;
    if (isAnnual) {
        const [month, day] = startDate.split('-').map(Number);
        start = new Date(today.getFullYear(), month - 1, day);
        if (start > today) {
            start = new Date(today.getFullYear() - 1, month - 1, day);
        }
    } else {
        start = new Date(startDate);
    }
    const end = new Date(endDate);
    if (today < start) return 0;
    if (today > end) return 100;
    const total = end - start;
    const elapsed = today - start;
    return (elapsed / total) * 100;
}

function createCard(name, startDay, dayCount, isAnnual = false, endDate = null) {
    const card = document.createElement('div');
    card.className = 'dcount-card';
    const startDayElement = document.createElement('div');
    startDayElement.textContent = endDate ? `${startDay} - ${endDate}` : startDay;
    startDayElement.className = 'dcount-card-start-day';
    const title = document.createElement('div');
    title.textContent = name;
    title.className = 'dcount-card-title';
    const dayCountElement = document.createElement('div');
    dayCountElement.textContent = dayCount > 0 ? `D-${dayCount}` : `D+${Math.abs(dayCount)}`;
    if (dayCount === 0) {
        card.setAttribute('data-today', true);
    }
    dayCountElement.className = 'dcount-card-day-count';
    card.appendChild(title);
    card.appendChild(dayCountElement);
    card.appendChild(startDayElement);
    return card;
}

function renderDayCounts() {
    const container = document.getElementById('dcount-container');
    if (!container) {
        console.error('Container element with id "dcount-container" not found in index.html');
        return;
    }
    fetch('./src/data/dcount.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch dcount.json: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            data.data.forEach(event => {
                const isAnnual = event.type === 'Annually';
                const dayCount = calculateDayCount(event.start_date, isAnnual);
                const isClosed = isEventClosed(event.end_date);
                if (isClosed && !isAnnual) {
                    const card = createCard("Closed", "N/A", -999);
                    const wrapper = document.createElement('div');
                    wrapper.className = 'dcount-closed-wrapper';
                    const closedLabel = document.createElement('div');
                    closedLabel.textContent = 'Closed';
                    closedLabel.className = 'dcount-closed-label';
                    wrapper.appendChild(closedLabel);
                    card.appendChild(wrapper);
                    container.appendChild(card);
                } else {
                    const card = createCard(event.name, event.start_date, dayCount, isAnnual, event.end_date);
                    if (!isClosed && event.end_date) {
                        const progress = calculateProgress(event.start_date, event.end_date, isAnnual);
                        const progressBar = document.createElement('div');
                        progressBar.className = 'dcount-progress-bar';
                        const progressFill = document.createElement('div');
                        progressFill.className = 'dcount-progress-fill';
                        progressFill.style.width = `${progress}%`;
                        progressBar.appendChild(progressFill);
                        card.appendChild(progressBar);
                    }
                    container.appendChild(card);
                }
            });
        })
        .catch(error => {
            console.error('Error loading dcount.json:', error);
        });
}

init();
renderDayCounts();