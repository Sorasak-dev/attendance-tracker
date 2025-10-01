const CONFIG = {

    OFFICE_LOCATION: {
        // ที่อยู่สำนักงาน
        lat: 13.7222904,  // ละติจูด
        lng: 100.5293478  // ลองจิจูด
    },

    ALLOWED_RADIUS: 200, 

    STORAGE_KEY: 'attendance_records',

    TIME_TYPES: {
        'clock-in-morning': {
            label: 'เช้า',
            color: '#10b981'
        },
        'lunch-break': {
            label: 'กลางวัน',
            color: '#f59e0b'
        },
        'back-from-lunch': {
            label: 'บ่าย',
            color: '#3b82f6'
        },
        'clock-out-evening': {
            label: 'เย็น',
            color: '#ef4444'
        }
    },

    CAMERA_CONFIG: {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
        }
    },

    MESSAGES: {
        SUCCESS: 'บันทึกเวลาสำเร็จ!',
        ERROR_NO_EMPLOYEE: 'กรุณากรอกรหัสพนักงานและชื่อ',
        ERROR_NO_PHOTO: 'กรุณาถ่ายภาพใบหน้าก่อน',
        ERROR_LOCATION: 'คุณอยู่นอกพื้นที่ที่อนุญาต',
        ERROR_CAMERA: 'ไม่สามารถเปิดกล้องได้',
        LOCATION_CHECKING: 'กำลังตรวจสอบตำแหน่ง...',
        LOCATION_OK: 'คุณอยู่ในพื้นที่ที่อนุญาต',
        LOCATION_ERROR: 'คุณอยู่นอกพื้นที่ ({distance}m จากสำนักงาน)'
    }
};

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}

function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

    setTimeout(() => {
        alertBox.innerHTML = '';
    }, 5000);
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() + 543; 
    return `${day}/${month}/${year}`;
}

function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

function updateCurrentDateTime() {
    const element = document.getElementById('currentDateTime');
    if (element) {
        setInterval(() => {
            const now = new Date();
            element.textContent = formatDateTime(now);
        }, 1000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCurrentDateTime);
} else {
    updateCurrentDateTime();
}