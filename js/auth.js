const Auth = {
    ADMIN_CREDENTIALS: {
        email: 'admin@gmail.com',
        password: '123456'
    },

    isLoggedIn() {
        const session = sessionStorage.getItem('admin_session');
        if (!session) return false;

        try {
            const data = JSON.parse(session);
            const now = new Date().getTime();
            
            if (now > data.expiry) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    },

    login(email, password) {
        if (email === this.ADMIN_CREDENTIALS.email && 
            password === this.ADMIN_CREDENTIALS.password) {
            
            const expiry = new Date().getTime() + (2 * 60 * 60 * 1000);
            const session = {
                email: email,
                loginTime: new Date().toISOString(),
                expiry: expiry
            };
            
            sessionStorage.setItem('admin_session', JSON.stringify(session));
            return true;
        }
        
        return false;
    },

    logout() {
        sessionStorage.removeItem('admin_session');
        window.location.href = 'index.html';
    },

    protectAdminPage() {
        if (!this.isLoggedIn()) {
            this.showLoginModal();
            return false;
        }
        return true;
    },

    showLoginModal() {
        let modal = document.getElementById('loginModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'loginModal';
            modal.className = 'auth-modal';
            modal.innerHTML = `
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>เข้าสู่ระบบ Admin</h2>
                        <p>กรุณาเข้าสู่ระบบเพื่อดูรายงาน</p>
                    </div>
                    
                    <div id="loginAlert"></div>
                    
                    <form id="loginForm" onsubmit="return false;">
                        <div class="form-group">
                            <label for="adminEmail">Email</label>
                            <input type="email" id="adminEmail" placeholder="Email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="adminPassword">รหัสผ่าน</label>
                            <input type="password" id="adminPassword" placeholder="Password" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" id="loginBtn">
                            เข้าสู่ระบบ
                        </button>
                        
                        <button type="button" class="btn btn-secondary" onclick="window.location.href='index.html'">
                            กลับหน้าหลัก
                        </button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        const handleLogin = (e) => {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;
            const loginAlert = document.getElementById('loginAlert');
            
            if (!email || !password) {
                loginAlert.innerHTML = '<div class="alert alert-danger">กรุณากรอกข้อมูลให้ครบ</div>';
                return;
            }
            
            if (this.login(email, password)) {
                loginAlert.innerHTML = '<div class="alert alert-success">เข้าสู่ระบบสำเร็จ</div>';
                setTimeout(() => {
                    modal.style.display = 'none';
                    window.location.reload();
                }, 500);
            } else {
                loginAlert.innerHTML = '<div class="alert alert-danger">Email หรือรหัสผ่านไม่ถูกต้อง</div>';
            }
        };
        
        loginBtn.onclick = handleLogin;
        loginForm.onsubmit = handleLogin;
        
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin(e);
        });
    }
};

if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        if (!Auth.protectAdminPage()) {
            const container = document.querySelector('.container');
            if (container) container.style.display = 'none';
        } else {
            const header = document.querySelector('.header');
            if (header) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'btn btn-danger btn-sm logout-btn';
                logoutBtn.textContent = 'ออกจากระบบ';
                logoutBtn.onclick = () => Auth.logout();
                header.appendChild(logoutBtn);
            }
        }
    });
}