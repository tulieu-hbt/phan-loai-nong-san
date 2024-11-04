let model
const URL = "model/"; // Thay thế bằng đường dẫn đến mô hình của bạn
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('imageContainer');

// Hàm tải mô hình
async function loadModel() {
  try {
    model = await tf.loadLayersModel(URL + 'model.json');
    console.log("Mô hình đã tải thành công");
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
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } catch (error) {
    console.error("Lỗi khi khởi tạo camera:", error);
    result.innerText = "Không thể truy cập camera!";
  }
}

// Hàm chụp ảnh và dự đoán
async function predict() {
  try {
    // Chụp ảnh
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL();

    // Hiển thị ảnh đã chụp
    const capturedImage = document.createElement('img');
    capturedImage.src = imageDataURL;
    capturedImage.style.maxWidth = "100%";
    capturedImage.style.maxHeight = "100%";
    imageContainer.innerHTML = '';
    imageContainer.appendChild(capturedImage);

    // Xử lý và dự đoán
    const image = tf.browser.fromPixels(canvas); // hoặc tmImage.fromPixels(canvas) nếu có
    const resized = tf.image.resizeBilinear(image, [224, 224]);
    const normalized = resized.div(255);
    const batched = normalized.expandDims(0);
    const predictions = await model.predict(batched).data();

    // Lấy nhãn dự đoán (thay thế bằng nhãn của bạn)
    const classLabels = ["dragon fruit", "banana", "tomato", "grape", "lemon"];
    let maxProbability = 0;
    let predictedClass = "";
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] > maxProbability) {
        maxProbability = predictions[i];
        predictedClass = classLabels[i];
      }
    }

    // Hiển thị kết quả (có thể thêm hàm dịch ở đây)
    if (maxProbability > 0.6) { // Điều chỉnh ngưỡng nếu cần
      result.innerText = `Dự đoán: ${predictedClass} - ${(maxProbability * 100).toFixed(2)}%`;
    } else {
      result.innerText = "Không nhận ra nông sản này.";
    }

  } catch (error) {
    console.error("Lỗi khi dự đoán:", error);
    result.innerText = "Lỗi khi dự đoán!";
  }
}

// Khởi tạo ứng dụng
async function init() {
  await loadModel();
  await setupCamera();
  captureButton.addEventListener("click", predict);
}

// Chạy ứng dụng khi trang web được tải
document.addEventListener('DOMContentLoaded', init);
