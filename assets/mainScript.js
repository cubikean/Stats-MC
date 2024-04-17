async function fetchData() {
    const url = "./stats/YOUR_JSON.json";
    const response = await fetch(url);
    const dataAll = await response.json();
    const stats = dataAll.stats;

    removeSubstringFromKeys(stats, "minecraft:");

    Object.keys(stats).forEach(element => {
        const value = stats[element];
        const labels = Object.keys(value);

        times(value, labels);
        kilometers(value, labels);
        createChart(element, value, labels);
    });
}

function removeSubstringFromKeys(obj, substring) {
    const keys = Object.keys(obj);
    keys.forEach(key => {
        if (key.includes(substring)) {
            const newKey = key.replace(substring, "");
            obj[newKey] = obj[key];
            if (typeof obj[newKey] === "object") {
                removeSubstringFromKeys(obj[newKey], substring);
            }
            delete obj[key];
        } else if (typeof obj[key] === "object") {
            removeSubstringFromKeys(obj[key], substring);
        }
    });
}

function kilometers(value, labels) {
    const cmLabels = labels.filter(label => label.endsWith('_cm'));

    cmLabels.forEach(label => {
        const kmLabel = label.replace('_cm', '_km');
        value[kmLabel] = value[label] / 100000;
        delete value[label];
        const distanceList = document.querySelector('.distance-list');
        const distance = document.createElement("li");
        distance.id = label;
        distance.innerHTML += `<span>${label.slice(0, label.lastIndexOf('_one'))}</span>` + ': ' +  value[kmLabel];
        distanceList.appendChild(distance);
    });
}

function times(value, labels) {
    const timePlayed = labels.filter(label => label.includes('time'));

    timePlayed.forEach(element => {
        const timePlayedTicks = value[element];
        const timePlayedSeconds = timePlayedTicks / 20;

        console.log((timePlayedSeconds / 60 / 60).toFixed(2), `hour(s)${element}`);
        console.log((timePlayedSeconds / 60 / 60 / 24).toFixed(2), `day(s) ${element}`);
    });
}

function createChart(element, value, labels) {
    let canvasElement = document.getElementById(element);

    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
        canvasElement.id = element;
        document.body.appendChild(canvasElement);
    }

    const ctx = canvasElement.getContext("2d");

    const combinedData = Object.keys(value).map((label, index) => ({ label, value: value[label] }));
    const sortedData = combinedData.sort((a, b) => b.value - a.value);

    const top5Data = sortedData.slice(0, 10);
    const top5Label = top5Data.map(highest => highest.label);
    const top5Values = top5Data.map(highest => highest.value);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: top5Label,
            datasets: [{
                label: element,
                data: top5Values,
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                legend: {
                    title: {
                        display: true,
                        text: element,
                        font: {
                            size: 24,
                        }
                    }
                }
            }
        }
    });
}

fetchData();
