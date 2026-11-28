/**
 * FILE: src/js/checkout.js
 * NHIEM VU: Tinh toan gia tri don hang tu danh muc khoa hoc moi nhat, rang buoc tai khoan dang nhap,
 * xu ly thanh toan mo phong an toan (chong don hang do dang / trung lap khi thu lai) va hien thi ma QR minh hoa.
 */

var maVoucherDangApDung = '';
var soTienGiamDangApDung = 0;
var dangXuLyThanhToan = false;
var khoaChongTrungDonCuoi = '';
var thongTinMaThanhToanHienTai = null;

function chupSnapshotLocalStorageThanhToan() {
    var cacKhoa = ['EDU_PURCHASES', 'EDU_COURSES', 'EDU_ANALYTICS_LOGS', 'EDU_COUPONS', 'EDU_CART_ITEMS', 'EDU_PENDING_VIETQR', 'EDU_VIETQR_SIMULATED_PAID', 'EDU_PAYMENT_COUNTER'];
    return chupSnapshotLocalStorage(cacKhoa);
}

function khoiPhucSnapshotLocalStorageThanhToan(snapshot) {
    return khoiPhucSnapshotLocalStorage(snapshot);
}

document.addEventListener('DOMContentLoaded', function() {
    capNhatHuyHieuGioHang();
    dienSanThongTinNguoiDung();
    khoiPhucHoacTaoDonVietQR();
    ganSuKienCopyNhanhVietQR();
    hienThiTomTatDonHang();
    ganSuKienChonThanhToan();
    ganSuKienVoucherThanhToan();
    ganSuKienBieuMauThanhToan();
});

/**
 * Lay tai khoan dang dang nhap da doi chieu voi EDU_USERS
 */

function taoMaQRSVG(chuoiMa) {
    var kichThuoc = 11;
    var oVuong = 12;
    var dem = 12;
    var tongRong = kichThuoc * oVuong + dem * 2;
    var maBam = 0;
    var chuoi = String(chuoiMa || 'EDUCOURSES');
    for (var idx = 0; idx < chuoi.length; idx++) {
        maBam = ((maBam << 5) - maBam + chuoi.charCodeAt(idx)) | 0;
    }

    var svg = '<svg viewBox="0 0 ' + tongRong + ' ' + tongRong + '" width="144" height="144" role="img" aria-label="Mã QR thanh toán duy nhất">';
    svg += '<rect x="0" y="0" width="' + tongRong + '" height="' + tongRong + '" fill="#ffffff"/>';
    for (var r = 0; r < kichThuoc; r++) {
        for (var c = 0; c < kichThuoc; c++) {
            var goc = (r < 3 && c < 3) || (r < 3 && c >= kichThuoc - 3) || (r >= kichThuoc - 3 && c < 3);
            var bit = ((maBam >> ((r * kichThuoc + c) % 24)) + r * 7 + c * 13 + chuoi.charCodeAt((r + c) % chuoi.length)) % 2 === 0;
            if (goc || bit) {
                svg += '<rect x="' + (dem + c * oVuong) + '" y="' + (dem + r * oVuong) + '" width="' + (oVuong - 1) + '" height="' + (oVuong - 1) + '" rx="1.5" fill="#1e293b"/>';
            }
        }
    }
    svg += '</svg>';
    return svg;
}

function lamMoiMaThanhToanPhienHienTai() {
    var taiKhoan = layTaiKhoanThanhToanHopLe();
    var email = (taiKhoan && taiKhoan.email) ? taiKhoan.email : 'guest';
    thongTinMaThanhToanHienTai = taoMaThanhToanDuyNhat(email);

    var oMa = document.getElementById('hien-thi-ma-thanh-toan');
    if (oMa) {
        oMa.textContent = thongTinMaThanhToanHienTai.paymentCode;
    }
    var oQR = document.getElementById('khung-svg-ma-qr');
    if (oQR) {
        oQR.innerHTML = taoMaQRSVG(thongTinMaThanhToanHienTai.paymentCode);
    }
    var ghiChuQR = document.getElementById('noi-dung-chuyen-khoan-qr');
    if (ghiChuQR) {
        ghiChuQR.textContent = 'Nội dung chuyển khoản: ' + thongTinMaThanhToanHienTai.transferContent;
    }
}


var NGAN_HANG_VIETQR = 'MB';
var STK_VIETQR = '0372765126';
var TEN_TK_VIETQR = 'EDUCOURSES DEMO';
var boDemNguocVietQRId = null;
var boKiemTraTrangThaiId = null;

function khoiPhucHoacTaoDonVietQR() {
    var donCho = layDonVietQRDangCho();
    var taiKhoan = layTaiKhoanThanhToanHopLe();
    var email = (taiKhoan && taiKhoan.email) ? taiKhoan.email : 'guest';
    if (donCho && donCho.userEmail === email && donCho.discountCode) {
        maVoucherDangApDung = donCho.discountCode;
    }
    var ketQuaTinh = tinhToanGiaTriDonHang(layGioHang(), maVoucherDangApDung);
    var soTien = ketQuaTinh.hopLe ? Number(ketQuaTinh.tongThanhToan || 0) : 0;

    if (!donCho || donCho.userEmail !== email || Number(donCho.amount) !== soTien) {
        var snapshot = chupSnapshotLocalStorage(['EDU_PENDING_VIETQR', 'EDU_VIETQR_SIMULATED_PAID', 'EDU_PAYMENT_COUNTER']);
        if (!snapshot) {
            hienThiThongBao('Không thể đọc LocalStorage để tạo phiên VietQR.', 'danger');
            return false;
        }
        var thongTinMa = taoMaThanhToanDuyNhat(email);
        var maNgan = 'KH' + String(Math.floor(1000 + Math.random() * 9000));
        donCho = {
            orderCode: maNgan,
            paymentCode: thongTinMa.paymentCode,
            transferContent: maNgan,
            amount: soTien,
            userEmail: email,
            expiresAt: Date.now() + (15 * 60 * 1000),
            status: 'PENDING'
        };
        if (!luuDonVietQRDangCho(donCho) || !datTrangThaiWebhookGiaLap(maNgan, false)) {
            var khoiPhucThanhCong = khoiPhucSnapshotLocalStorage(snapshot);
            hienThiThongBao(khoiPhucThanhCong
                ? 'Không thể lưu phiên VietQR. Dữ liệu trước đó đã được khôi phục.'
                : 'Không thể lưu phiên VietQR và không thể khôi phục đầy đủ dữ liệu LocalStorage.', 'danger');
            return false;
        }
    }

    thongTinMaThanhToanHienTai = {
        paymentCode: donCho.orderCode,
        transferContent: donCho.orderCode
    };
    capNhatGiaoDienVietQR(donCho);
    batDauDemNguoc15Phut(donCho);
    return true;
}

