const video = document.getElementById('camera');
const result = document.getElementById('result');
let model;

// Hàm khởi động camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); // Sử dụng camera phía sau
        video.srcObject = stream;
    } catch (error) {
        console.error("Lỗi khi truy cập camera:", error);
        result.innerText = "Lỗi khi truy cập camera!"; // Thông báo lỗi nếu không thể truy cập camera
    }
}

// Hàm tải mô hình
async function loadModel() {
    const modelURL = "model/model.json"; // Đường dẫn tới model.json
    try {
        model = await tmImage.load(modelURL);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Hàm phân loại hình ảnh
async function classifyImage() {
    if (model) {
        const predictions = await model.predict(video);
        const topPrediction = predictions[0];

        // Hiển thị kết quả
        if (topPrediction.probability > 0.5) {
            result.innerText = `Kết quả: ${topPrediction.className} - Độ chính xác: ${(topPrediction.probability * 100).toFixed(2)}%`;
        } else {
            result.innerText = "Đây không phải là nông sản";
        }
    } else {
        result.innerText = "Mô hình chưa sẵn sàng!";
    }
}

// Khởi động camera và tải mô hình khi nhấn nút
document.getElementById('start-button').addEventListener('click', async () => {
    await loadModel();
    await startCamera(); // Khởi động camera sau khi mô hình được tải
    setInterval(classifyImage, 1000); // Phân loại hình ảnh mỗi giây
});
