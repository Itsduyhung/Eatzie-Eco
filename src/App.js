import logo from './logo.png';
import './App.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Tài khoản admin demo (CHỈ DÙNG CHO DEMO)
const ADMIN = {
  email: 'hungdeptrai123@gmail.com',
  password: 'eatziesodiff@test'
};

function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    // giữ login trong localStorage cho tiện demo
    const saved = localStorage.getItem('eatzie_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  // Dashboard state
  const [tuanChon, setTuanChon] = useState('Tất cả');

  // Dữ liệu biểu đồ
  const duLieu = {
    'Tuần 4': { tai: 11, hoatdong: 11, free: 11, pay: 0, don: { tbngay: 0, tong: 0 } },
    'Tuần 5': { tai: 12, hoatdong: 10, free: 7, pay: 3, don: { tbngay: 2, tong: 10 } },
    'Tuần 6': { tai: 19, hoatdong: 15, free: 14, pay: 1, don: { tbngay: 4, tong: 7 } },
    'Tuần 7': { tai: 10, hoatdong: 10, free: 6, pay: 4, don: { tbngay: 5, tong: 35 } },
    'Tuần 8': { tai: 10, hoatdong: 8, free: 8, pay: 0, don: { tbngay: 5, tong: 35 } },
  };

  const tongHop = (arr) =>
    arr.reduce((a, b) => ({
      tai: a.tai + b.tai,
      hoatdong: a.hoatdong + b.hoatdong,
      free: a.free + b.free,
      pay: a.pay + b.pay,
      don: {
        tbngay: a.don.tbngay + b.don.tbngay,
        tong: a.don.tong + b.don.tong,
      },
    }));

  const layDuLieuBieuDo = (loai) => {
    const dataTuan = tuanChon === 'Tất cả' ? tongHop(Object.values(duLieu)) : duLieu[tuanChon];

    return loai === 'nguoidung'
      ? {
          labels: ['Lượt tải', 'Người hoạt động', 'Người dùng Free', 'Người dùng trả phí'],
          datasets: [
            {
              data: [dataTuan.tai, dataTuan.hoatdong, dataTuan.free, dataTuan.pay],
              backgroundColor: ['#6666FF', '#8585FF', '#A3A3FF', '#C2C2FF'],
            },
          ],
        }
      : {
          labels: ['Đơn trung bình/ngày', 'Tổng đơn/tuần'],
          datasets: [
            {
              data: [dataTuan.don.tbngay, dataTuan.don.tong],
              backgroundColor: ['#6666FF', '#A3A3FF'],
            },
          ],
        };
  };

  const tuyChon = {
    plugins: {
      legend: { position: 'bottom' },
    },
    maintainAspectRatio: false,
  };

  // Xử lý login
  const handleLogin = (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('Vui lòng nhập email và mật khẩu.');
      return;
    }
    // So sánh với tài khoản demo
    if (email === ADMIN.email && password === ADMIN.password) {
      const u = { email: ADMIN.email, name: 'Admin Eatzie' };
      setUser(u);
      localStorage.setItem('eatzie_user', JSON.stringify(u));
      setEmail('');
      setPassword('');
      setErr('');
    } else {
      setErr('Thông tin đăng nhập không đúng.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eatzie_user');
  };

  useEffect(() => {
    // optional: focus vào email khi mount login
    const input = document.getElementById('email-input');
    if (input && !user) input.focus();
  }, [user]);

  // Nếu chưa login => show Login screen
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src={logo} alt="Eatzie" />
          </div>

          <h1>Đăng nhập quản trị</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eatzie.test"
                autoComplete="username"
              />
            </label>

            <label>
              Mật khẩu
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin@123"
                autoComplete="current-password"
              />
            </label>

            {err && <div className="login-error">{err}</div>}

            <button type="submit" className="login-btn">Đăng nhập</button>
          </form>

          <div className="login-note">
            <small>Demo account: <strong>admin@eatzie.test</strong> / <strong>Admin@123</strong></small>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã login => show Dashboard (như cũ) + nút logout
  const tuans = ['Tất cả','Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7', 'Tuần 8'];

  return (
    <div className="ung-dung">
      <header className="header-bar">
        <div className="hop-logo">
          <img src={logo} alt="Logo Eatzie" className="logo" />
        </div>

        <div className="header-actions">
          <div className="welcome">Xin chào, <strong>{user.name}</strong></div>
          <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      <div className="tuy-chon-hang">
        <select
          value={tuanChon}
          onChange={(e) => setTuanChon(e.target.value)}
          className="chon-tuan"
        >
          {tuans.map((tuan) => (
            <option key={tuan} value={tuan}>
              {tuan}
            </option>
          ))}
        </select>
        {/* giữ filter cũ — nếu muốn thêm button filter mới có thể bật lại */}
      </div>

      <div className="bieu-do-container">
        <div className="bieu-do-card">
          <h2>Người dùng</h2>
          <div className="bieu-do">
            <Pie data={layDuLieuBieuDo('nguoidung')} options={tuyChon} />
          </div>
        </div>

        <div className="bieu-do-card">
          <h2>Đơn hàng</h2>
          <div className="bieu-do">
            <Pie data={layDuLieuBieuDo('don')} options={tuyChon} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
