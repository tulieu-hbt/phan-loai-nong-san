let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Hàm tải mô hình
async function loadModel() {
    const modelURL = `${URL}model.json`; // Đường dẫn tới model.json
    console.log("Đang tải mô hình từ:", modelURL);
    try {
        model = await tmImage.load(modelURL); // Kiểm tra xem mô hình có được tải thành công không
        console.log("Mô hình đã được tải thành công:", model);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Hàm khởi tạo camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Hàm dự đoán
async function predict() {
    try {
        // ... (Mã predict) ...
        // Vẽ hình ảnh hiện tại từ video lên canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Lấy dữ liệu hình ảnh từ canvas
    const image = tf.browser.fromPixels(canvas);
    // Tiền xử lý ảnh (nếu cần)
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]); // Thay đổi kích thước ảnh thành 224x224
    const normalizedImage = resizedImage.div(255.0); // Chuẩn hóa giá trị pixel về khoảng 0-1
    // Dự đoán với mô hình
    const predictions = await model.predict(normalizedImage).data(); 
    // Xử lý kết quả dự đoán
    let maxProbability = 0;
    let predictedClass = "";
    for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxProbability) {
            maxProbability = predictions[i];
            predictedClass = model.getClassLabels()[i]; // Lấy tên lớp từ model
        }
    }
    // Hiển thị kết quả
    result.innerText = `Kết quả dự đoán: ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
    } catch (error) {
        console.error("Lỗi khi dự đoán:", error);
        result.innerText = "Lỗi khi dự đoán. Vui lòng kiểm tra console.";
    }
}

// Hàm khởi tạo ứng dụng
async function init() {
    await loadModel();
    await setupCamera();
}

// Gọi hàm init khi trang web được tải
document.addEventListener("DOMContentLoaded", async () => {
    // Đảm bảo rằng tmImage đã được định nghĩa
    if (typeof tmImage === "undefined") {
        console.error("tmImage is not defined. Please check the library script.");
        result.innerText = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
    } else {
        await init();
    }
});
