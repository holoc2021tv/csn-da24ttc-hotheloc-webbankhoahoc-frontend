/**
 * FILE: src/js/home.js
 * NHIEM VU: Hien thi Danh muc san pham, Khoa hoc Noi bat, Khuyen mai, Moi ra mat,
 * Yeu thich va Da xem gan day tren Trang chu.
 */

document.addEventListener('DOMContentLoaded', function() {
    capNhatHuyHieuGioHang();
    hienThiDanhMucNoiBat();
    hienThiKhoaHocQuanTamNhat30Ngay();
    hienThiKhoaHocNoiBatTheoCauHinh();
    hienThiKhuVucKhoaHoc('vung-khoa-hoc-ban-chay', layKhoaHocKhuyenMai().slice(0, 4));
    hienThiKhuVucKhoaHoc('vung-khoa-hoc-moi', layKhoaHocMoi().slice(0, 4));
    hienThiKhuVucCaNhanHoa();
    ganSuKienTrangChu();
});

function layKhoaHocKhuyenMai() {
    var tatCa = layTatCaKhoaHoc();
    var danhSachGiamGia = [];
    for (var i = 0; i < tatCa.length; i++) {
        var kh = tatCa[i];
        if (!kiemTraKhoaHocDangMo(kh)) continue;
        var goc = Number(kh.originalPrice || 0);
        var ban = Number(kh.salePrice || 0);
        if (goc > ban && goc > 0 && ban > 0) {
            danhSachGiamGia.push(kh);
        }
    }
    danhSachGiamGia.sort(function(a, b) {
        var ptA = (Number(a.originalPrice) - Number(a.salePrice)) / Number(a.originalPrice);
        var ptB = (Number(b.originalPrice) - Number(b.salePrice)) / Number(b.originalPrice);
        return ptB - ptA;
    });
    return danhSachGiamGia;
}

function ganSuKienTrangChu() {
    var phanNoiDungChinh = document.querySelector('main');
    if (!phanNoiDungChinh) {
        return;
    }

    phanNoiDungChinh.addEventListener('click', function(e) {
        var nutYeuThich = e.target.closest('.nut-yeu-thich-trang-chu');
        if (nutYeuThich) {
            var maKhoaHoc = nutYeuThich.getAttribute('data-ma-khoa-hoc');
            if (maKhoaHoc) {
                xuLyNutYeuThichChung(maKhoaHoc, nutYeuThich);
                hienThiKhoaHocQuanTamNhat30Ngay();
                hienThiKhuVucCaNhanHoa();
            }
            return;
        }

        var nutThemGio = e.target.closest('.nut-them-gio-trang-chu');
        if (nutThemGio) {
            var maThem = nutThemGio.getAttribute('data-ma-khoa-hoc');
            if (maThem) {
                xuLyThemGioHangTrangChu(maThem);
            }
            return;
        }

        var lienKetChiTiet = e.target.closest('.lien-ket-dem-click-trang-chu');
        if (lienKetChiTiet) {
            var maClick = lienKetChiTiet.getAttribute('data-ma-khoa-hoc');
            if (maClick) {
                tangLuotClickKhoaHoc(maClick);
            }
        }
    });
}

function hienThiDanhMucNoiBat() {
    var khungChua = document.getElementById('vung-danh-muc-noi-bat');
    if (!khungChua) {
        return;
    }

    var danhSachThongKe = thongKeTheoDanhMuc();
    var bangBieuTuong = {
        'Frontend': 'bi-window-sidebar text-primary',
        'JavaScript': 'bi-filetype-js text-warning',
        'Database': 'bi-database-check text-success',
        'Công cụ': 'bi-git text-danger',
        'Phân tích hệ thống': 'bi-diagram-3-fill text-info',
        'Kỹ năng mềm': 'bi-people-fill text-secondary'
    };

    var maHTML = '';
    for (var i = 0; i < danhSachThongKe.length; i++) {
        var muc = danhSachThongKe[i];
        var lopBieuTuong = bangBieuTuong[muc.category] || 'bi-journal-bookmark text-primary';

        maHTML += '<article class="card border p-3 text-center the-danh-muc shadow-sm">';
        maHTML += '  <a href="' + layDuongDanTrang('courses.html?category=' + encodeURIComponent(muc.category)) + '" class="text-decoration-none text-dark w-100">';
        maHTML += '    <i class="bi ' + lopBieuTuong + ' fs-2 mb-2 d-block"></i>';
        maHTML += '    <h6 class="fw-bold mb-1">' + maHoaHTML(muc.category) + '</h6>';
        maHTML += '    <small class="text-muted d-block">' + Number(muc.count || 0) + ' khóa học</small>';
        maHTML += '    <div class="d-flex justify-content-center gap-2 mt-2 flex-wrap">';
        maHTML += '      <small class="badge bg-primary-subtle text-primary"><i class="bi bi-eye-fill me-1"></i>' + Number(muc.totalViews || 0) + ' xem</small>';
        maHTML += '      <small class="badge bg-danger-subtle text-danger"><i class="bi bi-hand-index-thumb-fill me-1"></i>' + Number(muc.totalClicks || 0) + ' click</small>';
        maHTML += '    </div>';
        maHTML += '  </a>';
        maHTML += '</article>';
    }

    khungChua.innerHTML = maHTML;
}