function capNhatGiaoDienVietQR(donCho) {
    if (!donCho) return;
    var oMa = document.getElementById('hien-thi-ma-thanh-toan');
    if (oMa) oMa.textContent = donCho.orderCode;

    var oTien = document.getElementById('vietqr-so-tien');
    if (oTien) oTien.textContent = dinhDangTienVND(donCho.amount || 0);

    var ghiChuQR = document.getElementById('noi-dung-chuyen-khoan-qr');
    if (ghiChuQR) {
        ghiChuQR.textContent = 'Nội dung chuyển khoản bắt buộc: ' + donCho.orderCode + ' (' + dinhDangTienVND(donCho.amount || 0) + ')';
    }

    var oQR = document.getElementById('khung-svg-ma-qr');
    if (oQR) oQR.innerHTML = taoMaQRSVG(donCho.orderCode);

    var anhVietQR = document.getElementById('anh-vietqr-dong');
    if (anhVietQR && Number(donCho.amount) > 0) {
        var urlVietQR = 'https://img.vietqr.io/image/' + NGAN_HANG_VIETQR + '-' + STK_VIETQR + '-qr_only.png?amount=' + encodeURIComponent(donCho.amount) + '&addInfo=' + encodeURIComponent(donCho.orderCode) + '&accountName=' + encodeURIComponent(TEN_TK_VIETQR);
        anhVietQR.onload = function() {
            anhVietQR.classList.remove('d-none');
            if (oQR) oQR.classList.add('d-none');
            var ghiChuMinhHoaCu = document.getElementById('ghi-chu-qr-minh-hoa');
            if (ghiChuMinhHoaCu && ghiChuMinhHoaCu.parentNode) ghiChuMinhHoaCu.parentNode.removeChild(ghiChuMinhHoaCu);
        };
        anhVietQR.onerror = function() {
            anhVietQR.classList.add('d-none');
            if (oQR) oQR.classList.remove('d-none');
            var ghiChuMinhHoa = document.getElementById('ghi-chu-qr-minh-hoa');
            if (!ghiChuMinhHoa && oQR) {
                ghiChuMinhHoa = document.createElement('div');
                ghiChuMinhHoa.id = 'ghi-chu-qr-minh-hoa';
                ghiChuMinhHoa.className = 'small text-danger mt-2';
                ghiChuMinhHoa.textContent = 'Mã QR minh họa (chế độ mô phỏng offline, không quét thanh toán thật)';
                oQR.parentNode.insertBefore(ghiChuMinhHoa, oQR.nextSibling);
            }
        };
        anhVietQR.src = urlVietQR;
    }
}

function batDauDemNguoc15Phut(donCho) {
    if (boDemNguocVietQRId) {
        clearInterval(boDemNguocVietQRId);
        boDemNguocVietQRId = null;
    }
    var oDongHo = document.getElementById('dong-ho-dem-nguoc-vietqr');
    if (!oDongHo || !donCho) return;

    function capNhatDongHo() {
        var conLaiMs = Number(donCho.expiresAt) - Date.now();
        if (conLaiMs <= 0) {
            oDongHo.textContent = '00:00';
            clearInterval(boDemNguocVietQRId);
            boDemNguocVietQRId = null;
            if (boKiemTraTrangThaiId) {
                clearInterval(boKiemTraTrangThaiId);
                boKiemTraTrangThaiId = null;
            }
            xoaDonVietQRDangCho();
            hienThiThongBao('Phiên thanh toán VietQR đã hết hạn 15 phút. Đang tạo mã đơn mới!', 'warning');
            khoiPhucHoacTaoDonVietQR();
            return;
        }
        var tongGiay = Math.floor(conLaiMs / 1000);
        var phut = Math.floor(tongGiay / 60);
        var giay = tongGiay % 60;
        oDongHo.textContent = (phut < 10 ? '0' + phut : phut) + ':' + (giay < 10 ? '0' + giay : giay);
    }

    capNhatDongHo();
    boDemNguocVietQRId = setInterval(capNhatDongHo, 1000);
}

function batDauVongLapKiemTraVietQR(thongTinNguoiMua) {
    if (boKiemTraTrangThaiId) {
        clearInterval(boKiemTraTrangThaiId);
    }
    var donCho = layDonVietQRDangCho();
    if (!donCho) {
        khoiPhucHoacTaoDonVietQR();
        donCho = layDonVietQRDangCho();
    }

    var oTrangThai = document.getElementById('trang-thai-cho-vietqr');
    var nutWebhookTest = document.getElementById('nut-mo-phong-webhook-paid');
    if (oTrangThai) oTrangThai.classList.remove('d-none');
    if (nutWebhookTest) {
        nutWebhookTest.classList.remove('d-none');
        if (nutWebhookTest.getAttribute('data-da-gan-webhook') !== '1') {
            nutWebhookTest.setAttribute('data-da-gan-webhook', '1');
            nutWebhookTest.addEventListener('click', function() {
                var donDangCho = layDonVietQRDangCho();
                if (!donDangCho || !donDangCho.orderCode) {
                    hienThiThongBao('Không tìm thấy mã đơn VietQR đang chờ đối soát.', 'warning');
                    return;
                }
                if (!datTrangThaiWebhookGiaLap(donDangCho.orderCode, true)) {
                    hienThiThongBao('Không thể lưu tín hiệu PAID mô phỏng vào LocalStorage.', 'danger');
                    return;
                }
                hienThiThongBao('Đã gửi tín hiệu Webhook PAID cho mã ' + donDangCho.orderCode + '. Hệ thống đang tự xác nhận...', 'info');
            });
        }
    }

    boKiemTraTrangThaiId = setInterval(function() {
        var donHienTai = layDonVietQRDangCho();
        if (!donHienTai) {
            clearInterval(boKiemTraTrangThaiId);
            boKiemTraTrangThaiId = null;
            return;
        }
        if (kiemTraTrangThaiWebhookGiaLap(donHienTai.orderCode)) {
            var ketQuaXacNhan = taoVaLuuDonHangMoPhong(thongTinNguoiMua, true);
            if (ketQuaXacNhan && ketQuaXacNhan.success) {
                clearInterval(boKiemTraTrangThaiId);
                clearInterval(boDemNguocVietQRId);
                boKiemTraTrangThaiId = null;
                boDemNguocVietQRId = null;
                window.location.href = layDuongDanTrang('my-courses.html');
            }
        }
    }, 3000);
}

