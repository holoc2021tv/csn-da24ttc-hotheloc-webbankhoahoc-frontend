/**
 * FILE: src/js/login.js
 * NHIEM VU: Xu ly dang nhap danh rieng cho Hoc vien (chan tai khoan Admin), ho tro dang nhap
 * nhieu tai khoan cung luc (?mode=add), Captcha va quen mat khau mo phong.
 */

var maXacThucDangNhapHienTai = '';

function laCheDoThemTaiKhoan() {
    var thamSo = new URLSearchParams(window.location.search || '');
    return thamSo.get('mode') === 'add';
}

document.addEventListener('DOMContentLoaded', function() {
    var phienHienTai = layNguoiDungHienTai();
    if (phienHienTai && phienHienTai.email && !laCheDoThemTaiKhoan()) {
        window.location.replace(layDuongDanTrang('index.html'));
        return;
    }
    damBaoTaiKhoanQuanTri();
    taoMaXacThucDangNhap();
    ganSuKienBieuMauDangNhap();
    ganSuKienQuenMatKhau();
});

function taoMaXacThucDangNhap() {
    maXacThucDangNhapHienTai = taoMaCaptcha(5);
    var phanTuHienThi = document.getElementById('hien-thi-ma-xac-thuc-dang-nhap');
    if (phanTuHienThi) {
        phanTuHienThi.textContent = maXacThucDangNhapHienTai;
    }
}

function ganSuKienBieuMauDangNhap() {
    var bieuMauDangNhap = document.getElementById('bieu-mau-dang-nhap');
    var nutDoiMa = document.getElementById('nut-doi-ma-xac-thuc-dang-nhap');
    var oNhapMaXacThuc = document.getElementById('o-nhap-ma-xac-thuc-dang-nhap');

    if (nutDoiMa) {
        nutDoiMa.addEventListener('click', function() {
            taoMaXacThucDangNhap();
            if (oNhapMaXacThuc) {
                oNhapMaXacThuc.value = '';
                oNhapMaXacThuc.focus();
            }
        });
    }

    if (!bieuMauDangNhap) {
        return;
    }

    bieuMauDangNhap.addEventListener('submit', function(e) {
        e.preventDefault();

        var email = document.getElementById('email-dang-nhap').value.trim();
        var matKhau = document.getElementById('mat-khau-dang-nhap').value;
        var maDaNhap = oNhapMaXacThuc ? oNhapMaXacThuc.value.trim().toUpperCase() : '';
        var oGhiNho = document.getElementById('ghi-nho-dang-nhap');
        var ghiNhoPhien = oGhiNho ? Boolean(oGhiNho.checked) : true;

        if (maDaNhap !== maXacThucDangNhapHienTai) {
            hienThiThongBao('Mã xác thực Captcha không chính xác! Vui lòng nhập lại.', 'danger');
            taoMaXacThucDangNhap();
            if (oNhapMaXacThuc) {
                oNhapMaXacThuc.value = '';
                oNhapMaXacThuc.focus();
            }
            return;
        }

        damBaoTaiKhoanQuanTri();
        var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
        if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) {
            hienThiThongBao('Dữ liệu tài khoản trong LocalStorage đang bị lỗi định dạng JSON.', 'danger');
            return;
        }

        var danhSachNguoiDung = ketQuaDoc.duLieu;
        var nguoiDungKhop = null;
        for (var i = 0; i < danhSachNguoiDung.length; i++) {
            if (danhSachNguoiDung[i] && typeof danhSachNguoiDung[i].email === 'string' && danhSachNguoiDung[i].email.toLowerCase() === email.toLowerCase() && danhSachNguoiDung[i].password === matKhau) {
                nguoiDungKhop = danhSachNguoiDung[i];
                break;
            }
        }

        if (nguoiDungKhop) {
            if (nguoiDungKhop.role === 'admin' || nguoiDungKhop.email.toLowerCase() === EMAIL_QUAN_TRI_MAC_DINH) {
                hienThiThongBao('Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.', 'danger');
                taoMaXacThucDangNhap();
                return;
            }

            if (nguoiDungKhop.status === 'locked') {
                hienThiThongBao('Tài khoản này đang bị tạm khóa bởi Quản trị viên. Không thể đăng nhập.', 'danger');
                taoMaXacThucDangNhap();
                return;
            }

            var nguoiDungHienTai = {
                id: nguoiDungKhop.id,
                fullName: nguoiDungKhop.fullName,
                email: nguoiDungKhop.email,
                phone: nguoiDungKhop.phone || '0372765126',
                address: nguoiDungKhop.address || 'Trà Vinh, Việt Nam',
                role: 'user',
                createdAt: nguoiDungKhop.createdAt || '',
                rememberSession: ghiNhoPhien
            };

            if (!themHoacCapNhatPhienNguoiDung(nguoiDungHienTai)) {
                hienThiThongBao('Không thể lưu phiên đăng nhập vào trình duyệt (bộ nhớ đầy hoặc bị chặn).', 'danger');
                return;
            }

            var soKhoaDaLoc = locBoKhoaHocDaSoHuuKhoiGio();
            var chuThichLoc = soKhoaDaLoc > 0 ? (' (Đã tự động bỏ ' + soKhoaDaLoc + ' khóa học bạn đã sở hữu khỏi giỏ hàng).') : '';
            var tongSoPhien = layDanhSachPhienDangNhap().length;
            var chuThichDaPhien = tongSoPhien > 1 ? (' Hiện đang đăng nhập song song ' + tongSoPhien + ' tài khoản học viên.') : '';

            luuThongBaoChoChuyenTrang('Đăng nhập thành công! Chào mừng ' + nguoiDungKhop.fullName + ' quay lại.' + chuThichLoc + chuThichDaPhien, 'success');
            var duongDanQuayLai = layVaXoaDuongDanQuayLai();
            window.location.href = duongDanQuayLai ? duongDanQuayLai : layDuongDanTrang('index.html');
        } else {
            hienThiThongBao('Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.', 'danger');
            taoMaXacThucDangNhap();
            if (oNhapMaXacThuc) {
                oNhapMaXacThuc.value = '';
            }
            document.getElementById('mat-khau-dang-nhap').value = '';
            document.getElementById('mat-khau-dang-nhap').focus();
        }
    });
}

