function init() {
    var css_link = document.createElement('link');
    css_link.rel = 'stylesheet';
    css_link.href = 'src/data/style/hko_waning.css';
    document.head.appendChild(css_link);
    styleInfo("[Plugins] HKO weather warning:", "Resources initialized", '#98f3d8', "auto");
}

async function getData() {
    const url = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc';
    try {
        const response = await fetch(url);
        const json = await response.json();
        const container = document.getElementById('warning_sign');
        if (Object.keys(json).length > 0) {
            const keyElement = document.getElementById("navKey");
            keyElement.setAttribute("warning_status", "true");
            Object.values(json).forEach(warning => {
                if (warning.code) {
                    const warningElement = document.createElement('img');
                    warningElement.className = 'warning_sign';
                    warningElement.alt = warning.code;
                    warningElement.title = `${warning.name}現正生效 - 資訊來自data.gov.hk`;
                    warningElement.src = `./src/data/warning_sign/morden/dark/${warning.code}.png`;
                    container.appendChild(warningElement);
                }
            });
        } else {
            document.getElementById('warning_sign').remove();
        }
    } catch (error) {
        console.error(error.message);
    }
}

init();
getData();