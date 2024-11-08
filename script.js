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
        if (result) result.innerText = "Không thể tải mô hình!";
    }
}

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        if (result) result.innerText = "Không thể sử dụng camera!";
    }
}

function saveCapturedImage() {
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
    predictions.forEach((prob, i) => {
        if (prob > maxProbability) {
            maxProbability = prob;
            predictedClass = classLabels[i];
        }
    });

    if (maxProbability < 0.7) {
        result.innerText = "Không nhận diện được nông sản.";
        preservationInfo.innerText = "";
        plantingPlanContainer.innerHTML = "";
        marketInfoContainer.innerHTML = "";
        return;
    }

    result.innerText = `Kết quả: ${predictedClass}`;
    preservationInfo.innerText = preservationTexts[predictedClass];

    await fetchAndDisplayPlantingInfo(predictedClass);
    displayMarketData(predictedClass, marketInfoContainer);
}

async function fetchAndDisplayPlantingInfo(nongsan) {
    const data = await fetchPlantingInfo(nongsan);
    if (data.plantingPlan.length > 0 || data.costEstimate.length > 0) {
        displayPlantingInfo(data, plantingPlanContainer);
    } else {
        plantingPlanContainer.innerHTML = "<p>Không có dữ liệu cho nông sản này.</p>";
    }
}

async function fetchPlantingInfo(nongsan) {
    try {
        const response = await fetch('baocao.json');
        const data = await response.json();
        return data.find(item => item.nongsan === nongsan) || { plantingPlan: [], costEstimate: [] };
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ file JSON:", error);
        return { plantingPlan: [], costEstimate: [] };
    }
}

async function init() {
    await loadModel();
    await setupCamera();
}

document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});
