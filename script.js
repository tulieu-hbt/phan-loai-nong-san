let model;
const URL = "model/";

const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById("camera");
const canvas = document.createElement("canvas");
const capturedImage = document.getElementById("capturedImage");
const preservationInfo = document.getElementById("preservationInfo");
const plantingPlanContainer = document.getElementById("plantingPlanContainer");
const marketInfoContainer = document.getElementById("marketInfoContainer");

// Khởi tạo camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
        return new Promise(resolve => {
            video.onloadedmetadata = () => resolve(video);
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Tải mô hình TensorFlow
async function loadModel() {
    const modelURL = `${URL}model.json`;
    try {
        model = await tf.loadLayersModel(modelURL);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Chụp ảnh từ video camera
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage.src = canvas.toDataURL("image/png");
}

// Dự đoán nông sản
async function predict() {
    if (!model) return;

    captureImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
    const preservationTexts = {
        "thanh long": "Bảo quản thanh long ở nơi thoáng mát...",
        "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng sau khi thu hoạch. Bạn có thể tham khảo về cách trồng chuối ...",
        "cà chua": "Cà chua nên được bảo quản ở nhiệt độ phòng sau khi thu hoạch. Bạn có thể tham khảo về cách trồng cà chua để bổ sung bữa cơm gia đình ...",
        "nho": "Nho nên được bảo quản trong tủ lạnh...",
        "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng..."
    };

    let maxProbability = 0;
    let predictedClass = "";
    predictions.forEach((prob, i) => {
        if (prob > maxProbability) {
            maxProbability = prob;
            predictedClass = classLabels[i];
        }
    });

    if (maxProbability < 0.7) {
        result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        preservationInfo.innerText = "";
        plantingPlanContainer.innerHTML = "";
        marketInfoContainer.innerHTML = "";
        return;
    }

    result.innerText = `Kết quả: ${predictedClass}`;
    preservationInfo.innerText = preservationTexts[predictedClass];
    speak(preservationTexts[predictedClass]);

    // Hiển thị dữ liệu kế hoạch trồng cây và chi phí
    await fetchAndDisplayPlanData(predictedClass, plantingPlanContainer, marketInfoContainer);
}

// Hàm Text-to-Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    }
}

// Tải dữ liệu JSON và tìm dữ liệu phù hợp với nông sản
async function loadExcelData() {
    const url = 'https://tulieu-hbt.github.io/phan-loai-nong-san/assets/baocao.json';  // Đảm bảo URL đúng
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return [];
    }
}

// Hàm hiển thị kế hoạch trồng cây và chi phí
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

// Hiển thị bảng kế hoạch trồng cây
//<td>${task.STT || ""}</td>
function displayPlantingPlan(plantingPlan, container) {
    if (!Array.isArray(plantingPlan) || plantingPlan.length === 0) {
        container.innerHTML = "<p>Không có dữ liệu kế hoạch trồng cây hợp lệ.</p>";
        return;
    }

    let tasksHTML = "<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>";
    tasksHTML += "<table><tr><th>STT</th><th>Công việc cần làm</th><th>Thời gian thực hiện</th><th>Vật liệu, dụng cụ cần thiết</th><th>Ghi chú</th></tr>";

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
    container.innerHTML = tasksHTML;
}

// Hiển thị bảng chi phí trồng cây
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
    container.innerHTML = costHTML;
}

// Hàm TTS (Text-to-Speech)
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    }
}

// Hàm tải dữ liệu từ file JSON dựa trên loại nông sản
async function fetchPlantingInfo(nongsan) {
    const url = 'https://tulieu-hbt.github.io/phan-loai-nong-san/assets/baocao.json';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("Dữ liệu JSON:", data);

        // Tìm đối tượng có nongsan trùng với nongsan cần tìm
        const nongsanData = data.find(item => item.nongsan === nongsan);

        // Trả về plantingPlan và costEstimate từ đối tượng tìm được
        return nongsanData ? {
            plantingPlan: nongsanData.plantingPlan,
            costEstimate: nongsanData.costEstimate
        } : { plantingPlan: [], costEstimate: [] };

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return { plantingPlan: [], costEstimate: [] };
    }
}

// Hàm hiển thị dữ liệu kế hoạch trồng cây
function displayPlantingInfo(data, container) {
    const { plantingPlan, costEstimate } = data;

    if (Array.isArray(plantingPlan) && Array.isArray(costEstimate)) {
        displayPlantingPlan(plantingPlan, container);
        displayCostEstimate(costEstimate, container);
    } else {
        container.innerHTML = "<p>Không có dữ liệu cho nông sản này.</p>";
    }
}

// Hàm fetch dữ liệu và hiển thị kế hoạch trồng cây
async function fetchAndDisplayPlantingInfo(nongsan) {
    const data = await fetchPlantingInfo(nongsan);
    if (data) {
        displayPlantingPlan(data.plantingPlan, plantingPlanContainer);
        displayCostEstimate(data.costEstimate, plantingPlanContainer); // Đảm bảo bảng chi phí cũng được hiển thị
    }
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

// Khởi tạo
async function init() {
    await loadModel();
    await setupCamera();
}

// Chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});

