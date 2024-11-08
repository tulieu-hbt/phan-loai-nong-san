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

video.addEventListener('loadedmetadata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});

async function loadModel() {
    const modelURL = `${URL}model.json`;
    try {
        model = await tf.loadLayersModel(modelURL);
        if (result) result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        if (result) result.innerText = "Không thể tải mô hình! " + error.message;
    }
}

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        if (result) result.innerText = "Không thể sử dụng camera!";
    }
}

function saveCapturedImage() {
    if (!capturedImage) {
        console.error("Element with ID 'capturedImage' not found.");
        return;
    }
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage.src = canvas.toDataURL("image/png");
}

async function predict() {
    if (!model) return;

    saveCapturedImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
    const preservationTexts = {
        "thanh long": "Bảo quản thanh long ở nơi thoáng mát...",
        "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng...",
        "cà chua": "Cà chua nên được bảo quản ở nhiệt độ phòng...",
        "nho": "Nho nên được bảo quản trong tủ lạnh...",
        "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng..."
    };

    let maxProbability = 0, predictedClass = "";
    for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxProbability) {
            maxProbability = predictions[i];
            predictedClass = classLabels[i];
        }
    }

    if (maxProbability < 0.7) {
        if (result) result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        return;
    }

    const nongsan = predictedClass;

    if (result) result.innerText = `Kết quả: ${nongsan}`;
    if (preservationInfo) preservationInfo.innerText = preservationTexts[nongsan];
    speak(preservationTexts[nongsan]);

    fetchAndDisplayPlantingInfo(nongsan);

    displayMarketData(nongsan, marketInfoContainer);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    }
}

async function fetchPlantingInfo(nongsan) {
    try {
        const response = await fetch('baocao.json');
        const data = await response.json();

        const nongsanData = data.find(item => item.nongsan === nongsan);

        return nongsanData ? {
            plantingPlan: nongsanData.plantingPlan,
            costEstimate: nongsanData.costEstimate
        } : { plantingPlan: [], costEstimate: [] };

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return { plantingPlan: [], costEstimate: [] };
    }
}

function displayPlantingPlan(plantingPlan, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }

    const table = document.createElement('table');
    const headerRow = table.insertRow();
    ['STT', 'Công việc cần làm', 'Thời gian thực hiện', 'Vật liệu, dụng cụ cần thiết', 'Ghi chú'].forEach(headerText => {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = headerText;
    });

    plantingPlan.forEach(task => {
        const row = table.insertRow();
        ['STT', 'Cong Viec Can Lam', 'Thoi Gian Thuc Hien', 'Vat Lieu, Dung Cu Can Thiet', 'Ghi Chu'].forEach(key => {
            const cell = row.insertCell();
            cell.textContent = task[key] || '';
        });
    });

    container.innerHTML = '<h3>Kế hoạch trồng và chăm sóc cây trồng</h3>';
    container.appendChild(table);
}

function displayCostEstimate(costEstimate, container) {
    if (!container) {
        console.error("Container is undefined");
        return;
    }

    const table = document.createElement('table');
    const headerRow = table.insertRow();
    ['STT', 'Các loại chi phí', 'Đơn vị tính', 'Đơn giá (đồng)', 'Số lượng', 'Thành tiền (đồng)', 'Ghi chú'].forEach(headerText => {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = headerText;
    });

    let totalCost = 0;
    costEstimate.forEach(item => {
        const row = table.insertRow();
        ['STT', 'Cac Loai Chi Phi', 'Don Vi Tinh', 'Don Gia (dong)', 'So Luong', 'Ghi Chu'].forEach(key => {
            const cell = row.insertCell();
            cell.textContent = item[key] || '';
        });
        const itemTotal = (item['Don Gia (dong)'] || 0) * (item['So Luong'] || 0);
        totalCost += itemTotal;
        const totalCell = row.insertCell();
        totalCell.textContent = itemTotal;
    });

    // Thêm dòng tổng cộng
    const totalRow = table.insertRow();
    const totalLabelCell = totalRow.insertCell();
    totalLabelCell.colSpan = 5;
    totalLabelCell.textContent = 'Tổng cộng';
    const totalValueCell = totalRow.insertCell();
    totalValueCell.textContent = totalCost;

    container.innerHTML = '<h3>Bảng tính chi phí trồng và chăm sóc cây trồng</h3>';
    container.appendChild(table);
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
    displayPlantingInfo(data, plantingPlanContainer);
}

// Hàm tạo dữ liệu giả lập cho giá thị trường
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

document.addEventListener("DOMContentLoaded", async () => {
    await init();
    if (captureButton) captureButton.addEventListener("click", predict);
});
