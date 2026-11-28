/**
 * FILE: src/js/storage.js
 * NHIEM VU: Lop luu tru dung chung an toan cho LocalStorage, chong XSS,
 * sinh ma duy nhat, kiem tra quyen so huu theo trang thai don hang, quan ly Gio hang,
 * Don hang, Danh gia (chi nguoi da mua hop le), Yeu thich, Da xem, Lien he, Voucher va Tien do hoc.
 */

var KHOA_LUU_GIO_HANG = 'EDU_CART_ITEMS';
var KHOA_LUU_DON_HANG = 'EDU_PURCHASES';
var KHOA_LUU_YEU_THICH = 'EDU_FAVORITES';
var KHOA_LUU_DA_XEM = 'EDU_RECENT_VIEWED';
var KHOA_LUU_DANH_GIA = 'EDU_REVIEWS';
var KHOA_LUU_LIEN_HE = 'EDU_CONTACTS';
var KHOA_LUU_TIEN_DO_HOC = 'EDU_LEARNING_PROGRESS';
var KHOA_LUU_PHIEN_DANG_NHAP = 'EDU_CURRENT_USER';
var KHOA_LUU_PHIEN_QUAN_TRI = 'EDU_CURRENT_ADMIN';
var KHOA_DANH_SACH_PHIEN_DANG_NHAP = 'EDU_ACTIVE_SESSIONS';
var KHOA_DEM_MA_THANH_TOAN = 'EDU_PAYMENT_COUNTER';
var KHOA_CHAT_HO_TRO = 'EDU_SUPPORT_CHAT';
var KHOA_LUU_DANH_MUC = 'EDU_CATEGORIES';
var KHOA_LUU_MA_GIAM_GIA = 'EDU_COUPONS';
var boDemSinhMa = 0;

/**
 * 0.1. Ma hoa ky tu HTML dac biet de phong chong XSS khi ghep chuoi HTML
 */
function maHoaHTML(chuoi) {
    var ketQua = String(chuoi == null ? '' : chuoi);

    ketQua = ketQua.replace(/&/g, '&amp;');
    ketQua = ketQua.replace(/</g, '&lt;');
    ketQua = ketQua.replace(/>/g, '&gt;');
    ketQua = ketQua.replace(/"/g, '&quot;');
    ketQua = ketQua.replace(/'/g, '&#039;');

    return ketQua;
}

/**
 * 0.2. Kiem tra URL hinh anh / video an toan (chan javascript:, data:, vbscript:)
 */
function kiemTraDuongDanAnToan(duongDan, duongDanDuPhong) {
    var macDinh = duongDanDuPhong || '';
    if (!duongDan || typeof duongDan !== 'string') {
        return macDinh;
    }

    var chuoiSach = duongDan.trim();
    if (chuoiSach === '') {
        return macDinh;
    }

    var chuoiThuong = chuoiSach.toLowerCase();
    if (chuoiThuong.indexOf('http://') === 0 || chuoiThuong.indexOf('https://') === 0) {
        return chuoiSach;
    }

    if (chuoiThuong.indexOf('javascript:') === -1 &&
        chuoiThuong.indexOf('data:') === -1 &&
        chuoiThuong.indexOf('vbscript:') === -1 &&
        chuoiSach.indexOf('//') !== 0 &&
        chuoiSach.indexOf(':') === -1) {
        return chuoiSach;
    }

    return macDinh;
}

/**
 * 0.3. Doc du lieu JSON an toan tu LocalStorage (khong tu dong xoa hay ghi de du lieu loi)
 */
function docDuLieuJSON(khoa, giaTriMacDinh) {
    var duLieu = null;
    try {
        duLieu = localStorage.getItem(khoa);
    } catch (loiDoc) {
        return giaTriMacDinh;
    }

    if (duLieu === null) {
        return giaTriMacDinh;
    }

    try {
        var ketQua = JSON.parse(duLieu);
        if (Array.isArray(giaTriMacDinh) && !Array.isArray(ketQua)) {
            return giaTriMacDinh;
        }
        return ketQua;
    } catch (loi) {
        return giaTriMacDinh;
    }
}

/**
 * 0.4. Doc du lieu JSON kem trang thai kiem tra de bao ve du lieu quan trong
 */
function docDuLieuJSONCoTrangThai(khoa, yeuCauMang) {
    var duLieuGoc = null;
    try {
        duLieuGoc = localStorage.getItem(khoa);
    } catch (loiDoc) {
        return { tonTai: false, hopLe: false, duLieu: yeuCauMang ? [] : null };
    }

    if (duLieuGoc === null) {
        return { tonTai: false, hopLe: true, duLieu: yeuCauMang ? [] : null };
    }

    try {
        var ketQua = JSON.parse(duLieuGoc);
        if (yeuCauMang && !Array.isArray(ketQua)) {
            return { tonTai: true, hopLe: false, duLieu: [] };
        }
        if (!yeuCauMang && (ketQua === null || typeof ketQua !== 'object' || Array.isArray(ketQua))) {
            return { tonTai: true, hopLe: false, duLieu: null };
        }
        if (yeuCauMang) {
            var danhSachHopLe = [];
            for (var i = 0; i < ketQua.length; i++) {
                if (ketQua[i] !== null && typeof ketQua[i] === 'object' && !Array.isArray(ketQua[i])) {
                    danhSachHopLe.push(ketQua[i]);
                }
            }
            ketQua = danhSachHopLe;
        }
        return { tonTai: true, hopLe: true, duLieu: ketQua };
    } catch (loi) {
        return { tonTai: true, hopLe: false, duLieu: yeuCauMang ? [] : null };
    }
}

/**
 * 0.4b. Luu / Xoa du lieu tap trung vao LocalStorage (bat loi QuotaExceededError / quyen ghi)
 */
function luuDuLieuJSON(khoa, giaTri) {
    try {
        localStorage.setItem(khoa, JSON.stringify(giaTri));
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
            try { window.dispatchEvent(new CustomEvent('edu-data-updated', { detail: { key: khoa } })); } catch (evErr) {}
        }
        return true;
    } catch (loi) {
        return false;
    }
}

function docChuoiThoLocal(khoa, giaTriMacDinh) {
    try {
        var giaTri = localStorage.getItem(khoa);
        return giaTri !== null ? giaTri : (giaTriMacDinh !== undefined ? giaTriMacDinh : null);
    } catch (loiDoc) {
        return giaTriMacDinh !== undefined ? giaTriMacDinh : null;
    }
}

function chupSnapshotLocalStorage(cacKhoa) {
    var danhSachKhoa = Array.isArray(cacKhoa) ? cacKhoa : [];
    var snapshot = {};
    try {
        for (var i = 0; i < danhSachKhoa.length; i++) {
            snapshot[danhSachKhoa[i]] = localStorage.getItem(danhSachKhoa[i]);
        }
        return snapshot;
    } catch (loiChup) {
        return null;
    }
}

function khoiPhucSnapshotLocalStorage(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        return false;
    }
    var thanhCong = true;
    for (var khoa in snapshot) {
        if (Object.prototype.hasOwnProperty.call(snapshot, khoa)) {
            try {
                if (snapshot[khoa] === null) {
                    localStorage.removeItem(khoa);
                } else {
                    localStorage.setItem(khoa, snapshot[khoa]);
                }
            } catch (loiPhucHoi) {
                thanhCong = false;
            }
        }
    }
    return thanhCong;
}

function luuChuoiThoLocal(khoa, chuoi) {
    try {
        localStorage.setItem(khoa, String(chuoi));
        return true;
    } catch (loi) {
        return false;
    }
}

function xoaDuLieuKho(khoa) {
    try {
        localStorage.removeItem(khoa);
        return true;
    } catch (loi) {
        return false;
    }
}

/**
 * 0.4d. Sinh ma dinh danh duy nhat phia client (tranh trung trong cung mili-giay)
 */
function taoMaDuyNhat(tienTo, mangHienCo, tenTruong) {
    var danhSach = Array.isArray(mangHienCo) ? mangHienCo : [];
    var truong = tenTruong || 'id';
    var tapKyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    var thuLan = 0;

    while (thuLan < 50) {
        boDemSinhMa = (boDemSinhMa + 1) % 10000;
        var ngauNhien = '';
        for (var k = 0; k < 4; k++) {
            ngauNhien = ngauNhien + tapKyTu.charAt(Math.floor(Math.random() * tapKyTu.length));
        }
        var maMoi = String(tienTo || 'ID_') + new Date().getTime() + '_' + boDemSinhMa + '_' + ngauNhien;
        var biTrung = false;
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i] && danhSach[i][truong] === maMoi) {
                biTrung = true;
                break;
            }
        }
        if (!biTrung) {
            return maMoi;
        }
        thuLan = thuLan + 1;
    }
    return String(tienTo || 'ID_') + new Date().getTime() + '_' + Math.floor(Math.random() * 1000000);
}

/**
 * 0.4d2. Co che dinh danh phien rieng theo tung tab bang window.name (luu rieng theo tab trinh duyet)
 */
var TIEN_TO_PHIEN_TAB = 'EDU_TAB_SESSION:';

function layPhienRiengCuaTab() {
    if (typeof window === 'undefined' || typeof window.name !== 'string') {
        return null;
    }
    if (window.name.indexOf(TIEN_TO_PHIEN_TAB) !== 0) {
        return null;
    }
    try {
        return JSON.parse(window.name.substring(TIEN_TO_PHIEN_TAB.length));
    } catch (e) {
        return null;
    }
}

function datPhienRiengCuaTab(giaTriEmailHoacVaiTro) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        var duLieuTab = { tabKey: String(giaTriEmailHoacVaiTro || '') };
        window.name = TIEN_TO_PHIEN_TAB + JSON.stringify(duLieuTab);
    } catch (e) {
    }
}

function timTrongDanhSachPhienTheoEmail(emailCanTim) {
    if (!emailCanTim) {
        return null;
    }
    var emailChuan = String(emailCanTim).trim().toLowerCase();
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_DANH_SACH_PHIEN_DANG_NHAP, true);
    if (ketQua.tonTai && ketQua.hopLe) {
        for (var i = 0; i < ketQua.duLieu.length; i++) {
            var tk = ketQua.duLieu[i];
            if (tk && tk.email && String(tk.email).trim().toLowerCase() === emailChuan) {
                return tk;
            }
        }
    }
    var hienTai = docDuLieuJSONCoTrangThai(KHOA_LUU_PHIEN_DANG_NHAP, false);
    if (hienTai.tonTai && hienTai.hopLe && hienTai.duLieu && hienTai.duLieu.email &&
        String(hienTai.duLieu.email).trim().toLowerCase() === emailChuan) {
        return hienTai.duLieu;
    }
    return null;
}

function layNguoiDungHienTai() {
    var phienTab = layPhienRiengCuaTab();
    if (phienTab && phienTab.tabKey) {
        if (phienTab.tabKey === '__admin_tab__' || phienTab.tabKey === '__guest__') {
            return null;
        }
        var tkTab = timTrongDanhSachPhienTheoEmail(phienTab.tabKey);
        if (tkTab && tkTab.email && tkTab.role !== 'admin') {
            return tkTab;
        }
        return null;
    }
    var ketQuaLocal = docDuLieuJSONCoTrangThai(KHOA_LUU_PHIEN_DANG_NHAP, false);
    if (ketQuaLocal.tonTai && ketQuaLocal.hopLe && ketQuaLocal.duLieu && ketQuaLocal.duLieu.email && ketQuaLocal.duLieu.role !== 'admin') {
        datPhienRiengCuaTab(String(ketQuaLocal.duLieu.email).trim().toLowerCase());
        return ketQuaLocal.duLieu;
    }
    return null;
}

function luuNguoiDungHienTai(nguoiDung) {
    if (!nguoiDung || typeof nguoiDung !== 'object') {
        return false;
    }
    return luuDuLieuJSON(KHOA_LUU_PHIEN_DANG_NHAP, nguoiDung);
}

function xoaNguoiDungHienTai() {
    return xoaDuLieuKho(KHOA_LUU_PHIEN_DANG_NHAP);
}

/**
 * 0.4g. Xac dinh ngu canh thu muc trang hien tai va tra ve duong dan chuan
 */
function laTrangTrongThuMucHtml() {
    if (typeof window === 'undefined' || !window.location || !window.location.pathname) {
        return false;
    }
    var duongDan = String(window.location.pathname).replace(/\\/g, '/');
    return duongDan.indexOf('/src/html/') > -1;
}

function layDuongDanTrang(tenTep) {
    var dich = String(tenTep || 'index.html');
    if (dich.indexOf('http://') === 0 || dich.indexOf('https://') === 0 || dich.indexOf('../') === 0 || dich.indexOf('src/html/') === 0) {
        return dich;
    }
    var trongSrcHtml = laTrangTrongThuMucHtml();
    if (dich === 'index.html' || dich.indexOf('index.html#') === 0 || dich.indexOf('index.html?') === 0) {
        return trongSrcHtml ? ('../../' + dich) : dich;
    }
    return trongSrcHtml ? dich : ('src/html/' + dich);
}

