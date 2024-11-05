// kehoach.js

async function fetchMarketData(nongsan) {
    const apiKey = "YOUR_RAPIDAPI_KEY";
    const url = `https://agridata.p.rapidapi.com/prices?product=${nongsan}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "agridata.p.rapidapi.com"
            }
        });

        if (!response.ok) return generateMockMarketData(nongsan);

        const data = await response.json();
        return data.prices ? { price: data.prices[0].price, date: data.prices[0].date } : generateMockMarketData(nongsan);
    } catch {
        return generateMockMarketData(nongsan);
    }
}

function generateMockMarketData(nongsan) {
    const mockPrices = {
        "chuối": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "cà chua": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

async function displayMarketData(nongsan, container) {
    const marketData = await fetchMarketData(nongsan);
    container.innerHTML = `<p>Giá ${nongsan}: ${marketData.price} VND/kg - Ngày: ${marketData.date}</p>`;
}

async function fetchPlantingPlan(nongsan) {
    const plans = {
        "chuối": "<h3>Kế hoạch trồng chuối...</h3>",
        "cà chua": "<h3>Kế hoạch trồng cà chua...</h3>"
    };
    return plans[nongsan] || "<p>Không có dữ liệu</p>";
}

async function displayPlantingPlan(nongsan, container) {
    const planData = await fetchPlantingPlan(nongsan);
    container.innerHTML = planData;
}