function taoDonHangChoVietQR(thongTinNguoiMua) {
    var donCho = layDonVietQRDangCho();
    var ketQuaTinh = tinhToanGiaTriDonHang(thongTinNguoiMua.danhSachGioHang, maVoucherDangApDung);
    if (!donCho || !ketQuaTinh.hopLe || ketQuaTinh.tongThanhToan <= 0) {
        hienThiThongBao('Không thể tạo đơn chờ VietQR. Vui lòng kiểm tra lại giỏ hàng và tổng tiền.', 'danger');
        return { success: false };
    }

    var ketQuaDocDon = docDuLieuJSONCoTrangThai(KHOA_LUU_DON_HANG, true);
    if (ketQuaDocDon.tonTai && !ketQuaDocDon.hopLe) {
        hienThiThongBao('Dữ liệu lịch sử đơn hàng trong LocalStorage đang gặp lỗi.', 'danger');
        return { success: false };
    }
    var danhSachDon = ketQuaDocDon.duLieu.slice();
    var donDaCo = null;
    for (var i = 0; i < danhSachDon.length; i++) {
        if (danhSachDon[i] && danhSachDon[i].transferContent === donCho.orderCode && danhSachDon[i].orderStatus === 'pending') {
            donDaCo = danhSachDon[i];
            break;
        }
    }
    if (!donDaCo) {
        var snapshot = chupSnapshotLocalStorageThanhToan();
        if (!snapshot) {
            hienThiThongBao('Không thể đọc dữ liệu LocalStorage để tạo đơn chờ.', 'danger');
            return { success: false };
        }
        var cacMonCho = [];
        for (var j = 0; j < ketQuaTinh.danhSachMonHopLe.length; j++) {
            var monCho = ketQuaTinh.danhSachMonHopLe[j];
            cacMonCho.push({
                id: monCho.id,
                title: monCho.title,
                instructor: monCho.instructor,
                image: monCho.image,
                salePrice: monCho.salePrice,
                quantity: monCho.quantity,
                itemStatus: 'Chờ xác nhận thanh toán'
            });
        }
        var donMoi = {
            orderId: taoMaDuyNhat('ORD', danhSachDon, 'orderId'),
            userId: thongTinNguoiMua.userId || '',
            customerName: thongTinNguoiMua.hoTen,
            customerEmail: thongTinNguoiMua.email,
            customerPhone: thongTinNguoiMua.soDienThoai,
            paymentCode: donCho.orderCode,
            transferContent: donCho.orderCode,
            paymentMethod: 'VietQR (mô phỏng)',
            paymentSimulation: true,
            orderStatus: 'pending',
            status: 'Chờ xác nhận thanh toán VietQR',
            dateISO: layChuoiNgayHomNay(),
            createdAt: new Date().toLocaleString('vi-VN'),
            subtotalAmount: ketQuaTinh.tongTamTinh,
            discountCode: ketQuaTinh.maVoucherHopLe,
            discountAmount: ketQuaTinh.soTienGiam,
            totalAmount: ketQuaTinh.tongThanhToan,
            items: cacMonCho
        };
        danhSachDon.unshift(donMoi);
        donCho.purchaseOrderId = donMoi.orderId;
        donCho.discountCode = ketQuaTinh.maVoucherHopLe;
        if (!luuTatCaDonHang(danhSachDon) || !luuDonVietQRDangCho(donCho)) {
            var khoiPhucThanhCong = khoiPhucSnapshotLocalStorageThanhToan(snapshot);
            hienThiThongBao(khoiPhucThanhCong ? 'Không thể lưu đơn chờ VietQR. Dữ liệu trước đó đã được khôi phục.' : 'Không thể lưu đơn chờ VietQR và cũng không thể khôi phục đầy đủ dữ liệu.', 'danger');
            return { success: false };
        }
    }

    batDauVongLapKiemTraVietQR(thongTinNguoiMua);
    hienThiThongBao('Đơn hàng đang chờ xác nhận PAID mô phỏng. Khóa học chưa được kích hoạt.', 'info');
    return { success: true, pending: true };
}

function ganSuKienCopyNhanhVietQR() {
    var cacNutCopy = document.querySelectorAll('.nut-copy-nhanh-vietqr');
    for (var i = 0; i < cacNutCopy.length; i++) {
        cacNutCopy[i].addEventListener('click', function() {
            var idMucTieu = this.getAttribute('data-muc-tieu');
            var el = document.getElementById(idMucTieu);
            if (!el) return;
            var text = String(el.textContent || '').trim();
            if (idMucTieu === 'vietqr-so-tien') {
                text = text.replace(/[^0-9]/g, '');
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text);
            }
            hienThiThongBao('Đã sao chép: ' + text, 'success');
        });
    }
}

function layTaiKhoanThanhToanHopLe() {
    var phienHienTai = layNguoiDungHienTai();
    if (!phienHienTai || !phienHienTai.email) {
        return null;
    }

    var emailChuan = String(phienHienTai.email).trim().toLowerCase();
    var danhSachNguoiDung = docDuLieuJSON('EDU_USERS', []);
    for (var i = 0; i < danhSachNguoiDung.length; i++) {
        var u = danhSachNguoiDung[i];
        if (u && u.email && String(u.email).trim().toLowerCase() === emailChuan) {
            return u;
        }
    }
    return phienHienTai;
}