function hienThiKhuVucKhoaHoc(maKhungChua, danhSachKhoaHoc) {
    var khungChua = document.getElementById(maKhungChua);
    if (!khungChua) {
        return;
    }

    if (!danhSachKhoaHoc || danhSachKhoaHoc.length === 0) {
        khungChua.innerHTML = '<p class="text-center text-muted">Hiện chưa có khóa học nào trong mục này.</p>';
        return;
    }

    var maHTML = '';
    for (var i = 0; i < danhSachKhoaHoc.length; i++) {
        maHTML += taoMaHTMLTheKhoaHoc(danhSachKhoaHoc[i], 'trang-chu');
    }
    khungChua.innerHTML = maHTML;
}

function xuLyThemGioHangTrangChu(maKhoaHoc) {
    tangLuotClickKhoaHoc(maKhoaHoc);
    var ketQua = themVaoGio(maKhoaHoc, 1);
    hienThiThongBao(ketQua.message, ketQua.success ? 'success' : 'warning');
    hienThiDanhMucNoiBat();
    hienThiKhoaHocQuanTamNhat30Ngay();
    hienThiKhoaHocNoiBatTheoCauHinh();
    hienThiKhuVucKhoaHoc('vung-khoa-hoc-ban-chay', layKhoaHocKhuyenMai().slice(0, 4));
    hienThiKhuVucKhoaHoc('vung-khoa-hoc-moi', layKhoaHocMoi().slice(0, 4));
}

function hienThiKhuVucCaNhanHoa() {
    var khuVucCaNhan = document.getElementById('khu-vuc-ca-nhan-hoa');
    var vungYeuThich = document.getElementById('vung-khoa-hoc-yeu-thich');
    var vungVuaXem = document.getElementById('vung-khoa-hoc-vua-xem');

    if (!khuVucCaNhan || !vungYeuThich || !vungVuaXem) {
        return;
    }

    var danhSachYeuThich = layDanhSachKhoaHocYeuThich().slice(0, 4);
    var danhSachVuaXem = layDanhSachKhoaHocVuaXem().slice(0, 4);

    if (danhSachYeuThich.length === 0 && danhSachVuaXem.length === 0) {
        khuVucCaNhan.classList.add('d-none');
        return;
    }

    khuVucCaNhan.classList.remove('d-none');

    if (danhSachYeuThich.length === 0) {
        vungYeuThich.innerHTML = '<div class="alert alert-light border text-muted mb-0">Bạn chưa lưu khóa học yêu thích nào.</div>';
    } else {
        var maHTMLYeuThich = '';
        for (var i = 0; i < danhSachYeuThich.length; i++) {
            var khoaHocThich = danhSachYeuThich[i];
            var anhThich = kiemTraDuongDanAnToan(khoaHocThich.image, '');
            var maUrlThich = encodeURIComponent(khoaHocThich.id || '');

            maHTMLYeuThich += '<article class="card border shadow-sm h-100 p-2">';
            maHTMLYeuThich += '  <div class="d-flex align-items-center gap-2">';
            maHTMLYeuThich += '    <img src="' + maHoaHTML(anhThich) + '" alt="' + maHoaHTML(khoaHocThich.title) + '" class="rounded anh-san-pham-thanh-toan">';
            maHTMLYeuThich += '    <div class="overflow-hidden">';
            maHTMLYeuThich += '      <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrlThich) + '" class="fw-bold text-dark text-decoration-none d-block text-truncate lien-ket-dem-click-trang-chu" data-ma-khoa-hoc="' + maHoaHTML(khoaHocThich.id) + '">' + maHoaHTML(khoaHocThich.title) + '</a>';
            maHTMLYeuThich += '      <div class="text-danger fw-semibold small">' + maHoaHTML(dinhDangTienVND(khoaHocThich.salePrice)) + '</div>';
            maHTMLYeuThich += '    </div>';
            maHTMLYeuThich += '  </div>';
            maHTMLYeuThich += '</article>';
        }
        vungYeuThich.innerHTML = maHTMLYeuThich;
    }

    if (danhSachVuaXem.length === 0) {
        vungVuaXem.innerHTML = '<div class="alert alert-light border text-muted mb-0">Chưa có lịch sử khóa học đã xem gần đây.</div>';
    } else {
        var maHTMLVuaXem = '';
        for (var j = 0; j < danhSachVuaXem.length; j++) {
            var khoaHocXem = danhSachVuaXem[j];
            var anhXem = kiemTraDuongDanAnToan(khoaHocXem.image, '');
            var maUrlXem = encodeURIComponent(khoaHocXem.id || '');

            maHTMLVuaXem += '<article class="card border shadow-sm h-100 p-2">';
            maHTMLVuaXem += '  <div class="d-flex align-items-center gap-2">';
            maHTMLVuaXem += '    <img src="' + maHoaHTML(anhXem) + '" alt="' + maHoaHTML(khoaHocXem.title) + '" class="rounded anh-san-pham-thanh-toan">';
            maHTMLVuaXem += '    <div class="overflow-hidden">';
            maHTMLVuaXem += '      <a href="' + layDuongDanTrang('course-detail.html?id=' + maUrlXem) + '" class="fw-bold text-dark text-decoration-none d-block text-truncate lien-ket-dem-click-trang-chu" data-ma-khoa-hoc="' + maHoaHTML(khoaHocXem.id) + '">' + maHoaHTML(khoaHocXem.title) + '</a>';
            maHTMLVuaXem += '      <div class="text-muted small"><i class="bi bi-eye me-1"></i>' + Number(khoaHocXem.views || 0) + ' lượt xem</div>';
            maHTMLVuaXem += '    </div>';
            maHTMLVuaXem += '  </div>';
            maHTMLVuaXem += '</article>';
        }
        vungVuaXem.innerHTML = maHTMLVuaXem;
    }
}

