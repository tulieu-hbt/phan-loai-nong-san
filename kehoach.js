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

// Hàm hiển thị dữ liệu kế hoạch trồng cây và chi phí
async function fetchAndDisplayPlanData(nongsan, introContainer, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        // Kiểm tra nếu thiết bị là điện thoại di động
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        if (isMobile) {
            // Hiển thị thông tin dạng văn bản trên điện thoại di động
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayTextPlan(selectedData.plantingPlan, plantingContainer);
            displayTextCost(selectedData.costEstimate, costContainer);
        } else {
            // Hiển thị thông tin dạng bảng trên máy tính
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
            displayCostEstimate(selectedData.costEstimate, costContainer);
        }
    } else {
        introContainer.innerHTML = "<p>Không có dữ liệu giới thiệu.</p>";
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}

// Hàm hiển thị thông tin giới thiệu
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu");
        return;
    }

    let introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || ""}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || ""}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || ""}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || ""}</p>
    `;
    container.innerHTML = introHTML + container.innerHTML; // Thêm thông tin giới thiệu trước nội dung hiện có
}

// Hàm hiển thị kế hoạch trồng cây dạng văn bản
function displayTextPlan(plantingPlan, container) {
    if (!plantingPlan || !Array.isArray(plantingPlan)) {
        console.error("Không có dữ liệu kế hoạch trồng cây hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let planHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    plantingPlan.forEach(task => {
        planHTML += `
            <p><strong>STT:</strong> ${task.STT || ""}</p>
            <p><strong>Công việc cần làm:</strong> ${task['Cong Viec Can Lam'] || ""}</p>
            <p><strong>Thời gian thực hiện:</strong> ${task['Thoi Gian Thuc Hien'] || ""}</p>
            <p><strong>Vật liệu, dụng cụ cần thiết:</strong> ${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</p>
            <p><strong>Ghi chú:</strong> ${task['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });
    container.innerHTML = planHTML;
}

// Hàm hiển thị chi phí trồng cây dạng văn bản
function displayTextCost(costEstimate, container) {
    if (!costEstimate || !Array.isArray(costEstimate)) {
        console.error("Không có dữ liệu chi phí hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu chi phí hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;

        costHTML += `
            <p><strong>STT:</strong> ${item.STT || ""}</p>
            <p><strong>Các loại chi phí:</strong> ${item['Cac Loai Chi Phi'] || ""}</p>
            <p><strong>Đơn vị tính:</strong> ${item['Don Vi Tinh'] || ""}</p>
            <p><strong>Đơn giá (đồng):</strong> ${item['Don Gia (dong)'] || ""}</p>
            <p><strong>Số lượng:</strong> ${item['So Luong'] || ""}</p>
            <p><strong>Thành tiền (đồng):</strong> ${itemTotal}</p>
            <p><strong>Ghi chú:</strong> ${item['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });

    costHTML += `<p><strong>Tổng cộng:</strong> ${totalCost} đồng</p>`;
    container.innerHTML = costHTML;
}

// Hàm hiển thị kế hoạch trồng cây dạng bảng
// Hàm hiển thị kế hoạch trồng cây dạng bảng
function displayPlantingPlan(plantingPlan, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += `<table>
        <tr>
            <th class="stt">STT</th>
            <th>Công việc cần làm</th>
            <th>Thời gian thực hiện</th>
            <th>Vật liệu, dụng cụ cần thiết</th>
            <th>Ghi chú</th>
        </tr>`;

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td class="stt">${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
            <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
            <td>${task['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML; // Ghi đè nội dung của container
}

// Hàm hiển thị chi phí trồng cây dạng bảng
function displayCostEstimate(costEstimate, container) {
    if (!Array.isArray(costEstimate)) {
        console.error("Dữ liệu costEstimate không phải là một mảng:", costEstimate);
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

// Hàm hiển thị kế hoạch trồng cây dạng văn bản
function displayTextPlan(plantingPlan, container) {
    if (!plantingPlan || !Array.isArray(plantingPlan)) {
        console.error("Không có dữ liệu kế hoạch trồng cây hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let planHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    plantingPlan.forEach(task => {
        planHTML += `
            <p><strong>STT:</strong> ${task.STT || ""}</p>
            <p><strong>Công việc cần làm:</strong> ${task['Cong Viec Can Lam'] || ""}</p>
            <p><strong>Thời gian thực hiện:</strong> ${task['Thoi Gian Thuc Hien'] || ""}</p>
            <p><strong>Vật liệu, dụng cụ cần thiết:</strong> ${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</p>
            <p><strong>Ghi chú:</strong> ${task['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });
    container.innerHTML = planHTML;
}

// Hàm hiển thị chi phí trồng cây dạng văn bản
function displayTextCost(costEstimate, container) {
    if (!costEstimate || !Array.isArray(costEstimate)) {
        console.error("Không có dữ liệu chi phí hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu chi phí hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;

        costHTML += `
            <p><strong>STT:</strong> ${item.STT || ""}</p>
            <p><strong>Các loại chi phí:</strong> ${item['Cac Loai Chi Phi'] || ""}</p>
            <p><strong>Đơn vị tính:</strong> ${item['Don Vi Tinh'] || ""}</p>
            <p><strong>Đơn giá (đồng):</strong> ${item['Don Gia (dong)'] || ""}</p>
            <p><strong>Số lượng:</strong> ${item['So Luong'] || ""}</p>
            <p><strong>Thành tiền (đồng):</strong> ${itemTotal}</p>
            <p><strong>Ghi chú:</strong> ${item['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });

    costHTML += `<p><strong>Tổng cộng:</strong> ${totalCost} đồng</p>`;
    container.innerHTML = costHTML;
}

// Hàm hiển thị thông tin giới thiệu
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu");
        return;
    }

    let introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || ""}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || ""}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || ""}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || ""}</p>
    `;
    container.innerHTML = introHTML + container.innerHTML; // Thêm thông tin giới thiệu trước nội dung hiện có
}

// Hàm hiển thị dữ liệu kế hoạch trồng cây và chi phí
// Hàm hiển thị dữ liệu kế hoạch trồng cây và chi phí
async function fetchAndDisplayPlanData(nongsan, introContainer, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        // Kiểm tra nếu thiết bị là điện thoại di động
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        if (isMobile) {
            // Hiển thị thông tin dạng văn bản trên điện thoại di động
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayTextPlan(selectedData.plantingPlan, plantingContainer);
            displayTextCost(selectedData.costEstimate, costContainer);
        } else {
            // Hiển thị thông tin dạng bảng trên máy tính
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
            displayCostEstimate(selectedData.costEstimate, costContainer);
        }
    } else {
        introContainer.innerHTML = "<p>Không có dữ liệu giới thiệu.</p>";
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}

// Hàm hiển thị thông tin giới thiệu
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu");
        return;
    }

    let introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || ""}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || ""}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || ""}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || ""}</p>
    `;
    container.innerHTML = introHTML + container.innerHTML; // Thêm thông tin giới thiệu trước nội dung hiện có
}

// Hàm hiển thị kế hoạch trồng cây dạng văn bản
function displayTextPlan(plantingPlan, container) {
    if (!plantingPlan || !Array.isArray(plantingPlan)) {
        console.error("Không có dữ liệu kế hoạch trồng cây hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let planHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    plantingPlan.forEach(task => {
        planHTML += `
            <p><strong>STT:</strong> ${task.STT || ""}</p>
            <p><strong>Công việc cần làm:</strong> ${task['Cong Viec Can Lam'] || ""}</p>
            <p><strong>Thời gian thực hiện:</strong> ${task['Thoi Gian Thuc Hien'] || ""}</p>
            <p><strong>Vật liệu, dụng cụ cần thiết:</strong> ${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</p>
            <p><strong>Ghi chú:</strong> ${task['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });
    container.innerHTML = planHTML;
}

// Hàm hiển thị chi phí trồng cây dạng văn bản
function displayTextCost(costEstimate, container) {
    if (!costEstimate || !Array.isArray(costEstimate)) {
        console.error("Không có dữ liệu chi phí hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu chi phí hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;

        costHTML += `
            <p><strong>STT:</strong> ${item.STT || ""}</p>
            <p><strong>Các loại chi phí:</strong> ${item['Cac Loai Chi Phi'] || ""}</p>
            <p><strong>Đơn vị tính:</strong> ${item['Don Vi Tinh'] || ""}</p>
            <p><strong>Đơn giá (đồng):</strong> ${item['Don Gia (dong)'] || ""}</p>
            <p><strong>Số lượng:</strong> ${item['So Luong'] || ""}</p>
            <p><strong>Thành tiền (đồng):</strong> ${itemTotal}</p>
            <p><strong>Ghi chú:</strong> ${item['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });

    costHTML += `<p><strong>Tổng cộng:</strong> ${totalCost} đồng</p>`;
    container.innerHTML = costHTML;
}

// Hàm hiển thị kế hoạch trồng cây dạng bảng
function displayPlantingPlan(plantingPlan, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += `<table>
        <tr>
            <th class="stt">STT</th>
            <th>Công việc cần làm</th>
            <th>Thời gian thực hiện</th>
            <th>Vật liệu, dụng cụ cần thiết</th>
            <th>Ghi chú</th>
        </tr>`;

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td class="stt">${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
            <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
            <td>${task['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML; // Ghi đè nội dung của container
}

// Hàm hiển thị chi phí trồng cây dạng bảng
// Hàm hiển thị chi phí trồng cây dạng bảng
function displayCostEstimate(costEstimate, container) {
    if (!Array.isArray(costEstimate)) {
        console.error("Dữ liệu costEstimate không phải là một mảng:", costEstimate);
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

// Hàm hiển thị kế hoạch trồng cây dạng bảng
function displayPlantingPlan(plantingPlan, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }
    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += `<table>
        <tr>
            <th class="stt">STT</th>
            <th>Công việc cần làm</th>
            <th>Thời gian thực hiện</th>
            <th>Vật liệu, dụng cụ cần thiết</th>
            <th>Ghi chú</th>
        </tr>`;

    plantingPlan.forEach(task => {
        tasksHTML += `<tr>
            <td class="stt">${task.STT || ""}</td>
            <td>${task['Cong Viec Can Lam'] || ""}</td>
            <td>${task['Thoi Gian Thuc Hien'] || ""}</td>
            <td>${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</td>
            <td>${task['Ghi Chu'] || ""}</td>
        </tr>`;
    });

    tasksHTML += "</table>";
    container.innerHTML = tasksHTML; // Ghi đè nội dung của container
}

// Hàm hiển thị kế hoạch trồng cây dạng văn bản
function displayTextPlan(plantingPlan, container) {
    if (!plantingPlan || !Array.isArray(plantingPlan)) {
        console.error("Không có dữ liệu kế hoạch trồng cây hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let planHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    plantingPlan.forEach(task => {
        planHTML += `
            <p><strong>STT:</strong> ${task.STT || ""}</p>
            <p><strong>Công việc cần làm:</strong> ${task['Cong Viec Can Lam'] || ""}</p>
            <p><strong>Thời gian thực hiện:</strong> ${task['Thoi Gian Thuc Hien'] || ""}</p>
            <p><strong>Vật liệu, dụng cụ cần thiết:</strong> ${task['Vat Lieu, Dung Cu Can Thiet'] || ""}</p>
            <p><strong>Ghi chú:</strong> ${task['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });
    container.innerHTML = planHTML;
}

// Hàm hiển thị chi phí trồng cây dạng văn bản
function displayTextCost(costEstimate, container) {
    if (!costEstimate || !Array.isArray(costEstimate)) {
        console.error("Không có dữ liệu chi phí hoặc dữ liệu không hợp lệ");
        container.innerHTML = "<p>Không có dữ liệu chi phí hợp lệ.</p>";
        return;
    }

    let costHTML = "<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>";
    let totalCost = 0;
    costEstimate.forEach(item => {
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;

        costHTML += `
            <p><strong>STT:</strong> ${item.STT || ""}</p>
            <p><strong>Các loại chi phí:</strong> ${item['Cac Loai Chi Phi'] || ""}</p>
            <p><strong>Đơn vị tính:</strong> ${item['Don Vi Tinh'] || ""}</p>
            <p><strong>Đơn giá (đồng):</strong> ${item['Don Gia (dong)'] || ""}</p>
            <p><strong>Số lượng:</strong> ${item['So Luong'] || ""}</p>
            <p><strong>Thành tiền (đồng):</strong> ${itemTotal}</p>
            <p><strong>Ghi chú:</strong> ${item['Ghi Chu'] || ""}</p>
            <hr>
        `;
    });

    costHTML += `<p><strong>Tổng cộng:</strong> ${totalCost} đồng</p>`;
    container.innerHTML = costHTML;
}

// Hàm hiển thị thông tin giới thiệu
function displayIntroduction(gioiThieu, container) {
    if (!gioiThieu || typeof gioiThieu !== "object") {
        console.error("Không có thông tin giới thiệu");
        return;
    }

    let introHTML = `
        <h3>Giới thiệu về cây trồng</h3>
        <p><strong>Giống cây:</strong> ${gioiThieu.giongCay || ""}</p>
        <p><strong>Phương thức trồng:</strong> ${gioiThieu.phuongThucTrong || ""}</p>
        <p><strong>Diện tích & Số lượng:</strong> ${gioiThieu.dienTichSoLuong || ""}</p>
        <p><strong>Điều kiện sinh trưởng:</strong> ${gioiThieu.dieuKienSinhTruong || ""}</p>
    `;
    container.innerHTML = introHTML + container.innerHTML; // Thêm thông tin giới thiệu trước nội dung hiện có
}

// Hàm hiển thị dữ liệu kế hoạch trồng cây và chi phí
async function fetchAndDisplayPlanData(nongsan, introContainer, plantingContainer, costContainer) {
    const data = await loadExcelData();
    const selectedData = data.find(item => item.nongsan === nongsan);

    if (selectedData) {
        // Kiểm tra nếu thiết bị là điện thoại di động
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        if (isMobile) {
            // Hiển thị thông tin dạng văn bản trên điện thoại di động
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayTextPlan(selectedData.plantingPlan, plantingContainer);
            displayTextCost(selectedData.costEstimate, costContainer);
        } else {
            // Hiển thị thông tin dạng bảng trên máy tính
            displayIntroduction(selectedData.gioiThieu, introContainer);
            displayPlantingPlan(selectedData.plantingPlan, plantingContainer);
            displayCostEstimate(selectedData.costEstimate, costContainer);
        }
    } else {
        introContainer.innerHTML = "<p>Không có dữ liệu giới thiệu.</p>";
        plantingContainer.innerHTML = "<p>Không có dữ liệu cho kế hoạch trồng cây.</p>";
        costContainer.innerHTML = "<p>Không có dữ liệu cho chi phí trồng cây.</p>";
    }
}

// Khởi tạo dữ liệu khi trang được tải
document.addEventListener("DOMContentLoaded", async () => {
    // Khởi tạo dữ liệu khi trang được tải
    await fetchAndDisplayPlanData("cà chua", introContainer, plantingPlanContainer, marketInfoContainer);
});
