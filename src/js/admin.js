/**
 * FILE: src/js/admin.js
 * NHIEM VU: Dieu khien Admin Dashboard V2 (Sidebar + Header + 8 phan he):
 * Tong quan (KPI, bo loc Ngay/Thang/Nam, bieu do SVG dong tu LocalStorage),
 * Khoa hoc, Don hang (modal chi tiet, huy/kich hoat), Hoc vien (modal chi tiet, khoa/mo khoa),
 * Danh muc (EDU_CATEGORIES), Ma giam gia (EDU_COUPONS), Danh gia va Lien he.
 */

var phanHeDangMo = 'tong-quan';
var trangKhoaHocAdmin = 1;
var trangDonHangAdmin = 1;
var SO_DONG_BANG_ADMIN = 10;
var TEN_PHAN_HE = {
    'tong-quan': 'Tổng quan',
    'khoa-hoc': 'Khóa học',
    'don-hang': 'Đơn hàng',
    'hoc-vien': 'Học viên',
    'danh-muc': 'Danh mục',
    'ma-giam-gia': 'Mã giảm giá',
    'danh-gia': 'Đánh giá',
    'xep-hang': 'Xếp hạng & Nổi bật',
    'lien-he': 'Liên hệ'
};

document.addEventListener('DOMContentLoaded', function() {
    if (!kiemTraLaQuanTriVien()) {
        return;
    }
    khoiTaoDanhMucMacDinh();
    khoiTaoMaGiamGiaMacDinh();
    hienThiThongTinAdminHeader();
    khoiTaoNgayLocMacDinh();
    ganSuKienTrangQuanTri();
    lamMoiBangDieuKhienQuanTri();
});

function hienThiThongTinAdminHeader() {
    var admin = layQuanTriVienHienTai();
    if (!admin) {
        return;
    }
    var oTen = document.getElementById('ten-admin-header');
    var oEmail = document.getElementById('email-admin-header');
    if (oTen) oTen.textContent = admin.fullName || 'Quản trị viên';
    if (oEmail) oEmail.textContent = admin.email || '';
}

function moModalBootstrap(idModal) {
    var el = document.getElementById(idModal);
    if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).show();
    }
}

function dongModalBootstrap(idModal) {
    var el = document.getElementById(idModal);
    if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).hide();
    }
}

function chuyenPhanHeQuanTri(maPhanHe) {
    if (!TEN_PHAN_HE[maPhanHe]) {
        maPhanHe = 'tong-quan';
    }
    phanHeDangMo = maPhanHe;

    var cacPanel = document.querySelectorAll('.admin-panel');
    for (var i = 0; i < cacPanel.length; i++) {
        if (cacPanel[i].id === 'panel-' + maPhanHe) {
            cacPanel[i].classList.remove('d-none');
        } else {
            cacPanel[i].classList.add('d-none');
        }
    }

    var cacNutMenu = document.querySelectorAll('#menu-phan-he-quan-tri .admin-nav-btn');
    for (var j = 0; j < cacNutMenu.length; j++) {
        var maNut = cacNutMenu[j].getAttribute('data-phan-he');
        if (maNut === maPhanHe) {
            cacNutMenu[j].classList.add('active');
            cacNutMenu[j].setAttribute('aria-current', 'page');
        } else {
            cacNutMenu[j].classList.remove('active');
            cacNutMenu[j].removeAttribute('aria-current');
        }
    }

    var oBreadcrumb = document.getElementById('breadcrumb-phan-he-hien-tai');
    if (oBreadcrumb) {
        oBreadcrumb.textContent = TEN_PHAN_HE[maPhanHe];
    }

    dongSidebarMobile();
}

function dongSidebarMobile() {
    var sidebar = document.getElementById('thanh-ben-quan-tri');
    var backdrop = document.getElementById('lop-phu-sidebar-quan-tri');
    if (sidebar) sidebar.classList.remove('admin-sidebar-mobile-open');
    if (backdrop) backdrop.classList.remove('show');
}

function khoiTaoNgayLocMacDinh() {
    var ngayHomNay = layChuoiNgayHomNay();
    var cacPhan = ngayHomNay.split('-');
    var oNgay = document.getElementById('o-chon-ngay-loc');
    var oThang = document.getElementById('o-chon-thang-loc');
    var oNam = document.getElementById('o-chon-nam-loc');
    if (oNgay) oNgay.value = ngayHomNay;
    if (oThang && cacPhan.length === 3) oThang.value = cacPhan[1];
    if (oNam && cacPhan.length === 3) oNam.value = cacPhan[0];
    capNhatHienThiOChonLoc();
}

function capNhatHienThiOChonLoc() {
    var oLoai = document.getElementById('loai-loc-thoi-gian');
    var cheDo = oLoai ? oLoai.value : 'ALL';
    var khungNgay = document.getElementById('khung-chon-ngay-loc');
    var khungThang = document.getElementById('khung-chon-thang-loc');
    var khungNam = document.getElementById('khung-chon-nam-loc');
    if (khungNgay) khungNgay.classList.add('d-none');
    if (khungThang) khungThang.classList.add('d-none');
    if (khungNam) khungNam.classList.add('d-none');
    if (cheDo === 'DAY' && khungNgay) {
        khungNgay.classList.remove('d-none');
    } else if (cheDo === 'MONTH') {
        if (khungThang) khungThang.classList.remove('d-none');
        if (khungNam) khungNam.classList.remove('d-none');
    } else if (cheDo === 'YEAR' && khungNam) {
        khungNam.classList.remove('d-none');
    }
}

function kiemTraNgayKhopBoLoc(chuoiNgayISO) {
    var oLoai = document.getElementById('loai-loc-thoi-gian');
    var cheDo = oLoai ? oLoai.value : 'ALL';
    if (cheDo === 'ALL') {
        return true;
    }
    if (!chuoiNgayISO) {
        return false;
    }
    if (cheDo === 'DAY') {
        var oNgay = document.getElementById('o-chon-ngay-loc');
        return chuoiNgayISO === (oNgay ? oNgay.value : '');
    }
    if (cheDo === 'MONTH') {
        var oThang = document.getElementById('o-chon-thang-loc');
        var oNam = document.getElementById('o-chon-nam-loc');
        var thangNam = (oNam ? oNam.value : '') + '-' + (oThang ? oThang.value : '');
        return chuoiNgayISO.indexOf(thangNam) === 0;
    }
    if (cheDo === 'YEAR') {
        var oNamLoc = document.getElementById('o-chon-nam-loc');
        return chuoiNgayISO.indexOf(oNamLoc ? oNamLoc.value : '') === 0;
    }
    return true;
}

function lamMoiBangDieuKhienQuanTri() {
    capNhatDanhMucTrongFormVaBoLoc();
    hienThiThongKeVaBieuDoQuanTri();
    hienThiBangQuanLyKhoaHoc();
    hienThiBangQuanLyDonHang();
    hienThiBangQuanLyNguoiDung();
    hienThiBangQuanLyDanhMuc();
    hienThiBangQuanLyMaGiamGia();
    hienThiBangQuanLyDanhGia();
    hienThiBangQuanLyLienHe();
    hienThiBangXepHangAdmin();
}

function capNhatDanhMucTrongFormVaBoLoc() {
    var danhMucMo = layDanhMucDangMo();
    var tatCaDanhMuc = layTatCaDanhMuc();
    var boLocDM = document.getElementById('loc-danh-muc-khoa-hoc-admin');
    var formDM = document.getElementById('nhap-danh-muc-khoa-hoc');

    if (boLocDM) {
        var giaTriCu = boLocDM.value || 'ALL';
        var htmlLoc = '<option value="ALL">Tất cả danh mục</option>';
        for (var i = 0; i < tatCaDanhMuc.length; i++) {
            var ten = maHoaHTML(tatCaDanhMuc[i].name);
            htmlLoc += '<option value="' + ten + '">' + ten + '</option>';
        }
        boLocDM.innerHTML = htmlLoc;
        boLocDM.value = giaTriCu;
        if (!boLocDM.value) boLocDM.value = 'ALL';
    }

    if (formDM) {
        var giaTriForm = formDM.value;
        var htmlForm = '';
        for (var j = 0; j < danhMucMo.length; j++) {
            var tenMo = maHoaHTML(danhMucMo[j].name);
            htmlForm += '<option value="' + tenMo + '">' + tenMo + '</option>';
        }
        formDM.innerHTML = htmlForm;
        if (giaTriForm) formDM.value = giaTriForm;
    }
}

/* =========================================================================
   PHAN HE 1: DASHBOARD TONG QUAN, KPI, BIEU DO SVG DONG
   ========================================================================= */
function hienThiThongKeVaBieuDoQuanTri() {
    var danhSachKhoaHoc = layTatCaKhoaHoc();
    var danhSachNguoiDung = docDuLieuJSONCoTrangThai('EDU_USERS', true).duLieu;
    var danhSachDonHang = layTatCaDonHang();
    var danhSachLienHe = layTatCaLienHe();

    var doanhThuMoPhong = 0;
    var tongDonLoc = 0;
    var donHopLeLoc = 0;
    var donChoLoc = 0;
    var donHuyLoc = 0;
    var tongLuotMuaLoc = 0;
    var donHangDaLoc = [];

    for (var i = 0; i < danhSachDonHang.length; i++) {
        var don = danhSachDonHang[i];
        if (!kiemTraNgayKhopBoLoc(don.dateISO || '')) {
            continue;
        }
        donHangDaLoc.push(don);
        tongDonLoc = tongDonLoc + 1;
        if (kiemTraTrangThaiDonHopLe(don)) {
            donHopLeLoc = donHopLeLoc + 1;
            doanhThuMoPhong = doanhThuMoPhong + Number(don.totalAmount || 0);
            var cacMon = don.items || [];
            for (var m = 0; m < cacMon.length; m++) {
                if (cacMon[m] && typeof cacMon[m] === 'object') {
                    tongLuotMuaLoc = tongLuotMuaLoc + Number(cacMon[m].quantity || 1);
                }
            }
        } else if (String(don.orderStatus || '').trim().toLowerCase() === 'pending') {
            donChoLoc = donChoLoc + 1;
        } else {
            donHuyLoc = donHuyLoc + 1;
        }
    }

    var khoaDangMo = 0;
    var khoaTamAn = 0;
    for (var c = 0; c < danhSachKhoaHoc.length; c++) {
        if (kiemTraKhoaHocDangMo(danhSachKhoaHoc[c])) {
            khoaDangMo = khoaDangMo + 1;
        } else {
            khoaTamAn = khoaTamAn + 1;
        }
    }

    var tongHocVien = 0;
    var hvHoatDong = 0;
    var hvBiKhoa = 0;
    for (var u = 0; u < danhSachNguoiDung.length; u++) {
        if (danhSachNguoiDung[u] && danhSachNguoiDung[u].role !== 'admin') {
            tongHocVien = tongHocVien + 1;
            if (kiemTraTaiKhoanBiKhoa(danhSachNguoiDung[u])) {
                hvBiKhoa = hvBiKhoa + 1;
            } else {
                hvHoatDong = hvHoatDong + 1;
            }
        }
    }

    var el;
    el = document.getElementById('thong-ke-tong-doanh-thu'); if (el) el.textContent = dinhDangTienVND(doanhThuMoPhong);
    el = document.getElementById('thong-ke-doanh-thu-phu'); if (el) el.textContent = donHopLeLoc + ' đơn hợp lệ (' + tongLuotMuaLoc + ' lượt mua)';
    el = document.getElementById('thong-ke-tong-khoa-hoc'); if (el) el.textContent = String(danhSachKhoaHoc.length);
    el = document.getElementById('thong-ke-khoa-hoc-phu'); if (el) el.textContent = khoaDangMo + ' mở bán · ' + khoaTamAn + ' tạm ẩn';
    el = document.getElementById('thong-ke-tong-don-hang'); if (el) el.textContent = String(tongDonLoc);
    el = document.getElementById('thong-ke-don-hang-phu'); if (el) el.textContent = donHopLeLoc + ' kích hoạt · ' + donChoLoc + ' chờ · ' + donHuyLoc + ' hủy';
    el = document.getElementById('thong-ke-tong-nguoi-dung'); if (el) el.textContent = String(tongHocVien);
    el = document.getElementById('thong-ke-nguoi-dung-phu'); if (el) el.textContent = hvHoatDong + ' hoạt động · ' + hvBiKhoa + ' bị khóa';

    hienThiBieuDoTop10LuotXemSVG(danhSachKhoaHoc);
    hienThiBieuDoDoanhThuSVG(donHangDaLoc);
    hienThiBieuDoTrangThaiDonSVG(donHopLeLoc, donChoLoc, donHuyLoc, tongDonLoc);
    hienThiBieuDoKhoaHocTheoDanhMucSVG(danhSachKhoaHoc);
    hienThiBangDonHangGanDay(donHangDaLoc);
    capNhatThongBaoVaHuyHieuAdmin(danhSachDonHang, danhSachLienHe);
}

function hienThiBieuDoDoanhThuSVG(donHangDaLoc) {
    var khung = document.getElementById('bieu-do-doanh-thu-thoi-gian');
    if (!khung) return;

    var nhomTheoNgay = {};
    var danhSachNgay = [];
    for (var i = 0; i < donHangDaLoc.length; i++) {
        var don = donHangDaLoc[i];
        if (!kiemTraTrangThaiDonHopLe(don)) continue;
        var ngay = don.dateISO || 'Không rõ';
        if (nhomTheoNgay[ngay] === undefined) {
            nhomTheoNgay[ngay] = 0;
            danhSachNgay.push(ngay);
        }
        nhomTheoNgay[ngay] = nhomTheoNgay[ngay] + Number(don.totalAmount || 0);
    }

    if (danhSachNgay.length === 0) {
        khung.innerHTML = '<div class="text-center text-muted py-5 small"><i class="bi bi-bar-chart fs-2 d-block mb-2"></i>Chưa có dữ liệu đơn hàng hợp lệ trong khoảng thời gian này.</div>';
        return;
    }

    danhSachNgay.sort();
    if (danhSachNgay.length > 7) {
        danhSachNgay = danhSachNgay.slice(danhSachNgay.length - 7);
    }

    var maxVal = 1;
    for (var j = 0; j < danhSachNgay.length; j++) {
        if (nhomTheoNgay[danhSachNgay[j]] > maxVal) maxVal = nhomTheoNgay[danhSachNgay[j]];
    }

    var svgW = 560;
    var svgH = 210;
    var padL = 42;
    var padR = 20;
    var padT = 20;
    var padB = 34;
    var chartW = svgW - padL - padR;
    var chartH = svgH - padT - padB;
    var barSlot = chartW / danhSachNgay.length;
    var barW = barSlot > 60 ? 36 : Math.max(16, Math.floor(barSlot * 0.55));

    var svg = '<svg class="admin-svg-chart" viewBox="0 0 ' + svgW + ' ' + svgH + '" role="img" aria-label="Biểu đồ doanh thu mô phỏng">';
    svg += '<line x1="' + padL + '" y1="' + (padT + chartH) + '" x2="' + (svgW - padR) + '" y2="' + (padT + chartH) + '" stroke="#cbd5e1" stroke-width="1"></line>';

    for (var k = 0; k < danhSachNgay.length; k++) {
        var giaTri = nhomTheoNgay[danhSachNgay[k]];
        var chieuCao = Math.max(4, Math.round((giaTri / maxVal) * (chartH - 12)));
        var x = Math.round(padL + k * barSlot + (barSlot - barW) / 2);
        var y = padT + chartH - chieuCao;
        var nhanNgay = danhSachNgay[k].length >= 10 ? danhSachNgay[k].slice(5) : danhSachNgay[k];
        var nhanTien = giaTri >= 1000000 ? ((giaTri / 1000000).toFixed(1) + 'tr') : (Math.round(giaTri / 1000) + 'k');

        svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + chieuCao + '" rx="5" fill="#2563eb"></rect>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="600">' + maHoaHTML(nhanTien) + '</text>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (padT + chartH + 18) + '" text-anchor="middle" font-size="11" fill="#64748b">' + maHoaHTML(nhanNgay) + '</text>';
    }
    svg += '</svg>';
    khung.innerHTML = svg;
}