/**
 * 0.4h. Bo dau tieng Viet phuc vu tim kiem khong dau
 */
function boDauTiengViet(chuoi) {
    if (chuoi === null || chuoi === undefined) {
        return '';
    }
    var ketQua = String(chuoi).toLowerCase().trim();
    ketQua = ketQua.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
    ketQua = ketQua.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
    ketQua = ketQua.replace(/[ìíịỉĩ]/g, 'i');
    ketQua = ketQua.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
    ketQua = ketQua.replace(/[ùúụủũưừứựửữ]/g, 'u');
    ketQua = ketQua.replace(/[ỳýỵỷỹ]/g, 'y');
    ketQua = ketQua.replace(/đ/g, 'd');
    ketQua = ketQua.replace(/\s+/g, ' ');
    return ketQua;
}

/**
 * 0.4i. Quan ly phien dang nhap rieng biet cho Quan tri vien (EDU_CURRENT_ADMIN)
 */
function layQuanTriVienHienTai() {
    var ketQuaLocal = docDuLieuJSONCoTrangThai(KHOA_LUU_PHIEN_QUAN_TRI, false);
    if (ketQuaLocal.tonTai && ketQuaLocal.hopLe && ketQuaLocal.duLieu && ketQuaLocal.duLieu.email && ketQuaLocal.duLieu.role === 'admin') {
        return ketQuaLocal.duLieu;
    }
    return null;
}

function luuQuanTriVienHienTai(quanTri) {
    if (!quanTri || typeof quanTri !== 'object') {
        return false;
    }
    return luuDuLieuJSON(KHOA_LUU_PHIEN_QUAN_TRI, quanTri);
}

function xoaQuanTriVienHienTai() {
    return xoaDuLieuKho(KHOA_LUU_PHIEN_QUAN_TRI);
}

/**
 * 0.4j. Quan ly dang nhap nhieu tai khoan hoc vien cung luc (EDU_ACTIVE_SESSIONS)
 */
function layDanhSachPhienDangNhap() {
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_DANH_SACH_PHIEN_DANG_NHAP, true);
    var danhSach = (ketQua.tonTai && ketQua.hopLe) ? ketQua.duLieu.slice() : [];
    var hienTai = layNguoiDungHienTai();
    if (hienTai && typeof hienTai.email === 'string' && hienTai.role !== 'admin') {
        var daCo = false;
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === hienTai.email.toLowerCase()) {
                daCo = true;
                break;
            }
        }
        if (!daCo) {
            danhSach.push(hienTai);
            luuDuLieuJSON(KHOA_DANH_SACH_PHIEN_DANG_NHAP, danhSach);
        }
    }
    return danhSach;
}

function themHoacCapNhatPhienNguoiDung(nguoiDung) {
    if (!nguoiDung || typeof nguoiDung.email !== 'string' || nguoiDung.email === '') {
        return false;
    }
    var danhSach = layDanhSachPhienDangNhap();
    var daCapNhat = false;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === nguoiDung.email.toLowerCase()) {
            danhSach[i] = nguoiDung;
            daCapNhat = true;
            break;
        }
    }
    if (!daCapNhat) {
        danhSach.push(nguoiDung);
    }
    var okMang = luuDuLieuJSON(KHOA_DANH_SACH_PHIEN_DANG_NHAP, danhSach);
    var okHienTai = luuNguoiDungHienTai(nguoiDung);
    if (okMang && okHienTai) {
        datPhienRiengCuaTab(String(nguoiDung.email).trim().toLowerCase());
    }
    return okMang && okHienTai;
}

function chuyenDoiPhienNguoiDung(emailCanChuyen) {
    if (!emailCanChuyen) {
        return null;
    }
    var danhSach = layDanhSachPhienDangNhap();
    var taiKhoanChon = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === String(emailCanChuyen).toLowerCase()) {
            taiKhoanChon = danhSach[i];
            break;
        }
    }
    if (!taiKhoanChon) {
        return null;
    }
    datPhienRiengCuaTab(String(taiKhoanChon.email).trim().toLowerCase());
    luuNguoiDungHienTai(taiKhoanChon);
    return taiKhoanChon;
}

function dangXuatPhienNguoiDungHienTai() {
    var hienTai = layNguoiDungHienTai();
    var danhSach = layDanhSachPhienDangNhap();
    var danhSachMoi = [];
    var emailDangXuat = (hienTai && typeof hienTai.email === 'string') ? hienTai.email.toLowerCase() : '';
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() !== emailDangXuat) {
            danhSachMoi.push(danhSach[i]);
        }
    }
    luuDuLieuJSON(KHOA_DANH_SACH_PHIEN_DANG_NHAP, danhSachMoi);
    if (danhSachMoi.length > 0) {
        datPhienRiengCuaTab(String(danhSachMoi[0].email).trim().toLowerCase());
        luuNguoiDungHienTai(danhSachMoi[0]);
        return danhSachMoi[0];
    }
    datPhienRiengCuaTab('__guest__');
    xoaNguoiDungHienTai();
    return null;
}

function dangXuatTatCaPhienNguoiDung() {
    datPhienRiengCuaTab('__guest__');
    xoaDuLieuKho(KHOA_DANH_SACH_PHIEN_DANG_NHAP);
    xoaNguoiDungHienTai();
    return true;
}

/**
 * 0.4k. Sinh ma thanh toan va noi dung chuyen khoan duy nhat cho moi tai khoan va moi lan mua
 */
function taoMaThanhToanDuyNhat(emailTaiKhoan) {
    var boDem = Number(docDuLieuJSON(KHOA_DEM_MA_THANH_TOAN, 0)) || 0;
    boDem += 1;
    luuDuLieuJSON(KHOA_DEM_MA_THANH_TOAN, boDem);

    var emailSach = boDauTiengViet(emailTaiKhoan || 'guest').replace(/[^a-z0-9]/g, '').toUpperCase();
    var maTaiKhoanNgan = emailSach.substring(0, 5) || 'GUEST';
    var bayGio = new Date();
    var nam = String(bayGio.getFullYear()).slice(-2);
    var thang = String(bayGio.getMonth() + 1);
    if (thang.length < 2) thang = '0' + thang;
    var ngay = String(bayGio.getDate());
    if (ngay.length < 2) ngay = '0' + ngay;
    var kyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    var tatCaDon = layTatCaDonHang();
    var maThanhToan = '';
    var noiDung = '';
    var hopLe = false;
    var soLanThu = 0;

    while (!hopLe && soLanThu < 20) {
        soLanThu += 1;
        var hauTo = '';
        for (var k = 0; k < 4; k++) {
            hauTo += kyTu.charAt(Math.floor(Math.random() * kyTu.length));
        }
        var soThuTu = String(boDem + soLanThu - 1);
        while (soThuTu.length < 3) soThuTu = '0' + soThuTu;
        maThanhToan = 'TT-' + nam + thang + ngay + '-' + maTaiKhoanNgan + '-' + soThuTu + hauTo;
        noiDung = 'EDU ' + maTaiKhoanNgan + ' ' + maThanhToan;

        hopLe = true;
        for (var i = 0; i < tatCaDon.length; i++) {
            if (tatCaDon[i].paymentCode === maThanhToan || tatCaDon[i].transferContent === noiDung) {
                hopLe = false;
                break;
            }
        }
    }

    return {
        paymentCode: maThanhToan,
        transferContent: noiDung
    };
}

/**
 * 0.4l. Cap nhat huy hieu so luong yeu thich tren Navbar
 */
function capNhatHuyHieuYeuThich() {
    var danhSach = layDanhSachMaYeuThich();
    var soLuong = danhSach.length;
    var huyHieu = document.getElementById('so-luong-yeu-thich');
    if (huyHieu) {
        huyHieu.textContent = String(soLuong);
    }
}

/**
 * 0.4m. Luu tru lich su khung chat ho tro demo
 */
function layLichSuChatHoTro() {
    return docDuLieuJSONCoTrangThai(KHOA_CHAT_HO_TRO, true).duLieu;
}

function luuLichSuChatHoTro(mangTinNhan) {
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_CHAT_HO_TRO, true);
    if (!ketQua.hopLe) {
        return false;
    }
    return luuDuLieuJSON(KHOA_CHAT_HO_TRO, mangTinNhan || []);
}


/**
 * 0.4n. Luu tru don cho thanh toan VietQR (chong F5) va tai khoan Google mo phong
 */
var KHOA_DON_VIETQR_CHO = 'EDU_PENDING_VIETQR';
var KHOA_WEBHOOK_GIA_LAP = 'EDU_VIETQR_SIMULATED_PAID';
var KHOA_TAI_KHOAN_GOOGLE = 'EDU_GOOGLE_ACCOUNTS';
var KHOA_GOOGLE_CLIENT_ID = 'EDU_GOOGLE_CLIENT_ID';

function layGoogleClientIdLuu() {
    var obj = docDuLieuJSON(KHOA_GOOGLE_CLIENT_ID, null);
    return (obj && obj.clientId) ? String(obj.clientId).trim() : '';
}

function layDonVietQRDangCho() {
    var don = docDuLieuJSON(KHOA_DON_VIETQR_CHO, null);
    if (!don || !don.orderCode || !don.expiresAt) {
        return null;
    }
    if (Date.now() > Number(don.expiresAt)) {
        xoaDuLieuKho(KHOA_DON_VIETQR_CHO);
        return null;
    }
    return don;
}

function luuDonVietQRDangCho(donCho) {
    return luuDuLieuJSON(KHOA_DON_VIETQR_CHO, donCho);
}

function xoaDonVietQRDangCho() {
    var daXoaWebhook = xoaDuLieuKho(KHOA_WEBHOOK_GIA_LAP);
    var daXoaDonCho = xoaDuLieuKho(KHOA_DON_VIETQR_CHO);
    return daXoaWebhook && daXoaDonCho;
}

function datTrangThaiWebhookGiaLap(maDon, daThanhToan) {
    if (!daThanhToan) {
        return xoaDuLieuKho(KHOA_WEBHOOK_GIA_LAP);
    }
    return luuDuLieuJSON(KHOA_WEBHOOK_GIA_LAP, { orderCode: String(maDon || ''), status: 'PAID', paidAt: Date.now() });
}

function kiemTraTrangThaiWebhookGiaLap(maDon) {
    var kq = docDuLieuJSON(KHOA_WEBHOOK_GIA_LAP, null);
    return Boolean(kq && kq.status === 'PAID' && String(kq.orderCode) === String(maDon || ''));
}

function layDanhSachTaiKhoanGoogle() {
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_TAI_KHOAN_GOOGLE, true);
    if (!ketQua.tonTai || !ketQua.hopLe) {
        return [{ fullName: 'Hồ Thế Lộc', email: 'holoc2021.tv@gmail.com' }];
    }
    return ketQua.duLieu;
}

function luuTaiKhoanGoogle(taiKhoan) {
    if (!taiKhoan || !taiKhoan.email) return false;
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_TAI_KHOAN_GOOGLE, true);
    if (!ketQua.hopLe) {
        return false;
    }
    var ds = ketQua.tonTai ? ketQua.duLieu.slice() : layDanhSachTaiKhoanGoogle().slice();
    var emailChuan = String(taiKhoan.email).trim().toLowerCase();
    var daCo = false;
    for (var i = 0; i < ds.length; i++) {
        if (ds[i] && typeof ds[i].email === 'string' && ds[i].email.toLowerCase() === emailChuan) {
            ds[i].fullName = taiKhoan.fullName || ds[i].fullName;
            daCo = true;
            break;
        }
    }
    if (!daCo) {
        ds.unshift({ fullName: taiKhoan.fullName || emailChuan.split('@')[0], email: emailChuan });
    }
    return luuDuLieuJSON(KHOA_TAI_KHOAN_GOOGLE, ds);
}

function kiemTraEmailHopLe(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    var bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return bieuThucEmail.test(email.trim());
}

/**
 * 0.4g. Don dep ma khoa hoc da bi xoa khoi Gio hang, Yeu thich va Da xem (KHONG xoa lich su don hang)
 */
function dongBoKhiXoaKhoaHoc(maKhoaHoc) {
    xoaKhoiGio(maKhoaHoc);

    var tatCaYeuThich = docDuLieuJSON(KHOA_LUU_YEU_THICH, []);
    var yeuThichMoi = [];
    for (var i = 0; i < tatCaYeuThich.length; i++) {
        var muc = tatCaYeuThich[i];
        var maMuc = (typeof muc === 'string') ? muc : (muc && muc.courseId ? muc.courseId : '');
        if (maMuc !== maKhoaHoc) {
            yeuThichMoi.push(muc);
        }
    }
    luuDuLieuJSON(KHOA_LUU_YEU_THICH, yeuThichMoi);

    var tatCaDaXem = docDuLieuJSON(KHOA_LUU_DA_XEM, []);
    var daXemMoi = [];
    for (var j = 0; j < tatCaDaXem.length; j++) {
        var mucXem = tatCaDaXem[j];
        var maXem = (typeof mucXem === 'string') ? mucXem : (mucXem && mucXem.courseId ? mucXem.courseId : '');
        if (maXem !== maKhoaHoc) {
            daXemMoi.push(mucXem);
        }
    }
    luuDuLieuJSON(KHOA_LUU_DA_XEM, daXemMoi);
}

