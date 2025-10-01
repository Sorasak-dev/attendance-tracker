const FacialRecognition = {
    stream: null,
    capturedImage: null,

    async startCamera() {
        try {
            const video = document.getElementById('video');
            const startBtn = document.getElementById('startCameraBtn');
            const captureBtn = document.getElementById('captureBtn');
            const snapshotContainer = document.getElementById('snapshotContainer');

            if (!video) return;

            if (snapshotContainer) snapshotContainer.classList.add('hidden');

            this.stream = await navigator.mediaDevices.getUserMedia(
                CONFIG.CAMERA_CONFIG
            );

            video.srcObject = this.stream;
            
            await video.play();

            if (startBtn) startBtn.classList.add('hidden');
            if (captureBtn) captureBtn.classList.remove('hidden');

            showAlert('📷 เปิดกล้องสำเร็จ', 'success');

        } catch (error) {
            console.error('Camera error:', error);
            
            let errorMessage = CONFIG.MESSAGES.ERROR_CAMERA;
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'คุณไม่อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'ไม่พบกล้องในอุปกรณ์ของคุณ';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'กล้องถูกใช้งานโดยแอปอื่นอยู่';
            }
            
            showAlert(errorMessage, 'danger');
            throw error;
        }
    },

    capturePhoto() {
        try {
            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            const snapshot = document.getElementById('snapshot');
            const snapshotContainer = document.getElementById('snapshotContainer');
            const captureBtn = document.getElementById('captureBtn');
            const videoContainer = document.querySelector('.video-container');

            if (!video || !canvas || !snapshot) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);

            if (videoContainer) videoContainer.classList.add('hidden');

            snapshot.src = this.capturedImage;
            if (snapshotContainer) snapshotContainer.classList.remove('hidden');

            if (captureBtn) captureBtn.classList.add('hidden');

            this.stopCamera();

            showAlert('ถ่ายภาพสำเร็จ', 'success');

        } catch (error) {
            console.error('Capture error:', error);
            showAlert('เกิดข้อผิดพลาดในการถ่ายภาพ', 'danger');
        }
    },

    async retakePhoto() {
        const snapshot = document.getElementById('snapshot');
        const snapshotContainer = document.getElementById('snapshotContainer');
        const videoContainer = document.querySelector('.video-container');
        const captureBtn = document.getElementById('captureBtn');

        this.capturedImage = null;
        if (snapshot) snapshot.src = '';
        if (snapshotContainer) snapshotContainer.classList.add('hidden');

        if (videoContainer) videoContainer.classList.remove('hidden');

        await this.startCamera();
    },

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    getCapturedImage() {
        return this.capturedImage;
    },

    hasCapturedImage() {
        return this.capturedImage !== null;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');

    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', () => {
            FacialRecognition.startCamera();
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            FacialRecognition.capturePhoto();
        });
    }

    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            FacialRecognition.retakePhoto();
        });
    }
});

window.addEventListener('beforeunload', () => {
    FacialRecognition.stopCamera();
});