function hienThiBieuDoTrangThaiDonSVG(donHopLe, donCho, donHuy, tongDon) {
    var khung = document.getElementById('bieu-do-trang-thai-don-hang');
    if (!khung) return;

    if (tongDon === 0) {
        khung.innerHTML = '<div class="text-center text-muted py-5 small"><i class="bi bi-pie-chart fs-2 d-block mb-2"></i>Chưa có dữ liệu đơn hàng.</div>';
        return;
    }

    var chuVi = 2 * Math.PI * 52;
    var tyLeHopLe = Math.round((donHopLe / tongDon) * 100);
    var tyLeCho = Math.round((donCho / tongDon) * 100);
    var tyLeHuy = Math.max(0, 100 - tyLeHopLe - tyLeCho);
    var doDaiHopLe = (donHopLe / tongDon) * chuVi;
    var doDaiCho = (donCho / tongDon) * chuVi;
    var doDaiHuy = Math.max(0, chuVi - doDaiHopLe - doDaiCho);

    var html = '<div class="admin-donut-wrap">';
    html += '<svg class="admin-donut-svg" viewBox="0 0 140 140" role="img" aria-label="Tỷ lệ trạng thái đơn hàng">';
    html += '  <circle cx="70" cy="70" r="52" fill="none" stroke="#e2e8f0" stroke-width="18"></circle>';
    if (donHopLe > 0) {
        html += '  <circle cx="70" cy="70" r="52" fill="none" stroke="#2563eb" stroke-width="18" stroke-dasharray="' + doDaiHopLe.toFixed(1) + ' ' + chuVi.toFixed(1) + '" transform="rotate(-90 70 70)"></circle>';
    }
    if (donCho > 0) {
        html += '  <circle cx="70" cy="70" r="52" fill="none" stroke="#f59e0b" stroke-width="18" stroke-dasharray="' + doDaiCho.toFixed(1) + ' ' + chuVi.toFixed(1) + '" stroke-dashoffset="-' + doDaiHopLe.toFixed(1) + '" transform="rotate(-90 70 70)"></circle>';
    }
    if (donHuy > 0) {
        html += '  <circle cx="70" cy="70" r="52" fill="none" stroke="#ef4444" stroke-width="18" stroke-dasharray="' + doDaiHuy.toFixed(1) + ' ' + chuVi.toFixed(1) + '" stroke-dashoffset="-' + (doDaiHopLe + doDaiCho).toFixed(1) + '" transform="rotate(-90 70 70)"></circle>';
    }
    html += '  <text x="70" y="68" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">' + tongDon + '</text>';
    html += '  <text x="70" y="86" text-anchor="middle" font-size="11" fill="#64748b">Đơn hàng</text>';
    html += '</svg>';
    html += '<div class="small">';
    html += '  <div class="mb-2"><i class="admin-legend-dot admin-dot-blue"></i><strong>Đã kích hoạt:</strong> ' + donHopLe + ' (' + tyLeHopLe + '%)</div>';
    html += '  <div class="mb-2"><i class="admin-legend-dot admin-dot-amber"></i><strong>Chờ duyệt:</strong> ' + donCho + ' (' + tyLeCho + '%)</div>';
    html += '  <div><i class="admin-legend-dot admin-dot-red"></i><strong>Đã hủy:</strong> ' + donHuy + ' (' + tyLeHuy + '%)</div>';
    html += '</div>';
    html += '</div>';
    khung.innerHTML = html;
}

function hienThiBangDonHangGanDay(donHangDaLoc) {
    var thanBang = document.getElementById('bang-don-hang-gan-day');
    if (!thanBang) return;

    if (donHangDaLoc.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có đơn hàng nào trong khoảng thời gian này.</td></tr>';
        return;
    }

    var gioiHan = donHangDaLoc.length < 5 ? donHangDaLoc.length : 5;
    var html = '';
    for (var i = 0; i < gioiHan; i++) {
        var don = donHangDaLoc[i];
        var hopLe = kiemTraTrangThaiDonHopLe(don);
        var laCho = String(don.orderStatus || '').trim().toLowerCase() === 'pending';
        var nhanTT = hopLe
            ? '<div class="badge bg-success-subtle text-success">Đã kích hoạt</div>'
            : (laCho
                ? '<div class="badge bg-warning-subtle text-warning-emphasis">Chờ duyệt</div>'
                : '<div class="badge bg-danger-subtle text-danger">Đã hủy</div>');
        html += '<tr>';
        html += '  <td class="fw-bold text-primary small">' + maHoaHTML(don.orderId) + '</td>';
        html += '  <td class="small">' + maHoaHTML(don.customerName || don.customerEmail) + '</td>';
        html += '  <td class="small text-muted">' + maHoaHTML(don.dateISO || don.createdAt || '') + '</td>';
        html += '  <td class="fw-semibold text-danger small">' + maHoaHTML(dinhDangTienVND(don.totalAmount)) + '</td>';
        html += '  <td>' + nhanTT + '</td>';
        html += '  <td class="text-end"><button type="button" class="btn btn-outline-primary btn-sm nut-xem-chi-tiet-don-hang" data-ma-don-hang="' + maHoaHTML(don.orderId) + '">Xem</button></td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
}

/* =========================================================================
   PHAN HE 2: QUAN LY KHOA HOC (CRUD + AN/HIEN + BAO TOAN LICH SU)
   ========================================================================= */
function hienThiBangQuanLyKhoaHoc() {
    var thanBang = document.getElementById('bang-quan-ly-khoa-hoc');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-khoa-hoc-quan-tri');
    var oDM = document.getElementById('loc-danh-muc-khoa-hoc-admin');
    var oTD = document.getElementById('loc-trinh-do-khoa-hoc-admin');
    var oTT = document.getElementById('loc-trang-thai-khoa-hoc-admin');

    var tuKhoa = oTim ? oTim.value.trim().toLowerCase() : '';
    var locDM = oDM ? oDM.value : 'ALL';
    var locTD = oTD ? oTD.value : 'ALL';
    var locTT = oTT ? oTT.value : 'ALL';

    var tatCa = layTatCaKhoaHoc();
    var danhSach = [];
    for (var i = 0; i < tatCa.length; i++) {
        var kh = tatCa[i];
        var dangMo = kiemTraKhoaHocDangMo(kh);
        var khopTK = tuKhoa === '' ||
            (kh.id || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (kh.title || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (kh.category || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (kh.instructor || '').toLowerCase().indexOf(tuKhoa) > -1;
        var khopDM = (locDM === 'ALL') || (kh.category === locDM);
        var khopTD = (locTD === 'ALL') || ((kh.level || 'Cơ bản') === locTD);
        var ttChuan = kh.status ? String(kh.status).toLowerCase() : 'published';
        if (ttChuan === 'active') ttChuan = 'published';
        var khopTT = (locTT === 'ALL') || (locTT === 'published' && ttChuan === 'published') || (locTT === 'draft' && ttChuan === 'draft') || (locTT === 'hidden' && ttChuan === 'hidden');
        if (khopTK && khopDM && khopTD && khopTT) {
            danhSach.push(kh);
        }
    }

    if (danhSach.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy khóa học phù hợp.</td></tr>';
        vePhanTrangBangAdmin('phan-trang-khoa-hoc-admin', 0, 1, 'khoa-hoc');
        return;
    }

    var tongTrangKH = Math.ceil(danhSach.length / SO_DONG_BANG_ADMIN);
    if (trangKhoaHocAdmin > tongTrangKH) trangKhoaHocAdmin = tongTrangKH;
    if (trangKhoaHocAdmin < 1) trangKhoaHocAdmin = 1;
    var batDauKH = (trangKhoaHocAdmin - 1) * SO_DONG_BANG_ADMIN;
    var ketThucKH = Math.min(batDauKH + SO_DONG_BANG_ADMIN, danhSach.length);

    var html = '';
    for (var j = batDauKH; j < ketThucKH; j++) {
        var item = danhSach[j];
        var anh = kiemTraDuongDanAnToan(item.image, '');
        var ma = maHoaHTML(item.id);
        var dangMoBan = kiemTraKhoaHocDangMo(item);
        var nhanGia = Number(item.salePrice || 0) === 0
            ? '<div class="badge bg-success-subtle text-success fw-bold">Miễn phí (0đ)</div>'
            : '<div class="fw-bold text-danger">' + maHoaHTML(dinhDangTienVND(item.salePrice)) + '</div>';
        var badgeTT = dangMoBan
            ? '<div class="badge bg-success-subtle text-success">Đang mở bán</div>'
            : '<div class="badge bg-secondary-subtle text-secondary">Đang tạm ẩn</div>';
        var nutAnHienIcon = dangMoBan ? 'bi-eye-slash' : 'bi-eye';
        var nutAnHienTitle = dangMoBan ? 'Tạm ẩn khóa học' : 'Mở bán lại';

        html += '<tr>';
        html += '  <td class="fw-bold text-primary small">' + ma + '</td>';
        html += '  <td><div class="d-flex align-items-center gap-2"><img src="' + maHoaHTML(anh) + '" alt="' + maHoaHTML(item.title) + '" class="rounded anh-thu-nho-quan-tri"><div><div class="fw-bold small">' + maHoaHTML(item.title) + '</div><small class="text-muted">GV: ' + maHoaHTML(item.instructor) + '</small></div></div></td>';
        html += '  <td><div class="badge bg-primary-subtle text-primary">' + maHoaHTML(item.category) + '</div> <small class="text-muted d-block">' + maHoaHTML(item.level || 'Cơ bản') + '</small></td>';
        html += '  <td>' + nhanGia + '</td>';
        html += '  <td class="text-center small">' + Number(item.views || 0) + ' xem · ' + Number(item.purchases || 0) + ' mua</td>';
        html += '  <td class="text-center">' + badgeTT + '</td>';
        html += '  <td class="text-end text-nowrap">';
        html += '    <button type="button" class="btn btn-outline-primary btn-sm me-1 nut-sua-khoa-hoc-quan-tri" data-ma-khoa-hoc="' + ma + '" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>';
        html += '    <button type="button" class="btn btn-outline-warning btn-sm me-1 nut-an-hien-khoa-hoc-quan-tri" data-ma-khoa-hoc="' + ma + '" title="' + nutAnHienTitle + '"><i class="bi ' + nutAnHienIcon + '"></i></button>';
        html += '    <button type="button" class="btn btn-outline-danger btn-sm nut-xoa-khoa-hoc-quan-tri" data-ma-khoa-hoc="' + ma + '" title="Xóa khóa học"><i class="bi bi-trash"></i></button>';
        html += '  </td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
    vePhanTrangBangAdmin('phan-trang-khoa-hoc-admin', danhSach.length, trangKhoaHocAdmin, 'khoa-hoc');
}

function moHopThoaiThemKhoaHoc() {
    capNhatDanhMucTrongFormVaBoLoc();
    var form = document.getElementById('bieu-mau-khoa-hoc-quan-tri');
    if (form) form.reset();
    document.getElementById('tieu-de-hop-thoai-khoa-hoc').textContent = 'Thêm Khóa Học Mới';
    document.getElementById('che-do-sua-khoa-hoc').value = 'ADD';
    var oMa = document.getElementById('nhap-ma-khoa-hoc');
    if (oMa) { oMa.value = ''; oMa.readOnly = false; }
    var oTL = document.getElementById('nhap-thoi-luong-khoa-hoc'); if (oTL) oTL.value = '12 giờ học';
    var oSB = document.getElementById('nhap-so-bai-hoc-khoa-hoc'); if (oSB) oSB.value = '20';
    var oTT = document.getElementById('nhap-trang-thai-khoa-hoc'); if (oTT) oTT.value = 'published';
    moModalBootstrap('hop-thoai-khoa-hoc');
}

function moHopThoaiSuaKhoaHoc(maKhoaHoc) {
    var kh = timKhoaHocTheoMa(maKhoaHoc);
    if (!kh) return;
    capNhatDanhMucTrongFormVaBoLoc();
    document.getElementById('tieu-de-hop-thoai-khoa-hoc').textContent = 'Cập nhật Khóa học (' + kh.id + ')';
    document.getElementById('che-do-sua-khoa-hoc').value = 'EDIT';
    var oMa = document.getElementById('nhap-ma-khoa-hoc');
    oMa.value = kh.id; oMa.readOnly = true;
    document.getElementById('nhap-ten-khoa-hoc').value = kh.title || '';
    var oDM = document.getElementById('nhap-danh-muc-khoa-hoc');
    if (oDM) {
        var daCoOpt = false;
        for (var i = 0; i < oDM.options.length; i++) {
            if (oDM.options[i].value === kh.category) { daCoOpt = true; break; }
        }
        if (!daCoOpt && kh.category) {
            var opt = document.createElement('option');
            opt.value = kh.category; opt.textContent = kh.category;
            oDM.appendChild(opt);
        }
        oDM.value = kh.category || 'Frontend';
    }
    var oTD = document.getElementById('nhap-trinh-do-khoa-hoc'); if (oTD) oTD.value = kh.level || 'Cơ bản';
    var oTT = document.getElementById('nhap-trang-thai-khoa-hoc'); if (oTT) oTT.value = (kh.status === 'hidden' || kh.status === 'draft') ? kh.status : 'published';
    document.getElementById('nhap-giang-vien-khoa-hoc').value = kh.instructor || '';
    var oTL = document.getElementById('nhap-thoi-luong-khoa-hoc'); if (oTL) oTL.value = kh.duration || '12 giờ học';
    var oSB = document.getElementById('nhap-so-bai-hoc-khoa-hoc'); if (oSB) oSB.value = Number(kh.lessonsCount || 20);
    document.getElementById('nhap-gia-goc-khoa-hoc').value = Number(kh.originalPrice || 0);
    document.getElementById('nhap-gia-ban-khoa-hoc').value = Number(kh.salePrice || 0);
    document.getElementById('nhap-anh-khoa-hoc').value = kh.image || '';
    document.getElementById('nhap-mo-ta-khoa-hoc').value = kh.description || '';
    document.getElementById('chon-khoa-hoc-noi-bat').checked = Boolean(kh.isFeatured);
    moModalBootstrap('hop-thoai-khoa-hoc');
}

function xuLyLuuBieuMauKhoaHoc() {
    var cheDo = document.getElementById('che-do-sua-khoa-hoc').value;
    var maKH = document.getElementById('nhap-ma-khoa-hoc').value.trim();
    var tenKH = document.getElementById('nhap-ten-khoa-hoc').value.trim();
    var danhMuc = document.getElementById('nhap-danh-muc-khoa-hoc').value;
    var trinhDo = document.getElementById('nhap-trinh-do-khoa-hoc').value || 'Cơ bản';
    var trangThai = document.getElementById('nhap-trang-thai-khoa-hoc').value || 'published';
    var giangVien = document.getElementById('nhap-giang-vien-khoa-hoc').value.trim();
    var thoiLuong = document.getElementById('nhap-thoi-luong-khoa-hoc').value.trim() || '12 giờ học';
    var soBaiHoc = parseInt(document.getElementById('nhap-so-bai-hoc-khoa-hoc').value, 10);
    var giaGoc = Number(document.getElementById('nhap-gia-goc-khoa-hoc').value);
    var giaBan = Number(document.getElementById('nhap-gia-ban-khoa-hoc').value);
    var anh = kiemTraDuongDanAnToan(document.getElementById('nhap-anh-khoa-hoc').value.trim(), '');
    var moTa = document.getElementById('nhap-mo-ta-khoa-hoc').value.trim();
    var noiBat = document.getElementById('chon-khoa-hoc-noi-bat').checked;

    if (maKH === '' || tenKH.length < 5 || tenKH.length > 150 || giangVien === '') {
        hienThiThongBao('Mã khóa học, tên khóa học (5–150 ký tự) và giảng viên là bắt buộc!', 'danger');
        return false;
    }
    if (isNaN(giaGoc) || isNaN(giaBan) || giaGoc < 0 || giaBan < 0) {
        hienThiThongBao('Giá gốc và giá bán phải là số không âm!', 'danger');
        return false;
    }
    if (giaBan > giaGoc) {
        hienThiThongBao('Giá bán không được lớn hơn giá gốc!', 'warning');
        return false;
    }
    if (isNaN(soBaiHoc) || soBaiHoc < 1) {
        hienThiThongBao('Số bài học phải là số nguyên tối thiểu 1!', 'danger');
        return false;
    }
    if (anh === '') {
        hienThiThongBao('Đường dẫn ảnh không hợp lệ!', 'danger');
        return false;
    }

    var danhSach = layTatCaKhoaHoc().slice();
    var mocThoiGian = new Date().toLocaleString('vi-VN');

    if (cheDo === 'ADD') {
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i].id === maKH) {
                hienThiThongBao('Mã khóa học đã tồn tại! Vui lòng nhập mã khác.', 'danger');
                return false;
            }
        }
        danhSach.unshift({
            id: maKH, title: tenKH, category: danhMuc, level: trinhDo, status: trangThai,
            instructor: giangVien, duration: thoiLuong, lessonsCount: soBaiHoc,
            originalPrice: giaGoc, salePrice: giaBan,
            rating: 0, ratingCount: 0, views: 0, clicks: 0, purchases: 0,
            image: anh, isFeatured: noiBat, isBestSeller: false, isNew: true,
            description: moTa, createdAt: mocThoiGian, updatedAt: mocThoiGian
        });
    } else {
        for (var j = 0; j < danhSach.length; j++) {
            if (danhSach[j].id === maKH) {
                danhSach[j].title = tenKH;
                danhSach[j].category = danhMuc;
                danhSach[j].level = trinhDo;
                danhSach[j].status = trangThai;
                danhSach[j].instructor = giangVien;
                danhSach[j].duration = thoiLuong;
                danhSach[j].lessonsCount = soBaiHoc;
                danhSach[j].originalPrice = giaGoc;
                danhSach[j].salePrice = giaBan;
                danhSach[j].image = anh;
                danhSach[j].description = moTa;
                danhSach[j].isFeatured = noiBat;
                danhSach[j].updatedAt = mocThoiGian;
                break;
            }
        }
    }

    if (trangThai !== 'published' && trangThai !== 'active') {
        goGhimNeuKhongCongKhai(maKH);
    }
    if (!luuTatCaKhoaHoc(danhSach)) {
        hienThiThongBao('Không thể lưu khóa học vào LocalStorage.', 'danger');
        return false;
    }
    dongModalBootstrap('hop-thoai-khoa-hoc');
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã lưu khóa học ' + maKH + ' thành công!', 'success');
    return true;
}

function xuLyAnHienKhoaHoc(maKhoaHoc) {
    var danhSach = layTatCaKhoaHoc().slice();
    var trangThaiMoi = 'hidden';
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maKhoaHoc) {
            trangThaiMoi = kiemTraKhoaHocDangMo(danhSach[i]) ? 'hidden' : 'active';
            danhSach[i].status = trangThaiMoi;
            danhSach[i].updatedAt = new Date().toLocaleString('vi-VN');
            break;
        }
    }
    if (trangThaiMoi !== 'published' && trangThaiMoi !== 'active') {
        goGhimNeuKhongCongKhai(maKhoaHoc);
    }
    if (!luuTatCaKhoaHoc(danhSach)) {
        hienThiThongBao('Không thể cập nhật trạng thái khóa học.', 'danger');
        return false;
    }
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao(trangThaiMoi === 'hidden' ? 'Đã tạm ẩn khóa học ' + maKhoaHoc + ' (người đã mua vẫn giữ quyền học).' : 'Đã mở bán lại khóa học ' + maKhoaHoc + '.', 'info');
    return true;
}