function dienSanThongTinNguoiDung() {
    var thongTinDayDu = layTaiKhoanThanhToanHopLe();
    if (!thongTinDayDu) {
        return;
    }

    var oHoTen = document.getElementById('ho-ten-thanh-toan');
    var oEmail = document.getElementById('email-thanh-toan');
    var oSoDienThoai = document.getElementById('so-dien-thoai-thanh-toan');
    var oDiaChi = document.getElementById('dia-chi-thanh-toan');
    var nhanTrangThai = document.getElementById('nhan-trang-thai-dang-nhap');

    if (oHoTen && thongTinDayDu.fullName) {
        oHoTen.value = thongTinDayDu.fullName;
        oHoTen.readOnly = true;
    }
    if (oEmail && thongTinDayDu.email) {
        oEmail.value = thongTinDayDu.email;
        oEmail.readOnly = true;
    }
    if (oSoDienThoai && thongTinDayDu.phone) {
        oSoDienThoai.value = thongTinDayDu.phone;
        oSoDienThoai.readOnly = true;
    }
    if (oDiaChi) {
        oDiaChi.value = thongTinDayDu.address || 'Chưa có địa chỉ mặc định';
        oDiaChi.readOnly = true;
    }
    if (nhanTrangThai) {
        nhanTrangThai.classList.remove('d-none');
    }
}

function ganSuKienChonThanhToan() {
    var cacNutCheDoNhan = document.querySelectorAll('input[name="recipientMode"]');
    var khungDiaChiKhac = document.getElementById('hop-nhap-dia-chi-khac');
    var nutChonKhac = document.getElementById('che-do-nguoi-nhan-khac');
    var oSdtKhac = document.getElementById('so-dien-thoai-nguoi-nhan-khac');
    if (oSdtKhac) {
        ganChiChoNhapSo(oSdtKhac);
    }

    for (var r = 0; r < cacNutCheDoNhan.length; r++) {
        cacNutCheDoNhan[r].addEventListener('change', function() {
            if (khungDiaChiKhac && nutChonKhac) {
                if (nutChonKhac.checked) {
                    khungDiaChiKhac.classList.remove('d-none');
                } else {
                    khungDiaChiKhac.classList.add('d-none');
                }
            }
        });
    }

    var nutTaoLaiMa = document.getElementById('nut-tao-lai-ma-thanh-toan');
    if (nutTaoLaiMa) {
        nutTaoLaiMa.addEventListener('click', function() {
            if (boKiemTraTrangThaiId) {
                clearInterval(boKiemTraTrangThaiId);
                boKiemTraTrangThaiId = null;
            }
            var oTTCho = document.getElementById('trang-thai-cho-vietqr');
            var nutWH = document.getElementById('nut-mo-phong-webhook-paid');
            if (oTTCho) oTTCho.classList.add('d-none');
            if (nutWH) nutWH.classList.add('d-none');
            xoaDonVietQRDangCho();
            khoiPhucHoacTaoDonVietQR();
            hienThiThongBao('Đã sinh mã đơn VietQR mới (đếm ngược 15 phút)!', 'info');
        });
    }

    var cacNutPhuongThuc = document.querySelectorAll('input[name="paymentMethod"]');
    var khungMaQR = document.getElementById('khung-thanh-toan-qr');
    var nutChonQR = document.getElementById('phuong-thuc-ma-qr');

    for (var i = 0; i < cacNutPhuongThuc.length; i++) {
        cacNutPhuongThuc[i].addEventListener('change', function() {
            if (khungMaQR && nutChonQR) {
                var ketQuaTinh = tinhToanGiaTriDonHang(layGioHang(), maVoucherDangApDung);
                if (nutChonQR.checked && ketQuaTinh.hopLe && ketQuaTinh.tongThanhToan > 0) {
                    khungMaQR.classList.remove('d-none');
                } else {
                    khungMaQR.classList.add('d-none');
                }
                hienThiTomTatDonHang();
            }
        });
    }
}

/**
 * Ham tinh toan tap trung duy nhat cho ca hien thi tom tat va tao don hang
 * Luon doc gia moi nhat tu EDU_COURSES, kiem tra so huu han khong am va phat hien thay doi gia.
 */
function tinhToanGiaTriDonHang(danhSachGioHang, maVoucher) {
    if (!Array.isArray(danhSachGioHang) || danhSachGioHang.length === 0) {
        return {
            hopLe: false,
            lyDo: 'Giỏ hàng của bạn đang trống.',
            tongTamTinh: 0,
            soTienGiam: 0,
            tongThanhToan: 0,
            maVoucherHopLe: '',
            coThayDoiGia: false,
            danhSachMonHopLe: []
        };
    }

    var tongTamTinh = 0;
    var coThayDoiGia = false;
    var danhSachMonHopLe = [];

    for (var i = 0; i < danhSachGioHang.length; i++) {
        var mucGio = danhSachGioHang[i];
        if (!mucGio || !mucGio.id) {
            return { hopLe: false, lyDo: 'Có sản phẩm không hợp lệ trong giỏ hàng.' };
        }

        var khoaHocHienHanh = timKhoaHocTheoMa(mucGio.id);
        if (!khoaHocHienHanh) {
            return {
                hopLe: false,
                lyDo: 'Khóa học "' + (mucGio.title || mucGio.id) + '" không còn tồn tại trong danh mục. Vui lòng xóa khỏi giỏ hàng.'
            };
        }
        if (!kiemTraKhoaHocDangMo(khoaHocHienHanh)) {
            return {
                hopLe: false,
                lyDo: 'Khóa học "' + khoaHocHienHanh.title + '" hiện đang tạm ẩn và ngừng mở bán mới. Vui lòng xóa khỏi giỏ hàng.'
            };
        }

        if (kiemTraDaMuaKhoaHoc(khoaHocHienHanh.id)) {
            return {
                hopLe: false,
                lyDo: 'Bạn đã sở hữu khóa học "' + khoaHocHienHanh.title + '". Vui lòng xóa khỏi giỏ hàng trước khi thanh toán.'
            };
        }

        var donGiaMoiNhat = Number(khoaHocHienHanh.salePrice);
        var soLuong = Number(mucGio.quantity || 1);

        if (!isFinite(donGiaMoiNhat) || isNaN(donGiaMoiNhat) || donGiaMoiNhat < 0 || !isFinite(soLuong) || isNaN(soLuong) || soLuong <= 0) {
            return {
                hopLe: false,
                lyDo: 'Giá hoặc số lượng của khóa học "' + khoaHocHienHanh.title + '" không hợp lệ.'
            };
        }

        var giaCuTrongGio = mucGio.salePrice !== undefined ? Number(mucGio.salePrice) : donGiaMoiNhat;
        if (isFinite(giaCuTrongGio) && giaCuTrongGio !== donGiaMoiNhat) {
            coThayDoiGia = true;
        }

        var thanhTien = donGiaMoiNhat * soLuong;
        tongTamTinh = tongTamTinh + thanhTien;

        danhSachMonHopLe.push({
            id: khoaHocHienHanh.id,
            title: khoaHocHienHanh.title,
            instructor: khoaHocHienHanh.instructor || 'Giảng viên EduCourses',
            image: khoaHocHienHanh.image || '',
            salePrice: donGiaMoiNhat,
            quantity: soLuong,
            thanhTien: thanhTien,
            itemStatus: 'Chờ xác nhận mô phỏng'
        });
    }

    if (!isFinite(tongTamTinh) || isNaN(tongTamTinh) || tongTamTinh < 0) {
        return { hopLe: false, lyDo: 'Tổng tiền tạm tính không hợp lệ.' };
    }

    var ketQuaGiam = (maVoucher && maVoucher !== '') ? tinhGiamGiaVoucher(maVoucher, tongTamTinh) : { hopLe: false, ma: '', soTienGiam: 0 };
    var soTienGiam = ketQuaGiam.hopLe ? Number(ketQuaGiam.soTienGiam || 0) : 0;
    if (!isFinite(soTienGiam) || isNaN(soTienGiam) || soTienGiam < 0) {
        soTienGiam = 0;
    }

    var tongThanhToan = tongTamTinh - soTienGiam;
    if (tongThanhToan < 0) {
        tongThanhToan = 0;
    }

    return {
        hopLe: true,
        lyDo: '',
        tongTamTinh: tongTamTinh,
        soTienGiam: soTienGiam,
        tongThanhToan: tongThanhToan,
        maVoucherHopLe: ketQuaGiam.hopLe ? ketQuaGiam.ma : '',
        coThayDoiGia: coThayDoiGia,
        danhSachMonHopLe: danhSachMonHopLe
    };
}

