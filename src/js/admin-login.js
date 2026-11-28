/**
 * FILE: src/js/admin-login.js
 * NHIEM VU: Xu ly dang nhap rieng biet cho Quan tri vien (EDU_CURRENT_ADMIN),
 * chan tai khoan hoc vien va khong anh huong den phien dang nhap nguoi dung.
 */

var maXacThucQuanTriHienTai = '';

document.addEventListener('DOMContentLoaded', function() {
    var phienAdmin = layQuanTriVienHienTai();
    if (phienAdmin && phienAdmin.email && phienAdmin.role === 'admin') {
        window.location.replace(layDuongDanTrang('admin.html'));
        return;
    }
    damBaoTaiKhoanQuanTri();
    taoMaXacThucQuanTri();
    ganSuKienDangNhapQuanTri();
});

function taoMaXacThucQuanTri() {
    maXacThucQuanTriHienTai = taoMaCaptcha(5);
    var khungHienThi = document.getElementById('hien-thi-ma-xac-thuc-quan-tri');
    if (khungHienThi) {
        khungHienThi.textContent = maXacThucQuanTriHienTai;
    }
}

function ganSuKienDangNhapQuanTri() {
    var bieuMau = document.getElementById('bieu-mau-dang-nhap-quan-tri');
    var nutDoiMa = document.getElementById('nut-doi-ma-xac-thuc-quan-tri');
    var oNhapMa = document.getElementById('o-nhap-ma-xac-thuc-quan-tri');

    if (nutDoiMa) {
        nutDoiMa.addEventListener('click', function() {
            taoMaXacThucQuanTri();
            if (oNhapMa) {
                oNhapMa.value = '';
                oNhapMa.focus();
            }
        });
    }

    if (!bieuMau) {
        return;
    }

    bieuMau.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('email-dang-nhap-quan-tri').value.trim();
        var matKhau = document.getElementById('mat-khau-dang-nhap-quan-tri').value;
        var maDaNhap = oNhapMa ? oNhapMa.value.trim().toUpperCase() : '';

        if (maDaNhap !== maXacThucQuanTriHienTai) {
            hienThiThongBao('Mã xác thực Captcha không chính xác! Vui lòng nhập lại.', 'danger');
            taoMaXacThucQuanTri();
            if (oNhapMa) {
                oNhapMa.value = '';
                oNhapMa.focus();
            }
            return;
        }

        damBaoTaiKhoanQuanTri();
        var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
        if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) {
            hienThiThongBao('Dữ liệu tài khoản đang bị lỗi định dạng JSON.', 'danger');
            return;
        }

        var danhSach = ketQuaDoc.duLieu;
        var taiKhoanKhop = null;
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === email.toLowerCase() && danhSach[i].password === matKhau) {
                taiKhoanKhop = danhSach[i];
                break;
            }
        }

        if (!taiKhoanKhop) {
            hienThiThongBao('Email hoặc mật khẩu Quản trị viên không chính xác!', 'danger');
            taoMaXacThucQuanTri();
            if (oNhapMa) {
                oNhapMa.value = '';
            }
            document.getElementById('mat-khau-dang-nhap-quan-tri').value = '';
            return;
        }

        if (taiKhoanKhop.role !== 'admin') {
            hienThiThongBao('Tài khoản này là tài khoản Học viên, không có quyền vào cổng Quản trị!', 'warning');
            taoMaXacThucQuanTri();
            return;
        }

        if (taiKhoanKhop.status === 'locked') {
            hienThiThongBao('Tài khoản Quản trị này đang bị khóa.', 'danger');
            taoMaXacThucQuanTri();
            return;
        }

        var phienAdminMoi = {
            id: taiKhoanKhop.id,
            fullName: taiKhoanKhop.fullName,
            email: taiKhoanKhop.email,
            phone: taiKhoanKhop.phone || '0372765126',
            address: taiKhoanKhop.address || 'Trà Vinh, Việt Nam',
            role: 'admin'
        };

        if (!luuQuanTriVienHienTai(phienAdminMoi)) {
            hienThiThongBao('Không thể lưu phiên Quản trị vào LocalStorage.', 'danger');
            return;
        }

        datPhienRiengCuaTab('__admin_tab__');
        luuThongBaoChoChuyenTrang('Đăng nhập Quản trị viên (Admin) thành công!', 'success');
        window.location.href = layDuongDanTrang('admin.html');
    });
}
