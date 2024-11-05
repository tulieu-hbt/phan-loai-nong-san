// kehoach.js

// Hàm lấy thông tin giá thị trường từ API hoặc sử dụng dữ liệu giả lập nếu API không truy cập được
async function fetchMarketData(nongsan) {
    const apiKey = "YOUR_RAPIDAPI_KEY"; // Thay thế bằng API Key của bạn
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

// Hàm tạo dữ liệu giả lập cho giá thị trường nếu không thể lấy từ API
function generateMockMarketData(nongsan) {
    const mockPrices = {
        "chuối": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "cà chua": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() },
        "thanh long": { price: (20000 + Math.random() * 5000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

// Hàm hiển thị thông tin thị trường lên giao diện
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

// Hàm lấy kế hoạch trồng cây (giả lập hoặc từ API nếu có)
async function fetchPlantingPlan(nongsan) {
    // Đây là dữ liệu giả lập cho kế hoạch trồng cây
    const mockPlans = {
        "chuối": `
            <h3>Kế hoạch trồng và chăm sóc chuối</h3>
            <table>
                <tr><th>Ngày</th><th>Công việc</th><th>Vật liệu</th><th>Ghi chú</th></tr>
                <tr><td>1</td><td>Chuẩn bị đất</td><td>Đất, phân bón</td><td>Làm đất kỹ</td></tr>
                <tr><td>7</td><td>Trồng cây giống</td><td>Giống chuối</td><td>Chọn giống tốt</td></tr>
                <tr><td>30</td><td>Bón phân</td><td>Phân hữu cơ</td><td>Bón vừa đủ</td></tr>
            </table>
        `,
        "cà chua": `
            <h3>Kế hoạch trồng và chăm sóc cà chua</h3>
            <table>
                <tr><th>Ngày</th><th>Công việc</th><th>Vật liệu</th><th>Ghi chú</th></tr>
                <tr><td>1</td><td>Chuẩn bị đất</td><td>Đất, phân bón</td><td>Đảm bảo đất tơi xốp</td></tr>
                <tr><td>3</td><td>Gieo hạt</td><td>Hạt giống cà chua</td><td>Ngâm trước khi gieo</td></tr>
                <tr><td>15</td><td>Tưới nước</td><td>Nước sạch</td><td>Không để úng</td></tr>
            </table>
        `,
        "thanh long": `
            <h3>Kế hoạch trồng và chăm sóc thanh long</h3>
            <table>
                <tr><th>Ngày</th><th>Công việc</th><th>Vật liệu</th><th>Ghi chú</th></tr>
                <tr><td>1</td><td>Chuẩn bị đất</td><td>Đất thịt, phân bón</td><td>Xử lý đất</td></tr>
                <tr><td>5</td><td>Trồng cành</td><td>Cành thanh long</td><td>Trồng vào bầu</td></tr>
                <tr><td>20</td><td>Tưới nước</td><td>Nước sạch</td><td>Giữ độ ẩm</td></tr>
            </table>
        `
    };

    return mockPlans[nongsan] || `<p>Không có dữ liệu cho nông sản này.</p>`;
}

// Hàm hiển thị kế hoạch trồng cây lên giao diện
async function displayPlantingPlan(nongsan, container) {
    const planData = await fetchPlantingPlan(nongsan);
    container.innerHTML = planData;
}
