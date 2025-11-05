import logo from './logo.png';
import './App.css';
import { Pie, Line } from 'react-chartjs-2'; // Thêm Line
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale, // Cần thiết cho Line Chart
  LinearScale,   // Cần thiết cho Line Chart
  PointElement,  // Cần thiết cho Line Chart
  LineElement,   // Cần thiết cho Line Chart
} from 'chart.js';
import { useEffect, useState } from 'react';

// Đăng ký các thành phần cần thiết cho cả Pie và Line Chart
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

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

  // Dữ liệu biểu đồ Pie (Người dùng & Đơn hàng)
  const duLieu = {
    'Tuần 4': { tai: 11, hoatdong: 11, free: 11, pay: 0, don: { tbngay: 0, tong: 0 } },
    'Tuần 5': { tai: 12, hoatdong: 10, free: 7, pay: 3, don: { tbngay: 2, tong: 10 } },
    'Tuần 6': { tai: 19, hoatdong: 15, free: 14, pay: 1, don: { tbngay: 1, tong: 7 } },
    'Tuần 7': { tai: 10, hoatdong: 10, free: 6, pay: 4, don: { tbngay: 5, tong: 35 } },
    'Tuần 8': { tai: 10, hoatdong: 8, free: 8, pay: 0, don: { tbngay: 5, tong: 35 } },
  };

  // Dữ liệu doanh thu Line Chart (dựa trên ảnh)
  // Giả định thứ tự cột trong ảnh là Tuần 5, Tuần 6, Tuần 7, Tuần 8
  const doanhThuTheoTuan = {
    'Tuần 5': {
      hoaHong: 295198, // 295.198 đ
      premium: 87000,  // 87.000 đ
    },
    'Tuần 6': {
      hoaHong: 181020, // 181.020 đ
      premium: 29000,  // 29.000 đ
    },
    'Tuần 7': {
      hoaHong: 150010, // 150.010 đ
      premium: 116000, // 116.000 đ
    },
    'Tuần 8': {
      hoaHong: 126000, // 126.000 đ
      premium: 0,      // 0 đ
    },
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

  // Logic lấy dữ liệu cho Line Chart
  const layDuLieuDoanhThu = () => {
    const labels = Object.keys(doanhThuTheoTuan); // ['Tuần 5', 'Tuần 6', 'Tuần 7', 'Tuần 8']
    const hoaHongData = labels.map(tuan => doanhThuTheoTuan[tuan].hoaHong);
    const premiumData = labels.map(tuan => doanhThuTheoTuan[tuan].premium);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Hoa hồng (Commission 7%)',
          data: hoaHongData,
          borderColor: '#6666FF',
          backgroundColor: 'rgba(102, 102, 255, 0.2)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Doanh số khóa học Premium',
          data: premiumData,
          borderColor: '#A3A3FF',
          backgroundColor: 'rgba(102, 102, 255, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  // Options cho Pie Chart
  const tuyChon = {
    plugins: {
      legend: { position: 'bottom' },
    },
    maintainAspectRatio: false,
  };
  
  // Options cho Line Chart
  const tuyChonLine = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false, text: 'Doanh thu theo Tuần' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Giá trị (VNĐ)' },
        // Định dạng tiền tệ cho trục Y
        ticks: {
          callback: function(value, index, ticks) {
            return value.toLocaleString('vi-VN') + ' đ';
          }
        }
      },
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
            <small>Demo account: <strong>{ADMIN.email}</strong> / <strong>{ADMIN.password}</strong></small>
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
        {/* PIE CHART 1: Người dùng */}
        <div className="bieu-do-card">
          <h2>Người dùng</h2>
          <div className="bieu-do">
            <Pie data={layDuLieuBieuDo('nguoidung')} options={tuyChon} />
          </div>
        </div>

        {/* PIE CHART 2: Đơn hàng */}
        <div className="bieu-do-card">
          <h2>Đơn hàng</h2>
          <div className="bieu-do">
            <Pie data={layDuLieuBieuDo('don')} options={tuyChon} />
          </div>
        </div>

        {/* LINE CHART MỚI: Doanh thu */}
        <div className="bieu-do-card full-width">
          <h2>📊 Hoa hồng & Doanh số khóa học Premium (VNĐ)</h2>
          <div className="bieu-do">
            <Line data={layDuLieuDoanhThu()} options={tuyChonLine} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;