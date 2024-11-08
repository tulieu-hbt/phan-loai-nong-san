// Hàm tải dữ liệu từ file JSON
async function loadExcelData() {
    const url = 'assets/baocao.json';  // Đảm bảo URL đúng

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return []; // Trả về một mảng rỗng nếu có lỗi
    }
}

// Hàm hiển thị kế hoạch trồng cây
function displayPlantingPlan(plantingPlan, container) {
    if (!Array.isArray(plantingPlan) || plantingPlan.length === 0) {
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
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
    if (!Array.isArray(costEstimate) || costEstimate.length === 0) {
        container.innerHTML = "<p>Không có dữ liệu chi phí trồng cây hợp lệ.</p>";
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

// Hàm fetch dữ liệu kế hoạch trồng cây và hiển thị
async function fetchAndDisplayPlanData(nongsan, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
        displayCostEstimate(selectedData.costEstimate, costContainer);
    } else {
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}
