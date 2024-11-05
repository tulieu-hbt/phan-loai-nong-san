// ketqua.js

// Dữ liệu nông sản cơ bản
const nongsanData = {
    chuoi: {
        name: "Chuối",
        preservation: "Chuối nên được bảo quản ở nhiệt độ phòng, tránh nơi có ánh nắng mặt trời và độ ẩm cao.",
        plantingPlan: [
            { stt: 1, task: "Chuẩn bị đất và phân bón", time: "1 ngày", materials: "Đất trồng, phân hữu cơ", note: "Đảm bảo đất giàu dinh dưỡng" },
            { stt: 2, task: "Trồng cây giống", time: "1 ngày", materials: "Cây giống chuối", note: "Chọn giống khỏe mạnh" },
            { stt: 3, task: "Tưới nước và chăm sóc", time: "Hàng ngày", materials: "Bình tưới nước", note: "Tưới đều và tránh úng" },
            { stt: 4, task: "Bón phân", time: "Hàng tháng", materials: "Phân hữu cơ", note: "Bón đúng liều lượng" },
            { stt: 5, task: "Thu hoạch", time: "10-12 tháng sau khi trồng", materials: "Kéo cắt", note: "Thu hoạch khi quả chín" },
        ],
        costTable: []
    },
    "cà chua": {
        name: "Cà Chua",
        preservation: "Bảo quản cà chua ở nhiệt độ phòng, tránh lạnh để giữ hương vị tốt nhất.",
        plantingPlan: [
            { stt: 1, task: "Chuẩn bị đất và phân bón", time: "1 ngày", materials: "Đất trồng, phân hữu cơ", note: "Đảm bảo đất tơi xốp" },
            { stt: 2, task: "Gieo hạt hoặc trồng cây con", time: "1 ngày", materials: "Hạt giống hoặc cây con", note: "Chọn giống tốt" },
            { stt: 3, task: "Tưới nước và chăm sóc", time: "Hàng ngày", materials: "Bình tưới nước", note: "Không tưới quá nhiều nước" },
            { stt: 4, task: "Kiểm tra sâu bệnh", time: "Hàng tuần", materials: "Thuốc bảo vệ thực vật", note: "Sử dụng đúng liều lượng" },
            { stt: 5, task: "Thu hoạch", time: "60-70 ngày sau khi trồng", materials: "Kéo cắt", note: "Thu hoạch khi quả chín đỏ" },
        ],
        costTable: []
    },
    // Thêm các loại nông sản khác theo cấu trúc tương tự
};

// Hàm lấy dữ liệu thị trường từ AgriData API
async function fetchMarketData(nongsan) {
    const apiKey = "YOUR_RAPIDAPI_KEY"; // Thay YOUR_RAPIDAPI_KEY bằng API Key từ RapidAPI
    const url = `https://agridata.p.rapidapi.com/prices?product=${nongsan}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "agridata.p.rapidapi.com"
            }
        });
        
        // Chuyển đổi dữ liệu nhận được từ API sang dạng JSON
        const data = await response.json();
        
        if (data && data.prices) {
            console.log(`Dữ liệu thị trường cho ${nongsan}:`, data.prices);
            // Cập nhật giá thị trường và thời gian cập nhật cho nông sản
            nongsanData[nongsan] = {
                ...nongsanData[nongsan],
                marketPrice: data.prices[0].price, // Lấy giá đầu tiên trong danh sách trả về
                lastUpdated: data.prices[0].date // Ngày cập nhật
            };
        } else {
            console.error("Không tìm thấy dữ liệu giá cho nông sản này.");
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AgriData API:", error);
        // Nếu không có kết nối API, sử dụng giá giả lập
        updateMockMarketPrices(nongsan);
    }
}

// Hàm tạo giá giả lập trong trường hợp không có kết nối với API
function generateMockMarketData(nongsan) {
    const prices = {
        chuoi: (5000 + Math.random() * 2000).toFixed(0) + " VND/kg",
        "cà chua": (15000 + Math.random() * 3000).toFixed(0) + " VND/kg",
        "thanh long": (20000 + Math.random() * 5000).toFixed(0) + " VND/kg",
        "phân hữu cơ": (20000 + Math.random() * 5000).toFixed(0) + " VND/kg",
        "phân đạm": (25000 + Math.random() * 5000).toFixed(0) + " VND/kg"
    };
    return prices[nongsan] || "Dữ liệu giá không có sẵn";
}

// Hàm cập nhật giá thị trường giả lập
function updateMockMarketPrices(nongsan) {
    const price = generateMockMarketData(nongsan);
    console.log(`Giá ${nongsan} (giả lập): ${price}`);
    // Cập nhật vào dữ liệu nông sản
    if (nongsanData[nongsan]) {
        nongsanData[nongsan].marketPrice = price;
        nongsanData[nongsan].lastUpdated = new Date().toLocaleString();
    }
}

// Hàm khởi tạo và kiểm tra API hoặc sử dụng dữ liệu giả lập
async function initMarketData(nongsan) {
    try {
        await fetchMarketData(nongsan);
    } catch (error) {
        console.error("Không thể lấy dữ liệu thị trường từ API, sử dụng dữ liệu giả lập.");
        updateMockMarketPrices(nongsan);
    }
}

// Ví dụ gọi hàm khởi tạo giá thị trường cho "chuoi" và "cà chua"
initMarketData("chuoi");
initMarketData("cà chua");

// Cập nhật giá mỗi 60 giây
setInterval(() => initMarketData("chuoi"), 60000);
setInterval(() => initMarketData("cà chua"), 60000);