/**
 * 0.4h. Ham dung chung: Xoa phan tu trong mang theo thuoc tinh id (hoac ten khoa bat ky)
 */
function xoaPhanTuTrongMangTheoId(mangGoc, maCanXoa, tenTruong) {
    var truong = tenTruong || 'id';
    var mangMoi = [];
    for (var i = 0; i < mangGoc.length; i++) {
        if (mangGoc[i] && mangGoc[i][truong] !== maCanXoa) {
            mangMoi.push(mangGoc[i]);
        }
    }
    return mangMoi;
}

/**
 * 0.4i. Ham dung chung: Tach ma khoa hoc va email tu muc luu trong EDU_FAVORITES / EDU_RECENT_VIEWED
 */
function layThongTinMucTheoTaiKhoan(muc) {
    if (typeof muc === 'string') {
        return { courseId: muc, userEmail: '' };
    }
    if (muc && typeof muc === 'object' && muc.courseId) {
        return { courseId: muc.courseId, userEmail: muc.userEmail || '' };
    }
    return { courseId: '', userEmail: '' };
}

/**
 * 0.4j. Ham dung chung: Sinh ma Captcha ngau nhien (mac dinh 5 ky tu)
 */
function taoMaCaptcha(doDai) {
    var soKyTu = doDai || 5;
    var tapKyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var chuoiMa = '';
    for (var i = 0; i < soKyTu; i++) {
        var viTri = Math.floor(Math.random() * tapKyTu.length);
        chuoiMa = chuoiMa + tapKyTu.charAt(viTri);
    }
    return chuoiMa;
}

/**
 * 0.4k. Ham dung chung: Chi cho phep nhap ky tu so (0-9) vao o input
 */