function hienThiTomTatDonHang() {
    var khungTomTat = document.getElementById('tom-tat-don-hang-thanh-toan');
    var phanTuTongTien = document.getElementById('tong-tien-thanh-toan');

    if (!khungTomTat) {
        return;
    }

    var danhSachGioHang = layGioHang();
    if (danhSachGioHang.length === 0) {
        khungTomTat.innerHTML = '<div class="text-muted text-center py-3">Không có sản phẩm nào để thanh toán.</div>';
        if (phanTuTongTien) {
            phanTuTongTien.textContent = '0đ';
        }
        return;
    }

    var ketQuaTinh = tinhToanGiaTriDonHang(danhSachGioHang, maVoucherDangApDung);
    if (!ketQuaTinh.hopLe) {
        khungTomTat.innerHTML = '<div class="alert alert-warning small mb-0">' + maHoaHTML(ketQuaTinh.lyDo) + '</div>';
        if (phanTuTongTien) {
            phanTuTongTien.textContent = '0đ';
        }
        return;
    }

    var maHTML = '';
    if (ketQuaTinh.coThayDoiGia) {
        maHTML += '<div class="alert alert-warning py-2 px-3 small mb-3"><i class="bi bi-exclamation-triangle-fill me-1"></i>Học phí một số khóa học đã được cập nhật theo bảng giá mới nhất. Vui lòng kiểm tra kỹ trước khi xác nhận.</div>';
    }

    for (var i = 0; i < ketQuaTinh.danhSachMonHopLe.length; i++) {
        var sanPham = ketQuaTinh.danhSachMonHopLe[i];
        var anhAnToan = kiemTraDuongDanAnToan(sanPham.image, '');
        var tieuDeAnToan = maHoaHTML(sanPham.title || 'Không có tên');

        maHTML += '<div class="d-flex justify-content-between align-items-center mb-3">';
        maHTML += '  <div class="d-flex align-items-center gap-3">';
        maHTML += '    <div class="position-relative">';
        maHTML += '      <img src="' + maHoaHTML(anhAnToan) + '" alt="' + tieuDeAnToan + '" class="rounded anh-san-pham-thanh-toan">';
        maHTML += '      <div class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">' + sanPham.quantity + '</div>';
        maHTML += '    </div>';
        maHTML += '    <div>';
        maHTML += '      <div class="fw-semibold text-truncate ten-san-pham-thanh-toan" title="' + tieuDeAnToan + '">' + tieuDeAnToan + '</div>';
        maHTML += '      <div class="text-muted fs-6">' + maHoaHTML(dinhDangTienVND(sanPham.salePrice)) + '</div>';
        maHTML += '    </div>';
        maHTML += '  </div>';
        maHTML += '  <div class="fw-bold text-dark">' + maHoaHTML(dinhDangTienVND(sanPham.thanhTien)) + '</div>';
        maHTML += '</div>';
    }

    khungTomTat.innerHTML = maHTML;

    soTienGiamDangApDung = ketQuaTinh.soTienGiam;
    var tongSauGiam = ketQuaTinh.tongThanhToan;

    var dongGiam = document.getElementById('dong-giam-gia-thanh-toan');
    var oTienGiam = document.getElementById('so-tien-giam-thanh-toan');
    if (dongGiam && oTienGiam) {
        if (soTienGiamDangApDung > 0) {
            dongGiam.classList.remove('d-none');
            oTienGiam.textContent = '-' + dinhDangTienVND(soTienGiamDangApDung);
        } else {
            dongGiam.classList.add('d-none');
        }
    }

    if (phanTuTongTien) {
        phanTuTongTien.textContent = dinhDangTienVND(tongSauGiam);
    }

    var ghiChuQR = document.getElementById('noi-dung-chuyen-khoan-qr');
    if (ghiChuQR && thongTinMaThanhToanHienTai) {
        ghiChuQR.textContent = 'Nội dung chuyển khoản: ' + thongTinMaThanhToanHienTai.transferContent + ' (' + dinhDangTienVND(tongSauGiam) + ')';
    }

    var khungMaQR = document.getElementById('khung-thanh-toan-qr');
    var nutChonQR = document.getElementById('phuong-thuc-ma-qr');
    var nutHoanTat = document.querySelector('#bieu-mau-thanh-toan button[type="submit"]');
    if (tongSauGiam <= 0) {
        if (khungMaQR) khungMaQR.classList.add('d-none');
        if (nutHoanTat) nutHoanTat.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Kích hoạt khóa học miễn phí (0đ - Mô phỏng)';
    } else {
        if (khungMaQR && nutChonQR && nutChonQR.checked) {
            khungMaQR.classList.remove('d-none');
        }
        if (nutHoanTat) nutHoanTat.innerHTML = (nutChonQR && nutChonQR.checked) ? '<i class="bi bi-qr-code-scan me-2"></i>Xác Nhận Tạo Mã VietQR &amp; Tự Động Đối Soát' : '<i class="bi bi-check-circle-fill me-2"></i>Hoàn Tất Thanh Toán (Mô Phỏng)';
    }
}