function xuLyXoaKhoaHoc(maKhoaHoc, boQuaXacNhan) {
    if (kiemTraKhoaHocCoDonHang(maKhoaHoc)) {
        hienThiThongBao('Không thể xóa cứng khóa học ' + maKhoaHoc + ' vì đã có đơn hàng tham chiếu. Hãy dùng nút Tạm ẩn để bảo toàn lịch sử!', 'warning');
        return false;
    }
    if (boQuaXacNhan !== true) {
        xacNhanHanhDongBootstrap('Xóa khóa học', 'Bạn có chắc chắn muốn xóa vĩnh viễn khóa học ' + maKhoaHoc + '?', function() {
            xuLyXoaKhoaHoc(maKhoaHoc, true);
        });
        return false;
    }
    if (!luuTatCaKhoaHoc(xoaPhanTuTrongMangTheoId(layTatCaKhoaHoc(), maKhoaHoc))) {
        hienThiThongBao('Không thể xóa khóa học trong LocalStorage.', 'danger');
        return false;
    }
    dongBoKhiXoaKhoaHoc(maKhoaHoc);
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã xóa khóa học ' + maKhoaHoc + ' thành công!', 'info');
    return true;
}

/* =========================================================================
   PHAN HE 3: QUAN LY DON HANG & QUYEN HOC
   ========================================================================= */
function tinhLaiLuotMuaTatCaKhoaHoc() {
    var tatCaKhoaHoc = layTatCaKhoaHoc().slice();
    var danhSachDon = layTatCaDonHang();
    var demLuotMua = {};
    for (var i = 0; i < danhSachDon.length; i++) {
        if (!kiemTraTrangThaiDonHopLe(danhSachDon[i])) continue;
        var cacMon = danhSachDon[i].items || [];
        for (var j = 0; j < cacMon.length; j++) {
            var idMon = cacMon[j].id;
            demLuotMua[idMon] = (demLuotMua[idMon] || 0) + Number(cacMon[j].quantity || 1);
        }
    }
    for (var k = 0; k < tatCaKhoaHoc.length; k++) {
        tatCaKhoaHoc[k].purchases = demLuotMua[tatCaKhoaHoc[k].id] || 0;
    }
    return luuTatCaKhoaHoc(tatCaKhoaHoc);
}

function hienThiBangQuanLyDonHang() {
    var thanBang = document.getElementById('bang-quan-ly-don-hang');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-don-hang-quan-tri');
    var oTT = document.getElementById('loc-trang-thai-don-hang-admin');
    var tuKhoa = oTim ? oTim.value.trim().toLowerCase() : '';
    var locTT = oTT ? oTT.value : 'ALL';

    var tatCa = layTatCaDonHang();
    var danhSach = [];
    for (var i = 0; i < tatCa.length; i++) {
        var don = tatCa[i];
        if (!kiemTraNgayKhopBoLoc(don.dateISO || '')) continue;
        var hopLe = kiemTraTrangThaiDonHopLe(don);
        var ttDon = don.orderStatus ? String(don.orderStatus).toLowerCase() : (hopLe ? 'paid_simulated' : 'cancelled');
        var khopTK = tuKhoa === '' ||
            (don.orderId || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (don.paymentCode || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (don.customerName || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (don.customerEmail || '').toLowerCase().indexOf(tuKhoa) > -1;
        var khopTT = (locTT === 'ALL') ||
            (locTT === 'paid_simulated' && hopLe) ||
            (locTT === 'pending' && ttDon === 'pending') ||
            (locTT === 'cancelled' && ttDon === 'cancelled') ||
            (locTT === 'refunded' && ttDon === 'refunded');
        if (khopTK && khopTT) danhSach.push(don);
    }

    if (danhSach.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Không có đơn hàng nào khớp bộ lọc.</td></tr>';
        vePhanTrangBangAdmin('phan-trang-don-hang-admin', 0, 1, 'don-hang');
        return;
    }

    var tongTrangDH = Math.ceil(danhSach.length / SO_DONG_BANG_ADMIN);
    if (trangDonHangAdmin > tongTrangDH) trangDonHangAdmin = tongTrangDH;
    if (trangDonHangAdmin < 1) trangDonHangAdmin = 1;
    var batDauDH = (trangDonHangAdmin - 1) * SO_DONG_BANG_ADMIN;
    var ketThucDH = Math.min(batDauDH + SO_DONG_BANG_ADMIN, danhSach.length);

    var html = '';
    for (var j = batDauDH; j < ketThucDH; j++) {
        var d = danhSach[j];
        var hopLeDon = kiemTraTrangThaiDonHopLe(d);
        var maDon = maHoaHTML(d.orderId);
        var tenMon = '';
        var monList = d.items || [];
        for (var m = 0; m < monList.length; m++) {
            if (m > 0) tenMon += ', ';
            tenMon += (monList[m].title || monList[m].id) + ' (x' + Number(monList[m].quantity || 1) + ')';
        }
        var maTTDon = d.orderStatus ? String(d.orderStatus).toLowerCase() : (hopLeDon ? 'paid' : 'cancelled');
        var badge = '<div class="badge bg-danger-subtle text-danger">Đã hủy</div>';
        if (hopLeDon) {
            badge = '<div class="badge bg-success-subtle text-success">Đã thanh toán</div>';
        } else if (maTTDon === 'pending') {
            badge = '<div class="badge bg-warning-subtle text-dark">Chờ xử lý</div>';
        } else if (maTTDon === 'refunded') {
            badge = '<div class="badge bg-secondary-subtle text-secondary">Đã hoàn tiền</div>';
        }
        var nutHanhDong = hopLeDon
            ? '<button type="button" class="btn btn-outline-danger btn-sm nut-doi-trang-thai-don-hang" data-ma-don-hang="' + maDon + '">Hủy đơn</button>'
            : '<button type="button" class="btn btn-outline-success btn-sm nut-doi-trang-thai-don-hang" data-ma-don-hang="' + maDon + '">Kích hoạt lại</button>';

        html += '<tr>';
        html += '  <td class="fw-bold text-primary small">' + maDon + '</td>';
        html += '  <td><div class="fw-semibold small">' + maHoaHTML(d.customerName || '') + '</div><small class="text-muted">' + maHoaHTML(d.customerEmail || '') + '</small></td>';
        html += '  <td class="small">' + maHoaHTML(tenMon) + '<div class="text-muted">' + maHoaHTML(d.createdAt || d.dateISO || '') + '</div></td>';
        html += '  <td class="small">' + maHoaHTML(d.paymentMethod || 'Mô phỏng') + '</td>';
        html += '  <td class="fw-bold text-danger small">' + maHoaHTML(dinhDangTienVND(d.totalAmount)) + '</td>';
        html += '  <td>' + badge + '</td>';
        html += '  <td class="text-end text-nowrap"><button type="button" class="btn btn-outline-primary btn-sm me-1 nut-xem-chi-tiet-don-hang" data-ma-don-hang="' + maDon + '">Chi tiết</button>' + nutHanhDong + '</td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
    vePhanTrangBangAdmin('phan-trang-don-hang-admin', danhSach.length, trangDonHangAdmin, 'don-hang');
}

function moChiTietDonHang(maDonHang) {
    var danhSach = layTatCaDonHang();
    var don = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].orderId === maDonHang) { don = danhSach[i]; break; }
    }
    if (!don) return;

    var tieuDe = document.getElementById('tieu-de-chi-tiet-don-hang');
    var noiDung = document.getElementById('noi-dung-chi-tiet-don-hang');
    if (tieuDe) tieuDe.textContent = 'Chi tiết đơn hàng ' + don.orderId;
    if (!noiDung) return;

    var monHtml = '';
    var cacMon = don.items || [];
    for (var m = 0; m < cacMon.length; m++) {
        monHtml += '<tr><td>' + maHoaHTML(cacMon[m].id) + '</td><td>' + maHoaHTML(cacMon[m].title) + '</td><td class="text-center">' + Number(cacMon[m].quantity || 1) + '</td><td class="text-end">' + maHoaHTML(dinhDangTienVND(cacMon[m].salePrice)) + '</td></tr>';
    }

    var html = '';
    html += '<div class="row g-2 small mb-3">';
    html += '  <div class="col-md-6"><strong>Học viên:</strong> ' + maHoaHTML(don.customerName || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Email:</strong> ' + maHoaHTML(don.customerEmail || '') + '</div>';
    html += '  <div class="col-md-6"><strong>SĐT:</strong> ' + maHoaHTML(don.customerPhone || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Ngày đặt:</strong> ' + maHoaHTML(don.createdAt || don.dateISO || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Phương thức:</strong> ' + maHoaHTML(don.paymentMethod || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Trạng thái:</strong> ' + maHoaHTML(don.status || '') + '</div>';
    html += '</div>';
    html += '<div class="table-responsive mb-3"><table class="table table-sm table-bordered mb-0"><thead class="table-light"><tr><th>Mã KH</th><th>Khóa học</th><th class="text-center">SL</th><th class="text-end">Đơn giá</th></tr></thead><tbody>' + monHtml + '</tbody></table></div>';
    html += '<div class="text-end small">';
    html += '  <div>Tạm tính: <strong>' + maHoaHTML(dinhDangTienVND(don.subtotalAmount !== undefined ? don.subtotalAmount : don.totalAmount)) + '</strong></div>';
    html += '  <div>Mã giảm giá: <strong>' + maHoaHTML(don.discountCode || 'Không áp dụng') + '</strong> (-' + maHoaHTML(dinhDangTienVND(don.discountAmount || 0)) + ')</div>';
    html += '  <div class="fs-6 text-danger fw-bold mt-1">Tổng thanh toán: ' + maHoaHTML(dinhDangTienVND(don.totalAmount)) + '</div>';
    html += '</div>';
    var ttHienTai = don.orderStatus || 'paid';
    if (ttHienTai === 'paid_simulated') ttHienTai = 'paid';
    html += '<div class="border-top pt-3 mt-3 d-flex flex-wrap align-items-center justify-content-between gap-2">';
    html += '  <div class="d-flex align-items-center gap-2">';
    html += '    <label for="chon-trang-thai-don-chi-tiet" class="small fw-bold mb-0">Cập nhật trạng thái:</label>';
    html += '    <select id="chon-trang-thai-don-chi-tiet" class="form-select form-select-sm w-auto">';
    html += '      <option value="pending"' + (ttHienTai === 'pending' ? ' selected' : '') + '>Chờ xử lý (Pending)</option>';
    html += '      <option value="paid"' + (ttHienTai === 'paid' ? ' selected' : '') + '>Đã thanh toán (Paid)</option>';
    html += '      <option value="cancelled"' + (ttHienTai === 'cancelled' ? ' selected' : '') + '>Đã hủy (Cancelled)</option>';
    html += '      <option value="refunded"' + (ttHienTai === 'refunded' ? ' selected' : '') + '>Đã hoàn tiền (Refunded)</option>';
    html += '    </select>';
    html += '  </div>';
    html += '  <button type="button" id="nut-luu-trang-thai-don-chi-tiet" class="btn btn-primary btn-sm fw-semibold">Lưu trạng thái</button>';
    html += '</div>';
    noiDung.innerHTML = html;
    var nutLuuTT = document.getElementById('nut-luu-trang-thai-don-chi-tiet');
    if (nutLuuTT) {
        nutLuuTT.addEventListener('click', function() {
            var chon = document.getElementById('chon-trang-thai-don-chi-tiet');
            if (chon && capNhatTrangThaiDonHangCuThe(don.orderId, chon.value)) {
                dongModalBootstrap('hop-thoai-chi-tiet-don-hang');
            }
        });
    }
    moModalBootstrap('hop-thoai-chi-tiet-don-hang');
}

function capNhatTrangThaiDonHangCuThe(maDonHang, trangThaiMoi) {
    var danhSach = layTatCaDonHang().slice();
    var donMucTieu = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].orderId === maDonHang) { donMucTieu = danhSach[i]; break; }
    }
    if (!donMucTieu) return false;

    var nhanTrangThai = {
        pending: 'Chờ xử lý',
        paid: 'Đã thanh toán - Đã kích hoạt khóa học',
        cancelled: 'Đã hủy (thu hồi quyền học)',
        refunded: 'Đã hoàn tiền (thu hồi quyền học)'
    };
    if (!nhanTrangThai[trangThaiMoi]) return false;

    donMucTieu.orderStatus = (trangThaiMoi === 'paid') ? 'paid_simulated' : trangThaiMoi;
    donMucTieu.status = nhanTrangThai[trangThaiMoi];
    if (!luuTatCaDonHang(danhSach)) {
        hienThiThongBao('Không thể lưu trạng thái đơn hàng mới.', 'danger');
        return false;
    }
    tinhLaiLuotMuaTatCaKhoaHoc();
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã cập nhật đơn ' + maDonHang + ' sang trạng thái: ' + nhanTrangThai[trangThaiMoi], 'success');
    return true;
}

function xuLyDoiTrangThaiDonHang(maDonHang, boQuaXacNhan) {
    var danhSach = layTatCaDonHang().slice();
    var donMucTieu = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].orderId === maDonHang) { donMucTieu = danhSach[i]; break; }
    }
    if (!donMucTieu) return false;

    var dangHopLe = kiemTraTrangThaiDonHopLe(donMucTieu);
    var cauHoi = dangHopLe
        ? 'Xác nhận HỦY đơn hàng ' + maDonHang + '? Quyền học từ đơn này sẽ bị thu hồi nếu học viên không có đơn hợp lệ khác.'
        : 'Xác nhận KÍCH HOẠT LẠI đơn hàng ' + maDonHang + ' (paid_simulated)?';

    if (!boQuaXacNhan) {
        xacNhanHanhDongBootstrap('Cập nhật đơn hàng', cauHoi, function() {
            xuLyDoiTrangThaiDonHang(maDonHang, true);
        });
        return false;
    }

    if (dangHopLe) {
        donMucTieu.orderStatus = 'cancelled';
        donMucTieu.status = 'Đã hủy (thu hồi quyền học từ đơn này)';
    } else {
        donMucTieu.orderStatus = 'paid_simulated';
        donMucTieu.status = 'Thanh toán mô phỏng thành công - Đã kích hoạt khóa học';
    }

    if (!luuTatCaDonHang(danhSach)) {
        hienThiThongBao('Không thể cập nhật trạng thái đơn hàng.', 'danger');
        return false;
    }
    tinhLaiLuotMuaTatCaKhoaHoc();
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã cập nhật trạng thái đơn ' + maDonHang + ' và đồng bộ lại quyền học/lượt mua!', 'success');
    return true;
}

