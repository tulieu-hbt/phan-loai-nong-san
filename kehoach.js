// Hàm tải dữ liệu từ file JSON
async function loadExcelData() {
    const url = 'https://tulieu-hbt.github.io/phan-loai-nong-san/assets/baocao.json';  // Đảm bảo URL đúng

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Kiểm tra dữ liệu
        console.log("Dữ liệu từ file JSON:", data); 

        return data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return []; // Trả về một mảng rỗng nếu có lỗi
    }
}
// Hàm hiển kế hoạch trồng cây
function displayPlantingPlan(plantingPlan, container) {
    console.log("Kế hoạch trồng cây:", plantingPlan); // Kiểm tra dữ liệu kế hoạch trồng cây
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += "<table><tr><th>STT</th><th>Công việc cần làm</th><th>Thời gian thực hiện</th><th>Vật liệu, dụng cụ cần thiết</th><th>Ghi chú</th></tr>";

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td>${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
            <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
            <td>${task['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML; // Ghi đè nội dung của container
}


// Hàm hiển thị chi phí trồng cây
function displayCostEstimate(costEstimate, container) {
    console.log("Chi phí trồng cây:", costEstimate); // Kiểm tra dữ liệu chi phí trồng cây
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    costHTML += "<table><tr><th>STT</th><th>Các loại chi phí</th><th>Đơn vị tính</th><th>Đơn giá (đồng)</th><th>Số lượng</th><th>Thành tiền (đồng)</th><th>Ghi chú</th></tr>";

    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;
        costHTML += `<tr>
            <td>${item.STT || ""}</td>
            <td>${item['Cac Loai Chi Phi'] || ""}</td>
            <td>${item['Don Vi Tinh'] || ""}</td>
            <td>${item['Don Gia (dong)'] || ""}</td>
            <td>${item['So Luong'] || ""}</td>
            <td>${itemTotal}</td>
            <td>${item['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    costHTML += `<tr class="total-row">
        <td colspan="5">Tổng cộng</td>
        <td>${totalCost}</td>
        <td></td>
    </tr>`;
    costHTML += "</table>";
    container.innerHTML = costHTML; // Ghi đè nội dung của container
}


// Hàm tạo dữ liệu giả lập cho giá thị trường (bổ sung dữ liệu)
function generateMockMarketData(nongsan) {
    const mockPrices = {
        "chuối": { price: (5000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() },
        "cà chua": { price: (15000 + Math.random() * 3000).toFixed(0), date: new Date().toLocaleDateString() },
        "thanh long": { price: (20000 + Math.random() * 5000).toFixed(0), date: new Date().toLocaleDateString() },
        "nho": { price: (10000 + Math.random() * 4000).toFixed(0), date: new Date().toLocaleDateString() },
        "chanh": { price: (8000 + Math.random() * 2000).toFixed(0), date: new Date().toLocaleDateString() }
    };
    return mockPrices[nongsan] || { price: "Không có sẵn", date: new Date().toLocaleDateString() };
}

// Hàm hiển thị thông tin giá thị trường lên giao diện
async function displayMarketData(nongsan, container) {
    const marketData = generateMockMarketData(nongsan);
    container.innerHTML = `<p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p>
    <p>Cập nhật lần cuối: ${marketData.date}</p>`;
}
