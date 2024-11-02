let model;
const video = document.getElementById("camera");
const result = document.getElementById("result");
const predictionsDiv = document.getElementById("predictions");
const captureButton = document.getElementById("captureButton");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    const modelURL = "model/model.json"; // Đường dẫn tới model.json
    console.log("Đang tải mô hình từ:", modelURL);
    try {
        model = await tmImage.load(modelURL);
        console.log("Mô hình đã được tải thành công:", model);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

async function captureAndPredict() {
    if (!model) {
        console.error("Mô hình chưa được tải!");
        return;
    }
    
    const img = tf.browser.fromPixels(video);
    const predictions = await model.predict(img);
    tf.dispose(img); // Giải phóng bộ nhớ

    predictionsDiv.innerHTML = ''; // Xóa dự đoán cũ
    predictions.forEach(prediction => {
        const p = document.createElement("p");
        p.innerText = `${prediction.className}: ${Math.round(prediction.probability * 100)}%`;
        predictionsDiv.appendChild(p);
    });
}

async function init() {
    await setupCamera();
    await loadModel();
    
    captureButton.addEventListener("click", captureAndPredict);
}

init().catch(err => {
    console.error("Lỗi trong quá trình khởi tạo:", err);
    result.innerText = "Đã xảy ra lỗi trong quá trình khởi tạo!";
});
