// URL của file JSON chứa dữ liệu
const dataUrl = 'https://tulieu-hbt.github.io/phan-loai-nong-san/assets/baocao.json';  // Đảm bảo URL đúng

// Hàm tải và xử lý dữ liệu từ file JSON
async function fetchData() {
    try {
        const response = await fetch(dataUrl);
        const data = await response.json();

        // Gọi hàm hiển thị dữ liệu
        displayPlanData(data);
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
    }
}

// Hàm hiển thị dữ liệu trên giao diện
function displayPlanData(data) {
    const { plantingPlan, costEstimate } = data;
    const plantingPlanContainer = document.getElementById('plantingPlanContainer');

    if (Array.isArray(plantingPlan) && Array.isArray(costEstimate)) {
        displayPlantingPlan(plantingPlan, plantingPlanContainer);
        displayCostEstimate(costEstimate, plantingPlanContainer);
    } else {
        plantingPlanContainer.innerHTML = "<p>Không có dữ liệu cho nông sản này.</p>";
    }
}

// Hàm hiển thị kế hoạch trồng cây
function displayPlantingPlan(plantingPlan, container) {
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
    container.innerHTML += tasksHTML;
}

// Hàm hiển thị chi phí trồng cây
function displayCostEstimate(costEstimate, container) {
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
    container.innerHTML += costHTML;
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", fetchData);