function ganChiChoNhapSo(phanTuNhap) {
    if (!phanTuNhap) {
        return;
    }
    phanTuNhap.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

/**
 * 0.4l. Ham dung chung: Bat/tat nut Yeu thich, doi bieu tuong tim va hien thi Toast
 */
function xuLyNutYeuThichChung(maKhoaHoc, phanTuNut) {
    var ketQua = batTatKhoaHocYeuThich(maKhoaHoc);
    if (!ketQua.success) {
        hienThiThongBao(ketQua.message || 'Không thể lưu danh sách Yêu thích vào trình duyệt.', 'danger');
        return false;
    }
    var daThem = ketQua.daThem;
    var bieuTuong = phanTuNut ? phanTuNut.querySelector('i') : null;
    if (bieuTuong) {
        bieuTuong.className = daThem ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-secondary';
    }
    if (daThem) {
        hienThiThongBao('Đã lưu khóa học vào danh sách Yêu thích!', 'success');
    } else {
        hienThiThongBao('Đã xóa khóa học khỏi danh sách Yêu thích.', 'info');
    }
    return daThem;
}

/**
 * 0.5. Lay email nguoi dung dang dang nhap (tra ve '' neu la khach vang lai)
 */
function layEmailNguoiDungDangNhap() {
    var phienTab = layPhienRiengCuaTab();
    if (phienTab && phienTab.tabKey === '__admin_tab__') {
        return '__admin__';
    }
    var nguoiDung = layNguoiDungHienTai();
    if (nguoiDung && nguoiDung.email) {
        return String(nguoiDung.email).trim().toLowerCase();
    }
    return '';
}

/**
 * 0.5b. Kiem tra trang thai don hang co du dieu kien cap quyen hoc hay khong
 * Chi cac don thanh toan mo phong thanh cong / da kich hoat moi duoc cap quyen.
 */
function kiemTraTrangThaiDonHopLe(donHang) {
    if (!donHang) {
        return false;
    }
    if (donHang.orderStatus) {
        var maTrangThai = String(donHang.orderStatus).trim().toLowerCase();
        return (maTrangThai === 'paid' || maTrangThai === 'paid_simulated' || maTrangThai === 'activated');
    }
    var chuoiTrangThai = String(donHang.status || '').trim().toLowerCase();
    if (chuoiTrangThai === '' ||
        chuoiTrangThai.indexOf('hủy') > -1 ||
        chuoiTrangThai.indexOf('cancelled') > -1 ||
        chuoiTrangThai.indexOf('refunded') > -1 ||
        chuoiTrangThai.indexOf('hoàn tiền') > -1 ||
        chuoiTrangThai.indexOf('failed') > -1 ||
        chuoiTrangThai.indexOf('thất bại') > -1 ||
        chuoiTrangThai.indexOf('pending') > -1 ||
        chuoiTrangThai.indexOf('chờ') > -1) {
        return false;
    }
    return (chuoiTrangThai.indexOf('paid') > -1 ||
        chuoiTrangThai.indexOf('đã kích hoạt') > -1 ||
        chuoiTrangThai.indexOf('thành công') > -1);
}

/**
 * 0.6. Kiem tra nguoi dung hien tai da mua khoa hoc voi don hang hop le trong EDU_PURCHASES chua
 */
function kiemTraDaMuaKhoaHoc(maKhoaHoc, emailChiDinh) {
    var emailHienTai = emailChiDinh ? String(emailChiDinh).trim().toLowerCase() : layEmailNguoiDungDangNhap();
    if (emailHienTai === '') {
        return false;
    }

    var danhSachDonHang = layTatCaDonHang();
    for (var i = 0; i < danhSachDonHang.length; i++) {
        var don = danhSachDonHang[i];
        if (!kiemTraTrangThaiDonHopLe(don)) {
            continue;
        }
        var emailDon = don.customerEmail ? String(don.customerEmail).trim().toLowerCase() : '';
        if (emailDon === emailHienTai && don.items && Array.isArray(don.items)) {
            for (var j = 0; j < don.items.length; j++) {
                if (don.items[j] && don.items[j].id === maKhoaHoc) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 0.7. Hop nhat gio khach vao tai khoan vua dang nhap & loc bo cac khoa hoc da so huu
 */
function locBoKhoaHocDaSoHuuKhoiGio() {
    var emailHienTai = layEmailNguoiDungDangNhap();
    if (emailHienTai === '') {
        return 0;
    }
    var tatCaGio = docDuLieuJSON(KHOA_LUU_GIO_HANG, []);
    var gioTaiKhoan = [];
    var gioKhac = [];
    var gioKhach = [];

    for (var i = 0; i < tatCaGio.length; i++) {
        var muc = tatCaGio[i];
        if (!muc || !muc.id) {
            continue;
        }
        var emailMuc = muc.userEmail ? String(muc.userEmail).trim().toLowerCase() : '';
        if (emailMuc === emailHienTai) {
            gioTaiKhoan.push(muc);
        } else if (emailMuc === '') {
            gioKhach.push(muc);
        } else {
            gioKhac.push(muc);
        }
    }

    // Hop nhat gio khach vao gio tai khoan (khong trung ma khoa hoc)
    for (var g = 0; g < gioKhach.length; g++) {
        var daCo = false;
        for (var k = 0; k < gioTaiKhoan.length; k++) {
            if (gioTaiKhoan[k].id === gioKhach[g].id) {
                daCo = true;
                break;
            }
        }
        if (!daCo) {
            gioKhach[g].userEmail = emailHienTai;
            gioTaiKhoan.push(gioKhach[g]);
        }
    }

    // Loc bo khoa hoc da so huu khoi gio tai khoan
    var gioCuoiCung = [];
    var soLuongDaLoc = 0;
    for (var j = 0; j < gioTaiKhoan.length; j++) {
        if (kiemTraDaMuaKhoaHoc(gioTaiKhoan[j].id, emailHienTai)) {
            soLuongDaLoc = soLuongDaLoc + 1;
        } else {
            gioCuoiCung.push(gioTaiKhoan[j]);
        }
    }

    if (gioKhach.length > 0 || soLuongDaLoc > 0) {
        luuDuLieuJSON(KHOA_LUU_GIO_HANG, gioCuoiCung.concat(gioKhac));
        capNhatHuyHieuGioHang();
    }
    return soLuongDaLoc;
}

/**
 * 1. Lay danh sach san pham trong gio hang theo dung tai khoan dang dang nhap (hoac gio khach)
 */
function layGioHang() {
    var tatCaGio = docDuLieuJSON(KHOA_LUU_GIO_HANG, []);
    var emailHienTai = layEmailNguoiDungDangNhap();
    var ketQua = [];
    for (var i = 0; i < tatCaGio.length; i++) {
        var muc = tatCaGio[i];
        if (!muc || !muc.id) {
            continue;
        }
        var emailMuc = muc.userEmail ? String(muc.userEmail).trim().toLowerCase() : '';
        if (emailMuc === emailHienTai) {
            ketQua.push(muc);
        }
    }
    return ketQua;
}

/**
 * 2. Luu mang gio hang cua tai khoan hien tai vao LocalStorage (bao toan gio cua tai khoan khac)
 */
function luuGioHang(mangGioHang) {
    var emailHienTai = layEmailNguoiDungDangNhap();
    var tatCaGio = docDuLieuJSON(KHOA_LUU_GIO_HANG, []);
    var gioTaiKhoanKhac = [];

    for (var i = 0; i < tatCaGio.length; i++) {
        var muc = tatCaGio[i];
        if (!muc || !muc.id) {
            continue;
        }
        var emailMuc = muc.userEmail ? String(muc.userEmail).trim().toLowerCase() : '';
        if (emailMuc !== emailHienTai) {
            gioTaiKhoanKhac.push(muc);
        }
    }

    var mangGanEmail = [];
    for (var j = 0; j < mangGioHang.length; j++) {
        var mon = mangGioHang[j];
        if (mon && mon.id) {
            mon.userEmail = emailHienTai;
            mangGanEmail.push(mon);
        }
    }

    var daLuu = luuDuLieuJSON(KHOA_LUU_GIO_HANG, mangGanEmail.concat(gioTaiKhoanKhac));
    if (daLuu) {
        capNhatHuyHieuGioHang();
    }
    return daLuu;
}

/**
 * 3. Them khoa hoc vao gio hang (chan mua trung khoa hoc da so huu va kiem tra ket qua luu)
 */
function themVaoGio(maKhoaHoc, soLuong) {
    var thongTinKhoaHoc = timKhoaHocTheoMa(maKhoaHoc);

    if (!thongTinKhoaHoc) {
        return { success: false, message: 'Không tìm thấy thông tin khóa học!' };
    }

    if (!kiemTraKhoaHocDangMo(thongTinKhoaHoc)) {
        return { success: false, message: 'Khóa học "' + thongTinKhoaHoc.title + '" hiện đang tạm ẩn và ngừng mở bán mới!' };
    }

    if (kiemTraDaMuaKhoaHoc(maKhoaHoc)) {
        return {
            success: false,
            message: 'Bạn đã sở hữu khóa học "' + thongTinKhoaHoc.title + '"! Vui lòng vào mục Khóa học của tôi để học.'
        };
    }

    var danhSachGio = layGioHang();
    for (var i = 0; i < danhSachGio.length; i++) {
        if (danhSachGio[i].id === maKhoaHoc) {
            return {
                success: false,
                message: 'Khóa học "' + thongTinKhoaHoc.title + '" đã có trong giỏ hàng của bạn!'
            };
        }
    }

    danhSachGio.push({
        id: thongTinKhoaHoc.id,
        title: thongTinKhoaHoc.title,
        category: thongTinKhoaHoc.category,
        instructor: thongTinKhoaHoc.instructor,
        salePrice: Number(thongTinKhoaHoc.salePrice || 0),
        originalPrice: Number(thongTinKhoaHoc.originalPrice || 0),
        image: thongTinKhoaHoc.image,
        quantity: 1
    });

    if (!luuGioHang(danhSachGio)) {
        return {
            success: false,
            message: 'Không thể lưu giỏ hàng vào trình duyệt (bộ nhớ LocalStorage đầy hoặc bị chặn).'
        };
    }
    ghiNhanLuotThemGio(thongTinKhoaHoc.id);
    return { success: true, message: 'Đã thêm khóa học "' + thongTinKhoaHoc.title + '" vào giỏ hàng!' };
}

/**
 * 4. Cap nhat so luong cua mot khoa hoc trong gio hang (toi da 1 cho khoa hoc so)
 */
function capNhatSoLuongGioHang(maKhoaHoc, soLuongMoi) {
    var danhSachGio = layGioHang();
    for (var i = 0; i < danhSachGio.length; i++) {
        if (danhSachGio[i].id === maKhoaHoc) {
            var giaTriSoLuong = Number(soLuongMoi);
            if (giaTriSoLuong <= 0) {
                danhSachGio.splice(i, 1);
            } else {
                danhSachGio[i].quantity = 1;
            }
            break;
        }
    }
    return luuGioHang(danhSachGio);
}

/**
 * 5. Xoa mot khoa hoc khoi gio hang bang vong lap for
 */
function xoaKhoiGio(maKhoaHoc) {
    return luuGioHang(xoaPhanTuTrongMangTheoId(layGioHang(), maKhoaHoc));
}

/**
 * 6. Xoa sach toan bo gio hang
 */
function xoaSachGioHang() {
    return luuGioHang([]);
}

/**
 * 7. Tinh tong so luong khoa hoc trong gio bang vong lap for
 */
function demTongSoLuongGioHang() {
    var danhSachGio = layGioHang();
    var tongSoLuong = 0;
    for (var i = 0; i < danhSachGio.length; i++) {
        tongSoLuong = tongSoLuong + Number(danhSachGio[i].quantity || 1);
    }
    return tongSoLuong;
}

/**
 * 8. Tinh tong so tien thanh toan cua gio hang bang vong lap for (uu tien gia moi nhat trong catalog)
 */
function tinhTongTienGioHang() {
    var danhSachGio = layGioHang();
    var tongTien = 0;
    for (var i = 0; i < danhSachGio.length; i++) {
        var khoaHocHienHanh = typeof timKhoaHocTheoMa === 'function' ? timKhoaHocTheoMa(danhSachGio[i].id) : null;
        var donGia = khoaHocHienHanh ? Number(khoaHocHienHanh.salePrice) : Number(danhSachGio[i].salePrice || danhSachGio[i].price || 0);
        if (isNaN(donGia) || donGia < 0) donGia = 0;
        var soLuong = Number(danhSachGio[i].quantity || 1);
        tongTien = tongTien + (donGia * soLuong);
    }
    return tongTien;
}

/**
 * 9. Cap nhat so hien thi tren icon Gio hang o thanh Navbar
 */
function capNhatHuyHieuGioHang() {
    var phanTuHuyHieu = document.getElementById('so-luong-gio-hang');
    if (phanTuHuyHieu) {
        phanTuHuyHieu.textContent = String(demTongSoLuongGioHang());
    }
}

/**
 * 10. Quan ly danh sach Khoa hoc Yeu thich (EDU_FAVORITES) tach theo tai khoan dang dang nhap
 */
function layEmailYeuThichHopLe() {
    var phienTab = layPhienRiengCuaTab();
    if (phienTab && phienTab.tabKey === '__admin_tab__') {
        return '__admin__';
    }
    var nguoiDung = layNguoiDungHienTai();
    if (nguoiDung && nguoiDung.email) {
        return String(nguoiDung.email).trim().toLowerCase();
    }
    var admin = layQuanTriVienHienTai();
    if (admin && admin.email && (!phienTab || phienTab.tabKey !== '__guest__')) {
        return '__admin__';
    }
    return '';
}

function layDanhSachMaYeuThich() {
    var emailHienTai = layEmailYeuThichHopLe();
    if (emailHienTai === '') {
        return [];
    }
    var tatCa = docDuLieuJSON(KHOA_LUU_YEU_THICH, []);
    var ketQua = [];
    for (var i = 0; i < tatCa.length; i++) {
        var thongTin = layThongTinMucTheoTaiKhoan(tatCa[i]);
        if (thongTin.courseId !== '' && thongTin.userEmail === emailHienTai) {
            ketQua.push(thongTin.courseId);
        }
    }
    return ketQua;
}

function kiemTraKhoaHocYeuThich(maKhoaHoc) {
    var danhSachYeuThich = layDanhSachMaYeuThich();
    for (var i = 0; i < danhSachYeuThich.length; i++) {
        if (danhSachYeuThich[i] === maKhoaHoc) {
            return true;
        }
    }
    return false;
}

function batTatKhoaHocYeuThich(maKhoaHoc) {
    var emailHienTai = layEmailYeuThichHopLe();
    if (emailHienTai === '') {
        return {
            success: false,
            daThem: false,
            yeuCauDangNhap: true,
            message: 'Vui lòng đăng nhập tài khoản để lưu khóa học yêu thích của riêng bạn.'
        };
    }
    var tatCa = docDuLieuJSON(KHOA_LUU_YEU_THICH, []);
    var danhSachMoi = [];
    var daTimThay = false;

    for (var i = 0; i < tatCa.length; i++) {
        var thongTin = layThongTinMucTheoTaiKhoan(tatCa[i]);
        if (thongTin.courseId === maKhoaHoc && thongTin.userEmail === emailHienTai) {
            daTimThay = true;
        } else {
            danhSachMoi.push(tatCa[i]);
        }
    }

    var daThem = false;
    if (!daTimThay) {
        danhSachMoi.unshift({ courseId: maKhoaHoc, userEmail: emailHienTai, timestamp: Date.now(), dateISO: layChuoiNgayHienTaiAnToan() });
        daThem = true;
    }

    var daLuu = luuDuLieuJSON(KHOA_LUU_YEU_THICH, danhSachMoi);
    return {
        success: daLuu,
        daThem: daThem,
        message: daLuu ? '' : 'Không thể lưu danh sách Yêu thích vào LocalStorage.'
    };
}

function layDanhSachKhoaHocYeuThich() {
    var danhSachMa = layDanhSachMaYeuThich();
    var ketQua = [];
    for (var i = 0; i < danhSachMa.length; i++) {
        var khoaHoc = timKhoaHocTheoMa(danhSachMa[i]);
        if (khoaHoc) {
            ketQua.push(khoaHoc);
        }
    }
    return ketQua;
}

/**
 * 11. Quan ly danh sach Khoa hoc Da xem gan day (EDU_RECENT_VIEWED) tach theo tai khoan
 */
function layDanhSachMaDaXem() {
    var tatCa = docDuLieuJSON(KHOA_LUU_DA_XEM, []);
    var emailHienTai = layEmailNguoiDungDangNhap();
    var ketQua = [];
    for (var i = 0; i < tatCa.length; i++) {
        var thongTin = layThongTinMucTheoTaiKhoan(tatCa[i]);
        if (thongTin.courseId !== '' && thongTin.userEmail === emailHienTai) {
            ketQua.push(thongTin.courseId);
        }
    }
    return ketQua;
}

function themKhoaHocVuaXem(maKhoaHoc) {
    if (!maKhoaHoc) {
        return false;
    }
    var tatCa = docDuLieuJSON(KHOA_LUU_DA_XEM, []);
    var emailHienTai = layEmailNguoiDungDangNhap();
    var danhSachKhac = [];
    var danhSachCuaToi = [{ courseId: maKhoaHoc, userEmail: emailHienTai }];

    for (var i = 0; i < tatCa.length; i++) {
        var thongTin = layThongTinMucTheoTaiKhoan(tatCa[i]);
        if (thongTin.userEmail === emailHienTai) {
            if (thongTin.courseId !== maKhoaHoc && danhSachCuaToi.length < 8) {
                danhSachCuaToi.push({ courseId: thongTin.courseId, userEmail: emailHienTai });
            }
        } else {
            danhSachKhac.push(tatCa[i]);
        }
    }

    return luuDuLieuJSON(KHOA_LUU_DA_XEM, danhSachCuaToi.concat(danhSachKhac));
}

function layDanhSachKhoaHocVuaXem() {
    var danhSachMa = layDanhSachMaDaXem();
    var ketQua = [];
    for (var i = 0; i < danhSachMa.length; i++) {
        var khoaHoc = timKhoaHocTheoMa(danhSachMa[i]);
        if (khoaHoc) {
            ketQua.push(khoaHoc);
        }
    }
    return ketQua;
}

/**
 * 12. Quan ly Lich su Don hang / Giao dich mo phong (EDU_PURCHASES)
 */
function layTatCaDonHang() {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_DON_HANG, true);
    return kiemTra.duLieu;
}

function luuTatCaDonHang(mangDonHang) {
    return luuDuLieuJSON(KHOA_LUU_DON_HANG, mangDonHang);
}

/**
 * 13. Quan ly Danh gia sao cho tung khoa hoc (EDU_REVIEWS)
 * Rang buoc nhat quan: Chi tai khoan da mua khoa hoc voi don hang hop le moi duoc danh gia (1 lan/khoa hoc).
 */
function layTatCaDanhGia() {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_DANH_GIA, true);
    return kiemTra.duLieu;
}

function luuTatCaDanhGia(mangDanhGia) {
    return luuDuLieuJSON(KHOA_LUU_DANH_GIA, mangDanhGia);
}

function layDanhGiaCuaKhoaHoc(maKhoaHoc) {
    var tatCaDanhGia = layTatCaDanhGia();
    var danhSach = [];
    for (var i = 0; i < tatCaDanhGia.length; i++) {
        if (tatCaDanhGia[i].courseId === maKhoaHoc) {
            danhSach.push(tatCaDanhGia[i]);
        }
    }
    return danhSach;
}

function tinhLaiDiemDanhGiaKhoaHoc(maKhoaHoc) {
    var danhGiaKhoaHoc = layDanhGiaCuaKhoaHoc(maKhoaHoc);
    var tongSoSao = 0;
    for (var i = 0; i < danhGiaKhoaHoc.length; i++) {
        tongSoSao = tongSoSao + Number(danhGiaKhoaHoc[i].stars || 0);
    }

    var diemTrungBinh = 0;
    if (danhGiaKhoaHoc.length > 0) {
        diemTrungBinh = Math.round((tongSoSao / danhGiaKhoaHoc.length) * 10) / 10;
    }

    var tatCaKhoaHoc = layTatCaKhoaHoc();
    for (var j = 0; j < tatCaKhoaHoc.length; j++) {
        if (tatCaKhoaHoc[j].id === maKhoaHoc) {
            tatCaKhoaHoc[j].rating = diemTrungBinh;
            tatCaKhoaHoc[j].ratingCount = danhGiaKhoaHoc.length;
            break;
        }
    }
    return luuTatCaKhoaHoc(tatCaKhoaHoc);
}

function themDanhGiaKhoaHoc(maKhoaHoc, soSaoNhap, noiDungBinhLuan, tenNguoiDanhGia, emailNguoiDanhGia) {
    var soSao = Number(soSaoNhap);
    if (isNaN(soSao) || soSao < 1 || soSao > 5) {
        return { success: false, message: 'Vui lòng chọn số sao từ 1 đến 5!' };
    }

    var nguoiDungHienTai = layNguoiDungHienTai();
    if (!nguoiDungHienTai || !nguoiDungHienTai.email) {
        return { success: false, message: 'Vui lòng đăng nhập tài khoản trước khi gửi đánh giá sao!' };
    }

    var emailDangNhap = String(nguoiDungHienTai.email).trim().toLowerCase();

    if (!kiemTraDaMuaKhoaHoc(maKhoaHoc, emailDangNhap)) {
        return { success: false, message: 'Chỉ học viên đã đăng ký mua khóa học này (đơn hợp lệ) mới có thể gửi đánh giá!' };
    }

    var kiemTraDanhGia = docDuLieuJSONCoTrangThai(KHOA_LUU_DANH_GIA, true);
    if (kiemTraDanhGia.tonTai && !kiemTraDanhGia.hopLe) {
        return { success: false, message: 'Dữ liệu đánh giá đang gặp lỗi định dạng, không thể ghi đè.' };
    }

    var tatCaDanhGia = kiemTraDanhGia.duLieu;
    for (var i = 0; i < tatCaDanhGia.length; i++) {
        var emailCu = tatCaDanhGia[i].userEmail ? String(tatCaDanhGia[i].userEmail).trim().toLowerCase() : '';
        if (tatCaDanhGia[i].courseId === maKhoaHoc && emailCu === emailDangNhap) {
            return { success: false, message: 'Bạn đã gửi đánh giá cho khóa học này rồi (mỗi tài khoản chỉ đánh giá 1 lần)!' };
        }
    }

    var thoiDiemHienTai = new Date();
    var chuoiNgay = typeof layChuoiNgayHomNay === 'function' ? layChuoiNgayHomNay() : '2026-11-19';

    var danhGiaMoi = {
        id: taoMaDuyNhat('REV_', tatCaDanhGia, 'id'),
        courseId: maKhoaHoc,
        stars: soSao,
        comment: noiDungBinhLuan,
        userName: tenNguoiDanhGia || nguoiDungHienTai.fullName || 'Học viên EduCourses',
        userEmail: nguoiDungHienTai.email,
        dateISO: chuoiNgay,
        createdAt: thoiDiemHienTai.toLocaleString('vi-VN')
    };

    var banSaoDanhGia = tatCaDanhGia.slice();
    banSaoDanhGia.unshift(danhGiaMoi);
    if (!luuTatCaDanhGia(banSaoDanhGia)) {
        return { success: false, message: 'Không thể lưu đánh giá vào LocalStorage (bộ nhớ đầy hoặc bị chặn).' };
    }

    tinhLaiDiemDanhGiaKhoaHoc(maKhoaHoc);

    if (typeof ghiNhatKyTuongTac === 'function') {
        ghiNhatKyTuongTac('REVIEW', maKhoaHoc, soSao);
    }

    return { success: true, message: 'Đánh giá khóa học (' + soSao + ' sao) thành công!' };
}

/**
 * 14. Quan ly tin nhan Lien he luu tru mo phong (EDU_CONTACTS)
 */
function layTatCaLienHe() {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_LIEN_HE, true);
    return kiemTra.duLieu;
}

function luuTatCaLienHe(mangLienHe) {
    return luuDuLieuJSON(KHOA_LUU_LIEN_HE, mangLienHe);
}

function luuLienHeMoi(hoTen, email, tieuDe, noiDung) {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_LIEN_HE, true);
    if (kiemTra.tonTai && !kiemTra.hopLe) {
        return { success: false, message: 'Dữ liệu liên hệ hiện không hợp lệ trong LocalStorage, chưa thể lưu mới.' };
    }

    var danhSachLienHe = kiemTra.duLieu.slice();
    var thoiDiemHienTai = new Date();
    var chuoiNgay = typeof layChuoiNgayHomNay === 'function' ? layChuoiNgayHomNay() : '2026-11-19';

    var banGhiMoi = {
        id: taoMaDuyNhat('LH_', danhSachLienHe, 'id'),
        fullName: hoTen,
        email: email,
        subject: tieuDe,
        message: noiDung,
        status: 'Đã lưu cục bộ (mô phỏng)',
        dateISO: chuoiNgay,
        createdAt: thoiDiemHienTai.toLocaleString('vi-VN')
    };

    danhSachLienHe.unshift(banGhiMoi);
    if (!luuTatCaLienHe(danhSachLienHe)) {
        return { success: false, message: 'Không thể lưu nội dung liên hệ vào LocalStorage (bộ nhớ đầy hoặc bị chặn).' };
    }
    return {
        success: true,
        data: banGhiMoi,
        message: 'Đã lưu nội dung liên hệ cục bộ trên trình duyệt (chế độ mô phỏng frontend - mã ' + banGhiMoi.id + ', chưa gửi email/Zalo thật).'
    };
}

/**
 * 15. Ham dung chung tao HTML the khoa hoc (giam trung lap code giua home.js va courses.js)
 */
function taoMaHTMLTheKhoaHoc(khoaHoc, tienToLop, tuyChon) {
    var nhomLop = tienToLop || 'trang-chu';
    var daYeuThich = kiemTraKhoaHocYeuThich(khoaHoc.id);
    var lopBieuTuongTim = daYeuThich ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary';
    var soLuotXem = Number(khoaHoc.views || 0);
    var soLuotClick = Number(khoaHoc.clicks || 0);
    var chuoiDiemSao = dinhDangDiemDanhGia(khoaHoc);
    var anhAnToan = kiemTraDuongDanAnToan(khoaHoc.image, '');
    var maAnToan = maHoaHTML(khoaHoc.id);
    var maUrl = encodeURIComponent(khoaHoc.id || '');
    var tieuDeAnToan = maHoaHTML(khoaHoc.title);
    var nhanClick = (nhomLop === 'danh-sach') ? ' lượt click' : ' click';

    var maHTML = '';
    maHTML += '<article class="card shadow-sm border-0 the-khoa-hoc">';
    maHTML += '  <div class="position-relative">';
    maHTML += '    <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrl) + '" class="lien-ket-dem-click-' + nhomLop + '" data-ma-khoa-hoc="' + maAnToan + '">';
    maHTML += '      <img src="' + maHoaHTML(anhAnToan) + '" class="card-img-top" alt="' + tieuDeAnToan + '">';
    maHTML += '    </a>';
    if (tuyChon && tuyChon.hienNhanDaSoHuu && kiemTraDaMuaKhoaHoc(khoaHoc.id)) {
        maHTML += '    <strong class="badge bg-success position-absolute top-0 start-0 m-2 shadow-sm">Đã sở hữu</strong>';
    }
    maHTML += '    <button type="button" class="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm nut-yeu-thich-' + nhomLop + '" data-ma-khoa-hoc="' + maAnToan + '" title="Lưu yêu thích">';
    maHTML += '      <i class="bi ' + lopBieuTuongTim + '"></i>';
    maHTML += '    </button>';
    maHTML += '  </div>';
    maHTML += '  <div class="than-the-khoa-hoc">';
    maHTML += '    <div class="thong-tin-phu-khoa-hoc">';
    maHTML += '      <div class="d-flex flex-wrap gap-1"><small class="badge bg-primary-subtle text-primary fw-semibold">' + maHoaHTML(khoaHoc.category) + '</small><small class="badge bg-light text-secondary border fw-semibold">' + maHoaHTML(khoaHoc.level || 'Cơ bản') + '</small></div>';
    maHTML += '      <small class="text-warning fw-bold"><i class="bi bi-star-fill me-1"></i>' + maHoaHTML(chuoiDiemSao) + '</small>';
    maHTML += '    </div>';
    maHTML += '    <h5 class="card-title fw-bold fs-6 mb-1">';
    maHTML += '      <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrl) + '" class="text-dark text-decoration-none lien-ket-dem-click-' + nhomLop + '" data-ma-khoa-hoc="' + maAnToan + '">' + tieuDeAnToan + '</a>';
    maHTML += '    </h5>';
    maHTML += '    <p class="card-text text-muted small mb-1">GV: ' + maHoaHTML(khoaHoc.instructor) + '</p>';
    maHTML += '    <div class="text-secondary small mb-1"><i class="bi bi-clock me-1 text-info"></i>' + maHoaHTML(khoaHoc.duration || '12 giờ học') + ' (' + Number(khoaHoc.lessonsCount || 20) + ' bài)</div>';
    maHTML += '    <div class="thong-tin-phu-khoa-hoc text-muted small">';
    maHTML += '      <small><i class="bi bi-eye me-1 text-primary"></i>' + soLuotXem + ' lượt xem</small>';
    maHTML += '      <small><i class="bi bi-hand-index-thumb me-1 text-success"></i>' + soLuotClick + nhanClick + '</small>';
    maHTML += '    </div>';
    maHTML += '    <div class="chan-the-khoa-hoc">';
    var giaGocSo = Number(khoaHoc.originalPrice || 0);
    var giaBanSo = Number(khoaHoc.salePrice || 0);
    var phanTramGiam = (giaGocSo > giaBanSo && giaGocSo > 0) ? Math.round(((giaGocSo - giaBanSo) / giaGocSo) * 100) : 0;

    maHTML += '      <div class="nhom-gia-khoa-hoc">';
    if (giaBanSo === 0) {
        maHTML += '        <strong class="text-success fs-5">Miễn phí</strong>';
        maHTML += '        <small class="badge bg-success-subtle text-success fw-bold">0đ</small>';
    } else {
        maHTML += '        <strong class="text-danger fs-5">' + maHoaHTML(dinhDangTienVND(giaBanSo)) + '</strong>';
        if (giaGocSo > giaBanSo) {
            maHTML += '        <del class="text-muted small">' + maHoaHTML(dinhDangTienVND(giaGocSo)) + '</del>';
        }
        if (phanTramGiam > 0) {
            maHTML += '        <small class="badge bg-danger-subtle text-danger fw-bold">-' + phanTramGiam + '%</small>';
        }
    }
    maHTML += '      </div>';
    maHTML += '      <div class="nhom-nut-khoa-hoc">';
    maHTML += '        <button type="button" class="btn btn-primary btn-sm nut-them-gio-' + nhomLop + '" data-ma-khoa-hoc="' + maAnToan + '">';
    maHTML += '          <i class="bi bi-cart-plus me-1"></i> Thêm vào giỏ';
    maHTML += '        </button>';
    maHTML += '        <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrl) + '" class="btn btn-outline-secondary btn-sm lien-ket-dem-click-' + nhomLop + '" data-ma-khoa-hoc="' + maAnToan + '">Xem chi tiết</a>';
    maHTML += '      </div>';
    maHTML += '    </div>';
    maHTML += '  </div>';
    maHTML += '</article>';
    return maHTML;
}

/**
 * 16. Kiem tra quyen gui danh gia sao cua nguoi dung hien tai
 */
function kiemTraQuyenGuiDanhGia(maKhoaHoc) {
    var nguoiDung = layNguoiDungHienTai();
    if (!nguoiDung || !nguoiDung.email) {
        return { duocPhep: false, lyDo: 'Vui lòng đăng nhập và mua khóa học để gửi đánh giá sao.' };
    }

    var emailDangNhap = String(nguoiDung.email).trim().toLowerCase();
    if (!kiemTraDaMuaKhoaHoc(maKhoaHoc, emailDangNhap)) {
        return { duocPhep: false, lyDo: 'Chỉ học viên đã đăng ký mua khóa học này (đơn hợp lệ) mới có thể gửi đánh giá.' };
    }

    var tatCaDanhGia = layTatCaDanhGia();
    for (var i = 0; i < tatCaDanhGia.length; i++) {
        var emailCu = tatCaDanhGia[i].userEmail ? String(tatCaDanhGia[i].userEmail).trim().toLowerCase() : '';
        if (tatCaDanhGia[i].courseId === maKhoaHoc && emailCu === emailDangNhap) {
            return { duocPhep: false, lyDo: 'Bạn đã gửi đánh giá cho khóa học này rồi (mỗi tài khoản 1 lần).' };
        }
    }

    return { duocPhep: true, lyDo: 'Bạn đủ điều kiện đánh giá khóa học này.' };
}

/**
 * 17. Quan ly Trang thai Khoa hoc, Danh muc (EDU_CATEGORIES) va Ma giam gia (EDU_COUPONS)
 */
function kiemTraKhoaHocDangMo(khoaHoc) {
    if (!khoaHoc) {
        return false;
    }
    var tt = khoaHoc.status ? String(khoaHoc.status).toLowerCase() : 'published';
    return tt === 'published' || tt === 'active';
}

function kiemTraKhoaHocCoDonHang(maKhoaHoc) {
    var danhSachDon = layTatCaDonHang();
    for (var i = 0; i < danhSachDon.length; i++) {
        var cacMon = (danhSachDon[i] && Array.isArray(danhSachDon[i].items)) ? danhSachDon[i].items : [];
        for (var j = 0; j < cacMon.length; j++) {
            if (cacMon[j] && cacMon[j].id === maKhoaHoc) {
                return true;
            }
        }
    }
    return false;
}

function taoSlugDanhMuc(tenDanhMuc) {
    var chuoi = String(tenDanhMuc || '').trim().toLowerCase();
    chuoi = chuoi.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
    chuoi = chuoi.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
    chuoi = chuoi.replace(/[ìíịỉĩ]/g, 'i');
    chuoi = chuoi.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
    chuoi = chuoi.replace(/[ùúụủũưừứựửữ]/g, 'u');
    chuoi = chuoi.replace(/[ỳýỵỷỹ]/g, 'y');
    chuoi = chuoi.replace(/đ/g, 'd');
    chuoi = chuoi.replace(/[^a-z0-9]+/g, '-');
    chuoi = chuoi.replace(/^-+|-+$/g, '');
    return chuoi || 'danh-muc';
}

function khoiTaoDanhMucMacDinh() {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_DANH_MUC, true);
    if (kiemTra.tonTai) {
        return kiemTra.hopLe;
    }
    var tatCaKH = typeof layTatCaKhoaHoc === 'function' ? layTatCaKhoaHoc() : [];
    var tenDaCo = [];
    var danhSachMoi = [];
    var ngayTao = new Date().toLocaleString('vi-VN');

    for (var i = 0; i < tatCaKH.length; i++) {
        var tenDM = tatCaKH[i] && tatCaKH[i].category ? String(tatCaKH[i].category).trim() : '';
        if (tenDM !== '' && tenDaCo.indexOf(tenDM) === -1) {
            tenDaCo.push(tenDM);
            danhSachMoi.push({
                id: 'CAT_' + String(danhSachMoi.length + 1),
                name: tenDM,
                slug: taoSlugDanhMuc(tenDM),
                description: 'Nhóm khóa học chuyên ngành ' + tenDM,
                status: 'active',
                createdAt: ngayTao,
                updatedAt: ngayTao
            });
        }
    }

    if (danhSachMoi.length === 0) {
        var macDinh = ['Frontend', 'JavaScript', 'Database', 'Công cụ', 'Phân tích hệ thống', 'Kỹ năng mềm'];
        for (var j = 0; j < macDinh.length; j++) {
            danhSachMoi.push({
                id: 'CAT_' + String(j + 1),
                name: macDinh[j],
                slug: taoSlugDanhMuc(macDinh[j]),
                description: 'Nhóm khóa học chuyên ngành ' + macDinh[j],
                status: 'active',
                createdAt: ngayTao,
                updatedAt: ngayTao
            });
        }
    }
    return luuDuLieuJSON(KHOA_LUU_DANH_MUC, danhSachMoi);
}