/* =========================================================================
   PHAN HE 4: QUAN LY HOC VIEN & TAI KHOAN
   ========================================================================= */

function demSoAdminHoatDong(danhSach) {
    var dem = 0;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && danhSach[i].role === 'admin' && !kiemTraTaiKhoanBiKhoa(danhSach[i])) {
            dem += 1;
        }
    }
    return dem;
}

function hienThiBangQuanLyNguoiDung() {
    var thanBang = document.getElementById('bang-quan-ly-nguoi-dung');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-nguoi-dung-quan-tri');
    var oVT = document.getElementById('loc-vai-tro-nguoi-dung-admin');
    var oTT = document.getElementById('loc-trang-thai-nguoi-dung-admin');
    var tuKhoa = oTim ? oTim.value.trim().toLowerCase() : '';
    var locVT = oVT ? oVT.value : 'ALL';
    var locTT = oTT ? oTT.value : 'ALL';

    var tatCa = docDuLieuJSONCoTrangThai('EDU_USERS', true).duLieu;
    var danhSach = [];
    for (var i = 0; i < tatCa.length; i++) {
        var u = tatCa[i];
        if (!u) continue;
        var biKhoa = kiemTraTaiKhoanBiKhoa(u);
        var vaiTro = (u.role === 'admin') ? 'admin' : 'user';
        var khopTK = tuKhoa === '' ||
            (u.fullName || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (u.email || '').toLowerCase().indexOf(tuKhoa) > -1 ||
            (u.phone || '').toLowerCase().indexOf(tuKhoa) > -1;
        var khopVT = (locVT === 'ALL') || (vaiTro === locVT) || (locVT === 'user' && (u.role === 'student' || u.role === 'user'));
        var khopTT = (locTT === 'ALL') || (locTT === 'locked' && biKhoa) || (locTT === 'active' && !biKhoa);
        if (khopTK && khopVT && khopTT) danhSach.push(u);
    }

    if (danhSach.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Không tìm thấy tài khoản phù hợp.</td></tr>';
        return;
    }

    var adminHienTai = layQuanTriVienHienTai();
    var html = '';
    for (var j = 0; j < danhSach.length; j++) {
        var tk = danhSach[j];
        var tongAdmin = demSoAdminHoatDong(tatCa);
        var laAdminCuoi = (tk.role === 'admin' && !kiemTraTaiKhoanBiKhoa(tk) && tongAdmin <= 1);
        var laAdminChinh = laAdminCuoi || (adminHienTai && tk.email === adminHienTai.email);
        var dangBiKhoa = kiemTraTaiKhoanBiKhoa(tk);
        var maTK = maHoaHTML(tk.id);
        var badgeVT = tk.role === 'admin'
            ? '<div class="badge bg-warning text-dark">Quản trị viên</div>'
            : '<div class="badge bg-info-subtle text-dark">Học viên</div>';
        var badgeTT = dangBiKhoa
            ? '<div class="badge bg-danger-subtle text-danger">Đang bị khóa</div>'
            : '<div class="badge bg-success-subtle text-success">Đang hoạt động</div>';
        var disabledAttr = laAdminChinh ? 'disabled' : '';
        var nhanNutKhoa = dangBiKhoa ? 'Mở khóa' : 'Khóa';

        html += '<tr>';
        html += '  <td class="small fw-bold text-secondary">' + maTK + '</td>';
        html += '  <td class="fw-semibold small">' + maHoaHTML(tk.fullName || '') + '</td>';
        html += '  <td class="small">' + maHoaHTML(tk.email || '') + '<div class="text-muted">' + maHoaHTML(tk.phone || '') + '</div></td>';
        html += '  <td>' + badgeVT + '</td>';
        html += '  <td>' + badgeTT + '</td>';
        html += '  <td class="text-end text-nowrap">';
        html += '    <button type="button" class="btn btn-outline-primary btn-sm me-1 nut-xem-chi-tiet-hoc-vien" data-ma-nguoi-dung="' + maTK + '">Chi tiết</button>';
        html += '    <button type="button" class="btn btn-outline-warning btn-sm nut-khoa-mo-nguoi-dung" data-ma-nguoi-dung="' + maTK + '" ' + disabledAttr + '>' + nhanNutKhoa + '</button>';
        html += '  </td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
}

function moChiTietHocVien(maNguoiDung) {
    var danhSach = docDuLieuJSONCoTrangThai('EDU_USERS', true).duLieu;
    var tk = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maNguoiDung) { tk = danhSach[i]; break; }
    }
    if (!tk) return;

    var tieuDe = document.getElementById('tieu-de-chi-tiet-hoc-vien');
    var noiDung = document.getElementById('noi-dung-chi-tiet-hoc-vien');
    if (tieuDe) tieuDe.textContent = 'Hồ sơ: ' + (tk.fullName || tk.email);
    if (!noiDung) return;

    var emailThuong = String(tk.email || '').trim().toLowerCase();
    var tatCaDon = layTatCaDonHang();
    var donCuaUser = [];
    var khoaDaSoHuu = [];
    for (var d = 0; d < tatCaDon.length; d++) {
        var eDon = tatCaDon[d].customerEmail ? String(tatCaDon[d].customerEmail).trim().toLowerCase() : '';
        if (eDon === emailThuong) {
            donCuaUser.push(tatCaDon[d]);
            if (kiemTraTrangThaiDonHopLe(tatCaDon[d]) && Array.isArray(tatCaDon[d].items)) {
                for (var m = 0; m < tatCaDon[d].items.length; m++) {
                    var monDon = tatCaDon[d].items[m];
                    if (monDon && typeof monDon === 'object') {
                        var tenK = monDon.title || monDon.id;
                        if (tenK && khoaDaSoHuu.indexOf(tenK) === -1) khoaDaSoHuu.push(tenK);
                    }
                }
            }
        }
    }

    var html = '<div class="row g-2 small mb-3">';
    html += '  <div class="col-md-6"><strong>Họ tên:</strong> ' + maHoaHTML(tk.fullName || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Email:</strong> ' + maHoaHTML(tk.email || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Số điện thoại:</strong> ' + maHoaHTML(tk.phone || '') + '</div>';
    html += '  <div class="col-md-6"><strong>Trạng thái:</strong> ' + (kiemTraTaiKhoanBiKhoa(tk) ? 'Đang bị khóa' : 'Đang hoạt động') + '</div>';
    html += '</div>';
    html += '<h6 class="fw-bold small">Khóa học đang sở hữu hợp lệ (' + khoaDaSoHuu.length + ')</h6>';
    if (khoaDaSoHuu.length === 0) {
        html += '<p class="text-muted small">Chưa sở hữu khóa học nào.</p>';
    } else {
        html += '<ul class="small mb-3">';
        for (var k = 0; k < khoaDaSoHuu.length; k++) html += '<li>' + maHoaHTML(khoaDaSoHuu[k]) + '</li>';
        html += '</ul>';
    }
    html += '<h6 class="fw-bold small">Lịch sử đơn hàng (' + donCuaUser.length + ')</h6>';
    if (donCuaUser.length === 0) {
        html += '<p class="text-muted small mb-0">Chưa có đơn hàng nào.</p>';
    } else {
        html += '<div class="table-responsive"><table class="table table-sm table-bordered mb-0 small"><thead class="table-light"><tr><th>Mã ĐH</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>';
        for (var r = 0; r < donCuaUser.length; r++) {
            html += '<tr><td>' + maHoaHTML(donCuaUser[r].orderId) + '</td><td>' + maHoaHTML(donCuaUser[r].dateISO || '') + '</td><td>' + maHoaHTML(dinhDangTienVND(donCuaUser[r].totalAmount)) + '</td><td>' + maHoaHTML(donCuaUser[r].status || '') + '</td></tr>';
        }
        html += '</tbody></table></div>';
    }
    var vaiTroHienTai = (tk.role === 'admin') ? 'admin' : 'user';
    html += '<form id="bieu-mau-sua-tai-khoan-admin" class="border-top pt-3 mt-3">';
    html += '  <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-pencil-square me-1"></i>Chỉnh sửa thông tin &amp; Phân quyền</h6>';
    html += '  <div class="row g-2 mb-2">';
    html += '    <div class="col-md-6"><label class="form-label small fw-semibold mb-1">Họ tên</label><input type="text" id="sua-ho-ten-user-admin" class="form-control form-control-sm" value="' + maHoaHTML(tk.fullName || '') + '" required></div>';
    html += '    <div class="col-md-6"><label class="form-label small fw-semibold mb-1">Số điện thoại</label><input type="tel" id="sua-sdt-user-admin" class="form-control form-control-sm" value="' + maHoaHTML(tk.phone || '') + '" minlength="10" maxlength="10"></div>';
    html += '    <div class="col-md-7"><label class="form-label small fw-semibold mb-1">Địa chỉ</label><input type="text" id="sua-dia-chi-user-admin" class="form-control form-control-sm" value="' + maHoaHTML(tk.address || '') + '"></div>';
    html += '    <div class="col-md-5"><label class="form-label small fw-semibold mb-1">Vai trò (RBAC)</label><select id="sua-vai-tro-user-admin" class="form-select form-select-sm"><option value="user"' + (vaiTroHienTai === 'user' ? ' selected' : '') + '>Học viên (User)</option><option value="admin"' + (vaiTroHienTai === 'admin' ? ' selected' : '') + '>Quản trị viên (Admin)</option></select></div>';
    html += '  </div>';
    html += '  <div class="text-end"><button type="submit" class="btn btn-primary btn-sm fw-semibold">Lưu thay đổi tài khoản</button></div>';
    html += '</form>';

    noiDung.innerHTML = html;
    var oSdtSuaUser = document.getElementById('sua-sdt-user-admin');
    if (oSdtSuaUser && typeof ganChiChoNhapSo === 'function') {
        ganChiChoNhapSo(oSdtSuaUser, 10);
    }
    var bieuMauSuaUser = document.getElementById('bieu-mau-sua-tai-khoan-admin');
    if (bieuMauSuaUser) {
        bieuMauSuaUser.addEventListener('submit', function(e) {
            e.preventDefault();
            luuChinhSuaNguoiDungTuAdmin(tk.id);
        });
    }
    moModalBootstrap('hop-thoai-chi-tiet-hoc-vien');
}

function luuChinhSuaNguoiDungTuAdmin(maNguoiDung) {
    if (!kiemTraLaQuanTriVien()) return false;
    var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
    if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) return false;
    var danhSach = ketQuaDoc.duLieu.slice();
    var hoTenMoi = document.getElementById('sua-ho-ten-user-admin').value.trim();
    var sdtMoi = document.getElementById('sua-sdt-user-admin').value.trim();
    var diaChiMoi = document.getElementById('sua-dia-chi-user-admin').value.trim();
    var vaiTroMoi = document.getElementById('sua-vai-tro-user-admin').value;
    if (vaiTroMoi !== 'admin') vaiTroMoi = 'user';

    if (hoTenMoi === '') {
        hienThiThongBao('Họ tên không được để trống!', 'danger');
        return false;
    }
    if (sdtMoi !== '' && !/^[0-9]{10}$/.test(sdtMoi)) {
        hienThiThongBao('Số điện thoại không hợp lệ! Vui lòng nhập chính xác 10 chữ số.', 'danger');
        return false;
    }

    var tongAdmin = demSoAdminHoatDong(danhSach);
    var adminHienTai = layQuanTriVienHienTai();
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maNguoiDung) {
            if (danhSach[i].role === 'admin' && vaiTroMoi !== 'admin' && tongAdmin <= 1) {
                hienThiThongBao('Không thể hạ quyền Admin cuối cùng đang hoạt động trong hệ thống!', 'warning');
                return false;
            }
            danhSach[i].fullName = hoTenMoi;
            danhSach[i].phone = sdtMoi;
            danhSach[i].address = diaChiMoi;
            danhSach[i].role = vaiTroMoi;
            if (!luuDuLieuJSON('EDU_USERS', danhSach)) {
                hienThiThongBao('Không thể lưu thay đổi tài khoản.', 'danger');
                return false;
            }
            if (adminHienTai && typeof adminHienTai.email === 'string' && danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === adminHienTai.email.toLowerCase()) {
                if (vaiTroMoi !== 'admin') {
                    xoaQuanTriVienHienTai();
                    window.location.replace(layDuongDanTrang('admin-login.html'));
                    return true;
                }
                adminHienTai.fullName = hoTenMoi;
                adminHienTai.phone = sdtMoi;
                luuQuanTriVienHienTai(adminHienTai);
                hienThiThongTinAdminHeader();
            }
            dongModalBootstrap('hop-thoai-chi-tiet-hoc-vien');
            lamMoiBangDieuKhienQuanTri();
            hienThiThongBao('Đã cập nhật thông tin & vai trò tài khoản thành công!', 'success');
            return true;
        }
    }
    return false;
}

