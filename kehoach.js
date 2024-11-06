// kehoach.js

// Finnhub API Key
const apiKey = 'csle9nhr01qq49fgr9jgcsle9nhr01qq49fgr9k0'; // Thay bằng API Key của bạn từ Finnhub

// Mapping sản phẩm nông sản sang mã hiệu trên Finnhub
const productSymbols = {
    "cà chua": "TOM",
    "chuối": "BAN",
    "nho": "GR",
    "dưa leo": "LEO",
    "cà rốt": "CAR",
    "bông cải xanh": "BLC",
    "cà pháo": "CPG",
    "dưa hấu": "WHT",
    "cà chua đào": "TOM",
    "dưa chuột": "PEP",
    "ớt": "CHL",
    "cải xanh": "BLC",
    "bắp": "CORN",
    "thanh long": "PNL",
    "xoài": "MPS",
    "cam": "ORNG",
    "quýt": "TNG"
};

// Hàm lấy thông tin giá thị trường từ API hoặc dữ liệu giả lập
async function fetchMarketData(nongsan) {
    const symbol = productSymbols[nongsan.toLowerCase()];
    if (!symbol) return generateMockMarketData(nongsan);

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return generateMockMarketData(nongsan);

        const data = await response.json();
        return data.c ? { price: data.c, date: new Date().toLocaleDateString() } : generateMockMarketData(nongsan);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
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

// Hàm hiển thị thông tin giá thị trường lên giao diện
async function displayMarketData(nongsan, container) {
    const marketData = await fetchMarketData(nongsan);
    container.innerHTML = `<p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p><p>Cập nhật lần cuối: ${marketData.date}</p>`;
}

// Hàm lấy và hiển thị kế hoạch trồng cây
async function fetchPlantingPlan(nongsan) {
    const plantingPlans = {
        "chuối": {
            overview: {
                "Giống cây": "Chuối tiêu",
                "Phương thức trồng": "Trồng bằng cây con",
                "Diện tích, số lượng": "500 m², 100 cây",
                "Điều kiện sinh trưởng": "Đất tơi xốp, độ ẩm cao"
            },
            tasks: [
                { stt: 1, task: "Chuẩn bị đất và phân bón", time: "1 ngày", materials: "Đất, phân hữu cơ", note: "Đảm bảo đất giàu dinh dưỡng" },
                { stt: 2, task: "Trồng cây giống", time: "1 ngày", materials: "Cây giống chuối", note: "Chọn giống khỏe mạnh" },
                { stt: 3, task: "Tưới nước và chăm sóc", time: "Hàng ngày", materials: "Bình tưới nước", note: "Tưới đều và tránh úng" },
                { stt: 4, task: "Bón phân", time: "Hàng tháng", materials: "Phân hữu cơ", note: "Bón đúng liều lượng" },
                { stt: 5, task: "Thu hoạch", time: "10-12 tháng sau khi trồng", materials: "Kéo cắt", note: "Thu hoạch khi quả chín" }
            ],
            cost: [
                { stt: 1, item: "Vật liệu, dụng cụ để trồng và chăm sóc cây", unit: "Bộ", price: 60000, quantity: 1, total: 60000, note: "Dụng cụ cần thiết" },
                { stt: 2, item: "Cây giống", unit: "Cây", price: 15000, quantity: 100, total: 1500000, note: "" },
                { stt: 3, item: "Phân bón", unit: "Kg", price: 10000, quantity: 40, total: 400000, note: "" },
                { stt: 4, item: "Thuốc bảo vệ thực vật", unit: "Chai", price: 30000, quantity: 2, total: 60000, note: "" },
                { stt: 5, item: "Chi phí gieo trồng, chăm sóc cây", unit: "Lần", price: 25000, quantity: 1, total: 25000, note: "" },
                { stt: 6, item: "Chi phí khác", unit: "", price: 0, quantity: 1, total: 50000, note: "" }
            ]
        },
        // Thêm các nông sản khác nếu cần
    };

    return plantingPlans[nongsan] || null;
}

// Hàm hiển thị kế hoạch trồng cây lên giao diện
async function displayPlantingPlan(nongsan, container) {
    const planData = await fetchPlantingPlan(nongsan);
    
    if (planData) {
        // Thông tin tổng quan
        let overviewHTML = "<h3>Thông tin tổng quan</h3><ul>";
        for (const [key, value] of Object.entries(planData.overview)) {
            overviewHTML += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        overviewHTML += "</ul>";

        // Kế hoạch trồng và chăm sóc cây trồng
        let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3><table><tr><th>STT</th><th>Công việc cần làm</th><th>Thời gian thực hiện</th><th>Vật liệu, dụng cụ cần thiết</th><th>Ghi chú</th></tr>";
        planData.tasks.forEach(task => {
            tasksHTML += `<tr><td>${task.stt}</td><td>${task.task}</td><td>${task.time}</td><td>${task.materials}</td><td>${task.note}</td></tr>`;
        });
        tasksHTML += "</table>";

        // Bảng tính chi phí trồng và chăm sóc cây trồng
        let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3><table><tr><th>STT</th><th>Các loại chi phí</th><th>Đơn vị tính</th><th>Đơn giá (đồng)</th><th>Số lượng</th><th>Thành tiền (đồng)</th><th>Ghi chú</th></tr>";
        let totalCost = 0;
        planData.cost.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalCost += itemTotal;
            costHTML += `<tr><td>${item.stt}</td><td>${item.item}</td><td>${item.unit}</td><td>${item.price}</td><td>${item.quantity}</td><td>${itemTotal}</td><td>${item.note}</td></tr>`;
        });
        costHTML += `<tr><td colspan="5">Tổng cộng</td><td>${totalCost}</td><td></td></tr>`;
        costHTML += "</table>";

        // Gán nội dung vào container
        container.innerHTML = overviewHTML + tasksHTML + costHTML;
    } else {
        container.innerHTML = "<p>Không có dữ liệu cho nông sản này.</p>";
    }
}