function capNhatGiaoDienKhiDongBoTab(khoaThayDoi) {
    if (khoaThayDoi === 'EDU_COURSES' || khoaThayDoi === 'EDU_FAVORITES' || khoaThayDoi === 'EDU_RECENT_VIEWED' || khoaThayDoi === 'EDU_CATEGORIES' || khoaThayDoi === 'EDU_FEATURED_CONFIG' || khoaThayDoi === 'EDU_VIEW_LOGS' || khoaThayDoi === 'EDU_CART_LOGS' || khoaThayDoi === 'EDU_PURCHASES') {
        hienThiDanhMucNoiBat();
        hienThiKhoaHocQuanTamNhat30Ngay();
    hienThiKhoaHocNoiBatTheoCauHinh();
        hienThiKhuVucKhoaHoc('vung-khoa-hoc-ban-chay', layKhoaHocKhuyenMai().slice(0, 4));
        hienThiKhuVucKhoaHoc('vung-khoa-hoc-moi', layKhoaHocMoi().slice(0, 4));
        hienThiKhuVucCaNhanHoa();
    }
}

function hienThiKhoaHocQuanTamNhat30Ngay() {
    var khungChua = document.getElementById('vung-khoa-hoc-quan-tam-nhat');
    if (!khungChua) return;
    var bangQuanTam = tinhBangXepHangQuanTam30Ngay(4);
    if (!bangQuanTam || bangQuanTam.length === 0) {
        khungChua.className = '';
        khungChua.innerHTML = '<div class="alert alert-light border text-center py-4 mb-0 text-muted"><i class="bi bi-compass fs-2 d-block mb-2 text-primary"></i>Chưa có dữ liệu tương tác trong 30 ngày gần nhất. Hãy xem chi tiết, yêu thích hoặc thêm khóa học vào giỏ để hệ thống cập nhật xu hướng thực tế!</div>';
        return;
    }
    khungChua.className = 'khung-khoa-hoc-4';
    var maHTML = '';
    for (var i = 0; i < bangQuanTam.length; i++) {
        maHTML += taoMaHTMLTheKhoaHoc(bangQuanTam[i].khoaHoc, 'trang-chu');
    }
    khungChua.innerHTML = maHTML;
}

function hienThiKhoaHocNoiBatTheoCauHinh() {
    var khuVuc = document.getElementById('khu-vuc-khoa-hoc-noi-bat');
    var khungChua = document.getElementById('vung-khoa-hoc-noi-bat');
    if (!khungChua) return;
    var danhSach = layDanhSachKhoaHocNoiBatHienThi(true);
    if (!danhSach || danhSach.length === 0) {
        if (khuVuc) khuVuc.classList.add('d-none');
        khungChua.innerHTML = '';
        return;
    }
    if (khuVuc) khuVuc.classList.remove('d-none');
    var maHTML = '';
    for (var i = 0; i < danhSach.length; i++) {
        var tuyChon = { hienNhanDaSoHuu: (danhSach[i].cheDo === 'manual') };
        maHTML += taoMaHTMLTheKhoaHoc(danhSach[i].khoaHoc, 'trang-chu', tuyChon);
    }
    khungChua.innerHTML = maHTML;
}