function kiemTraDuLieuThanhToan(oSoDienThoai) {
    // Bat buoc dang nhap va gan chat don hang voi tai khoan hien tai
    var taiKhoanHopLe = layTaiKhoanThanhToanHopLe();
    if (!taiKhoanHopLe || !taiKhoanHopLe.email) {
        luuThongBaoChoChuyenTrang('Vui lòng đăng nhập tài khoản trước khi xác nhận thanh toán!', 'warning');
        luuDuongDanQuayLai(window.location.href);
        window.location.href = layDuongDanTrang('login.html');
        return null;
    }

    var hoTen = document.getElementById('ho-ten-thanh-toan').value.trim();
    var emailForm = document.getElementById('email-thanh-toan').value.trim().toLowerCase();
    var emailTaiKhoan = String(taiKhoanHopLe.email).trim().toLowerCase();
    var soDienThoai = oSoDienThoai ? oSoDienThoai.value.trim() : '';

    if (hoTen === '') {
        hienThiThongBao('Vui lòng nhập họ và tên học viên!', 'danger');
        document.getElementById('ho-ten-thanh-toan').focus();
        return null;
    }

    if (emailForm !== emailTaiKhoan) {
        hienThiThongBao('Email nhận khóa học phải trùng khớp với tài khoản đang đăng nhập (' + taiKhoanHopLe.email + ')!', 'danger');
        document.getElementById('email-thanh-toan').value = taiKhoanHopLe.email;
        return null;
    }

    if (soDienThoai.length !== 10) {
        hienThiThongBao('Số điện thoại không hợp lệ! Vui lòng nhập chính xác 10 chữ số.', 'danger');
        if (oSoDienThoai) oSoDienThoai.focus();
        return null;
    }

    var danhSachGioHang = layGioHang();
    if (danhSachGioHang.length === 0) {
        hienThiThongBao('Giỏ hàng của bạn đang trống, không thể thanh toán!', 'warning');
        window.location.href = layDuongDanTrang('courses.html');
        return null;
    }

    return {
        userId: taiKhoanHopLe.id || '',
        hoTen: hoTen,
        email: taiKhoanHopLe.email,
        soDienThoai: soDienThoai,
        danhSachGioHang: danhSachGioHang
    };
}

/**
 * Thuc hien commit co kiem soat voi snapshot/rollback va chong tao don trung lap
 */