function layTatCaDanhMuc() {
    khoiTaoDanhMucMacDinh();
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_DANH_MUC, true);
    return kiemTra.hopLe ? kiemTra.duLieu : [];
}

function luuTatCaDanhMuc(mangDanhMuc) {
    if (!Array.isArray(mangDanhMuc)) {
        return false;
    }
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_DANH_MUC, true);
    if (kiemTra.tonTai && !kiemTra.hopLe) {
        return false;
    }
    return luuDuLieuJSON(KHOA_LUU_DANH_MUC, mangDanhMuc);
}

function layDanhMucDangMo() {
    var tatCa = layTatCaDanhMuc();
    var ketQua = [];
    for (var i = 0; i < tatCa.length; i++) {
        if (tatCa[i] && String(tatCa[i].status || 'active') !== 'hidden') {
            ketQua.push(tatCa[i]);
        }
    }
    return ketQua;
}

function khoiTaoMaGiamGiaMacDinh() {
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_MA_GIAM_GIA, true);
    if (kiemTra.tonTai) {
        return kiemTra.hopLe;
    }
    var ngayTao = new Date().toLocaleString('vi-VN');
    var macDinh = [
        {
            code: 'TVU2026',
            discountType: 'percent',
            discountValue: 10,
            minOrderValue: 0,
            usageLimit: 0,
            usedCount: 0,
            isActive: true,
            expiresAt: '',
            createdAt: ngayTao,
            updatedAt: ngayTao
        },
        {
            code: 'EDU50K',
            discountType: 'fixed',
            discountValue: 50000,
            minOrderValue: 0,
            usageLimit: 0,
            usedCount: 0,
            isActive: true,
            expiresAt: '',
            createdAt: ngayTao,
            updatedAt: ngayTao
        }
    ];
    return luuDuLieuJSON(KHOA_LUU_MA_GIAM_GIA, macDinh);
}