function xuLyDoiTrangThaiKhoaNguoiDung(maNguoiDung) {
    var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
    if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) {
        hienThiThongBao('Dữ liệu EDU_USERS đang gặp lỗi JSON.', 'danger');
        return false;
    }
    var danhSach = ketQuaDoc.duLieu.slice();
    var adminHienTai = layQuanTriVienHienTai();
    var trangThaiMoi = 'active';
    var daCapNhat = false;

    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maNguoiDung) {
            if ((danhSach[i].email === EMAIL_QUAN_TRI_MAC_DINH && danhSach[i].role === 'admin') ||
                (adminHienTai && danhSach[i].email === adminHienTai.email)) {
                hienThiThongBao('Không thể khóa tài khoản Quản trị viên đang sử dụng!', 'warning');
                return false;
            }
            trangThaiMoi = kiemTraTaiKhoanBiKhoa(danhSach[i]) ? 'active' : 'locked';
            danhSach[i].status = trangThaiMoi;
            daCapNhat = true;
            break;
        }
    }
    if (!daCapNhat) return false;
    if (!luuDuLieuJSON('EDU_USERS', danhSach)) {
        hienThiThongBao('Không thể lưu trạng thái tài khoản vào LocalStorage.', 'danger');
        return false;
    }
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao(trangThaiMoi === 'locked' ? 'Đã khóa tài khoản học viên!' : 'Đã mở khóa tài khoản học viên!', 'info');
    return true;
}

/* =========================================================================
   PHAN HE 5: QUAN LY DANH MUC (EDU_CATEGORIES)
   ========================================================================= */
function demSoKhoaHocTheoDanhMuc(tenDanhMuc) {
    var tatCa = layTatCaKhoaHoc();
    var dem = 0;
    for (var i = 0; i < tatCa.length; i++) {
        if (tatCa[i].category === tenDanhMuc) dem = dem + 1;
    }
    return dem;
}

function hienThiBangQuanLyDanhMuc() {
    var thanBang = document.getElementById('bang-quan-ly-danh-muc');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-danh-muc-quan-tri');
    var tuKhoa = oTim ? oTim.value.trim().toLowerCase() : '';
    var tatCa = layTatCaDanhMuc();
    var html = '';

    for (var i = 0; i < tatCa.length; i++) {
        var dm = tatCa[i];
        var khop = tuKhoa === '' || (dm.name || '').toLowerCase().indexOf(tuKhoa) > -1 || (dm.slug || '').toLowerCase().indexOf(tuKhoa) > -1;
        if (!khop) continue;
        var soKH = demSoKhoaHocTheoDanhMuc(dm.name);
        var dangHien = String(dm.status || 'active') !== 'hidden';
        var badge = dangHien
            ? '<div class="badge bg-success-subtle text-success">Đang hiển thị</div>'
            : '<div class="badge bg-secondary-subtle text-secondary">Đang ẩn</div>';
        var maDM = maHoaHTML(dm.id);

        html += '<tr>';
        html += '  <td class="small fw-bold text-secondary">' + maDM + '</td>';
        html += '  <td><div class="fw-bold small">' + maHoaHTML(dm.name) + '</div><small class="text-muted">' + maHoaHTML(dm.description || '') + '</small></td>';
        html += '  <td class="small text-muted">' + maHoaHTML(dm.slug || '') + '</td>';
        html += '  <td class="text-center"><div class="badge bg-primary-subtle text-primary">' + soKH + ' khóa</div></td>';
        html += '  <td class="text-center">' + badge + '</td>';
        html += '  <td class="text-end text-nowrap">';
        html += '    <button type="button" class="btn btn-outline-primary btn-sm me-1 nut-sua-danh-muc" data-ma-danh-muc="' + maDM + '">Sửa</button>';
        html += '    <button type="button" class="btn btn-outline-danger btn-sm nut-xoa-danh-muc" data-ma-danh-muc="' + maDM + '">Xóa</button>';
        html += '  </td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html || '<tr><td colspan="6" class="text-center text-muted py-4">Không tìm thấy danh mục.</td></tr>';
}

function moHopThoaiThemDanhMuc() {
    document.getElementById('tieu-de-hop-thoai-danh-muc').textContent = 'Thêm danh mục mới';
    document.getElementById('che-do-sua-danh-muc').value = 'ADD';
    document.getElementById('ma-danh-muc-dang-sua').value = '';
    document.getElementById('nhap-ten-danh-muc').value = '';
    document.getElementById('nhap-mo-ta-danh-muc').value = '';
    document.getElementById('nhap-trang-thai-danh-muc').value = 'active';
    moModalBootstrap('hop-thoai-danh-muc');
}

function moHopThoaiSuaDanhMuc(maDM) {
    var tatCa = layTatCaDanhMuc();
    var dm = null;
    for (var i = 0; i < tatCa.length; i++) {
        if (tatCa[i].id === maDM) { dm = tatCa[i]; break; }
    }
    if (!dm) return;
    document.getElementById('tieu-de-hop-thoai-danh-muc').textContent = 'Chỉnh sửa danh mục';
    document.getElementById('che-do-sua-danh-muc').value = 'EDIT';
    document.getElementById('ma-danh-muc-dang-sua').value = dm.id;
    document.getElementById('nhap-ten-danh-muc').value = dm.name || '';
    document.getElementById('nhap-mo-ta-danh-muc').value = dm.description || '';
    document.getElementById('nhap-trang-thai-danh-muc').value = dm.status || 'active';
    moModalBootstrap('hop-thoai-danh-muc');
}

function xuLyLuuDanhMuc(boQuaXacNhan) {
    var cheDo = document.getElementById('che-do-sua-danh-muc').value;
    var maDangSua = document.getElementById('ma-danh-muc-dang-sua').value;
    var tenMoi = document.getElementById('nhap-ten-danh-muc').value.trim();
    var moTa = document.getElementById('nhap-mo-ta-danh-muc').value.trim();
    var trangThai = document.getElementById('nhap-trang-thai-danh-muc').value || 'active';

    if (tenMoi === '') {
        hienThiThongBao('Tên danh mục không được để trống!', 'danger');
        return false;
    }

    var slugMoi = taoSlugDanhMuc(tenMoi);
    var danhSach = layTatCaDanhMuc().slice();
    for (var i = 0; i < danhSach.length; i++) {
        if (cheDo === 'EDIT' && danhSach[i].id === maDangSua) continue;
        if (String(danhSach[i].name || '').toLowerCase() === tenMoi.toLowerCase() || danhSach[i].slug === slugMoi) {
            hienThiThongBao('Tên hoặc slug danh mục đã tồn tại!', 'danger');
            return false;
        }
    }

    var lucNay = new Date().toLocaleString('vi-VN');
    if (cheDo === 'ADD') {
        danhSach.push({
            id: taoMaDuyNhat('CAT_', danhSach, 'id'),
            name: tenMoi, slug: slugMoi, description: moTa, status: trangThai,
            createdAt: lucNay, updatedAt: lucNay
        });
    } else {
        var tenCu = '';
        for (var j = 0; j < danhSach.length; j++) {
            if (danhSach[j].id === maDangSua) {
                tenCu = danhSach[j].name;
                danhSach[j].name = tenMoi;
                danhSach[j].slug = slugMoi;
                danhSach[j].description = moTa;
                danhSach[j].status = trangThai;
                danhSach[j].updatedAt = lucNay;
                break;
            }
        }
        // Dong bo doi ten sang cac khoa hoc dang dung danh muc cu
        if (tenCu !== '' && tenCu !== tenMoi) {
            var soBiAnhHuong = demSoKhoaHocTheoDanhMuc(tenCu);
            if (soBiAnhHuong > 0 && !boQuaXacNhan) {
                if (boQuaXacNhan !== true) {
                    xacNhanHanhDongBootstrap('Đổi tên danh mục', 'Đổi tên "' + tenCu + '" thành "' + tenMoi + '" sẽ tự động cập nhật cho ' + soBiAnhHuong + ' khóa học liên quan. Tiếp tục?', function() {
                        xuLyLuuDanhMuc(true);
                    });
                    return false;
                }
            }
            var tatCaKH = layTatCaKhoaHoc().slice();
            for (var k = 0; k < tatCaKH.length; k++) {
                if (tatCaKH[k].category === tenCu) {
                    tatCaKH[k].category = tenMoi;
                }
            }
            luuTatCaKhoaHoc(tatCaKH);
        }
    }

    if (!luuTatCaDanhMuc(danhSach)) {
        hienThiThongBao('Không thể lưu danh mục vào LocalStorage.', 'danger');
        return false;
    }
    dongModalBootstrap('hop-thoai-danh-muc');
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã lưu danh mục "' + tenMoi + '" thành công!', 'success');
    return true;
}

function xuLyXoaDanhMuc(maDM, boQuaXacNhan) {
    var danhSach = layTatCaDanhMuc();
    var dm = null;
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maDM) { dm = danhSach[i]; break; }
    }
    if (!dm) return false;
    var soKH = demSoKhoaHocTheoDanhMuc(dm.name);
    if (soKH > 0) {
        hienThiThongBao('Không thể xóa danh mục "' + dm.name + '" vì đang có ' + soKH + ' khóa học tham chiếu. Hãy chuyển khóa học hoặc chọn Ẩn danh mục!', 'warning');
        return false;
    }
    if (boQuaXacNhan !== true) { xacNhanHanhDongBootstrap('Xóa danh mục', 'Bạn có chắc chắn muốn xóa danh mục "' + dm.name + '"?', function() { xuLyXoaDanhMuc(maDM, true); }); return false; }
    if (!luuTatCaDanhMuc(xoaPhanTuTrongMangTheoId(danhSach, maDM, 'id'))) {
        hienThiThongBao('Không thể xóa danh mục trong LocalStorage.', 'danger');
        return false;
    }
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã xóa danh mục "' + dm.name + '".', 'info');
    return true;
}

/* =========================================================================
   PHAN HE 6: QUAN LY MA GIAM GIA (EDU_COUPONS)
   ========================================================================= */
function xacDinhTrangThaiVoucher(v) {
    var homNay = layChuoiNgayHomNay();
    if (!v.isActive) return 'INACTIVE';
    if (v.expiresAt && homNay > v.expiresAt) return 'EXPIRED';
    if (Number(v.usageLimit || 0) > 0 && Number(v.usedCount || 0) >= Number(v.usageLimit)) return 'EXHAUSTED';
    return 'ACTIVE';
}