function taoVaLuuDonHangMoPhong(thongTinNguoiMua, boQuaXacNhan) {
    if (dangXuLyThanhToan) {
        return { success: false, message: 'Đơn hàng đang được xử lý, vui lòng không bấm lặp lại.' };
    }
    var snapshotThanhToan = chupSnapshotLocalStorageThanhToan();
    if (!snapshotThanhToan) {
        hienThiThongBao('Không thể đọc dữ liệu LocalStorage trước khi tạo đơn hàng.', 'danger');
        return { success: false, message: 'Không thể tạo snapshot LocalStorage.' };
    }

    var ketQuaTinh = tinhToanGiaTriDonHang(thongTinNguoiMua.danhSachGioHang, maVoucherDangApDung);
    if (!ketQuaTinh.hopLe) {
        hienThiThongBao(ketQuaTinh.lyDo, 'danger');
        hienThiTomTatDonHang();
        return { success: false, message: ketQuaTinh.lyDo };
    }

    // Neu gia da doi so voi luc them vao gio, dong bo lai gia trong gio va yeu cau xac nhan ro
    if (ketQuaTinh.coThayDoiGia) {
        var gioCapNhat = [];
        for (var g = 0; g < ketQuaTinh.danhSachMonHopLe.length; g++) {
            var monMoi = ketQuaTinh.danhSachMonHopLe[g];
            gioCapNhat.push({
                id: monMoi.id,
                title: monMoi.title,
                instructor: monMoi.instructor,
                image: monMoi.image,
                salePrice: monMoi.salePrice,
                quantity: monMoi.quantity
            });
        }
        luuGioHang(gioCapNhat);
        hienThiTomTatDonHang();
    }

    var danhSachMaMon = [];
    for (var im = 0; im < ketQuaTinh.danhSachMonHopLe.length; im++) {
        danhSachMaMon.push(ketQuaTinh.danhSachMonHopLe[im].id);
    }
    var chuoiKhoaChongTrung = thongTinNguoiMua.email.toLowerCase() + '|' + ketQuaTinh.tongThanhToan + '|' + danhSachMaMon.join(',');
    if (khoaChongTrungDonCuoi === chuoiKhoaChongTrung) {
        hienThiThongBao('Đơn hàng này vừa được xác nhận thành công trước đó.', 'info');
        return { success: false, message: 'Đơn hàng trùng lặp.' };
    }

    var nutGuiNguoiKhac = document.getElementById('che-do-nguoi-nhan-khac');
    var laGuiNguoiKhac = Boolean(nutGuiNguoiKhac && nutGuiNguoiKhac.checked);
    var oDiaChi = document.getElementById('dia-chi-thanh-toan');
    var oTenNguoiNhanKhac = document.getElementById('ho-ten-nguoi-nhan-khac');
    var oSdtNguoiNhanKhac = document.getElementById('so-dien-thoai-nguoi-nhan-khac');
    var oDiaChiKhac = document.getElementById('o-nhap-dia-chi-khac');

    var diaChiCuoi = oDiaChi ? oDiaChi.value.trim() : '';
    var tenNguoiNhan = thongTinNguoiMua.hoTen;
    var sdtNguoiNhan = thongTinNguoiMua.soDienThoai;

    if (laGuiNguoiKhac) {
        tenNguoiNhan = oTenNguoiNhanKhac ? oTenNguoiNhanKhac.value.trim() : '';
        sdtNguoiNhan = oSdtNguoiNhanKhac ? oSdtNguoiNhanKhac.value.trim() : '';
        diaChiCuoi = oDiaChiKhac ? oDiaChiKhac.value.trim() : '';
        if (tenNguoiNhan === '' || sdtNguoiNhan.length !== 10 || diaChiCuoi === '') {
            hienThiThongBao('Khi gửi cho người khác, vui lòng nhập đầy đủ Họ tên, SĐT (10 số) và Địa chỉ mới!', 'danger');
            if (oDiaChiKhac && diaChiCuoi === '') oDiaChiKhac.focus();
            return { success: false, message: 'Thiếu thông tin địa chỉ người nhận mới.' };
        }
    } else if (diaChiCuoi === '') {
        diaChiCuoi = 'Địa chỉ mặc định của tài khoản đăng ký';
    }

    if (!thongTinMaThanhToanHienTai || !thongTinMaThanhToanHienTai.paymentCode) {
        lamMoiMaThanhToanPhienHienTai();
    }

    var phuongThucDangChon = document.querySelector('input[name="paymentMethod"]:checked');
    var laThanhToanQR = Boolean(phuongThucDangChon && phuongThucDangChon.value.toLowerCase().indexOf('qr') > -1 && ketQuaTinh.tongThanhToan > 0);
    var phuongThucThanhToan = ketQuaTinh.tongThanhToan === 0
        ? 'Kích hoạt khóa học miễn phí (0đ - Mô phỏng)'
        : (phuongThucDangChon ? phuongThucDangChon.value : 'Quét mã QR minh họa (Mô phỏng)');

    if (laThanhToanQR && boQuaXacNhan) {
        var donVietQR = layDonVietQRDangCho();
        var emailDonCho = donVietQR && donVietQR.userEmail ? String(donVietQR.userEmail).toLowerCase() : '';
        if (!donVietQR || Number(donVietQR.amount) !== Number(ketQuaTinh.tongThanhToan) || emailDonCho !== String(thongTinNguoiMua.email).toLowerCase() || !kiemTraTrangThaiWebhookGiaLap(donVietQR.orderCode)) {
            hienThiThongBao('Đơn VietQR vẫn đang chờ tín hiệu PAID mô phỏng.', 'warning');
            return { success: false, pending: true };
        }
    }

    if (!boQuaXacNhan) {
        var canhBaoDoiGia = ketQuaTinh.coThayDoiGia ? 'Lưu ý: Giá khóa học vừa được cập nhật theo bảng giá mới nhất. ' : '';
        var thongDiepXacNhan = canhBaoDoiGia + 'Xác nhận đặt hàng với tổng số tiền ' + dinhDangTienVND(ketQuaTinh.tongThanhToan) + ' (quy trình thanh toán mô phỏng trên trình duyệt).';
        xacNhanHanhDongBootstrap('Xác nhận đặt hàng', thongDiepXacNhan, function() {
            var ketQuaLuu;
            if (laThanhToanQR) {
                ketQuaLuu = taoDonHangChoVietQR(thongTinNguoiMua);
            } else {
                ketQuaLuu = taoVaLuuDonHangMoPhong(thongTinNguoiMua, true);
            }
            if (ketQuaLuu && ketQuaLuu.success) {
                if (!ketQuaLuu.pending) window.location.href = layDuongDanTrang('my-courses.html');
            }
        }, function() {
            hienThiThongBao('Bạn đã hủy xác nhận thanh toán. Giỏ hàng vẫn được giữ nguyên.', 'warning');
        });
        return { success: false, pendingConfirm: true, message: 'Đang chờ xác nhận.' };
    }

    var kiemTraDonHang = docDuLieuJSONCoTrangThai(KHOA_LUU_DON_HANG, true);
    if (kiemTraDonHang.tonTai && !kiemTraDonHang.hopLe) {
        hienThiThongBao('Dữ liệu lịch sử đơn hàng trong LocalStorage đang gặp lỗi. Giỏ hàng được giữ nguyên để tránh mất dữ liệu.', 'danger');
        return { success: false, message: 'EDU_PURCHASES bị lỗi JSON.' };
    }

    var banSaoDonHangGoc = kiemTraDonHang.duLieu.slice();
    var kiemTraKhoaHoc = docDuLieuJSONCoTrangThai(KHOA_LUU_KHOA_HOC, true);
    if (kiemTraKhoaHoc.tonTai && !kiemTraKhoaHoc.hopLe) {
        hienThiThongBao('Dữ liệu khóa học trong LocalStorage đang gặp lỗi, chưa thể hoàn tất thanh toán.', 'danger');
        return { success: false, message: 'EDU_COURSES bị lỗi JSON.' };
    }
    var banSaoKhoaHocGoc = JSON.parse(JSON.stringify(kiemTraKhoaHoc.duLieu));
    var kiemTraNhatKy = docDuLieuJSONCoTrangThai('EDU_ANALYTICS_LOGS', true);
    dangXuLyThanhToan = true;

    try {
        var thoiDiemHienTai = new Date();
        var cacMonLuu = [];
        for (var m = 0; m < ketQuaTinh.danhSachMonHopLe.length; m++) {
            var mon = ketQuaTinh.danhSachMonHopLe[m];
            cacMonLuu.push({
                id: mon.id,
                title: mon.title,
                instructor: mon.instructor,
                image: mon.image,
                salePrice: mon.salePrice,
                quantity: mon.quantity,
                itemStatus: 'Đã kích hoạt (mô phỏng)'
            });
        }

        var donHangMoi = {
            orderId: taoMaDuyNhat('ORD', banSaoDonHangGoc, 'orderId'),
            idempotencyKey: chuoiKhoaChongTrung,
            userId: thongTinNguoiMua.userId || '',
            customerName: thongTinNguoiMua.hoTen,
            customerEmail: thongTinNguoiMua.email,
            customerPhone: thongTinNguoiMua.soDienThoai,
            billingNote: diaChiCuoi,
            recipientType: laGuiNguoiKhac ? 'other' : 'self',
            recipientName: tenNguoiNhan,
            recipientPhone: sdtNguoiNhan,
            paymentCode: thongTinMaThanhToanHienTai.paymentCode,
            transferContent: thongTinMaThanhToanHienTai.transferContent,
            paymentMethod: phuongThucThanhToan,
            paymentSimulation: true,
            orderStatus: 'paid_simulated',
            status: 'Thanh toán mô phỏng thành công - Đã kích hoạt khóa học',
            dateISO: layChuoiNgayHomNay(),
            createdAt: thoiDiemHienTai.toLocaleString('vi-VN'),
            subtotalAmount: ketQuaTinh.tongTamTinh,
            discountCode: ketQuaTinh.maVoucherHopLe,
            discountAmount: ketQuaTinh.soTienGiam,
            totalAmount: ketQuaTinh.tongThanhToan,
            items: cacMonLuu
        };

        var danhSachDonMoi = banSaoDonHangGoc.slice();
        var daCapNhatDonCho = false;
        if (laThanhToanQR) {
            for (var d = 0; d < danhSachDonMoi.length; d++) {
                if (danhSachDonMoi[d] && danhSachDonMoi[d].orderStatus === 'pending' && danhSachDonMoi[d].transferContent === donHangMoi.transferContent) {
                    donHangMoi.orderId = danhSachDonMoi[d].orderId;
                    donHangMoi.createdAt = danhSachDonMoi[d].createdAt || donHangMoi.createdAt;
                    danhSachDonMoi[d] = donHangMoi;
                    daCapNhatDonCho = true;
                    break;
                }
            }
            if (!daCapNhatDonCho) throw new Error('Khong tim thay don VietQR dang cho de xac nhan.');
        } else {
            danhSachDonMoi.unshift(donHangMoi);
        }
        if (!luuTatCaDonHang(danhSachDonMoi)) {
            throw new Error('Khong the luu EDU_PURCHASES.');
        }

        var tatCaKhoaHocCapNhat = JSON.parse(JSON.stringify(banSaoKhoaHocGoc));
        for (var c = 0; c < cacMonLuu.length; c++) {
            var soLuongMua = Number(cacMonLuu[c].quantity || 1);
            for (var k = 0; k < tatCaKhoaHocCapNhat.length; k++) {
                if (tatCaKhoaHocCapNhat[k].id === cacMonLuu[c].id) {
                    tatCaKhoaHocCapNhat[k].purchases = Number(tatCaKhoaHocCapNhat[k].purchases || 0) + soLuongMua;
                    break;
                }
            }
        }
        if (!luuTatCaKhoaHoc(tatCaKhoaHocCapNhat)) {
            throw new Error('Khong the cap nhat EDU_COURSES.');
        }

        for (var n = 0; n < cacMonLuu.length; n++) {
            var ghiLogOk = ghiNhatKyTuongTac('PURCHASE', cacMonLuu[n].id, cacMonLuu[n].salePrice * cacMonLuu[n].quantity);
            if (ghiLogOk === false) {
                throw new Error('Khong the ghi EDU_ANALYTICS_LOGS.');
            }
        }

        if (donHangMoi.discountCode && donHangMoi.discountCode !== '') {
            if (!tangLuotDungMaGiamGia(donHangMoi.discountCode)) {
                throw new Error('Khong the cap nhat luot dung ma giam gia EDU_COUPONS.');
            }
        }

        if (!xoaSachGioHang()) {
            throw new Error('Khong the xoa gio hang EDU_CART_ITEMS.');
        }

        if (laThanhToanQR && !xoaDonVietQRDangCho()) {
            throw new Error('Khong the xoa trang thai VietQR sau khi xac nhan.');
        }

        khoaChongTrungDonCuoi = chuoiKhoaChongTrung;
        dangXuLyThanhToan = false;
        lamMoiMaThanhToanPhienHienTai();
        luuThongBaoChoChuyenTrang('Thanh toán mô phỏng đơn hàng ' + donHangMoi.orderId + ' thành công! Khóa học đã được kích hoạt.', 'success');
        if (!boQuaXacNhan) {
            window.location.href = layDuongDanTrang('my-courses.html');
        }
        return { success: true, order: donHangMoi };
    } catch (loi) {
        // Hoan tac (rollback) cac khoa da ghi de tranh trang thai nua thanh cong
        var khoiPhucThanhCong = khoiPhucSnapshotLocalStorageThanhToan(snapshotThanhToan);
        dangXuLyThanhToan = false;
        hienThiThongBao(khoiPhucThanhCong ? 'Xảy ra lỗi khi lưu đơn hàng. Hệ thống đã khôi phục dữ liệu và giữ nguyên giỏ hàng của bạn.' : 'Xảy ra lỗi khi lưu đơn hàng và không thể khôi phục đầy đủ dữ liệu LocalStorage.', 'danger');
        return { success: false, message: loi.message };
    }
}