function layTatCaMaGiamGia() {
    khoiTaoMaGiamGiaMacDinh();
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_MA_GIAM_GIA, true);
    return kiemTra.hopLe ? kiemTra.duLieu : [];
}

function luuTatCaMaGiamGia(mangMa) {
    if (!Array.isArray(mangMa)) {
        return false;
    }
    var kiemTra = docDuLieuJSONCoTrangThai(KHOA_LUU_MA_GIAM_GIA, true);
    if (kiemTra.tonTai && !kiemTra.hopLe) {
        return false;
    }
    return luuDuLieuJSON(KHOA_LUU_MA_GIAM_GIA, mangMa);
}

function tinhGiamGiaVoucher(maVoucher, tongTamTinh) {
    var maChuan = String(maVoucher || '').trim().toUpperCase().replace(/\s+/g, '');
    var tamTinh = Number(tongTamTinh || 0);
    if (maChuan === '' || isNaN(tamTinh) || tamTinh <= 0) {
        return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Vui lòng nhập mã giảm giá.' };
    }

    var danhSachMa = layTatCaMaGiamGia();
    var maKhop = null;
    for (var i = 0; i < danhSachMa.length; i++) {
        if (danhSachMa[i] && String(danhSachMa[i].code || '').trim().toUpperCase() === maChuan) {
            maKhop = danhSachMa[i];
            break;
        }
    }

    if (!maKhop) {
        return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Mã giảm giá không tồn tại.' };
    }
    if (!maKhop.isActive) {
        return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Mã giảm giá đang tạm ngưng hoạt động.' };
    }
    if (maKhop.expiresAt && String(maKhop.expiresAt).trim() !== '') {
        var homNay = typeof layChuoiNgayHomNay === 'function' ? layChuoiNgayHomNay() : new Date().toISOString().slice(0, 10);
        if (homNay > String(maKhop.expiresAt).trim()) {
            return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Mã giảm giá đã hết hạn sử dụng.' };
        }
    }
    var gioiHan = Number(maKhop.usageLimit || 0);
    var daDung = Number(maKhop.usedCount || 0);
    if (gioiHan > 0 && daDung >= gioiHan) {
        return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Mã giảm giá đã hết lượt sử dụng.' };
    }
    var donToiThieu = Number(maKhop.minOrderValue || 0);
    if (donToiThieu > 0 && tamTinh < donToiThieu) {
        var chuoiToiThieu = typeof dinhDangTienVND === 'function' ? dinhDangTienVND(donToiThieu) : (donToiThieu + 'đ');
        return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Đơn hàng cần tối thiểu ' + chuoiToiThieu + ' để dùng mã này.' };
    }

    var soTienGiam = 0;
    var giaTri = Number(maKhop.discountValue || 0);
    if (maKhop.discountType === 'percent') {
        if (giaTri < 1 || giaTri > 100) {
            return { hopLe: false, ma: '', soTienGiam: 0, thongBao: 'Cấu hình phần trăm giảm không hợp lệ.' };
        }
        soTienGiam = Math.round(tamTinh * (giaTri / 100));
    } else {
        soTienGiam = giaTri > tamTinh ? tamTinh : giaTri;
    }
    if (soTienGiam < 0) soTienGiam = 0;
    if (soTienGiam > tamTinh) soTienGiam = tamTinh;

    var moTaGiam = maKhop.discountType === 'percent'
        ? (giaTri + '%')
        : (typeof dinhDangTienVND === 'function' ? dinhDangTienVND(giaTri) : (giaTri + 'đ'));

    return {
        hopLe: true,
        ma: maKhop.code,
        soTienGiam: soTienGiam,
        thongBao: 'Áp dụng mã ' + maKhop.code + ' giảm ' + moTaGiam + ' thành công!'
    };
}

function tangLuotDungMaGiamGia(maVoucher) {
    var maChuan = String(maVoucher || '').trim().toUpperCase();
    if (maChuan === '') {
        return true;
    }
    var danhSach = layTatCaMaGiamGia().slice();
    var daCapNhat = false;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && String(danhSach[i].code || '').trim().toUpperCase() === maChuan) {
            danhSach[i].usedCount = Number(danhSach[i].usedCount || 0) + 1;
            danhSach[i].updatedAt = new Date().toLocaleString('vi-VN');
            daCapNhat = true;
            break;
        }
    }
    if (!daCapNhat) {
        return true;
    }
    return luuTatCaMaGiamGia(danhSach);
}

/**
 * 17b. Khoi phuc toan bo du lieu mau chi xoa dung cac khoa EDU_* (KHONG dung localStorage.clear())
 */
function khoiPhucToanBoDuLieuMau() {
    var cacKhoaDuAn = [
        'EDU_COURSES',
        'EDU_DATA_SCHEMA_VERSION',
        'EDU_COURSES_BACKUP',
        'EDU_CATEGORIES',
        'EDU_COUPONS',
        'EDU_PURCHASES',
        'EDU_CART_ITEMS',
        'EDU_FAVORITES',
        'EDU_RECENT_VIEWED',
        'EDU_REVIEWS',
        'EDU_CONTACTS',
        'EDU_ANALYTICS_LOGS',
        'EDU_LEARNING_PROGRESS',
        'EDU_CERTIFICATES',
        'EDU_PENDING_TOAST'
    ];
    for (var i = 0; i < cacKhoaDuAn.length; i++) {
        xoaDuLieuKho(cacKhoaDuAn[i]);
    }
    if (typeof khoiTaoDuLieuKhoaHoc === 'function') {
        khoiTaoDuLieuKhoaHoc();
    }
    khoiTaoDanhMucMacDinh();
    khoiTaoMaGiamGiaMacDinh();
    if (typeof damBaoTaiKhoanQuanTri === 'function') {
        damBaoTaiKhoanQuanTri();
    }
    capNhatHuyHieuGioHang();
    return true;
}

/**
 * 18. Lay tien do hoc tap mo phong (0, 50, 100) theo tai khoan va ma khoa hoc
 */
function layTienDoHocTap(maKhoaHoc) {
    var emailHienTai = layEmailNguoiDungDangNhap();
    if (emailHienTai === '' || !kiemTraDaMuaKhoaHoc(maKhoaHoc, emailHienTai)) {
        return 0;
    }
    var tatCaTienDo = docDuLieuJSON(KHOA_LUU_TIEN_DO_HOC, []);
    for (var i = 0; i < tatCaTienDo.length; i++) {
        var muc = tatCaTienDo[i];
        if (muc && muc.courseId === maKhoaHoc && muc.userEmail === emailHienTai) {
            return Number(muc.percent || 0);
        }
    }
    return 0;
}

/**
 * 19. Cap nhat tien do hoc tap mo phong (chi cap nhat khi da so huu hop le va kiem tra ket qua luu)
 */
function capNhatTienDoHocTap(maKhoaHoc, phanTramMoi) {
    var emailHienTai = layEmailNguoiDungDangNhap();
    if (emailHienTai === '' || !kiemTraDaMuaKhoaHoc(maKhoaHoc, emailHienTai)) {
        return { success: false, percent: 0, message: 'Bạn chưa sở hữu khóa học này nên không thể cập nhật tiến độ.' };
    }
    var mucPhanTram = Number(phanTramMoi || 0);
    if (isNaN(mucPhanTram) || mucPhanTram < 0) mucPhanTram = 0;
    if (mucPhanTram > 100) mucPhanTram = 100;

    var tatCaTienDo = docDuLieuJSON(KHOA_LUU_TIEN_DO_HOC, []).slice();
    var daTimThay = false;
    var ketQuaCuoi = mucPhanTram;

    for (var i = 0; i < tatCaTienDo.length; i++) {
        var muc = tatCaTienDo[i];
        if (muc && muc.courseId === maKhoaHoc && muc.userEmail === emailHienTai) {
            var hienTai = Number(muc.percent || 0);
            ketQuaCuoi = mucPhanTram > hienTai ? mucPhanTram : hienTai;
            tatCaTienDo[i] = {
                courseId: maKhoaHoc,
                userEmail: emailHienTai,
                percent: ketQuaCuoi,
                updatedAt: new Date().toLocaleString('vi-VN')
            };
            daTimThay = true;
            break;
        }
    }

    if (!daTimThay) {
        tatCaTienDo.push({
            courseId: maKhoaHoc,
            userEmail: emailHienTai,
            percent: ketQuaCuoi,
            updatedAt: new Date().toLocaleString('vi-VN')
        });
    }

    var daLuu = luuDuLieuJSON(KHOA_LUU_TIEN_DO_HOC, tatCaTienDo);
    return {
        success: daLuu,
        percent: daLuu ? ketQuaCuoi : 0,
        message: daLuu ? 'Đã cập nhật tiến độ học tập (mô phỏng).' : 'Không thể lưu tiến độ học tập vào LocalStorage.'
    };
}

var KHOA_LUU_CHUNG_NHAN = 'EDU_CERTIFICATES';

/**
 * 20. Lay danh sach chung nhan hoan thanh da luu trong LocalStorage
 */
function layTatCaChungNhan() {
    return docDuLieuJSON(KHOA_LUU_CHUNG_NHAN, []);
}

/**
 * 21. Tim hoac cap moi chung nhan hoan thanh (chi cap 1 lan duy nhat khi du dieu kien)
 */
function layHoacCapChungNhanKhoaHoc(maKhoaHoc) {
    var nguoiDung = layNguoiDungHienTai();
    if (!nguoiDung || !nguoiDung.email) {
        return { hopLe: false, thongBao: 'Vui lòng đăng nhập để xem chứng nhận khóa học.' };
    }
    var emailChuan = String(nguoiDung.email).trim().toLowerCase();
    if (!kiemTraDaMuaKhoaHoc(maKhoaHoc, emailChuan)) {
        return { hopLe: false, thongBao: 'Từ chối cấp chứng nhận: Tài khoản hiện tại chưa sở hữu khóa học này.' };
    }
    if (layTienDoHocTap(maKhoaHoc) < 100) {
        return { hopLe: false, thongBao: 'Bạn cần hoàn thành 100% tiến độ khóa học trước khi xem chứng nhận (mô phỏng).' };
    }

    var danhSach = layTatCaChungNhan();
    for (var i = 0; i < danhSach.length; i++) {
        var cn = danhSach[i];
        if (cn && cn.courseId === maKhoaHoc && cn.userEmail && String(cn.userEmail).toLowerCase() === emailChuan) {
            return { hopLe: true, chungNhan: cn, moiCap: false };
        }
    }

    var namHienTai = String(new Date().getFullYear());
    var banGhiMoi = {
        id: taoMaDuyNhat('CERT', danhSach, 'id'),
        userEmail: emailChuan,
        userName: nguoiDung.fullName || 'Học viên EduCourses',
        courseId: maKhoaHoc,
        certCode: 'CERT-DEMO-' + maKhoaHoc + '-' + namHienTai + '-' + String(danhSach.length + 1),
        issuedAt: new Date().toLocaleDateString('vi-VN'),
        issuedAtISO: new Date().toISOString()
    };

    danhSach.push(banGhiMoi);
    if (!luuDuLieuJSON(KHOA_LUU_CHUNG_NHAN, danhSach)) {
        return { hopLe: false, thongBao: 'Không thể lưu bản ghi chứng nhận vào LocalStorage.' };
    }
    return { hopLe: true, chungNhan: banGhiMoi, moiCap: true };
}