function hienThiBangQuanLyMaGiamGia() {
    var thanBang = document.getElementById('bang-quan-ly-ma-giam-gia');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-ma-giam-gia-quan-tri');
    var oLoc = document.getElementById('loc-trang-thai-voucher-admin');
    var tuKhoa = oTim ? oTim.value.trim().toUpperCase() : '';
    var locTT = oLoc ? oLoc.value : 'ALL';

    var tatCa = layTatCaMaGiamGia();
    var html = '';
    for (var i = 0; i < tatCa.length; i++) {
        var v = tatCa[i];
        var tt = xacDinhTrangThaiVoucher(v);
        if (tuKhoa !== '' && String(v.code || '').toUpperCase().indexOf(tuKhoa) === -1) continue;
        if (locTT !== 'ALL' && tt !== locTT) continue;

        var mucGiam = v.discountType === 'percent' ? (Number(v.discountValue) + '%') : dinhDangTienVND(v.discountValue);
        var gioiHan = Number(v.usageLimit || 0) > 0 ? (Number(v.usedCount || 0) + ' / ' + Number(v.usageLimit)) : (Number(v.usedCount || 0) + ' / Không giới hạn');
        var badge = '<div class="badge bg-success-subtle text-success">Đang hoạt động</div>';
        if (tt === 'INACTIVE') badge = '<div class="badge bg-secondary-subtle text-secondary">Đang tắt</div>';
        if (tt === 'EXPIRED') badge = '<div class="badge bg-danger-subtle text-danger">Hết hạn</div>';
        if (tt === 'EXHAUSTED') badge = '<div class="badge bg-warning-subtle text-dark">Hết lượt</div>';
        var ma = maHoaHTML(v.code);

        html += '<tr>';
        html += '  <td class="fw-bold text-primary">' + ma + '</td>';
        html += '  <td class="fw-semibold">' + maHoaHTML(mucGiam) + '</td>';
        html += '  <td class="small">' + maHoaHTML(dinhDangTienVND(v.minOrderValue || 0)) + '</td>';
        html += '  <td class="text-center small">' + maHoaHTML(gioiHan) + '</td>';
        html += '  <td class="small text-muted">' + maHoaHTML(v.expiresAt || 'Không giới hạn') + '</td>';
        html += '  <td class="text-center">' + badge + '</td>';
        html += '  <td class="text-end text-nowrap">';
        html += '    <button type="button" class="btn btn-outline-primary btn-sm me-1 nut-sua-voucher" data-ma-voucher="' + ma + '">Sửa</button>';
        html += '    <button type="button" class="btn btn-outline-warning btn-sm me-1 nut-bat-tat-voucher" data-ma-voucher="' + ma + '">' + (v.isActive ? 'Tắt' : 'Bật') + '</button>';
        html += '    <button type="button" class="btn btn-outline-danger btn-sm nut-xoa-voucher" data-ma-voucher="' + ma + '">Xóa</button>';
        html += '  </td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html || '<tr><td colspan="7" class="text-center text-muted py-4">Không có mã giảm giá nào.</td></tr>';
}

function moHopThoaiThemVoucher() {
    document.getElementById('tieu-de-hop-thoai-ma-giam-gia').textContent = 'Tạo mã giảm giá mới';
    document.getElementById('che-do-sua-voucher').value = 'ADD';
    var oMa = document.getElementById('nhap-ma-voucher');
    oMa.value = ''; oMa.readOnly = false;
    document.getElementById('nhap-loai-giam-voucher').value = 'percent';
    document.getElementById('nhap-gia-tri-voucher').value = '10';
    document.getElementById('nhap-don-toi-thieu-voucher').value = '0';
    document.getElementById('nhap-gioi-han-luot-voucher').value = '0';
    document.getElementById('nhap-han-su-dung-voucher').value = '';
    document.getElementById('chon-kich-hoat-voucher').checked = true;
    moModalBootstrap('hop-thoai-ma-giam-gia');
}

function moHopThoaiSuaVoucher(maCode) {
    var tatCa = layTatCaMaGiamGia();
    var v = null;
    for (var i = 0; i < tatCa.length; i++) {
        if (tatCa[i].code === maCode) { v = tatCa[i]; break; }
    }
    if (!v) return;
    document.getElementById('tieu-de-hop-thoai-ma-giam-gia').textContent = 'Chỉnh sửa mã ' + v.code;
    document.getElementById('che-do-sua-voucher').value = 'EDIT';
    var oMa = document.getElementById('nhap-ma-voucher');
    oMa.value = v.code; oMa.readOnly = true;
    document.getElementById('nhap-loai-giam-voucher').value = v.discountType || 'percent';
    document.getElementById('nhap-gia-tri-voucher').value = Number(v.discountValue || 0);
    document.getElementById('nhap-don-toi-thieu-voucher').value = Number(v.minOrderValue || 0);
    document.getElementById('nhap-gioi-han-luot-voucher').value = Number(v.usageLimit || 0);
    document.getElementById('nhap-han-su-dung-voucher').value = v.expiresAt || '';
    document.getElementById('chon-kich-hoat-voucher').checked = Boolean(v.isActive);
    moModalBootstrap('hop-thoai-ma-giam-gia');
}

function xuLyLuuVoucher() {
    var cheDo = document.getElementById('che-do-sua-voucher').value;
    var ma = document.getElementById('nhap-ma-voucher').value.trim().toUpperCase().replace(/\s+/g, '');
    var loai = document.getElementById('nhap-loai-giam-voucher').value;
    var giaTri = Number(document.getElementById('nhap-gia-tri-voucher').value);
    var donToiThieu = Number(document.getElementById('nhap-don-toi-thieu-voucher').value || 0);
    var gioiHan = Number(document.getElementById('nhap-gioi-han-luot-voucher').value || 0);
    var hanDung = document.getElementById('nhap-han-su-dung-voucher').value.trim();
    var kichHoat = document.getElementById('chon-kich-hoat-voucher').checked;

    if (ma === '') {
        hienThiThongBao('Mã voucher không được để trống!', 'danger');
        return false;
    }
    if (loai === 'percent' && (isNaN(giaTri) || giaTri < 1 || giaTri > 100)) {
        hienThiThongBao('Giảm theo phần trăm phải từ 1% đến 100%!', 'danger');
        return false;
    }
    if (loai === 'fixed' && (isNaN(giaTri) || giaTri <= 0)) {
        hienThiThongBao('Số tiền giảm phải lớn hơn 0!', 'danger');
        return false;
    }
    if (isNaN(donToiThieu) || donToiThieu < 0 || isNaN(gioiHan) || gioiHan < 0) {
        hienThiThongBao('Đơn tối thiểu và giới hạn lượt phải là số không âm!', 'danger');
        return false;
    }

    var danhSach = layTatCaMaGiamGia().slice();
    var lucNay = new Date().toLocaleString('vi-VN');
    if (cheDo === 'ADD') {
        for (var i = 0; i < danhSach.length; i++) {
            if (danhSach[i].code === ma) {
                hienThiThongBao('Mã giảm giá "' + ma + '" đã tồn tại!', 'danger');
                return false;
            }
        }
        danhSach.unshift({
            code: ma, discountType: loai, discountValue: giaTri,
            minOrderValue: donToiThieu, usageLimit: gioiHan, usedCount: 0,
            isActive: kichHoat, expiresAt: hanDung, createdAt: lucNay, updatedAt: lucNay
        });
    } else {
        for (var j = 0; j < danhSach.length; j++) {
            if (danhSach[j].code === ma) {
                danhSach[j].discountType = loai;
                danhSach[j].discountValue = giaTri;
                danhSach[j].minOrderValue = donToiThieu;
                danhSach[j].usageLimit = gioiHan;
                danhSach[j].isActive = kichHoat;
                danhSach[j].expiresAt = hanDung;
                danhSach[j].updatedAt = lucNay;
                break;
            }
        }
    }

    if (!luuTatCaMaGiamGia(danhSach)) {
        hienThiThongBao('Không thể lưu mã giảm giá vào LocalStorage.', 'danger');
        return false;
    }
    dongModalBootstrap('hop-thoai-ma-giam-gia');
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã lưu mã giảm giá ' + ma + ' thành công!', 'success');
    return true;
}

function xuLyBatTatVoucher(maCode) {
    var danhSach = layTatCaMaGiamGia().slice();
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].code === maCode) {
            danhSach[i].isActive = !danhSach[i].isActive;
            danhSach[i].updatedAt = new Date().toLocaleString('vi-VN');
            break;
        }
    }
    if (!luuTatCaMaGiamGia(danhSach)) return false;
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã đổi trạng thái mã ' + maCode + '.', 'info');
    return true;
}

function xuLyXoaVoucher(maCode, boQuaXacNhan) {
    if (boQuaXacNhan !== true) { xacNhanHanhDongBootstrap('Xóa mã giảm giá', 'Bạn có chắc chắn muốn xóa mã giảm giá ' + maCode + '?', function() { xuLyXoaVoucher(maCode, true); }); return false; }
    var danhSach = xoaPhanTuTrongMangTheoId(layTatCaMaGiamGia(), maCode, 'code');
    if (!luuTatCaMaGiamGia(danhSach)) return false;
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã xóa mã giảm giá ' + maCode + '.', 'info');
    return true;
}

/* =========================================================================
   PHAN HE 7 & 8: QUAN LY DANH GIA & LIEN HE
   ========================================================================= */
function hienThiBangQuanLyDanhGia() {
    var thanBang = document.getElementById('bang-quan-ly-danh-gia');
    if (!thanBang) return;

    var oTim = document.getElementById('o-tim-danh-gia-quan-tri');
    var tuKhoa = oTim ? oTim.value.trim().toLowerCase() : '';
    var tatCa = layTatCaDanhGia();
    var html = '';

    for (var i = 0; i < tatCa.length; i++) {
        var rev = tatCa[i];
        if (!kiemTraNgayKhopBoLoc(rev.dateISO || '')) continue;
        if (tuKhoa !== '' &&
            (rev.courseId || '').toLowerCase().indexOf(tuKhoa) === -1 &&
            (rev.userName || '').toLowerCase().indexOf(tuKhoa) === -1 &&
            (rev.comment || '').toLowerCase().indexOf(tuKhoa) === -1) {
            continue;
        }
        var kh = timKhoaHocTheoMa(rev.courseId);
        html += '<tr>';
        html += '  <td class="small fw-bold text-primary">' + maHoaHTML(rev.courseId) + '</td>';
        html += '  <td class="small fw-semibold">' + maHoaHTML(kh ? kh.title : rev.courseId) + '</td>';
        html += '  <td class="small">' + maHoaHTML(rev.userName || '') + '<div class="text-muted">' + maHoaHTML(rev.createdAt || '') + '</div></td>';
        html += '  <td class="text-warning fw-bold">' + Number(rev.stars || 0) + ' ★</td>';
        html += '  <td class="small">' + maHoaHTML(rev.comment || '') + '</td>';
        html += '  <td class="text-end"><button type="button" class="btn btn-outline-danger btn-sm nut-xoa-danh-gia-quan-tri" data-ma-danh-gia="' + maHoaHTML(rev.id) + '" data-ma-khoa-hoc="' + maHoaHTML(rev.courseId) + '"><i class="bi bi-trash"></i></button></td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html || '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có đánh giá sao nào.</td></tr>';
}

function xuLyXoaDanhGia(maDanhGia, maKhoaHoc, boQuaXacNhan) {
    if (boQuaXacNhan !== true) { xacNhanHanhDongBootstrap('Xóa đánh giá', 'Xóa đánh giá này? Điểm trung bình khóa học sẽ tự động tính lại.', function() { xuLyXoaDanhGia(maDanhGia, maKhoaHoc, true); }); return false; }
    var danhSachMoi = xoaPhanTuTrongMangTheoId(layTatCaDanhGia(), maDanhGia, 'id');
    if (!luuTatCaDanhGia(danhSachMoi)) return false;
    tinhLaiDiemDanhGiaKhoaHoc(maKhoaHoc);
    lamMoiBangDieuKhienQuanTri();
    hienThiThongBao('Đã xóa đánh giá và cập nhật lại điểm sao trung bình!', 'info');
    return true;
}

function hienThiBangQuanLyLienHe() {
    var thanBang = document.getElementById('bang-quan-ly-lien-he');
    if (!thanBang) return;

    var tatCa = layTatCaLienHe();
    if (tatCa.length === 0) {
        thanBang.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Chưa có tin nhắn liên hệ nào được lưu cục bộ.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < tatCa.length; i++) {
        var lh = tatCa[i];
        var ma = maHoaHTML(lh.id);
        var tt = lh.status || 'Mới';
        html += '<tr>';
        html += '  <td class="small fw-bold text-primary">' + ma + '</td>';
        html += '  <td class="small"><div class="fw-bold">' + maHoaHTML(lh.fullName || '') + '</div><div class="text-muted">' + maHoaHTML(lh.email || '') + '</div></td>';
        html += '  <td class="small"><div class="fw-semibold">' + maHoaHTML(lh.subject || '') + '</div><div class="text-secondary">' + maHoaHTML(lh.message || '') + '</div><small class="text-muted">' + maHoaHTML(lh.createdAt || '') + '</small></td>';
        html += '  <td><select class="form-select form-select-sm chon-trang-thai-lien-he" data-ma-lien-he="' + ma + '">';
        html += '    <option value="Mới"' + (tt === 'Mới' || tt.indexOf('cục bộ') > -1 ? ' selected' : '') + '>Mới (cục bộ)</option>';
        html += '    <option value="Đang xử lý"' + (tt === 'Đang xử lý' ? ' selected' : '') + '>Đang xử lý</option>';
        html += '    <option value="Đã xử lý"' + (tt === 'Đã xử lý' ? ' selected' : '') + '>Đã xử lý</option>';
        html += '  </select></td>';
        html += '  <td class="text-end"><button type="button" class="btn btn-outline-danger btn-sm nut-xoa-lien-he-quan-tri" data-ma-lien-he="' + ma + '"><i class="bi bi-trash"></i></button></td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
}

function xuLyDoiTrangThaiLienHe(maLienHe, trangThaiMoi) {
    var danhSach = layTatCaLienHe().slice();
    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i].id === maLienHe) {
            danhSach[i].status = trangThaiMoi;
            break;
        }
    }
    if (!luuTatCaLienHe(danhSach)) {
        hienThiThongBao('Không thể lưu trạng thái liên hệ.', 'danger');
        return false;
    }
    hienThiThongBao('Đã cập nhật trạng thái liên hệ ' + maLienHe + ' thành "' + trangThaiMoi + '".', 'success');
    return true;
}

function xuLyXoaLienHe(maLienHe, boQuaXacNhan) {
    if (boQuaXacNhan !== true) { xacNhanHanhDongBootstrap('Xóa liên hệ', 'Bạn có chắc chắn muốn xóa tin nhắn liên hệ ' + maLienHe + '?', function() { xuLyXoaLienHe(maLienHe, true); }); return false; }
    if (!luuTatCaLienHe(xoaPhanTuTrongMangTheoId(layTatCaLienHe(), maLienHe, 'id'))) return false;
    hienThiBangQuanLyLienHe();
    hienThiThongBao('Đã xóa tin nhắn liên hệ ' + maLienHe + '.', 'info');
    return true;
}

/* =========================================================================
   GAN SU KIEN 1 LAN DUY NHAT (EVENT DELEGATION)
   ========================================================================= */
