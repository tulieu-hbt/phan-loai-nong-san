let model;
const result = document.getElementById('result');
const captureButton = document.getElementById('captureButton');
const video = document.getElementById('camera');

// Hàm tải mô hình
async function loadModel() {
    const modelURL = "model/model.json"; // Đường dẫn tới model.json
    console.log("Đang tải mô hình từ:", modelURL);
    try {
        model = await tmImage.load(modelURL);
        console.log("Mô hình đã được tải thành công:", model);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình! Vui lòng kiểm tra console để biết thêm chi tiết.";
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
        result.innerText = "Không thể sử dụng camera! Vui lòng kiểm tra quyền truy cập camera.";
    }
}

// Hàm bắt đầu ứng dụng
async function init() {
    await loadModel();
    await setupCamera();
}

// Gọi hàm init khi trang được tải
window.addEventListener('load', () => {
    init();

    // Đảm bảo rằng phần tử đã sẵn sàng trước khi thêm sự kiện
    if (captureButton) {
        captureButton.addEventListener('click', async () => {
            result.innerText = "Chức năng chụp ảnh chưa được triển khai.";
        });
    } else {
        console.error("Không tìm thấy nút chụp ảnh.");
    }
});

// Cần xử lý lỗi khi tải camera
video.addEventListener('error', (error) => {
    console.error("Lỗi video:", error);
    result.innerText = "Lỗi video: không thể phát video từ camera.";
});