/**
 * =========================================================================
 * 20. DONG CO GHI NHAN HANH VI DUNG CHUNG & XEP HANG (QUAN TAM 30 NGAY + NOI BAT 100D)
 * =========================================================================
 */
var KHOA_MA_KHACH_CUC_BO = 'EDU_GUEST_ID';
var KHOA_NHAT_KY_LUOT_XEM = 'EDU_VIEW_LOGS';
var KHOA_NHAT_KY_THEM_GIO = 'EDU_CART_LOGS';
var KHOA_CAU_HINH_NOI_BAT = 'EDU_FEATURED_CONFIG';
var KHOA_DUONG_DAN_QUAY_LAI = 'EDU_RETURN_URL';
var SO_MS_MOT_NGAY = 86400000;

function layChuoiNgayHienTaiAnToan() {
    var d = new Date();
    var nam = d.getFullYear();
    var thang = String(d.getMonth() + 1);
    if (thang.length < 2) thang = '0' + thang;
    var ngay = String(d.getDate());
    if (ngay.length < 2) ngay = '0' + ngay;
    return nam + '-' + thang + '-' + ngay;
}

function luuDuongDanQuayLai(duongDan) {
    if (!duongDan) return false;
    var lienKet = document.createElement('a');
    lienKet.href = String(duongDan);
    if (lienKet.protocol !== window.location.protocol || lienKet.host !== window.location.host) {
        return false;
    }
    return luuDuLieuJSON(KHOA_DUONG_DAN_QUAY_LAI, { url: lienKet.pathname + lienKet.search + lienKet.hash });
}

function layVaXoaDuongDanQuayLai() {
    var duLieu = docDuLieuJSON(KHOA_DUONG_DAN_QUAY_LAI, null);
    xoaDuLieuKho(KHOA_DUONG_DAN_QUAY_LAI);
    if (duLieu && duLieu.url) {
        var duongDan = String(duLieu.url).trim();
        if (/^(http:\/\/|https:\/\/|\/\/|javascript:)/i.test(duongDan)) {
            return layDuongDanTrang('index.html');
        }
        if (duongDan.indexOf('\\') > -1 || /[\u0000-\u001f]/.test(duongDan)) {
            return layDuongDanTrang('index.html');
        }
        var lienKet = document.createElement('a');
        lienKet.href = duongDan;
        if (lienKet.protocol === window.location.protocol && lienKet.host === window.location.host) {
            return lienKet.pathname + lienKet.search + lienKet.hash;
        }
    }
    return layDuongDanTrang('index.html');
}

function layHoacTaoMaNguoiXem() {
    var email = layEmailNguoiDungDangNhap();
    if (email && email !== '' && email !== '__admin__') {
        return 'U:' + email;
    }
    var khach = docDuLieuJSON(KHOA_MA_KHACH_CUC_BO, null);
    if (khach && khach.guestId) {
        return String(khach.guestId);
    }
    var maMoi = 'G:' + String(Date.now()) + '_' + taoMaCaptcha(6);
    luuDuLieuJSON(KHOA_MA_KHACH_CUC_BO, { guestId: maMoi });
    return maMoi;
}

function donBanGhiQua180Ngay(danhSach) {
    if (!Array.isArray(danhSach)) return [];
    var mocGioiHan = Date.now() - (180 * SO_MS_MOT_NGAY);
    var ketQua = [];
    for (var i = 0; i < danhSach.length; i++) {
        var muc = danhSach[i];
        if (!muc || !muc.courseId) continue;
        var ts = Number(muc.timestamp || 0);
        if (!ts && muc.dateISO) {
            ts = Date.parse(muc.dateISO + 'T00:00:00');
        }
        if (!ts || ts >= mocGioiHan) {
            ketQua.push(muc);
        }
    }
    return ketQua;
}

function kiemTraKhoaHocDuDieuKienCongKhai(khoaHoc) {
    if (!khoaHoc || !khoaHoc.id || String(khoaHoc.id).trim() === '') {
        return false;
    }
    if (khoaHoc.isDeleted === true || khoaHoc.isArchived === true) {
        return false;
    }
    var tt = khoaHoc.status ? String(khoaHoc.status).trim().toLowerCase() : 'published';
    return (tt === 'published' || tt === 'active');
}

/**
 * Ghi nhan luot xem khoa hoc: gioi han toi da 1 luot/nguoi/khoa/ngay, tu don >180 ngay
 */
function ghiNhanLuotXemKhoaHoc(maKhoaHoc) {
    if (!maKhoaHoc) return false;
    var viewerId = layHoacTaoMaNguoiXem();
    var homNay = layChuoiNgayHienTaiAnToan();
    var danhSach = donBanGhiQua180Ngay(docDuLieuJSON(KHOA_NHAT_KY_LUOT_XEM, []));

    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].courseId === maKhoaHoc &&
            danhSach[i].viewerId === viewerId &&
            danhSach[i].dateISO === homNay) {
            return false;
        }
    }

    danhSach.push({
        courseId: String(maKhoaHoc),
        viewerId: viewerId,
        dateISO: homNay,
        timestamp: Date.now()
    });
    luuDuLieuJSON(KHOA_NHAT_KY_LUOT_XEM, danhSach);
    return true;
}

/**
 * Ghi nhan luot them vao gio hang (khong ghi lap neu khoa da co trong gio)
 */
function ghiNhanLuotThemGio(maKhoaHoc) {
    if (!maKhoaHoc) return false;
    var viewerId = layHoacTaoMaNguoiXem();
    var homNay = layChuoiNgayHienTaiAnToan();
    var danhSach = donBanGhiQua180Ngay(docDuLieuJSON(KHOA_NHAT_KY_THEM_GIO, []));
    danhSach.push({
        courseId: String(maKhoaHoc),
        viewerId: viewerId,
        dateISO: homNay,
        timestamp: Date.now()
    });
    return luuDuLieuJSON(KHOA_NHAT_KY_THEM_GIO, danhSach);
}

function layCauHinhNoiBatMacDinh() {
    return {
        mode: 'hybrid',
        maxItems: 6,
        minAutoScore: 50,
        pinnedCourseIds: [],
        excludedCourseIds: []
    };
}

function layCauHinhNoiBat() {
    var macDinh = layCauHinhNoiBatMacDinh();
    var ketQua = docDuLieuJSONCoTrangThai(KHOA_CAU_HINH_NOI_BAT, false);
    if (!ketQua.tonTai || !ketQua.hopLe || !ketQua.duLieu || typeof ketQua.duLieu !== 'object') {
        return macDinh;
    }
    var cfg = ketQua.duLieu;
    var cheDo = (cfg.mode === 'hybrid' || cfg.mode === 'automatic' || cfg.mode === 'manual') ? cfg.mode : 'hybrid';
    var toiDa = parseInt(cfg.maxItems, 10);
    if (isNaN(toiDa) || toiDa < 1 || toiDa > 12) toiDa = 6;
    var nguong = Number(cfg.minAutoScore);
    if (isNaN(nguong) || nguong < 0 || nguong > 100) nguong = 50;

    var gGhim = Array.isArray(cfg.pinnedCourseIds) ? cfg.pinnedCourseIds.slice() : [];
    var gLoai = Array.isArray(cfg.excludedCourseIds) ? cfg.excludedCourseIds.slice() : [];
    return {
        mode: cheDo,
        maxItems: toiDa,
        minAutoScore: nguong,
        pinnedCourseIds: gGhim,
        excludedCourseIds: gLoai
    };
}

function luuCauHinhNoiBat(cauHinh) {
    var chuan = layCauHinhNoiBatMacDinh();
    if (cauHinh && typeof cauHinh === 'object') {
        if (cauHinh.mode === 'hybrid' || cauHinh.mode === 'automatic' || cauHinh.mode === 'manual') {
            chuan.mode = cauHinh.mode;
        }
        var toiDa = parseInt(cauHinh.maxItems, 10);
        if (!isNaN(toiDa) && toiDa >= 1 && toiDa <= 12) chuan.maxItems = toiDa;
        var nguong = Number(cauHinh.minAutoScore);
        if (!isNaN(nguong) && nguong >= 0 && nguong <= 100) chuan.minAutoScore = nguong;
        if (Array.isArray(cauHinh.pinnedCourseIds)) chuan.pinnedCourseIds = cauHinh.pinnedCourseIds.slice();
        if (Array.isArray(cauHinh.excludedCourseIds)) chuan.excludedCourseIds = cauHinh.excludedCourseIds.slice();
    }
    return luuDuLieuJSON(KHOA_CAU_HINH_NOI_BAT, chuan);
}

/**
 * Bang xep hang 1: Khoa hoc duoc quan tam nhat (Xu huong 30 ngay)
 * Diem Quan Tam = (Them gio x 3) + (Yeu thich x 2) + (Luot xem x 1)
 */
function tinhBangXepHangQuanTam30Ngay(gioiHan) {
    var moc30Ngay = Date.now() - (30 * SO_MS_MOT_NGAY);
    var tatCaKhoaHoc = typeof layTatCaKhoaHoc === 'function' ? layTatCaKhoaHoc() : docDuLieuJSON(KHOA_LUU_KHOA_HOC, []);
    var nhatKyXem = docDuLieuJSON(KHOA_NHAT_KY_LUOT_XEM, []);
    var nhatKyGio = docDuLieuJSON(KHOA_NHAT_KY_THEM_GIO, []);
    var dsYeuThich = docDuLieuJSON(KHOA_LUU_YEU_THICH, []);

    var demXem = {};
    var demGio = {};
    var demThich = {};

    for (var i = 0; i < nhatKyXem.length; i++) {
        var x = nhatKyXem[i];
        if (!x || !x.courseId) continue;
        var tsX = Number(x.timestamp || 0) || (x.dateISO ? Date.parse(x.dateISO + 'T00:00:00') : 0);
        if (tsX >= moc30Ngay) {
            demXem[x.courseId] = (demXem[x.courseId] || 0) + 1;
        }
    }

    for (var j = 0; j < nhatKyGio.length; j++) {
        var g = nhatKyGio[j];
        if (!g || !g.courseId) continue;
        var tsG = Number(g.timestamp || 0) || (g.dateISO ? Date.parse(g.dateISO + 'T00:00:00') : 0);
        if (tsG >= moc30Ngay) {
            demGio[g.courseId] = (demGio[g.courseId] || 0) + 1;
        }
    }

    var capThichDaDem = {};
    for (var k = 0; k < dsYeuThich.length; k++) {
        var fav = dsYeuThich[k];
        var ttFav = layThongTinMucTheoTaiKhoan(fav);
        if (!ttFav.courseId) continue;
        var tsF = (fav && typeof fav === 'object') ? (Number(fav.timestamp || 0) || (fav.dateISO ? Date.parse(fav.dateISO + 'T00:00:00') : 0)) : 0;
        if (tsF >= moc30Ngay) {
            var khoaCap = ttFav.userEmail + '|' + ttFav.courseId;
            if (!capThichDaDem[khoaCap]) {
                capThichDaDem[khoaCap] = true;
                demThich[ttFav.courseId] = (demThich[ttFav.courseId] || 0) + 1;
            }
        }
    }

    var ketQua = [];
    for (var c = 0; c < tatCaKhoaHoc.length; c++) {
        var kh = tatCaKhoaHoc[c];
        if (!kiemTraKhoaHocDuDieuKienCongKhai(kh)) continue;
        var luotGio = demGio[kh.id] || 0;
        var luotThich = demThich[kh.id] || 0;
        var luotXem = demXem[kh.id] || 0;
        var diemQuanTam = (luotGio * 3) + (luotThich * 2) + (luotXem * 1);
        if (diemQuanTam > 0) {
            ketQua.push({
                khoaHoc: kh,
                luotThemGio: luotGio,
                luotYeuThich: luotThich,
                luotXem: luotXem,
                diemQuanTam: diemQuanTam
            });
        }
    }

    ketQua.sort(function(a, b) {
        if (b.diemQuanTam !== a.diemQuanTam) return b.diemQuanTam - a.diemQuanTam;
        if (b.luotThemGio !== a.luotThemGio) return b.luotThemGio - a.luotThemGio;
        if (b.luotYeuThich !== a.luotYeuThich) return b.luotYeuThich - a.luotYeuThich;
        if (b.luotXem !== a.luotXem) return b.luotXem - a.luotXem;
        return String(a.khoaHoc.title || '').localeCompare(String(b.khoaHoc.title || ''), 'vi');
    });

    if (gioiHan && gioiHan > 0 && ketQua.length > gioiHan) {
        return ketQua.slice(0, gioiHan);
    }
    return ketQua;
}

/**
 * Bang xep hang 2: Tinh diem Khoa hoc Noi bat (thang 100, 6 tieu chi, chong chia 0)
 */
