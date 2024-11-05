// kehoach.js

// Hàm lấy thông tin thị trường từ API hoặc dùng dữ liệu giả lập
async function fetchMarketData(nongsan) {
    const apiKey = "YOUR_RAPIDAPI_KEY"; // Thay YOUR_RAPIDAPI_KEY bằng API Key của bạn
    const url = `https://agridata.p.rapidapi.com/prices?product=${nongsan}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "agridata.p.rapidapi.com"
            }
        });
        
        if (response.status === 429 || response.status === 403) {
            console.warn("Không thể truy cập API, sử dụng dữ liệu giả lập.");
            return generateMockMarketData(nongsan);
        }
        
        if (!response.ok) {
            throw new Error(`Lỗi: ${response.statusText}`);
        }

        // Chuyển đổi dữ liệu nhận được từ API sang dạng JSON
        const data = await response.json();
        
        if (data && data.prices) {
            console.log(`Dữ liệu thị trường cho ${nongsan}:`, data.prices);
            return {
                price: data.prices[0].price,
                date: data.prices[0].date
            };
        } else {
            console.error("Không tìm thấy dữ liệu giá cho nông sản này.");
            return generateMockMarketData(nongsan);
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AgriData API:", error);
        return generateMockMarketData(nongsan);
    }
}

// Hàm tạo dữ liệu giả lập cho giá thị trường
function generateMockMarketData(nongsan) {
    const mockPrices = {
        "chuối": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "cà chua": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() },
        "thanh long": { price: (20000 + Math.random() * 5000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

// Hàm hiển thị thông tin thị trường
async function displayMarketData(nongsan, container) {
    const marketData = await fetchMarketData(nongsan);
    if (marketData) {
        container.innerHTML = `
            <p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p>
            <p>Cập nhật lần cuối: ${marketData.date}</p>
        `;
    } else {
        container.innerHTML = `<p>Không thể lấy thông tin giá thị trường cho ${nongsan}.</p>`;
    }
}