function ganSuKienTrangQuanTri() {
    // 1. Sidebar & dieu huong phan he
    var menuSidebar = document.getElementById('menu-phan-he-quan-tri');
    if (menuSidebar) {
        menuSidebar.addEventListener('click', function(e) {
            var nut = e.target.closest('.admin-nav-btn');
            if (nut && nut.getAttribute('data-phan-he')) {
                chuyenPhanHeQuanTri(nut.getAttribute('data-phan-he'));
            }
        });
    }

    document.addEventListener('click', function(e) {
        var nutChuyen = e.target.closest('.nut-chuyen-phan-he');
        if (nutChuyen && nutChuyen.getAttribute('data-phan-he')) {
            chuyenPhanHeQuanTri(nutChuyen.getAttribute('data-phan-he'));
        }
    });

    var nutThuGon = document.getElementById('nut-thu-gon-sidebar');
    if (nutThuGon) {
        nutThuGon.addEventListener('click', function() {
            var layout = document.getElementById('khung-bo-cuc-quan-tri');
            var icon = document.getElementById('bieu-tuong-thu-gon-sidebar');
            if (layout) {
                layout.classList.toggle('admin-sidebar-collapsed');
                if (icon) {
                    icon.className = layout.classList.contains('admin-sidebar-collapsed')
                        ? 'bi bi-chevron-double-right fs-5'
                        : 'bi bi-chevron-double-left fs-5';
                }
            }
        });
    }

    var nutMobile = document.getElementById('nut-mo-menu-mobile');
    var backdrop = document.getElementById('lop-phu-sidebar-quan-tri');
    if (nutMobile) {
        nutMobile.addEventListener('click', function() {
            var sb = document.getElementById('thanh-ben-quan-tri');
            if (sb) sb.classList.add('admin-sidebar-mobile-open');
            if (backdrop) backdrop.classList.add('show');
        });
    }
    if (backdrop) backdrop.addEventListener('click', dongSidebarMobile);

    // 2. Dang xuat & Khoi phuc du lieu mau (xac nhan 2 buoc)
    var nutDangXuat = document.getElementById('nut-dang-xuat-quan-tri');
    if (nutDangXuat) {
        nutDangXuat.addEventListener('click', function() {
            xacNhanHanhDongBootstrap('Đăng xuất Quản trị', 'Bạn có chắc chắn muốn đăng xuất khỏi Trang quản trị?', function() {
                xoaQuanTriVienHienTai();
                datPhienRiengCuaTab('__guest__');
                luuThongBaoChoChuyenTrang('Đã đăng xuất tài khoản quản trị thành công!', 'info');
                window.location.href = layDuongDanTrang('admin-login.html');
            });
        });
    }



    var nutTaiKhoanAdmin = document.getElementById('nut-cai-dat-tai-khoan-admin');
    var bieuMauTaiKhoanAdmin = document.getElementById('bieu-mau-tai-khoan-admin');
    if (nutTaiKhoanAdmin) {
        nutTaiKhoanAdmin.addEventListener('click', function() {
            var ad = layQuanTriVienHienTai();
            if (!ad) return;
            document.getElementById('admin-ho-ten-ca-nhan').value = ad.fullName || '';
            document.getElementById('admin-email-ca-nhan').value = ad.email || '';
            document.getElementById('admin-sdt-ca-nhan').value = ad.phone || '';
            document.getElementById('admin-mat-khau-moi').value = '';
            moModalBootstrap('hop-thoai-tai-khoan-admin');
        });
    }
    if (bieuMauTaiKhoanAdmin) {
        bieuMauTaiKhoanAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            var ad = layQuanTriVienHienTai();
            if (!ad) return;
            var hoTen = document.getElementById('admin-ho-ten-ca-nhan').value.trim();
            var sdt = document.getElementById('admin-sdt-ca-nhan').value.trim();
            var mkMoi = document.getElementById('admin-mat-khau-moi').value;
            if (hoTen === '') {
                hienThiThongBao('Họ tên Quản trị viên không được để trống!', 'danger');
                return;
            }
            if (mkMoi !== '' && mkMoi.length < 6) {
                hienThiThongBao('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'warning');
                return;
            }
            var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
            var danhSach = ketQuaDoc.duLieu.slice();
            for (var i = 0; i < danhSach.length; i++) {
                if (danhSach[i] && typeof danhSach[i].email === 'string' && typeof ad.email === 'string' && danhSach[i].email.toLowerCase() === ad.email.toLowerCase()) {
                    danhSach[i].fullName = hoTen;
                    danhSach[i].phone = sdt;
                    if (mkMoi !== '') danhSach[i].password = mkMoi;
                    danhSach[i].role = 'admin';
                    break;
                }
            }
            if (!luuDuLieuJSON('EDU_USERS', danhSach)) {
                hienThiThongBao('Không thể lưu thông tin tài khoản Quản trị viên vào LocalStorage.', 'danger');
                return;
            }
            ad.fullName = hoTen;
            ad.phone = sdt;
            luuQuanTriVienHienTai(ad);
            hienThiThongTinAdminHeader();
            dongModalBootstrap('hop-thoai-tai-khoan-admin');
            hienThiThongBao('Đã cập nhật thông tin tài khoản Quản trị viên!', 'success');
        });
    }


    // 4. Bo loc thoi gian Dashboard
    var oLoaiLoc = document.getElementById('loai-loc-thoi-gian');
    if (oLoaiLoc) oLoaiLoc.addEventListener('change', function() { capNhatHienThiOChonLoc(); lamMoiBangDieuKhienQuanTri(); });
    var oNgayLoc = document.getElementById('o-chon-ngay-loc');
    if (oNgayLoc) oNgayLoc.addEventListener('change', lamMoiBangDieuKhienQuanTri);
    var oThangLoc = document.getElementById('o-chon-thang-loc');
    if (oThangLoc) oThangLoc.addEventListener('change', lamMoiBangDieuKhienQuanTri);
    var oNamLoc = document.getElementById('o-chon-nam-loc');
    if (oNamLoc) oNamLoc.addEventListener('change', lamMoiBangDieuKhienQuanTri);

    var nutHomNay = document.getElementById('nut-loc-hom-nay-thoi-gian-thuc');
    if (nutHomNay) {
        nutHomNay.addEventListener('click', function() {
            if (oLoaiLoc) oLoaiLoc.value = 'DAY';
            khoiTaoNgayLocMacDinh();
            lamMoiBangDieuKhienQuanTri();
        });
    }
    var nutApDung = document.getElementById('nut-ap-dung-bo-loc-thong-ke');
    if (nutApDung) nutApDung.addEventListener('click', lamMoiBangDieuKhienQuanTri);
    var nutDatLai = document.getElementById('nut-dat-lai-bo-loc-thong-ke');
    if (nutDatLai) {
        nutDatLai.addEventListener('click', function() {
            if (oLoaiLoc) oLoaiLoc.value = 'ALL';
            capNhatHienThiOChonLoc();
            lamMoiBangDieuKhienQuanTri();
        });
    }

    // 5. Bo loc va nut them cua cac phan he
    var dsInputLoc = [
        ['o-tim-khoa-hoc-quan-tri', 'input', hienThiBangQuanLyKhoaHoc],
        ['loc-danh-muc-khoa-hoc-admin', 'change', hienThiBangQuanLyKhoaHoc],
        ['loc-trinh-do-khoa-hoc-admin', 'change', hienThiBangQuanLyKhoaHoc],
        ['loc-trang-thai-khoa-hoc-admin', 'change', hienThiBangQuanLyKhoaHoc],
        ['o-tim-don-hang-quan-tri', 'input', hienThiBangQuanLyDonHang],
        ['loc-trang-thai-don-hang-admin', 'change', hienThiBangQuanLyDonHang],
        ['o-tim-nguoi-dung-quan-tri', 'input', hienThiBangQuanLyNguoiDung],
        ['loc-vai-tro-nguoi-dung-admin', 'change', hienThiBangQuanLyNguoiDung],
        ['loc-trang-thai-nguoi-dung-admin', 'change', hienThiBangQuanLyNguoiDung],
        ['o-tim-danh-muc-quan-tri', 'input', hienThiBangQuanLyDanhMuc],
        ['o-tim-ma-giam-gia-quan-tri', 'input', hienThiBangQuanLyMaGiamGia],
        ['loc-trang-thai-voucher-admin', 'change', hienThiBangQuanLyMaGiamGia],
        ['o-tim-danh-gia-quan-tri', 'input', hienThiBangQuanLyDanhGia]
    ];
    for (var f = 0; f < dsInputLoc.length; f++) {
        var elLoc = document.getElementById(dsInputLoc[f][0]);
        if (elLoc) elLoc.addEventListener(dsInputLoc[f][1], dsInputLoc[f][2]);
    }

    var nutThemKH = document.getElementById('nut-mo-them-khoa-hoc');
    if (nutThemKH) nutThemKH.addEventListener('click', moHopThoaiThemKhoaHoc);
    var formKH = document.getElementById('bieu-mau-khoa-hoc-quan-tri');
    if (formKH) formKH.addEventListener('submit', function(e) { e.preventDefault(); xuLyLuuBieuMauKhoaHoc(); });

    var nutThemDM = document.getElementById('nut-mo-them-danh-muc');
    if (nutThemDM) nutThemDM.addEventListener('click', moHopThoaiThemDanhMuc);
    var formDM = document.getElementById('bieu-mau-danh-muc-quan-tri');
    if (formDM) formDM.addEventListener('submit', function(e) { e.preventDefault(); xuLyLuuDanhMuc(false); });

    var nutThemVC = document.getElementById('nut-mo-them-ma-giam-gia');
    if (nutThemVC) nutThemVC.addEventListener('click', moHopThoaiThemVoucher);
    var formVC = document.getElementById('bieu-mau-ma-giam-gia-quan-tri');
    if (formVC) formVC.addEventListener('submit', function(e) { e.preventDefault(); xuLyLuuVoucher(); });

    // 6. Event Delegation cho toan bo bang du lieu (gan 1 lan duy nhat)
    var bangKH = document.getElementById('bang-quan-ly-khoa-hoc');
    if (bangKH) {
        bangKH.addEventListener('click', function(e) {
            var nutSua = e.target.closest('.nut-sua-khoa-hoc-quan-tri');
            if (nutSua) { moHopThoaiSuaKhoaHoc(nutSua.getAttribute('data-ma-khoa-hoc')); return; }
            var nutAn = e.target.closest('.nut-an-hien-khoa-hoc-quan-tri');
            if (nutAn) { xuLyAnHienKhoaHoc(nutAn.getAttribute('data-ma-khoa-hoc')); return; }
            var nutXoa = e.target.closest('.nut-xoa-khoa-hoc-quan-tri');
            if (nutXoa) { xuLyXoaKhoaHoc(nutXoa.getAttribute('data-ma-khoa-hoc')); }
        });
    }

    var bangDonGanDay = document.getElementById('bang-don-hang-gan-day');
    if (bangDonGanDay) {
        bangDonGanDay.addEventListener('click', function(e) {
            var nutXem = e.target.closest('.nut-xem-chi-tiet-don-hang');
            if (nutXem) moChiTietDonHang(nutXem.getAttribute('data-ma-don-hang'));
        });
    }

    var bangDon = document.getElementById('bang-quan-ly-don-hang');
    if (bangDon) {
        bangDon.addEventListener('click', function(e) {
            var nutXem = e.target.closest('.nut-xem-chi-tiet-don-hang');
            if (nutXem) { moChiTietDonHang(nutXem.getAttribute('data-ma-don-hang')); return; }
            var nutDoi = e.target.closest('.nut-doi-trang-thai-don-hang');
            if (nutDoi) { xuLyDoiTrangThaiDonHang(nutDoi.getAttribute('data-ma-don-hang'), false); }
        });
    }

    var bangUser = document.getElementById('bang-quan-ly-nguoi-dung');
    if (bangUser) {
        bangUser.addEventListener('click', function(e) {
            var nutXem = e.target.closest('.nut-xem-chi-tiet-hoc-vien');
            if (nutXem) { moChiTietHocVien(nutXem.getAttribute('data-ma-nguoi-dung')); return; }
            var nutKhoa = e.target.closest('.nut-khoa-mo-nguoi-dung');
            if (nutKhoa) { xuLyDoiTrangThaiKhoaNguoiDung(nutKhoa.getAttribute('data-ma-nguoi-dung')); }
        });
    }

    var bangDM = document.getElementById('bang-quan-ly-danh-muc');
    if (bangDM) {
        bangDM.addEventListener('click', function(e) {
            var nutSua = e.target.closest('.nut-sua-danh-muc');
            if (nutSua) { moHopThoaiSuaDanhMuc(nutSua.getAttribute('data-ma-danh-muc')); return; }
            var nutXoa = e.target.closest('.nut-xoa-danh-muc');
            if (nutXoa) { xuLyXoaDanhMuc(nutXoa.getAttribute('data-ma-danh-muc')); }
        });
    }

    var bangVC = document.getElementById('bang-quan-ly-ma-giam-gia');
    if (bangVC) {
        bangVC.addEventListener('click', function(e) {
            var nutSua = e.target.closest('.nut-sua-voucher');
            if (nutSua) { moHopThoaiSuaVoucher(nutSua.getAttribute('data-ma-voucher')); return; }
            var nutBT = e.target.closest('.nut-bat-tat-voucher');
            if (nutBT) { xuLyBatTatVoucher(nutBT.getAttribute('data-ma-voucher')); return; }
            var nutXoa = e.target.closest('.nut-xoa-voucher');
            if (nutXoa) { xuLyXoaVoucher(nutXoa.getAttribute('data-ma-voucher')); }
        });
    }

    var bangDG = document.getElementById('bang-quan-ly-danh-gia');
    if (bangDG) {
        bangDG.addEventListener('click', function(e) {
            var nutXoa = e.target.closest('.nut-xoa-danh-gia-quan-tri');
            if (nutXoa) { xuLyXoaDanhGia(nutXoa.getAttribute('data-ma-danh-gia'), nutXoa.getAttribute('data-ma-khoa-hoc')); }
        });
    }

    var bangLH = document.getElementById('bang-quan-ly-lien-he');
    if (bangLH) {
        bangLH.addEventListener('click', function(e) {
            var nutXoa = e.target.closest('.nut-xoa-lien-he-quan-tri');
            if (nutXoa) { xuLyXoaLienHe(nutXoa.getAttribute('data-ma-lien-he')); }
        });
        bangLH.addEventListener('change', function(e) {
            var oChon = e.target.closest('.chon-trang-thai-lien-he');
            if (oChon) { xuLyDoiTrangThaiLienHe(oChon.getAttribute('data-ma-lien-he'), oChon.value); }
        });
    }
}

/**
 * Dong bo so lieu Admin Dashboard theo thoi gian thuc khi tab khac thao tac
 */
function capNhatGiaoDienKhiDongBoTab(khoaThayDoi) {
    if (!kiemTraLaQuanTriVien()) {
        return;
    }
    var cacKhoaThongKe = [
        'EDU_COURSES',
        'EDU_PURCHASES',
        'EDU_ANALYTICS_LOGS',
        'EDU_USERS',
        'EDU_REVIEWS',
        'EDU_CONTACTS',
        'EDU_CATEGORIES',
        'EDU_COUPONS',
        'EDU_FEATURED_CONFIG',
        'EDU_VIEW_LOGS',
        'EDU_CART_LOGS'
    ];
    for (var i = 0; i < cacKhoaThongKe.length; i++) {
        if (khoaThayDoi === cacKhoaThongKe[i]) {
            lamMoiBangDieuKhienQuanTri();
            if (khoaThayDoi === 'EDU_PURCHASES') {
                hienThiThongBao('Có đơn hàng mới từ học viên — Thống kê Admin vừa cập nhật!', 'success');
            } else if (khoaThayDoi === 'EDU_CONTACTS') {
                hienThiThongBao('Có liên hệ mới từ người dùng — Danh sách đã tự động cập nhật!', 'info');
            }
            break;
        }
    }
}

/* =========================================================================
   PHAN HE 9: CAU HINH XEP HANG & KHOA HOC NOI BAT (THANG 100 & 30 NGAY)
   ========================================================================= */
function goGhimNeuKhongCongKhai(maKhoaHoc) {
    var cfg = layCauHinhNoiBat();
    var moi = [];
    var coDoi = false;
    for (var i = 0; i < cfg.pinnedCourseIds.length; i++) {
        if (cfg.pinnedCourseIds[i] === maKhoaHoc) {
            coDoi = true;
        } else {
            moi.push(cfg.pinnedCourseIds[i]);
        }
    }
    if (coDoi) {
        cfg.pinnedCourseIds = moi;
        luuCauHinhNoiBat(cfg);
    }
}

function taiCauHinhXepHangLenForm() {
    var cfg = layCauHinhNoiBat();
    var oMode = document.getElementById('chon-che-do-noi-bat');
    var oMax = document.getElementById('nhap-so-luong-noi-bat-toi-da');
    var oMin = document.getElementById('nhap-nguong-diem-tu-dong');
    if (oMode) oMode.value = cfg.mode;
    if (oMax) oMax.value = String(cfg.maxItems);
    if (oMin) oMin.value = String(cfg.minAutoScore);
}

function hienThiBangXepHangAdmin() {
    var thanBang = document.getElementById('bang-xep-hang-noi-bat-admin');
    if (!thanBang) return;

    taiCauHinhXepHangLenForm();
    var cfg = layCauHinhNoiBat();
    var bangNoiBat = tinhBangXepHangNoiBat();
    var bangQuanTam = tinhBangXepHangQuanTam30Ngay(0);
    var diemQTTheoId = {};
    for (var q = 0; q < bangQuanTam.length; q++) {
        diemQTTheoId[bangQuanTam[q].khoaHoc.id] = bangQuanTam[q];
    }

    var tomTat = document.getElementById('tom-tat-ghim-loai-tru-admin');
    if (tomTat) {
        tomTat.textContent = 'Đang ghim: ' + cfg.pinnedCourseIds.length + '/' + cfg.maxItems + ' khóa • Đang loại trừ: ' + cfg.excludedCourseIds.length + ' khóa';
    }

    var html = '';
    for (var i = 0; i < bangNoiBat.length; i++) {
        var row = bangNoiBat[i];
        var kh = row.khoaHoc;
        var maKH = maHoaHTML(kh.id);
        var dangGhim = cfg.pinnedCourseIds.indexOf(kh.id) > -1;
        var dangLoai = cfg.excludedCourseIds.indexOf(kh.id) > -1;
        var qt = diemQTTheoId[kh.id];
        var diemQT = qt ? qt.diemQuanTam : 0;

        var badgeTT = row.duDieuKien
            ? '<div class="badge bg-success-subtle text-success">Công khai</div>'
            : '<div class="badge bg-secondary-subtle text-secondary">Ẩn / Nháp</div>';
        var lopPL = row.phanLoai === 'Nổi bật' ? 'bg-primary-subtle text-primary' : (row.phanLoai === 'Tiềm năng' ? 'bg-warning-subtle text-dark' : 'bg-light text-secondary border');

        html += '<tr>';
        html += '  <td><div class="fw-semibold small">' + maHoaHTML(kh.title) + '</div><small class="text-muted">' + maKH + ' • ' + maHoaHTML(kh.category || '') + '</small></td>';
        html += '  <td>' + badgeTT + '</td>';
        html += '  <td><strong class="text-dark">' + row.tongDiem + 'đ</strong> <div class="badge ' + lopPL + '">' + maHoaHTML(row.phanLoai) + '</div></td>';
        html += '  <td class="small text-muted">' + row.luotDangKy + ' ĐK • ' + row.diemDanhGiaTB.toFixed(1) + '★ (' + row.soDanhGia + ') • ' + row.luotXem + ' xem</td>';
        html += '  <td class="small fw-semibold text-danger">' + diemQT + ' điểm</td>';
        html += '  <td class="text-end text-nowrap">';
        html += '    <button type="button" class="btn btn-sm ' + (dangGhim ? 'btn-primary' : 'btn-outline-primary') + ' me-1 nut-ghim-khoa-hoc-admin" data-ma-khoa-hoc="' + maKH + '"><i class="bi bi-pin-angle-fill me-1"></i>' + (dangGhim ? 'Bỏ ghim' : 'Ghim') + '</button>';
        html += '    <button type="button" class="btn btn-sm ' + (dangLoai ? 'btn-danger' : 'btn-outline-secondary') + ' nut-loai-tru-khoa-hoc-admin" data-ma-khoa-hoc="' + maKH + '">' + (dangLoai ? 'Bỏ loại trừ' : 'Loại trừ') + '</button>';
        html += '  </td>';
        html += '</tr>';
    }
    thanBang.innerHTML = html;
}