function tinhBangXepHangNoiBat() {
    var tatCaKhoaHoc = typeof layTatCaKhoaHoc === 'function' ? layTatCaKhoaHoc() : docDuLieuJSON(KHOA_LUU_KHOA_HOC, []);
    var tatCaDon = layTatCaDonHang();
    var tatCaDanhGia = layTatCaDanhGia();
    var nhatKyXem = docDuLieuJSON(KHOA_NHAT_KY_LUOT_XEM, []);
    var tienDoObj = docDuLieuJSON('EDU_LEARNING_PROGRESS', {});

    var hocVienTheoKhoa = {};
    var doanhThuTheoKhoa = {};
    for (var d = 0; d < tatCaDon.length; d++) {
        var don = tatCaDon[d];
        if (!kiemTraTrangThaiDonHopLe(don)) continue;
        var emailHV = String(don.customerEmail || don.userId || ('anon_' + d)).trim().toLowerCase();
        var cacMon = Array.isArray(don.items) ? don.items : [];
        var tongTam = Number(don.subtotalAmount || 0);
        var tongThuc = Number(don.totalAmount || 0);
        var tyLeGiam = (tongTam > 0 && tongThuc >= 0) ? (tongThuc / tongTam) : 1;

        for (var m = 0; m < cacMon.length; m++) {
            var mon = cacMon[m];
            if (!mon || !mon.id) continue;
            if (!hocVienTheoKhoa[mon.id]) hocVienTheoKhoa[mon.id] = {};
            hocVienTheoKhoa[mon.id][emailHV] = true;
            var tienMon = Number(mon.salePrice || 0) * Number(mon.quantity || 1) * tyLeGiam;
            doanhThuTheoKhoa[mon.id] = (doanhThuTheoKhoa[mon.id] || 0) + tienMon;
        }
    }

    var tongSaoTheoKhoa = {};
    var soDanhGiaTheoKhoa = {};
    for (var r = 0; r < tatCaDanhGia.length; r++) {
        var dg = tatCaDanhGia[r];
        if (!dg || !dg.courseId) continue;
        var sao = Number(dg.stars || 0);
        if (sao >= 1 && sao <= 5) {
            tongSaoTheoKhoa[dg.courseId] = (tongSaoTheoKhoa[dg.courseId] || 0) + sao;
            soDanhGiaTheoKhoa[dg.courseId] = (soDanhGiaTheoKhoa[dg.courseId] || 0) + 1;
        }
    }

    var xemTichLuyTheoKhoa = {};
    for (var v = 0; v < nhatKyXem.length; v++) {
        var vx = nhatKyXem[v];
        if (vx && vx.courseId) {
            xemTichLuyTheoKhoa[vx.courseId] = (xemTichLuyTheoKhoa[vx.courseId] || 0) + 1;
        }
    }

    var tongTienDoTheoKhoa = {};
    var soNguoiHocTheoKhoa = {};
    if (tienDoObj && typeof tienDoObj === 'object') {
        for (var khoaTD in tienDoObj) {
            if (!Object.prototype.hasOwnProperty.call(tienDoObj, khoaTD)) continue;
            var phanTach = String(khoaTD).split('::');
            if (phanTach.length === 2) {
                var maK = phanTach[1];
                var pt = Number(tienDoObj[khoaTD] || 0);
                if (isFinite(pt) && pt >= 0) {
                    tongTienDoTheoKhoa[maK] = (tongTienDoTheoKhoa[maK] || 0) + Math.min(pt, 100);
                    soNguoiHocTheoKhoa[maK] = (soNguoiHocTheoKhoa[maK] || 0) + 1;
                }
            }
        }
    }

    var maxDangKy = 0;
    var maxDoanhThu = 0;
    var maxLuotXem = 0;
    var bangTho = [];

    for (var i = 0; i < tatCaKhoaHoc.length; i++) {
        var kh = tatCaKhoaHoc[i];
        var tapHV = hocVienTheoKhoa[kh.id] || {};
        var soDK = Object.keys(tapHV).length;
        var doanhThu = Math.round(doanhThuTheoKhoa[kh.id] || 0);
        var soDG = soDanhGiaTheoKhoa[kh.id] || 0;
        var diemTB = soDG > 0 ? (tongSaoTheoKhoa[kh.id] / soDG) : 0;
        var luotXem = xemTichLuyTheoKhoa[kh.id] || 0;
        var soHoc = soNguoiHocTheoKhoa[kh.id] || 0;
        var tyLeHoanThanh = soHoc > 0 ? (tongTienDoTheoKhoa[kh.id] / soHoc) : 0;

        if (soDK > maxDangKy) maxDangKy = soDK;
        if (doanhThu > maxDoanhThu) maxDoanhThu = doanhThu;
        if (luotXem > maxLuotXem) maxLuotXem = luotXem;

        bangTho.push({
            khoaHoc: kh,
            duDieuKien: kiemTraKhoaHocDuDieuKienCongKhai(kh),
            luotDangKy: soDK,
            soDanhGia: soDG,
            diemDanhGiaTB: diemTB,
            doanhThu: doanhThu,
            luotXem: luotXem,
            tyLeHoanThanh: tyLeHoanThanh
        });
    }

    var bayGio = Date.now();
    var ketQua = [];
    for (var j = 0; j < bangTho.length; j++) {
        var m = bangTho[j];
        var d1 = maxDangKy > 0 ? (35 * (m.luotDangKy / maxDangKy) * Math.min(m.luotDangKy / 3, 1)) : 0;
        var d2 = m.soDanhGia > 0 ? (25 * (m.diemDanhGiaTB / 5) * Math.min(m.soDanhGia / 5, 1)) : 0;
        var d3 = maxDoanhThu > 0 ? (15 * (m.doanhThu / maxDoanhThu)) : 0;
        var d4 = maxLuotXem > 0 ? (15 * (m.luotXem / maxLuotXem)) : 0;
        var d5 = 5 * (Math.min(Math.max(m.tyLeHoanThanh, 0), 100) / 100);

        var d6 = 0;
        var tsCapNhat = 0;
        if (m.khoaHoc.updatedAt) {
            tsCapNhat = Date.parse(m.khoaHoc.updatedAt);
            if (!isNaN(tsCapNhat) && tsCapNhat > 0) {
                var soNgay = Math.floor((bayGio - tsCapNhat) / SO_MS_MOT_NGAY);
                if (soNgay <= 30) d6 = 5;
                else if (soNgay <= 90) d6 = 3;
                else if (soNgay <= 180) d6 = 1;
                else d6 = 0;
            }
        }

        var tongDiem = d1 + d2 + d3 + d4 + d5 + d6;
        if (tongDiem < 0) tongDiem = 0;
        if (tongDiem > 100) tongDiem = 100;
        tongDiem = Math.round(tongDiem * 10) / 10;

        var phanLoai = 'Thông thường';
        if (tongDiem >= 80) phanLoai = 'Nổi bật';
        else if (tongDiem >= 50) phanLoai = 'Tiềm năng';

        m.tongDiem = tongDiem;
        m.phanLoai = phanLoai;
        m.tsCapNhat = isNaN(tsCapNhat) ? 0 : tsCapNhat;
        m.coChiSoThucTe = (m.luotDangKy > 0 || m.soDanhGia > 0 || m.luotXem > 0);
        ketQua.push(m);
    }

    ketQua.sort(function(a, b) {
        if (b.tongDiem !== a.tongDiem) return b.tongDiem - a.tongDiem;
        if (b.luotDangKy !== a.luotDangKy) return b.luotDangKy - a.luotDangKy;
        if (b.diemDanhGiaTB !== a.diemDanhGiaTB) return b.diemDanhGiaTB - a.diemDanhGiaTB;
        if (b.tsCapNhat !== a.tsCapNhat) return b.tsCapNhat - a.tsCapNhat;
        return String(a.khoaHoc.title || '').localeCompare(String(b.khoaHoc.title || ''), 'vi');
    });
    return ketQua;
}

function layCapDoKeTiep(capDo) {
    if (capDo === 'Cơ bản') return 'Trung cấp';
    if (capDo === 'Trung cấp') return 'Nâng cao';
    return 'Nâng cao';
}

/**
 * Tra ve danh sach Khoa hoc Noi bat hien thi phia nguoi hoc (3 che do + thich ung khach quen)
 */
function layDanhSachKhoaHocNoiBatHienThi(apDungKhachQuen) {
    var cauHinh = layCauHinhNoiBat();
    var bangDiem = tinhBangXepHangNoiBat();
    var banDoTheoId = {};
    for (var i = 0; i < bangDiem.length; i++) {
        banDoTheoId[bangDiem[i].khoaHoc.id] = bangDiem[i];
    }

    var dsGhimHopLe = [];
    var daGhimMap = {};
    for (var p = 0; p < cauHinh.pinnedCourseIds.length; p++) {
        var idP = cauHinh.pinnedCourseIds[p];
        var itemP = banDoTheoId[idP];
        if (itemP && itemP.duDieuKien && !daGhimMap[idP]) {
            daGhimMap[idP] = true;
            dsGhimHopLe.push(itemP);
        }
    }

    var loaiTruMap = {};
    for (var ex = 0; ex < cauHinh.excludedCourseIds.length; ex++) {
        loaiTruMap[cauHinh.excludedCourseIds[ex]] = true;
    }

    var ungVienTuDong = [];
    for (var a = 0; a < bangDiem.length; a++) {
        var cand = bangDiem[a];
        if (!cand.duDieuKien) continue;
        if (loaiTruMap[cand.khoaHoc.id]) continue;
        if (cauHinh.mode === 'hybrid' && daGhimMap[cand.khoaHoc.id]) continue;
        if (cand.tongDiem >= cauHinh.minAutoScore && cand.coChiSoThucTe) {
            ungVienTuDong.push(cand);
        }
    }

    // Che do Thu cong: giu nguyen thu tu ghim + danh dau da so huu
    if (cauHinh.mode === 'manual') {
        var kqManual = [];
        for (var m = 0; m < dsGhimHopLe.length && kqManual.length < cauHinh.maxItems; m++) {
            kqManual.push({
                khoaHoc: dsGhimHopLe[m].khoaHoc,
                daSoHuu: kiemTraDaMuaKhoaHoc(dsGhimHopLe[m].khoaHoc.id),
                cheDo: 'manual'
            });
        }
        return kqManual;
    }

    // Ghep tap ung vien chuan cho Hybrid / Automatic
    var tapChuan = (cauHinh.mode === 'hybrid') ? dsGhimHopLe.concat(ungVienTuDong) : ungVienTuDong.slice();

    // Kiem tra Khach quen (da dang nhap va so huu >= 1 khoa hoc)
    var emailHienTai = layEmailNguoiDungDangNhap();
    var khoaDaMua = [];
    var danhMucDaMua = {};
    var capDoKeTiepMap = {};
    if (apDungKhachQuen && emailHienTai && emailHienTai !== '' && emailHienTai !== '__admin__') {
        var tatCaKH = typeof layTatCaKhoaHoc === 'function' ? layTatCaKhoaHoc() : docDuLieuJSON(KHOA_LUU_KHOA_HOC, []);
        for (var u = 0; u < tatCaKH.length; u++) {
            if (kiemTraDaMuaKhoaHoc(tatCaKH[u].id, emailHienTai)) {
                khoaDaMua.push(tatCaKH[u]);
                danhMucDaMua[tatCaKH[u].category] = true;
                capDoKeTiepMap[layCapDoKeTiep(tatCaKH[u].level || 'Cơ bản')] = true;
            }
        }
    }

    if (khoaDaMua.length > 0) {
        var uuTienChuaMua = [];
        var chungChuaMua = [];
        for (var t = 0; t < tapChuan.length; t++) {
            var it = tapChuan[t];
            if (kiemTraDaMuaKhoaHoc(it.khoaHoc.id, emailHienTai)) {
                continue;
            }
            var khopDM = Boolean(danhMucDaMua[it.khoaHoc.category]);
            var khopCapDo = Boolean(capDoKeTiepMap[it.khoaHoc.level || 'Cơ bản']);
            if (khopDM || khopCapDo) {
                uuTienChuaMua.push(it);
            } else {
                chungChuaMua.push(it);
            }
        }
        var ghepKhachQuen = uuTienChuaMua.concat(chungChuaMua);
        var kqKhachQuen = [];
        for (var f = 0; f < ghepKhachQuen.length && kqKhachQuen.length < cauHinh.maxItems; f++) {
            kqKhachQuen.push({
                khoaHoc: ghepKhachQuen[f].khoaHoc,
                daSoHuu: false,
                cheDo: cauHinh.mode
            });
        }
        return kqKhachQuen;
    }

    // Khach vang lai
    var kqChuan = [];
    for (var s = 0; s < tapChuan.length && kqChuan.length < cauHinh.maxItems; s++) {
        kqChuan.push({
            khoaHoc: tapChuan[s].khoaHoc,
            daSoHuu: false,
            cheDo: cauHinh.mode
        });
    }
    return kqChuan;
}
