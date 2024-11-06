// kehoach.js

// Hàm tải dữ liệu từ file Excel
async function loadExcelData() {
    const url = 'https://github.com/tulieu-hbt/phan-loai-nong-san/raw/main/assets/baocao.xlsx';

    try {
        // Tải file Excel
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Lấy dữ liệu từ các sheet
        const plantingSheet = workbook.Sheets[workbook.SheetNames[0]];
        const costSheet = workbook.Sheets[workbook.SheetNames[1]];

        // Chuyển đổi dữ liệu sheet thành JSON
        const plantingPlan = XLSX.utils.sheet_to_json(plantingSheet);
        const costEstimate = XLSX.utils.sheet_to_json(costSheet);

        // Kiểm tra dữ liệu
        console.log("Planting Plan:", plantingPlan);
        console.log("Cost Estimate:", costEstimate);

        return { plantingPlan, costEstimate };
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file Excel:", error);
        return { plantingPlan: null, costEstimate: null };
    }
}

// Hàm hiển thị kế hoạch trồng cây
function displayPlantingPlan(plantingPlan, container) {
    // Kiểm tra nếu plantingPlan là mảng
    if (!Array.isArray(plantingPlan)) {
        console.error("Dữ liệu plantingPlan không phải là một mảng:", plantingPlan);
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += "<table><tr><th>STT</th><th>Công việc cần làm</th><th>Thời gian thực hiện</th><th>Vật liệu, dụng cụ cần thiết</th><th>Ghi chú</th></tr>";

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td>${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi gian thuc hien'] || ""}</td>
            <td>${task['Vat lieu, dung cu can thiet'] || ""}</td>
            <td>${task['Ghi chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML += tasksHTML;
}

// Hàm hiển thị chi phí trồng cây
function displayCostEstimate(costEstimate, container) {
    // Kiểm tra nếu costEstimate là mảng
    if (!Array.isArray(costEstimate)) {
        console.error("Dữ liệu costEstimate không phải là một mảng:", costEstimate);
        container.innerHTML = "<p>Không có dữ liệu chi phí trồng cây hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    costHTML += "<table><tr><th>STT</th><th>Các loại chi phí</th><th>Đơn vị tính</th><th>Đơn giá (đồng)</th><th>Số lượng</th><th>Thành tiền (đồng)</th><th>Ghi chú</th></tr>";

    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don gia (dong)'] || 0) * (item['So luong'] || 0);
        totalCost += itemTotal;
        costHTML += `<tr>
            <td>${item.STT || ""}</td>
            <td>${item['Cac loai chi phi'] || ""}</td>
            <td>${item['Don vi tinh'] || ""}</td>
            <td>${item['Don gia (dong)'] || ""}</td>
            <td>${item['So luong'] || ""}</td>
            <td>${itemTotal}</td>
            <td>${item['Ghi chu'] || ""}</td>
        </tr>`;
    });

    costHTML += `<tr class="total-row">
        <td colspan="5">Tổng cộng</td>
        <td>${totalCost}</td>
        <td></td>
    </tr>`;
    costHTML += "</table>";
    container.innerHTML += costHTML;
}

// Hàm hiển thị toàn bộ dữ liệu kế hoạch và chi phí lên giao diện
async function displayPlantingInfo(nongsan) {
    const { plantingPlan, costEstimate } = await loadExcelData();
    const plantingPlanContainer = document.getElementById('plantingPlanContainer');

    // Kiểm tra nếu dữ liệu có dạng mảng
    if (Array.isArray(plantingPlan) && Array.isArray(costEstimate)) {
        displayPlantingPlan(plantingPlan, plantingPlanContainer);
        displayCostEstimate(costEstimate, plantingPlanContainer);
    } else {
        plantingPlanContainer.innerHTML = "<p>Không có dữ liệu cho nông sản này.</p>";
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
    const marketData = generateMockMarketData(nongsan);
    container.innerHTML = `<p>Giá thị trường hiện tại của ${nongsan}: ${marketData.price} VND/kg</p>
    <p>Cập nhật lần cuối: ${marketData.date}</p>`;
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo thêm nếu cần
});