function xuLyGhimKhoaHocAdmin(maKhoaHoc) {
    var kh = timKhoaHocTheoMa(maKhoaHoc);
    if (!kh || !kiemTraKhoaHocDuDieuKienCongKhai(kh)) {
        hienThiThongBao('Không thể ghim khóa học đang ẩn, bản nháp hoặc chưa công khai!', 'warning');
        return false;
    }
    var cfg = layCauHinhNoiBat();
    var viTri = cfg.pinnedCourseIds.indexOf(maKhoaHoc);
    if (viTri > -1) {
        cfg.pinnedCourseIds.splice(viTri, 1);
        luuCauHinhNoiBat(cfg);
        hienThiBangXepHangAdmin();
        hienThiThongBao('Đã bỏ ghim khóa học ' + maKhoaHoc + '.', 'info');
        return true;
    }
    if (cfg.pinnedCourseIds.length >= cfg.maxItems) {
        hienThiThongBao('Đã đạt giới hạn ghim tối đa (' + cfg.maxItems + ' khóa). Hãy bỏ ghim bớt hoặc tăng Số thẻ tối đa!', 'warning');
        return false;
    }
    // Neu dang nam trong danh sach loai tru thi tu dong go loai tru
    var viTriLoai = cfg.excludedCourseIds.indexOf(maKhoaHoc);
    if (viTriLoai > -1) {
        cfg.excludedCourseIds.splice(viTriLoai, 1);
    }
    cfg.pinnedCourseIds.push(maKhoaHoc);
    luuCauHinhNoiBat(cfg);
    hienThiBangXepHangAdmin();
    hienThiThongBao('Đã ghim khóa học ' + maKhoaHoc + ' lên danh sách Nổi bật!', 'success');
    return true;
}

function xuLyLoaiTruKhoaHocAdmin(maKhoaHoc) {
    var cfg = layCauHinhNoiBat();
    var viTriLoai = cfg.excludedCourseIds.indexOf(maKhoaHoc);
    if (viTriLoai > -1) {
        cfg.excludedCourseIds.splice(viTriLoai, 1);
        luuCauHinhNoiBat(cfg);
        hienThiBangXepHangAdmin();
        hienThiThongBao('Đã đưa khóa học ' + maKhoaHoc + ' trở lại tập đề xuất tự động.', 'info');
        return true;
    }
    // Xung dot: neu dang ghim thi tu dong go ghim truoc
    var viTriGhim = cfg.pinnedCourseIds.indexOf(maKhoaHoc);
    if (viTriGhim > -1) {
        cfg.pinnedCourseIds.splice(viTriGhim, 1);
    }
    cfg.excludedCourseIds.push(maKhoaHoc);
    luuCauHinhNoiBat(cfg);
    hienThiBangXepHangAdmin();
    hienThiThongBao('Đã loại khóa học ' + maKhoaHoc + ' khỏi đề xuất tự động (và tự động gỡ ghim nếu có).', 'warning');
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    var formCauHinh = document.getElementById('bieu-mau-cau-hinh-noi-bat');
    if (formCauHinh) {
        formCauHinh.addEventListener('submit', function(e) {
            e.preventDefault();
            var cfg = layCauHinhNoiBat();
            cfg.mode = document.getElementById('chon-che-do-noi-bat').value;
            cfg.maxItems = parseInt(document.getElementById('nhap-so-luong-noi-bat-toi-da').value, 10) || 6;
            cfg.minAutoScore = Number(document.getElementById('nhap-nguong-diem-tu-dong').value);
            if (isNaN(cfg.minAutoScore) || cfg.minAutoScore < 0 || cfg.minAutoScore > 100) cfg.minAutoScore = 50;
            luuCauHinhNoiBat(cfg);
            hienThiBangXepHangAdmin();
            hienThiThongBao('Đã lưu cấu hình Xếp hạng & Nổi bật (' + cfg.mode + ', tối đa ' + cfg.maxItems + ', ngưỡng ' + cfg.minAutoScore + 'đ)!', 'success');
        });
    }

    var bangXepHang = document.getElementById('bang-xep-hang-noi-bat-admin');
    if (bangXepHang) {
        bangXepHang.addEventListener('click', function(e) {
            var nutGhim = e.target.closest('.nut-ghim-khoa-hoc-admin');
            if (nutGhim) {
                xuLyGhimKhoaHocAdmin(nutGhim.getAttribute('data-ma-khoa-hoc'));
                return;
            }
            var nutLoai = e.target.closest('.nut-loai-tru-khoa-hoc-admin');
            if (nutLoai) {
                xuLyLoaiTruKhoaHocAdmin(nutLoai.getAttribute('data-ma-khoa-hoc'));
            }
        });
    }
});

/* =========================================================================
   BIEU DO TRUC QUAN BO SUNG, CHUONG THONG BAO & PHAN TRANG ADMIN
   ========================================================================= */
function hienThiBieuDoTop10LuotXemSVG(tatCaKhoaHoc) {
    var khung = document.getElementById('bieu-do-top10-luot-xem');
    if (!khung) return;

    var ds = (tatCaKhoaHoc || []).slice();
    ds.sort(function(a, b) {
        return Number(b.views || 0) - Number(a.views || 0);
    });
    var top10 = [];
    for (var i = 0; i < ds.length && top10.length < 10; i++) {
        if (Number(ds[i].views || 0) > 0) {
            top10.push(ds[i]);
        }
    }

    if (top10.length === 0) {
        khung.innerHTML = '<div class="admin-empty-chart"><i class="bi bi-bar-chart fs-1 text-secondary mb-2"></i><div>Chưa có lượt xem khóa học thực tế.</div></div>';
        return;
    }

    var maxXem = Number(top10[0].views || 1);
    var caoMoiDong = 26;
    var tongCao = top10.length * caoMoiDong + 16;
    var rong = 520;
    var cotNhan = 175;
    var rongThanh = 285;

    var svg = '<svg viewBox="0 0 ' + rong + ' ' + tongCao + '" class="admin-svg-chart" role="img" aria-label="Top 10 khóa học lượt xem cao nhất">';
    for (var j = 0; j < top10.length; j++) {
        var kh = top10[j];
        var luotXem = Number(kh.views || 0);
        var w = Math.max(8, Math.round((luotXem / maxXem) * rongThanh));
        var y = 10 + j * caoMoiDong;
        var tenRut = String(kh.title || kh.id || '');
        if (tenRut.length > 24) tenRut = tenRut.substring(0, 22) + '...';

        svg += '<g>';
        svg += '  <title>' + maHoaHTML(kh.title || '') + ': ' + luotXem + ' lượt xem</title>';
        svg += '  <text x="' + (cotNhan - 8) + '" y="' + (y + 13) + '" text-anchor="end" font-size="10.5" fill="#475569">' + maHoaHTML(tenRut) + '</text>';
        svg += '  <rect x="' + cotNhan + '" y="' + y + '" width="' + w + '" height="17" rx="4" fill="#2dd4bf"></rect>';
        svg += '  <text x="' + (cotNhan + w + 6) + '" y="' + (y + 13) + '" font-size="10.5" font-weight="700" fill="#0f766e">' + luotXem + '</text>';
        svg += '</g>';
    }
    svg += '</svg>';
    khung.innerHTML = svg;
}

function hienThiBieuDoKhoaHocTheoDanhMucSVG(tatCaKhoaHoc) {
    var khung = document.getElementById('bieu-do-khoa-hoc-theo-danh-muc');
    if (!khung) return;

    var demTheoDM = {};
    var danhSachDM = [];
    for (var i = 0; i < (tatCaKhoaHoc || []).length; i++) {
        var dm = tatCaKhoaHoc[i].category || 'Khác';
        if (!demTheoDM[dm]) {
            demTheoDM[dm] = 0;
            danhSachDM.push(dm);
        }
        demTheoDM[dm] += 1;
    }

    if (danhSachDM.length === 0) {
        khung.innerHTML = '<div class="admin-empty-chart"><i class="bi bi-columns-gap fs-1 text-secondary mb-2"></i><div>Chưa có dữ liệu danh mục.</div></div>';
        return;
    }

    var maxCount = 1;
    for (var m = 0; m < danhSachDM.length; m++) {
        if (demTheoDM[danhSachDM[m]] > maxCount) maxCount = demTheoDM[danhSachDM[m]];
    }

    var rong = 520;
    var cao = 250;
    var demTrai = 36;
    var dayY = 205;
    var caoToiDa = 165;
    var buoc = (rong - demTrai - 16) / danhSachDM.length;
    var rongCot = Math.min(46, Math.max(20, buoc * 0.56));

    var svg = '<svg viewBox="0 0 ' + rong + ' ' + cao + '" class="admin-svg-chart" role="img" aria-label="Số lượng khóa học theo danh mục">';
    svg += '<line x1="' + demTrai + '" y1="' + dayY + '" x2="' + (rong - 10) + '" y2="' + dayY + '" stroke="#cbd5e1" stroke-width="1"/>';
    for (var k = 0; k < danhSachDM.length; k++) {
        var tenDM = danhSachDM[k];
        var sl = demTheoDM[tenDM];
        var h = Math.max(6, Math.round((sl / maxCount) * caoToiDa));
        var x = demTrai + k * buoc + (buoc - rongCot) / 2;
        var y = dayY - h;
        var nhanDM = tenDM.length > 11 ? tenDM.substring(0, 10) + '..' : tenDM;

        svg += '<g>';
        svg += '  <title>' + maHoaHTML(tenDM) + ': ' + sl + ' khóa học</title>';
        svg += '  <rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + rongCot.toFixed(1) + '" height="' + h + '" rx="5" fill="#f97316"></rect>';
        svg += '  <text x="' + (x + rongCot / 2).toFixed(1) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#c2410c">' + sl + '</text>';
        svg += '  <text x="' + (x + rongCot / 2).toFixed(1) + '" y="' + (dayY + 16) + '" text-anchor="middle" font-size="10" fill="#475569">' + maHoaHTML(nhanDM) + '</text>';
        svg += '</g>';
    }
    svg += '</svg>';
    khung.innerHTML = svg;
}

function capNhatThongBaoVaHuyHieuAdmin(tatCaDon, tatCaLienHe) {
    var soDonCho = 0;
    for (var i = 0; i < (tatCaDon || []).length; i++) {
        if (tatCaDon[i] && String(tatCaDon[i].orderStatus || '').toLowerCase() === 'pending') {
            soDonCho += 1;
        }
    }
    var soLienHeMoi = 0;
    for (var j = 0; j < (tatCaLienHe || []).length; j++) {
        if (tatCaLienHe[j] && (tatCaLienHe[j].status === 'Mới' || !tatCaLienHe[j].status)) {
            soLienHeMoi += 1;
        }
    }

    var badgeDon = document.getElementById('badge-sidebar-don-cho');
    if (badgeDon) {
        badgeDon.textContent = String(soDonCho);
        if (soDonCho > 0) badgeDon.classList.remove('d-none');
        else badgeDon.classList.add('d-none');
    }

    var badgeLH = document.getElementById('badge-sidebar-lien-he-moi');
    if (badgeLH) {
        badgeLH.textContent = String(soLienHeMoi);
        if (soLienHeMoi > 0) badgeLH.classList.remove('d-none');
        else badgeLH.classList.add('d-none');
    }

    var tongTB = soDonCho + soLienHeMoi;
    var soChuong = document.getElementById('so-thong-bao-admin');
    if (soChuong) {
        soChuong.textContent = String(tongTB);
        if (tongTB > 0) soChuong.classList.remove('d-none');
        else soChuong.classList.add('d-none');
    }

    var dsChuong = document.getElementById('danh-sach-chuong-thong-bao-admin');
    if (dsChuong) {
        if (tongTB === 0) {
            dsChuong.innerHTML = '<li class="px-3 py-2 text-muted small">Mọi đơn hàng và liên hệ đều đã được xử lý.</li>';
        } else {
            var htmlTB = '<li class="px-3 py-2 fw-bold small border-bottom text-dark">Việc cần xử lý (' + tongTB + ')</li>';
            if (soDonCho > 0) {
                htmlTB += '<li><button type="button" class="dropdown-item py-2 small nut-chuyen-phan-he" data-phan-he="don-hang"><i class="bi bi-clock-fill text-warning me-2"></i>Có <strong>' + soDonCho + '</strong> đơn hàng đang chờ duyệt</button></li>';
            }
            if (soLienHeMoi > 0) {
                htmlTB += '<li><button type="button" class="dropdown-item py-2 small nut-chuyen-phan-he" data-phan-he="lien-he"><i class="bi bi-envelope-exclamation-fill text-danger me-2"></i>Có <strong>' + soLienHeMoi + '</strong> tin nhắn liên hệ mới</button></li>';
            }
            dsChuong.innerHTML = htmlTB;
        }
    }
}

function vePhanTrangBangAdmin(idContainer, tongSoDong, trangHienTai, loaiBang) {
    var khung = document.getElementById(idContainer);
    if (!khung) return;
    var tongTrang = Math.ceil(tongSoDong / SO_DONG_BANG_ADMIN);
    if (tongTrang <= 1) {
        khung.innerHTML = '';
        return;
    }
    var html = '';
    for (var p = 1; p <= tongTrang; p++) {
        html += '<li class="page-item' + (p === trangHienTai ? ' active' : '') + '">';
        html += '<button type="button" class="page-link nut-phan-trang-admin" data-bang="' + loaiBang + '" data-trang="' + p + '">' + p + '</button>';
        html += '</li>';
    }
    khung.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        var nutPT = e.target.closest('.nut-phan-trang-admin');
        if (nutPT) {
            var bang = nutPT.getAttribute('data-bang');
            var trang = parseInt(nutPT.getAttribute('data-trang'), 10) || 1;
            if (bang === 'khoa-hoc') {
                trangKhoaHocAdmin = trang;
                hienThiBangQuanLyKhoaHoc();
            } else if (bang === 'don-hang') {
                trangDonHangAdmin = trang;
                hienThiBangQuanLyDonHang();
            }
        }
    });
});
