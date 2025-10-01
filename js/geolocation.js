const GeoLocation = {
    currentPosition: null,
    distance: null,
    isInRange: false,

    isSupported() {
        return 'geolocation' in navigator;
    },

    async getCurrentPosition() {
        if (!this.isSupported()) {
            throw new Error('เบราว์เซอร์ไม่รองรับการตรวจสอบตำแหน่ง');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.currentPosition);
                },
                (error) => {
                    let errorMessage = 'ไม่สามารถดึงตำแหน่งได้';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'คุณไม่อนุญาตให้เข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'ไม่สามารถหาตำแหน่งได้ กรุณาเปิด GPS';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'หมดเวลาในการค้นหาตำแหน่ง';
                            break;
                    }
                    
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    calculateDistanceFromOffice(userLat, userLng) {
        const distance = calculateDistance(
            userLat,
            userLng,
            CONFIG.OFFICE_LOCATION.lat,
            CONFIG.OFFICE_LOCATION.lng
        );
        
        this.distance = Math.round(distance);
        this.isInRange = this.distance <= CONFIG.ALLOWED_RADIUS;
        
        return {
            distance: this.distance,
            isInRange: this.isInRange
        };
    },

    async checkAndUpdateUI() {
        const locationCard = document.getElementById('locationCard');
        const locationStatus = document.getElementById('locationStatus');
        
        if (!locationCard || !locationStatus) return;

        try {

            locationStatus.textContent = CONFIG.MESSAGES.LOCATION_CHECKING;
            locationCard.className = 'card location-card';

            const position = await this.getCurrentPosition();

            const result = this.calculateDistanceFromOffice(
                position.lat,
                position.lng
            );

            if (result.isInRange) {
                locationCard.className = 'card location-card success';
                locationStatus.innerHTML = `
                    ${CONFIG.MESSAGES.LOCATION_OK}<br>
                    <small>ระยะห่าง: ${this.formatDistance(result.distance)}</small>
                `;
            } else {
                locationCard.className = 'card location-card error';
                const distanceText = this.formatDistance(result.distance);
                locationStatus.innerHTML = `คุณอยู่นอกพื้นที่ (${distanceText} จากสำนักงาน)`;
            }

            return result;

        } catch (error) {
            locationCard.className = 'card location-card error';
            locationStatus.textContent = error.message;
            throw error;
        }
    },

    getLocationData() {
        return {
            lat: this.currentPosition?.lat || null,
            lng: this.currentPosition?.lng || null,
            distance: this.distance,
            isInRange: this.isInRange
        };
    },

    openInGoogleMaps(lat, lng) {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    },

    formatDistance(meters) {
        if (meters >= 1000) {
            const km = (meters / 1000).toFixed(2);
            return `${km} km`;
        }
        return `${meters} m`;
    }
};

if (document.getElementById('locationCard')) {
    window.addEventListener('load', () => {
        GeoLocation.checkAndUpdateUI();
    });
}