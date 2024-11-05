// kehoach.js

// Hàm lấy thông tin thị trường từ AgriData API
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
        
        if (response.status === 403) {
            console.error("Lỗi 403: Quyền truy cập bị từ chối. Kiểm tra API Key và quyền truy cập.");
            return null;
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
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AgriData API:", error);
        return null;
    }
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

// Hàm lấy kế hoạch trồng cây từ dữ liệu giả lập hoặc từ API thực
async function fetchRealData(nongsan) {
    try {
        // Thay thế URL này bằng API thực tế nếu có
        const response = await fetch(`https://api.example.com/planting-data?product=${nongsan}`);
        const data = await response.json();

        return {
            info: {
                type: data.type || nongsan,
                method: data.method || "Không có thông tin",
                area: data.area || "Không có thông tin",
                conditions: data.conditions || "Không có thông tin"
            },
            plan: data.plan || [],
            costs: data.costs || []
        };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thực:", error);
        // Sử dụng dữ liệu giả lập trong trường hợp không thể lấy dữ liệu từ API
        return plantingPlans[nongsan] || null;
    }
}

// Hàm hiển thị thông tin kế hoạch và chi phí vào giao diện
async function displayPlantingPlan(nongsan) {
    const planData = await fetchRealData(nongsan);
    const planContainer1 = document.getElementById("plantingPlanContainer1");
    const planContainer2 = document.getElementById("plantingPlanContainer2");
    const marketInfoContainer = document.getElementById("marketInfoContainer");

    if (!planData) {
        planContainer1.innerHTML = `<p>Không có dữ liệu cho nông sản này.</p>`;
        planContainer2.innerHTML = `<p>Không có dữ liệu cho nông sản này.</p>`;
        return;
    }

    // Hiển thị thông tin kế hoạch trồng cây
    planContainer1.innerHTML = `
        <h3>Kế hoạch trồng và chăm sóc ${planData.info.type}</h3>
        <p>Phương thức trồng: ${planData.info.method}</p>
        <p>Diện tích: ${planData.info.area}</p>
        <p>Điều kiện sinh trưởng: ${planData.info.conditions}</p>
        <table>
            <tr><th>STT</th><th>Công việc cần làm</th><th>Thời gian thực hiện</th><th>Vật liệu, dụng cụ cần thiết</th><th>Ghi chú</th></tr>
            ${planData.plan.map(item => `
                <tr>
                    <td>${item.stt}</td>
                    <td>${item.task}</td>
                    <td>${item.time}</td>
                    <td>${item.materials}</td>
                    <td>${item.notes}</td>
                </tr>`).join('')}
        </table>
    `;

    // Hiển thị bảng tính chi phí trồng cây
    planContainer2.innerHTML = `
        <h3>Bảng tính chi phí trồng và chăm sóc ${planData.info.type}</h3>
        <table>
            <tr><th>STT</th><th>Các loại chi phí</th><th>Đơn vị tính</th><th>Đơn giá (đồng)</th><th>Số lượng</th><th>Thành tiền (đồng)</th><th>Ghi chú</th></tr>
            ${planData.costs.map(item => `
                <tr>
                    <td>${item.stt}</td>
                    <td>${item.item}</td>
                    <td>${item.unit}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>${item.total}</td>
                    <td>${item.notes}</td>
                </tr>`).join('')}
            <tr>
                <td colspan="5"><strong>Tổng cộng</strong></td>
                <td><strong>${planData.costs.reduce((sum, item) => sum + item.total, 0)}</strong></td>
                <td></td>
            </tr>
        </table>
    `;

    // Hiển thị thông tin giá thị trường
    displayMarketData(nongsan, marketInfoContainer);
}
