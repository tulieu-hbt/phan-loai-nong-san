// ketqua.js
// Dữ liệu ban đầu cho các loại nông sản
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
        costTable: [],
    },
    cam: {
        name: "Cam",
        preservation: "Cam nên được bảo quản trong tủ lạnh hoặc nơi mát mẻ.",
        plantingPlan: [
            // Kế hoạch trồng cam
        ],
        costTable: [],
    },
    // Thêm các nông sản khác nếu cần
};

// Hàm lấy dữ liệu giá cả thị trường từ API
async function fetchMarketData(nongsan) {
    try {
        // Thay URL này bằng API thực tế của bạn
        const response = await fetch(`https://api.example.com/market-data/${nongsan}`);
        const data = await response.json();

        // Cập nhật giá cả thị trường vào nongsanData nếu tồn tại nông sản này
        if (nongsanData[nongsan]) {
            nongsanData[nongsan].marketPrice = data.price; // Giá thị trường
            nongsanData[nongsan].lastUpdated = new Date().toLocaleString(); // Thời gian cập nhật
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
    }
}

// Gọi hàm fetchMarketData để cập nhật dữ liệu khi cần
fetchMarketData("chuoi");
fetchMarketData("cam");