function ganSuKienBieuMauThanhToan() {
    var bieuMauThanhToan = document.getElementById('bieu-mau-thanh-toan');
    var oSoDienThoai = document.getElementById('so-dien-thoai-thanh-toan');

    if (!bieuMauThanhToan) {
        return;
    }

    ganChiChoNhapSo(oSoDienThoai);

    bieuMauThanhToan.addEventListener('submit', function(e) {
        e.preventDefault();
        var thongTinHopLe = kiemTraDuLieuThanhToan(oSoDienThoai);
        if (thongTinHopLe) {
            taoVaLuuDonHangMoPhong(thongTinHopLe, false);
        }
    });
}

function ganSuKienVoucherThanhToan() {
    var nutApDung = document.getElementById('nut-ap-dung-ma-giam-gia');
    var oNhap = document.getElementById('o-nhap-ma-giam-gia');
    var thongBaoEl = document.getElementById('thong-bao-ma-giam-gia');
    if (!nutApDung || !oNhap) {
        return;
    }

    nutApDung.addEventListener('click', function() {
        var ketQuaTinh = tinhToanGiaTriDonHang(layGioHang(), '');
        var tamTinh = ketQuaTinh.hopLe ? ketQuaTinh.tongTamTinh : 0;
        var ketQua = tinhGiamGiaVoucher(oNhap.value, tamTinh);
        if (ketQua.hopLe) {
            maVoucherDangApDung = ketQua.ma;
            if (thongBaoEl) {
                thongBaoEl.className = 'small text-success mt-1';
                thongBaoEl.textContent = ketQua.thongBao;
            }
            hienThiThongBao(ketQua.thongBao, 'success');
        } else {
            maVoucherDangApDung = '';
            if (thongBaoEl) {
                thongBaoEl.className = 'small text-danger mt-1';
                thongBaoEl.textContent = ketQua.thongBao;
            }
            hienThiThongBao(ketQua.thongBao, 'warning');
        }
        hienThiTomTatDonHang();
        khoiPhucHoacTaoDonVietQR();
    });
}