var maCaptchaQuenMatKhau = '';

function taoMaCaptchaQuenMatKhau() {
    maCaptchaQuenMatKhau = taoMaCaptcha(5);
    var khung = document.getElementById('hien-thi-captcha-quen-mat-khau');
    if (khung) khung.textContent = maCaptchaQuenMatKhau;
}

function ganSuKienQuenMatKhau() {
    var nutMo = document.getElementById('nut-mo-quen-mat-khau');
    var hopThoai = document.getElementById('hop-thoai-quen-mat-khau');
    var bieuMau = document.getElementById('bieu-mau-quen-mat-khau');
    var nutDoi = document.getElementById('nut-doi-captcha-quen-mat-khau');

    if (nutDoi) {
        nutDoi.addEventListener('click', taoMaCaptchaQuenMatKhau);
    }

    if (nutMo && hopThoai) {
        nutMo.addEventListener('click', function() {
            taoMaCaptchaQuenMatKhau();
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                bootstrap.Modal.getOrCreateInstance(hopThoai).show();
            }
        });
    }

    if (!bieuMau) {
        return;
    }

    bieuMau.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('email-quen-mat-khau').value.trim().toLowerCase();
        var matKhauMoi = document.getElementById('mat-khau-moi-khoi-phuc').value;
        var maNhap = document.getElementById('o-nhap-captcha-quen-mat-khau').value.trim().toUpperCase();

        if (maNhap !== maCaptchaQuenMatKhau) {
            hienThiThongBao('Mã xác thực Captcha không khớp!', 'danger');
            taoMaCaptchaQuenMatKhau();
            return;
        }
        if (matKhauMoi.length < 6) {
            hienThiThongBao('Mật khẩu mới phải có tối thiểu 6 ký tự.', 'warning');
            return;
        }

        damBaoTaiKhoanQuanTri();
        var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
        if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) {
            hienThiThongBao('Dữ liệu EDU_USERS đang bị lỗi định dạng JSON.', 'danger');
            return;
        }

        var danhSach = ketQuaDoc.duLieu.slice();
        var daTimThay = false;
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === email && danhSach[i].role !== 'admin') {
                danhSach[i].password = matKhauMoi;
                daTimThay = true;
                break;
            }
        }

        if (!daTimThay) {
            hienThiThongBao('Không tìm thấy tài khoản học viên với email này!', 'danger');
            taoMaCaptchaQuenMatKhau();
            return;
        }

        if (!luuDuLieuJSON('EDU_USERS', danhSach)) {
            hienThiThongBao('Không thể lưu mật khẩu mới vào LocalStorage.', 'danger');
            return;
        }
        bieuMau.reset();
        if (hopThoai && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(hopThoai).hide();
        }
        hienThiThongBao('Đặt lại mật khẩu thành công (mô phỏng cục bộ trên trình duyệt)! Bạn có thể đăng nhập ngay.', 'success');
    });
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.href = layDuongDanTrang('admin-login.html');
    }
});
