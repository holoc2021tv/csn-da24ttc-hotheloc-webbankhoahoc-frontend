/**
 * FILE: src/js/profile.js
 * NHIEM VU: Doc va hien thi Ho so ca nhan o che do chi doc (khong cho chinh sua thong tin ca nhan),
 * dong thoi hien thi thong ke va danh sach khoa hoc yeu thich.
 */

document.addEventListener('DOMContentLoaded', function() {
    capNhatHuyHieuGioHang();
    var nguoiDungHienTai = layNguoiDungHienTai();
    if (!nguoiDungHienTai || !nguoiDungHienTai.email) {
        luuThongBaoChoChuyenTrang('Vui lòng đăng nhập để xem Hồ sơ cá nhân!', 'warning');
        luuDuongDanQuayLai(window.location.href);
        window.location.href = layDuongDanTrang('login.html');
        return;
    }
    taiHoSoNguoiDung();
    hienThiKhoaHocYeuThichHoSo();
});

function taiHoSoNguoiDung() {
    var nguoiDungHienTai = layNguoiDungHienTai();
    if (!nguoiDungHienTai) {
        return;
    }

    var danhSachNguoiDung = docDuLieuJSON('EDU_USERS', []);
    var thongTinKhop = nguoiDungHienTai;

    for (var i = 0; i < danhSachNguoiDung.length; i++) {
        if (danhSachNguoiDung[i] && typeof danhSachNguoiDung[i].email === 'string' && typeof nguoiDungHienTai.email === 'string' &&
            danhSachNguoiDung[i].email.toLowerCase() === nguoiDungHienTai.email.toLowerCase()) {
            thongTinKhop = danhSachNguoiDung[i];
            break;
        }
    }

    var chuoiHoTen = thongTinKhop.fullName || 'Học Viên';
    var mangTu = chuoiHoTen.trim().split(' ');
    var chuCaiDau = 'HV';
    if (mangTu.length > 1) {
        chuCaiDau = (mangTu[0].charAt(0) + mangTu[mangTu.length - 1].charAt(0)).toUpperCase();
    } else if (mangTu[0].length > 0) {
        chuCaiDau = mangTu[0].substring(0, 2).toUpperCase();
    }

    var khungAv = document.getElementById('chu-anh-dai-dien-ho-so');
    if (khungAv) {
        var urlAv = kiemTraDuongDanAnToan(thongTinKhop.avatar || '', '');
        if (urlAv !== '') {
            khungAv.innerHTML = '<img src="' + maHoaHTML(urlAv) + '" alt="Ảnh đại diện" class="w-100 h-100 rounded-circle object-fit-cover" referrerpolicy="no-referrer">';
        } else {
            khungAv.textContent = chuCaiDau;
        }
    }
    document.getElementById('ten-hien-thi-ho-so').textContent = thongTinKhop.fullName || 'Học Viên';
    document.getElementById('email-hien-thi-ho-so').textContent = thongTinKhop.email || '';
    document.getElementById('nhan-vai-tro-ho-so').textContent = 'Học viên chính thức';

    document.getElementById('hien-thi-ho-ten-ho-so').textContent = thongTinKhop.fullName || 'Chưa cập nhật';
    document.getElementById('hien-thi-email-ho-so').textContent = thongTinKhop.email || 'Chưa cập nhật';
    document.getElementById('hien-thi-sdt-ho-so').textContent = thongTinKhop.phone || 'Chưa cập nhật';
    document.getElementById('hien-thi-dia-chi-ho-so').textContent = thongTinKhop.address || 'Chưa cập nhật';
    document.getElementById('hien-thi-ngay-tao-ho-so').textContent = thongTinKhop.createdAt || '01/01/2026';

    var tatCaDonHang = layTatCaDonHang();
    var soDonCuaToi = 0;
    var tongSoKhoaHoc = 0;

    for (var j = 0; j < tatCaDonHang.length; j++) {
        var don = tatCaDonHang[j];
        if (!kiemTraTrangThaiDonHopLe(don)) {
            continue;
        }
        if (don && typeof don.customerEmail === 'string' && typeof thongTinKhop.email === 'string' && don.customerEmail.toLowerCase() === thongTinKhop.email.toLowerCase()) {
            soDonCuaToi = soDonCuaToi + 1;
            if (don.items) {
                tongSoKhoaHoc = tongSoKhoaHoc + don.items.length;
            }
        }
    }

    var soYeuThich = layDanhSachMaYeuThich().length;
    document.getElementById('thong-ke-don-hang-ho-so').textContent = String(soDonCuaToi);
    document.getElementById('thong-ke-khoa-hoc-ho-so').textContent = String(tongSoKhoaHoc);
    document.getElementById('thong-ke-yeu-thich-ho-so').textContent = String(soYeuThich);
}

function hienThiKhoaHocYeuThichHoSo() {
    var khungChua = document.getElementById('danh-sach-yeu-thich-ho-so');
    if (!khungChua) {
        return;
    }

    var danhSachYeuThich = layDanhSachKhoaHocYeuThich();
    if (danhSachYeuThich.length === 0) {
        khungChua.className = '';
        var maHTMLRong = '';
        maHTMLRong += '<div class="alert alert-light border text-muted mb-0">';
        maHTMLRong += '  Bạn chưa lưu khóa học yêu thích nào. <a href="' + layDuongDanTrang('courses.html') + '" class="fw-semibold text-decoration-none">Khám phá khóa học ngay</a>';
        maHTMLRong += '</div>';
        khungChua.innerHTML = maHTMLRong;
        return;
    }

    khungChua.className = 'luoi-khoa-hoc-nho';
    var maHTML = '';
    for (var i = 0; i < danhSachYeuThich.length; i++) {
        var khoaHoc = danhSachYeuThich[i];
        var anhAnToan = kiemTraDuongDanAnToan(khoaHoc.image, '');
        var maUrl = encodeURIComponent(khoaHoc.id || '');

        maHTML += '<article class="card border shadow-sm h-100 p-3">';
        maHTML += '  <div class="d-flex align-items-center gap-3">';
        maHTML += '    <img src="' + maHoaHTML(anhAnToan) + '" alt="' + maHoaHTML(khoaHoc.title) + '" class="rounded anh-san-pham-gio-hang">';
        maHTML += '    <div class="overflow-hidden flex-grow-1">';
        maHTML += '      <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrl) + '" class="fw-bold text-dark text-decoration-none d-block text-truncate">' + maHoaHTML(khoaHoc.title) + '</a>';
        maHTML += '      <div class="text-muted small">GV: ' + maHoaHTML(khoaHoc.instructor) + '</div>';
        maHTML += '      <div class="text-danger fw-bold">' + maHoaHTML(dinhDangTienVND(khoaHoc.salePrice)) + '</div>';
        maHTML += '    </div>';
        maHTML += '  </div>';
        maHTML += '</article>';
    }
    khungChua.innerHTML = maHTML;
}

function capNhatGiaoDienKhiDongBoTab(khoaThayDoi) {
    if (khoaThayDoi === 'EDU_FAVORITES' || khoaThayDoi === 'EDU_PURCHASES' || khoaThayDoi === 'EDU_COURSES') {
        taiHoSoNguoiDung();
        hienThiKhoaHocYeuThichHoSo();
    }
}
