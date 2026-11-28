/**
 * FILE: src/js/auth.js
 * NHIEM VU: Quan ly tai khoan Admin doc lap (EDU_CURRENT_ADMIN), ho tro dang nhap nhieu tai khoan
 * hoc vien cung luc (EDU_ACTIVE_SESSIONS), thanh tim kiem khong dau + giong noi,
 * nut & hop thoai Yeu thich, khung chat ho tro demo va dong bo nhieu tab.
 */

var EMAIL_QUAN_TRI_MAC_DINH = 'admin@gmail.com';
// Dan Google OAuth 2.0 Web Client ID tu Google Cloud Console de mo cua so chon tai khoan Google that:
var GOOGLE_CLIENT_ID = '889890946704-fl5tp8d3fbko61iu00ckskk66u6p0dfd.apps.googleusercontent.com';
var MAT_KHAU_QUAN_TRI_MAC_DINH = '123123123';

kiemTraQuyenTruyCapQuanTriNgay();
window.addEventListener('pageshow', function() { kiemTraQuyenTruyCapQuanTriNgay(); });

document.addEventListener('DOMContentLoaded', function() {
    damBaoTaiKhoanQuanTri();
    var duongDan = String(window.location.pathname || '').toLowerCase();
    var laTrangQuanTri = (duongDan.indexOf('admin.html') > -1 || duongDan.indexOf('admin-login.html') > -1);

    if (!laTrangQuanTri) {
        themThanhTimKiemVaNutYeuThichVaoMenu();
        capNhatThanhMenu();
        capNhatHuyHieuYeuThich();
        khoiTaoKhungChatHoTroDemo();
    }
    kiemTraVaHienThiThongBaoCho();
    ganSuKienAnHienMatKhau();
    ganSuKienDangNhapGoogleChung();
    ganSuKienDongBoNhieuTab();
    ganDuPhongAnhLoiToanTrang();
});

function timTaiKhoanTrongHeThong(email) {
    if (!email) {
        return null;
    }
    var ketQua = docDuLieuJSONCoTrangThai('EDU_USERS', true);
    if (!ketQua.tonTai || !ketQua.hopLe) {
        return null;
    }
    var emailChuan = String(email).toLowerCase();
    for (var i = 0; i < ketQua.duLieu.length; i++) {
        if (ketQua.duLieu[i].email && String(ketQua.duLieu[i].email).toLowerCase() === emailChuan) {
            return ketQua.duLieu[i];
        }
    }
    return null;
}

function kiemTraTaiKhoanBiKhoa(taiKhoan) {
    return Boolean(taiKhoan && taiKhoan.status === 'locked');
}

function kiemTraQuyenTruyCapQuanTriNgay() {
    var duongDanHienTai = String(window.location.pathname || '').toLowerCase();

    // Loai bo phien admin cu neu con sot lai trong EDU_CURRENT_USER
    var phienHocVien = layNguoiDungHienTai();
    if (phienHocVien && phienHocVien.role === 'admin') {
        xoaNguoiDungHienTai();
        phienHocVien = null;
    }

    if (phienHocVien && phienHocVien.email) {
        var banGhiGoc = timTaiKhoanTrongHeThong(phienHocVien.email);
        if (banGhiGoc && kiemTraTaiKhoanBiKhoa(banGhiGoc)) {
            dangXuatPhienNguoiDungHienTai();
            luuThongBaoChoChuyenTrang('Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên.', 'danger');
            if (duongDanHienTai.indexOf('login.html') === -1 && duongDanHienTai.indexOf('admin') === -1) {
                window.location.replace(layDuongDanTrang('login.html'));
                return;
            }
        }
    }

    if (duongDanHienTai.indexOf('admin.html') > -1 && duongDanHienTai.indexOf('admin-login.html') === -1) {
        var phienAdmin = layQuanTriVienHienTai();
        var banGhiAdmin = (phienAdmin && phienAdmin.email) ? timTaiKhoanTrongHeThong(phienAdmin.email) : null;
        var hopLeAdmin = Boolean(
            phienAdmin &&
            phienAdmin.role === 'admin' &&
            banGhiAdmin &&
            banGhiAdmin.role === 'admin' &&
            !kiemTraTaiKhoanBiKhoa(banGhiAdmin)
        );
        if (!hopLeAdmin) {
            xoaQuanTriVienHienTai();
            luuThongBaoChoChuyenTrang('Vui lòng đăng nhập qua Cổng Quản trị viên (Admin) để tiếp tục.', 'warning');
            window.location.replace(layDuongDanTrang('admin-login.html'));
        }
    }
}

function damBaoTaiKhoanQuanTri() {
    var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
    if (ketQuaDoc.tonTai && !ketQuaDoc.hopLe) {
        return;
    }

    var danhSachNguoiDung = ketQuaDoc.duLieu.slice();
    var daCoAdmin = false;
    var coThayDoi = false;

    for (var i = 0; i < danhSachNguoiDung.length; i++) {
        if (danhSachNguoiDung[i].role === 'admin' && danhSachNguoiDung[i].status !== 'locked') {
            daCoAdmin = true;
        }
        if (danhSachNguoiDung[i] && typeof danhSachNguoiDung[i].email === 'string' && danhSachNguoiDung[i].email.toLowerCase() === EMAIL_QUAN_TRI_MAC_DINH) {
            if (!danhSachNguoiDung[i].status) {
                danhSachNguoiDung[i].status = 'active';
                coThayDoi = true;
            }
        }
    }

    if (!daCoAdmin) {
        danhSachNguoiDung.unshift({
            id: 'USR_ADMIN_MAIN',
            fullName: 'Quản Trị Viên EduCourses',
            email: EMAIL_QUAN_TRI_MAC_DINH,
            phone: '0372765126',
            address: 'Trường Đại học Trà Vinh, Việt Nam',
            password: MAT_KHAU_QUAN_TRI_MAC_DINH,
            role: 'admin',
            status: 'active',
            createdAt: '01/01/2026'
        });
        coThayDoi = true;
    }

    if (coThayDoi || !ketQuaDoc.tonTai) {
        luuDuLieuJSON('EDU_USERS', danhSachNguoiDung);
    }
}

function kiemTraLaQuanTriVien() {
    var phienAdmin = layQuanTriVienHienTai();
    if (!phienAdmin || phienAdmin.role !== 'admin') {
        return false;
    }
    var banGhiGoc = timTaiKhoanTrongHeThong(phienAdmin.email);
    return Boolean(banGhiGoc && banGhiGoc.role === 'admin' && !kiemTraTaiKhoanBiKhoa(banGhiGoc));
}

/**
 * Chen thanh tim kiem khong dau + tim kiem giong noi va nut Yeu thich vao thanh dieu huong
 */
function themThanhTimKiemVaNutYeuThichVaoMenu() {
    var thanhMenu = document.getElementById('thanh-menu-chinh');
    if (!thanhMenu) {
        return;
    }

    // 1. Chen thanh tim kiem + nut micro giong noi (tranh trung lap)
    if (!document.getElementById('bieu-mau-tim-kiem-toan-cuc')) {
        var bieuMauTim = document.createElement('form');
        bieuMauTim.id = 'bieu-mau-tim-kiem-toan-cuc';
        bieuMauTim.className = 'khung-tim-kiem-menu my-2 my-lg-0 mx-lg-3';
        bieuMauTim.setAttribute('role', 'search');

        var maTim = '';
        maTim += '<div class="input-group input-group-sm">';
        maTim += '  <input type="text" id="o-tim-kiem-toan-cuc" class="form-control" placeholder="Tìm khóa học (gõ không dấu)...">';
        maTim += '  <button type="button" id="nut-tim-kiem-giong-noi-menu" class="btn btn-outline-secondary" title="Tìm kiếm bằng giọng nói">';
        maTim += '    <i class="bi bi-mic-fill"></i>';
        maTim += '  </button>';
        maTim += '  <button type="submit" class="btn btn-primary" title="Tìm kiếm">';
        maTim += '    <i class="bi bi-search"></i>';
        maTim += '  </button>';
        maTim += '</div>';
        bieuMauTim.innerHTML = maTim;

        var danhSachLink = thanhMenu.querySelector('.navbar-nav');
        if (danhSachLink && danhSachLink.parentNode) {
            danhSachLink.parentNode.insertBefore(bieuMauTim, danhSachLink.nextSibling);
        }

        bieuMauTim.addEventListener('submit', function(e) {
            e.preventDefault();
            var tuKhoa = document.getElementById('o-tim-kiem-toan-cuc').value.trim();
            var oTrangKhoaHoc = document.getElementById('o-tim-kiem-khoa-hoc');
            if (oTrangKhoaHoc) {
                oTrangKhoaHoc.value = tuKhoa;
                oTrangKhoaHoc.dispatchEvent(new Event('input'));
                return;
            }
            var duongDanDich = layDuongDanTrang('courses.html');
            if (tuKhoa !== '') {
                duongDanDich += '?q=' + encodeURIComponent(tuKhoa);
            }
            window.location.href = duongDanDich;
        });

        var oTimToanCuc = document.getElementById('o-tim-kiem-toan-cuc');
        if (oTimToanCuc) {
            ganGoiYTimKiemTuDong(oTimToanCuc, bieuMauTim);
        }
        var nutMicro = document.getElementById('nut-tim-kiem-giong-noi-menu');
        if (nutMicro) {
            nutMicro.addEventListener('click', function() {
                khoiChayTimKiemGiongNoi(document.getElementById('o-tim-kiem-toan-cuc'), nutMicro, function(ketQuaGiongNoi) {
                    var oTrangKhoaHoc = document.getElementById('o-tim-kiem-khoa-hoc');
                    if (oTrangKhoaHoc) {
                        oTrangKhoaHoc.value = ketQuaGiongNoi;
                        oTrangKhoaHoc.dispatchEvent(new Event('input'));
                    } else {
                        window.location.href = layDuongDanTrang('courses.html?q=' + encodeURIComponent(ketQuaGiongNoi));
                    }
                });
            });
        }
    }

    // 2. Chen nut Yeu thich ngay ben canh nut Gio hang
    if (!document.getElementById('nut-mo-yeu-thich-menu')) {
        var nutGioHang = thanhMenu.querySelector('a[href$="cart.html"]');
        if (nutGioHang && nutGioHang.parentNode) {
            var nutYeuThich = document.createElement('button');
            nutYeuThich.type = 'button';
            nutYeuThich.id = 'nut-mo-yeu-thich-menu';
            nutYeuThich.className = 'btn btn-outline-danger position-relative';
            nutYeuThich.title = 'Xem khóa học yêu thích';
            nutYeuThich.innerHTML = '<i class="bi bi-heart-fill me-1"></i>Yêu thích <strong id="so-luong-yeu-thich" class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">0</strong>';
            nutGioHang.parentNode.insertBefore(nutYeuThich, nutGioHang);

            nutYeuThich.addEventListener('click', function() {
                moHopThoaiYeuThichChung();
            });
        }
    }
}

/**
 * Dung chung Web Speech API cho tim kiem bang giong noi (tieng Viet)
 */

/**
 * Gan khung de xuat khoa hoc tu dong khi nguoi dung go chu (ho tro tim khong dau)
 */
function ganGoiYTimKiemTuDong(oNhap, vungNeo) {
    if (!oNhap || !vungNeo || oNhap.getAttribute('data-da-gan-goi-y') === '1') {
        return;
    }
    oNhap.setAttribute('data-da-gan-goi-y', '1');
    vungNeo.classList.add('position-relative');

    var khungGoiY = document.createElement('div');
    khungGoiY.className = 'khung-goi-y-tim-kiem shadow-lg border rounded-3 bg-white d-none';
    vungNeo.appendChild(khungGoiY);

    function dongGoiY() {
        khungGoiY.classList.add('d-none');
    }

    function hienThiGoiY() {
        var tuKhoa = boDauTiengViet(oNhap.value);
        if (tuKhoa === '') {
            dongGoiY();
            return;
        }
        var tatCa = typeof layTatCaKhoaHoc === 'function' ? layTatCaKhoaHoc() : [];
        var ketQua = [];
        for (var i = 0; i < tatCa.length; i++) {
            var kh = tatCa[i];
            if (typeof kiemTraKhoaHocDangMo === 'function' && !kiemTraKhoaHocDangMo(kh)) {
                continue;
            }
            var tenKD = boDauTiengViet(kh.title || '');
            var gvKD = boDauTiengViet(kh.instructor || '');
            var dmKD = boDauTiengViet(kh.category || '');
            if (tenKD.indexOf(tuKhoa) > -1 || gvKD.indexOf(tuKhoa) > -1 || dmKD.indexOf(tuKhoa) > -1) {
                ketQua.push(kh);
                if (ketQua.length >= 6) {
                    break;
                }
            }
        }

        if (ketQua.length === 0) {
            khungGoiY.innerHTML = '<div class="p-3 text-center text-muted small">Không tìm thấy khóa học phù hợp với "' + maHoaHTML(oNhap.value.trim()) + '".</div>';
            khungGoiY.classList.remove('d-none');
            return;
        }

        var maHTML = '';
        for (var j = 0; j < ketQua.length; j++) {
            var item = ketQua[j];
            var giaSo = Number(item.salePrice || 0);
            var chuoiGia = giaSo === 0 ? 'Miễn phí' : dinhDangTienVND(giaSo);
            var anh = kiemTraDuongDanAnToan(item.image, '');
            var link = layDuongDanTrang('course-detail.html?id=' + encodeURIComponent(item.id || ''));
            maHTML += '<a href="' + link + '" class="muc-goi-y-tim-kiem d-flex align-items-center gap-2 p-2 text-decoration-none border-bottom" data-ma-khoa-hoc="' + maHoaHTML(item.id) + '">';
            maHTML += '  <img src="' + maHoaHTML(anh) + '" alt="' + maHoaHTML(item.title) + '" class="rounded anh-goi-y-tim-kiem">';
            maHTML += '  <div class="overflow-hidden flex-grow-1">';
            maHTML += '    <div class="fw-semibold text-dark small text-truncate">' + maHoaHTML(item.title) + '</div>';
            maHTML += '    <div class="text-muted small text-truncate">' + maHoaHTML(item.category || '') + ' • ' + maHoaHTML(item.instructor || '') + '</div>';
            maHTML += '  </div>';
            maHTML += '  <strong class="small ' + (giaSo === 0 ? 'text-success' : 'text-danger') + ' text-nowrap">' + maHoaHTML(chuoiGia) + '</strong>';
            maHTML += '</a>';
        }
        maHTML += '<a href="' + layDuongDanTrang('courses.html?q=' + encodeURIComponent(oNhap.value.trim())) + '" class="d-block text-center py-2 small fw-semibold text-primary text-decoration-none bg-light">Xem tất cả kết quả <i class="bi bi-arrow-right ms-1"></i></a>';
        khungGoiY.innerHTML = maHTML;
        khungGoiY.classList.remove('d-none');

        var cacMuc = khungGoiY.querySelectorAll('.muc-goi-y-tim-kiem');
        for (var m = 0; m < cacMuc.length; m++) {
            cacMuc[m].addEventListener('click', function() {
                var maKH = this.getAttribute('data-ma-khoa-hoc');
                if (maKH && typeof tangLuotClickKhoaHoc === 'function') {
                    tangLuotClickKhoaHoc(maKH);
                }
            });
        }
    }

    oNhap.addEventListener('input', hienThiGoiY);
    oNhap.addEventListener('focus', function() {
        if (oNhap.value.trim() !== '') {
            hienThiGoiY();
        }
    });
    oNhap.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dongGoiY();
        }
    });
    document.addEventListener('click', function(e) {
        if (!vungNeo.contains(e.target)) {
            dongGoiY();
        }
    });
}

function khoiChayTimKiemGiongNoi(oNhapDich, nutMicro, hamSauKhiNhan) {
    var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        hienThiThongBao('Trình duyệt hiện tại chưa hỗ trợ tìm kiếm bằng giọng nói (khuyến nghị dùng Chrome hoặc Edge).', 'warning');
        return;
    }

    try {
        var nhanDang = new SpeechRec();
        nhanDang.lang = 'vi-VN';
        nhanDang.interimResults = false;
        nhanDang.maxAlternatives = 1;

        if (nutMicro) {
            nutMicro.classList.add('dang-ghi-am-giong-noi');
        }

        nhanDang.onresult = function(suKien) {
            if (suKien.results && suKien.results[0] && suKien.results[0][0]) {
                var vanBan = String(suKien.results[0][0].transcript || '').trim();
                if (oNhapDich) {
                    oNhapDich.value = vanBan;
                }
                if (typeof hamSauKhiNhan === 'function') {
                    hamSauKhiNhan(vanBan);
                }
            }
        };

        nhanDang.onerror = function() {
            hienThiThongBao('Không thể thu âm giọng nói. Hãy kiểm tra quyền micro của trình duyệt.', 'warning');
        };

        nhanDang.onend = function() {
            if (nutMicro) {
                nutMicro.classList.remove('dang-ghi-am-giong-noi');
            }
        };

        nhanDang.start();
    } catch (loi) {
        if (nutMicro) {
            nutMicro.classList.remove('dang-ghi-am-giong-noi');
        }
        hienThiThongBao('Không thể khởi chạy tính năng tìm kiếm giọng nói trên môi trường này.', 'warning');
    }
}

/**
 * Hop thoai hien thi danh sach khoa hoc da bam yeu thich tren moi trang
 */
function moHopThoaiYeuThichChung() {
    var hopThoai = document.getElementById('hop-thoai-yeu-thich-chung');
    if (!hopThoai) {
        hopThoai = document.createElement('div');
        hopThoai.id = 'hop-thoai-yeu-thich-chung';
        hopThoai.className = 'modal fade';
        hopThoai.setAttribute('tabindex', '-1');
        hopThoai.setAttribute('aria-hidden', 'true');

        var maKhung = '';
        maKhung += '<div class="modal-dialog modal-lg modal-dialog-scrollable">';
        maKhung += '  <div class="modal-content border-0 shadow">';
        maKhung += '    <div class="modal-header bg-danger text-white">';
        maKhung += '      <h5 class="modal-title fw-bold"><i class="bi bi-heart-fill me-2"></i>Khóa Học Bạn Đã Yêu Thích</h5>';
        maKhung += '      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>';
        maKhung += '    </div>';
        maKhung += '    <div class="modal-body" id="noi-dung-hop-thoai-yeu-thich"></div>';
        maKhung += '    <div class="modal-footer bg-light">';
        maKhung += '      <a href="' + layDuongDanTrang('courses.html') + '" class="btn btn-outline-primary btn-sm">Khám phá thêm khóa học</a>';
        maKhung += '      <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Đóng</button>';
        maKhung += '    </div>';
        maKhung += '  </div>';
        maKhung += '</div>';
        hopThoai.innerHTML = maKhung;
        document.body.appendChild(hopThoai);
    }

    hienThiNoiDungHopThoaiYeuThich();
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(hopThoai).show();
    }
}

function hienThiNoiDungHopThoaiYeuThich() {
    var vungNoiDung = document.getElementById('noi-dung-hop-thoai-yeu-thich');
    if (!vungNoiDung) {
        return;
    }
    var danhSach = layDanhSachKhoaHocYeuThich();
    capNhatHuyHieuYeuThich();

    if (layEmailYeuThichHopLe() === '') {
        vungNoiDung.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-lock fs-1 d-block mb-2 text-secondary"></i>Vui lòng <a href="' + layDuongDanTrang('login.html') + '" class="fw-bold text-decoration-none">đăng nhập tài khoản</a> để lưu và xem danh sách khóa học yêu thích của riêng bạn.</div>';
        return;
    }
    if (danhSach.length === 0) {
        vungNoiDung.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-heart fs-1 d-block mb-2 text-secondary"></i>Bạn chưa lưu khóa học yêu thích nào. Hãy bấm biểu tượng trái tim trên khóa học bạn quan tâm!</div>';
        return;
    }

    var maHTML = '<div class="list-group list-group-flush">';
    for (var i = 0; i < danhSach.length; i++) {
        var kh = danhSach[i];
        var maAnToan = maHoaHTML(kh.id);
        var linkChiTiet = layDuongDanTrang('course-detail.html?id=' + encodeURIComponent(kh.id));
        var anhAnToan = kiemTraDuongDanAnToan(kh.image, '');
        maHTML += '<div class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">';
        maHTML += '  <div class="d-flex align-items-center gap-3">';
        maHTML += '    <img src="' + maHoaHTML(anhAnToan) + '" alt="' + maHoaHTML(kh.title) + '" class="rounded anh-khoa-hoc-nho">';
        maHTML += '    <div>';
        maHTML += '      <a href="' + linkChiTiet + '" class="fw-bold text-dark text-decoration-none d-block">' + maHoaHTML(kh.title) + '</a>';
        maHTML += '      <small class="text-muted d-block">' + maHoaHTML(kh.category) + ' • GV: ' + maHoaHTML(kh.instructor) + '</small>';
        maHTML += '      <strong class="text-danger small">' + maHoaHTML(dinhDangTienVND(kh.salePrice)) + '</strong>';
        maHTML += '    </div>';
        maHTML += '  </div>';
        maHTML += '  <div class="d-flex gap-2">';
        maHTML += '    <button type="button" class="btn btn-primary btn-sm nut-them-gio-tu-yeu-thich" data-ma-khoa-hoc="' + maAnToan + '"><i class="bi bi-cart-plus me-1"></i>Thêm giỏ</button>';
        maHTML += '    <button type="button" class="btn btn-outline-danger btn-sm nut-bo-yeu-thich-modal" data-ma-khoa-hoc="' + maAnToan + '" title="Bỏ yêu thích"><i class="bi bi-trash"></i></button>';
        maHTML += '  </div>';
        maHTML += '</div>';
    }
    maHTML += '</div>';
    vungNoiDung.innerHTML = maHTML;

    var cacNutThem = vungNoiDung.querySelectorAll('.nut-them-gio-tu-yeu-thich');
    for (var j = 0; j < cacNutThem.length; j++) {
        cacNutThem[j].addEventListener('click', function() {
            var ma = this.getAttribute('data-ma-khoa-hoc');
            var kq = themVaoGio(ma, 1);
            hienThiThongBao(kq.message, kq.success ? 'success' : 'warning');
        });
    }

    var cacNutBo = vungNoiDung.querySelectorAll('.nut-bo-yeu-thich-modal');
    for (var k = 0; k < cacNutBo.length; k++) {
        cacNutBo[k].addEventListener('click', function() {
            var ma = this.getAttribute('data-ma-khoa-hoc');
            var ketQua = batTatKhoaHocYeuThich(ma);
            if (!ketQua.success) {
                hienThiThongBao(ketQua.message || 'Không thể cập nhật danh sách Yêu thích.', 'danger');
                return;
            }
            hienThiNoiDungHopThoaiYeuThich();
            hienThiThongBao('Đã xóa khóa học khỏi danh sách yêu thích.', 'info');
        });
    }
}

function capNhatThanhMenu() {
    var nguoiDungHienTai = layNguoiDungHienTai();
    var danhSachPhien = layDanhSachPhienDangNhap();
    var laQuanTri = kiemTraLaQuanTriVien();
    var phienAdmin = laQuanTri ? layQuanTriVienHienTai() : null;

    if ((!nguoiDungHienTai || !nguoiDungHienTai.email) && !phienAdmin) {
        return;
    }

    if ((!nguoiDungHienTai || !nguoiDungHienTai.email) && phienAdmin) {
        var cacNutDangNhapAdmin = document.querySelectorAll('a[href$="login.html"], a[href$="register.html"]');
        for (var a = 0; a < cacNutDangNhapAdmin.length; a++) {
            var linkA = cacNutDangNhapAdmin[a];
            var chaA = linkA.parentElement;
            if (!chaA || !chaA.querySelector('a[href$="cart.html"]')) {
                continue;
            }
            var vungAdmin = document.createElement('div');
            vungAdmin.className = 'dropdown';
            var tenAdminAnToan = maHoaHTML(phienAdmin.fullName || 'Quản trị viên');
            var emailAdminAnToan = maHoaHTML(phienAdmin.email || '');
            var htmlAdmin = '';
            htmlAdmin += '<button class="btn btn-dark dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">';
            htmlAdmin += '  <i class="bi bi-shield-lock-fill text-warning"></i> ' + tenAdminAnToan;
            htmlAdmin += '</button>';
            htmlAdmin += '<ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 menu-tai-khoan-rong">';
            htmlAdmin += '  <li class="px-3 py-2 border-bottom">';
            htmlAdmin += '    <div class="fw-bold small text-dark">' + tenAdminAnToan + '</div>';
            htmlAdmin += '    <div class="text-muted small">' + emailAdminAnToan + '</div>';
            htmlAdmin += '  </li>';
            htmlAdmin += '  <li><a class="dropdown-item py-2 fw-semibold text-primary" href="' + layDuongDanTrang('admin.html') + '"><i class="bi bi-speedometer2 me-2"></i>Mở Admin Dashboard</a></li>';
            htmlAdmin += '  <li><a class="dropdown-item py-2" href="' + layDuongDanTrang('login.html?mode=add') + '"><i class="bi bi-person-plus me-2 text-success"></i>Đăng nhập tài khoản Học viên</a></li>';
            htmlAdmin += '  <li><hr class="dropdown-divider"></li>';
            htmlAdmin += '  <li><button type="button" class="dropdown-item py-2 text-danger nut-dang-xuat-quan-tri-menu"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất Admin</button></li>';
            htmlAdmin += '</ul>';
            vungAdmin.innerHTML = htmlAdmin;
            chaA.replaceChild(vungAdmin, linkA);
            var nutThoatAdmin = vungAdmin.querySelector('.nut-dang-xuat-quan-tri-menu');
            if (nutThoatAdmin) {
                nutThoatAdmin.addEventListener('click', function() {
                    xoaQuanTriVienHienTai();
                    datPhienRiengCuaTab('__guest__');
                    luuThongBaoChoChuyenTrang('Đã đăng xuất tài khoản Quản trị viên.', 'info');
                    window.location.href = layDuongDanTrang('index.html');
                });
            }
            break;
        }
        return;
    }

    var cacLienKetDangNhap = document.querySelectorAll('a[href$="login.html"], a[href$="register.html"]');
    for (var i = 0; i < cacLienKetDangNhap.length; i++) {
        var lienKet = cacLienKetDangNhap[i];
        var phanTuCha = lienKet.parentElement;
        if (!phanTuCha) {
            continue;
        }
        var nutGioHang = phanTuCha.querySelector('a[href$="cart.html"]');
        if (!nutGioHang) {
            continue;
        }

        var vungMenuTaiKhoan = document.createElement('div');
        vungMenuTaiKhoan.className = 'dropdown';

        var tenHienThiAnToan = maHoaHTML(nguoiDungHienTai.fullName || nguoiDungHienTai.email);
        var emailHienThiAnToan = maHoaHTML(nguoiDungHienTai.email);
        var huyHieuDaPhien = '';

        var maHTMLMenu = '';
        maHTMLMenu += '<button class="btn btn-primary dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">';
        var anhGGAvatar = (nguoiDungHienTai.avatar && kiemTraDuongDanAnToan(nguoiDungHienTai.avatar, '') !== '') ? '<img src="' + maHoaHTML(kiemTraDuongDanAnToan(nguoiDungHienTai.avatar, '')) + '" alt="Ảnh đại diện" class="anh-dai-dien-menu-google" referrerpolicy="no-referrer">' : '<i class="bi bi-person-circle"></i>';
        maHTMLMenu += '  ' + anhGGAvatar + ' ' + tenHienThiAnToan + huyHieuDaPhien;
        maHTMLMenu += '</button>';
        maHTMLMenu += '<ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 menu-tai-khoan-rong">';
        maHTMLMenu += '  <li class="px-3 py-2 border-bottom">';
        maHTMLMenu += '    <div class="fw-bold small text-dark">' + tenHienThiAnToan + '</div>';
        maHTMLMenu += '    <div class="text-muted small">' + emailHienThiAnToan + '</div>';
        maHTMLMenu += '  </li>';
        maHTMLMenu += '  <li><a class="dropdown-item py-2" href="' + layDuongDanTrang('profile.html') + '"><i class="bi bi-person-vcard me-2 text-primary"></i>Hồ sơ cá nhân</a></li>';
        maHTMLMenu += '  <li><a class="dropdown-item py-2" href="' + layDuongDanTrang('my-courses.html') + '"><i class="bi bi-journal-check me-2 text-success"></i>Khóa học của tôi</a></li>';
        maHTMLMenu += '  <li><hr class="dropdown-divider"></li>';
        maHTMLMenu += '  <li><button type="button" class="dropdown-item py-2 text-danger nut-dang-xuat-tai-khoan"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>';
        maHTMLMenu += '</ul>';

        vungMenuTaiKhoan.innerHTML = maHTMLMenu;
        phanTuCha.replaceChild(vungMenuTaiKhoan, lienKet);

        var cacNutChuyen = vungMenuTaiKhoan.querySelectorAll('.nut-chuyen-tai-khoan-menu');
        for (var c = 0; c < cacNutChuyen.length; c++) {
            cacNutChuyen[c].addEventListener('click', function() {
                var emailDich = this.getAttribute('data-email-chuyen');
                var banGhi = timTaiKhoanTrongHeThong(emailDich);
                if (banGhi && kiemTraTaiKhoanBiKhoa(banGhi)) {
                    hienThiThongBao('Tài khoản này đang bị khóa, không thể chuyển sang.', 'danger');
                    return;
                }
                var daChuyen = chuyenDoiPhienNguoiDung(emailDich);
                if (daChuyen) {
                    luuThongBaoChoChuyenTrang('Đã chuyển sang tài khoản: ' + (daChuyen.fullName || daChuyen.email), 'success');
                    window.location.reload();
                }
            });
        }

        var nutDangXuat = vungMenuTaiKhoan.querySelector('.nut-dang-xuat-tai-khoan');
        if (nutDangXuat) {
            nutDangXuat.addEventListener('click', function() {
                var phienConLai = dangXuatPhienNguoiDungHienTai();
                if (phienConLai) {
                    luuThongBaoChoChuyenTrang('Đã đăng xuất tài khoản hiện tại. Đang tiếp tục với tài khoản ' + phienConLai.fullName + '.', 'info');
                    window.location.reload();
                } else {
                    luuThongBaoChoChuyenTrang('Đã đăng xuất khỏi tài khoản thành công.', 'info');
                    window.location.href = layDuongDanTrang('index.html');
                }
            });
        }
        break;
    }
}

/**
 * Khung chat ho tro demo noi o goc phai duoi tren cac trang nguoi dung
 */
function khoiTaoKhungChatHoTroDemo() {
    if (document.getElementById('khung-chat-ho-tro-demo')) {
        return;
    }

    var bocChat = document.createElement('aside');
    bocChat.id = 'khung-chat-ho-tro-demo';
    bocChat.className = 'khung-chat-noi';

    var maChat = '';
    maChat += '<div id="hop-chat-ho-tro" class="card shadow-lg border-0 hop-chat-mo-rong d-none">';
    maChat += '  <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2 px-3">';
    maChat += '    <div class="fw-bold small"><i class="bi bi-headset me-2"></i>Hỗ Trợ EduCourses (Demo)</div>';
    maChat += '    <button type="button" id="nut-dong-khung-chat" class="btn btn-sm btn-link text-white p-0 text-decoration-none" title="Thu gọn"><i class="bi bi-x-lg"></i></button>';
    maChat += '  </div>';
    maChat += '  <div id="danh-sach-tin-nhan-chat" class="card-body p-3 vung-tin-nhan-chat"></div>';
    maChat += '  <div class="px-3 pb-2 d-flex flex-wrap gap-1 border-top pt-2 bg-light">';
    maChat += '    <button type="button" class="btn btn-outline-primary btn-sm nut-goi-y-chat" data-cau-hoi="Cách mua khóa học và thanh toán?">Cách mua khóa học?</button>';
    maChat += '    <button type="button" class="btn btn-outline-primary btn-sm nut-goi-y-chat" data-cau-hoi="Hiện có mã giảm giá nào?">Mã giảm giá?</button>';
    maChat += '    <button type="button" class="btn btn-outline-primary btn-sm nut-goi-y-chat" data-cau-hoi="Thông tin liên hệ hỗ trợ?">Liên hệ hỗ trợ?</button>';
    maChat += '  </div>';
    maChat += '  <form id="bieu-mau-gui-chat-ho-tro" class="card-footer bg-white p-2 d-flex gap-2">';
    maChat += '    <input type="text" id="o-nhap-tin-nhan-chat" class="form-control form-control-sm" placeholder="Nhập câu hỏi cần hỗ trợ..." required>';
    maChat += '    <button type="submit" class="btn btn-primary btn-sm px-3" title="Gửi tin nhắn"><i class="bi bi-send-fill"></i></button>';
    maChat += '  </form>';
    maChat += '</div>';
    maChat += '<button type="button" id="nut-mo-khung-chat" class="btn btn-primary rounded-pill shadow-lg px-3 py-2 fw-semibold nut-chat-noi-goc">';
    maChat += '  <i class="bi bi-chat-dots-fill me-2"></i>Hỗ trợ (Demo)';
    maChat += '</button>';

    bocChat.innerHTML = maChat;
    document.body.appendChild(bocChat);

    var hopChat = document.getElementById('hop-chat-ho-tro');
    var nutMo = document.getElementById('nut-mo-khung-chat');
    var nutDong = document.getElementById('nut-dong-khung-chat');
    var bieuMauChat = document.getElementById('bieu-mau-gui-chat-ho-tro');
    var oNhapChat = document.getElementById('o-nhap-tin-nhan-chat');

    if (nutMo) {
        nutMo.addEventListener('click', function() {
            hopChat.classList.toggle('d-none');
            if (!hopChat.classList.contains('d-none')) {
                hienThiLichSuChatHoTro();
                if (oNhapChat) oNhapChat.focus();
            }
        });
    }

    if (nutDong) {
        nutDong.addEventListener('click', function() {
            hopChat.classList.add('d-none');
        });
    }

    var cacNutGoiY = bocChat.querySelectorAll('.nut-goi-y-chat');
    for (var i = 0; i < cacNutGoiY.length; i++) {
        cacNutGoiY[i].addEventListener('click', function() {
            var cauHoi = this.getAttribute('data-cau-hoi');
            guiTinNhanChatDemo(cauHoi);
        });
    }

    if (bieuMauChat) {
        bieuMauChat.addEventListener('submit', function(e) {
            e.preventDefault();
            var noiDung = oNhapChat.value.trim();
            if (noiDung === '') return;
            oNhapChat.value = '';
            guiTinNhanChatDemo(noiDung);
        });
    }
}

function taoPhanHoiTuDongDemo(cauHoi) {
    var chuan = boDauTiengViet(cauHoi);
    if (chuan.indexOf('giam gia') > -1 || chuan.indexOf('voucher') > -1 || chuan.indexOf('coupon') > -1 || chuan.indexOf('ma') > -1) {
        return 'Hiện tại bạn có thể dùng thử mã TVU2026 (giảm 10%) hoặc EDU50K (giảm 50.000đ cho đơn từ 200.000đ) tại trang Thanh toán.';
    }
    if (chuan.indexOf('mua') > -1 || chuan.indexOf('thanh toan') > -1 || chuan.indexOf('qr') > -1 || chuan.indexOf('gio hang') > -1) {
        return 'Bạn chỉ cần thêm khóa học vào Giỏ hàng -> sang trang Thanh toán. Mỗi lần mua hệ thống sẽ tự sinh một Mã thanh toán và Nội dung chuyển khoản riêng biệt cho tài khoản của bạn.';
    }
    if (chuan.indexOf('lien he') > -1 || chuan.indexOf('sdt') > -1 || chuan.indexOf('zalo') > -1 || chuan.indexOf('email') > -1) {
        return 'Bạn có thể liên hệ hỗ trợ qua SĐT/Zalo: 0372765126 hoặc Email: holoc2021.tv@gmail.com, hoặc gửi biểu mẫu tại trang Liên hệ.';
    }
    return 'Cảm ơn bạn đã nhắn tin! Đây là khung chat hỗ trợ mô phỏng (Demo) của EduCourses. Bạn có thể hỏi về cách mua khóa học, mã giảm giá, thanh toán hoặc thông tin liên hệ.';
}

function guiTinNhanChatDemo(noiDungNguoiDung) {
    var lichSu = layLichSuChatHoTro();
    var gio = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    lichSu.push({ nguoiGui: 'user', noiDung: noiDungNguoiDung, thoiGian: gio });
    lichSu.push({ nguoiGui: 'bot', noiDung: taoPhanHoiTuDongDemo(noiDungNguoiDung), thoiGian: gio });
    if (lichSu.length > 30) {
        lichSu = lichSu.slice(lichSu.length - 30);
    }
    if (!luuLichSuChatHoTro(lichSu)) {
        hienThiThongBao('Không thể lưu lịch sử chat vào LocalStorage.', 'danger');
        return;
    }
    hienThiLichSuChatHoTro();
}

function hienThiLichSuChatHoTro() {
    var vungTinNhan = document.getElementById('danh-sach-tin-nhan-chat');
    if (!vungTinNhan) {
        return;
    }
    var lichSu = layLichSuChatHoTro();
    if (lichSu.length === 0) {
        lichSu = [{
            nguoiGui: 'bot',
            noiDung: 'Xin chào! Tôi là trợ lý hỗ trợ demo của EduCourses. Bạn cần giải đáp gì về khóa học hoặc thanh toán?',
            thoiGian: 'Trực tuyến'
        }];
    }
    var maHTML = '';
    for (var i = 0; i < lichSu.length; i++) {
        var tin = lichSu[i];
        if (!tin || typeof tin !== 'object') {
            continue;
        }
        var laNguoiDung = (tin.nguoiGui === 'user');
        maHTML += '<div class="mb-2 d-flex ' + (laNguoiDung ? 'justify-content-end' : 'justify-content-start') + '">';
        maHTML += '  <div class="tin-nhan-chat ' + (laNguoiDung ? 'tin-nhan-nguoi-dung' : 'tin-nhan-he-thong') + '">';
        maHTML += '    <div>' + maHoaHTML(tin.noiDung) + '</div>';
        maHTML += '    <small class="d-block text-end opacity-75 mt-1">' + maHoaHTML(tin.thoiGian || '') + '</small>';
        maHTML += '  </div>';
        maHTML += '</div>';
    }
    vungTinNhan.innerHTML = maHTML;
    vungTinNhan.scrollTop = vungTinNhan.scrollHeight;
}


/**
 * Hop thoai xac nhan Bootstrap 5 thay the hoan toan hop thoai xac nhan mac dinh cua trinh duyet
 */
function xacNhanHanhDongBootstrap(tieuDe, noiDung, hamDongY, hamHuy) {
    var hopThoai = document.getElementById('hop-thoai-xac-nhan-chung-edu');
    if (!hopThoai) {
        hopThoai = document.createElement('div');
        hopThoai.id = 'hop-thoai-xac-nhan-chung-edu';
        hopThoai.className = 'modal fade';
        hopThoai.setAttribute('tabindex', '-1');
        hopThoai.setAttribute('aria-hidden', 'true');
        var ma = '';
        ma += '<div class="modal-dialog modal-dialog-centered">';
        ma += '  <div class="modal-content border-0 shadow">';
        ma += '    <div class="modal-header bg-primary text-white">';
        ma += '      <h5 class="modal-title fw-bold" id="tieu-de-xac-nhan-chung">Xác nhận thao tác</h5>';
        ma += '      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>';
        ma += '    </div>';
        ma += '    <div class="modal-body p-4" id="noi-dung-xac-nhan-chung"></div>';
        ma += '    <div class="modal-footer bg-light">';
        ma += '      <button type="button" class="btn btn-outline-secondary" id="nut-huy-xac-nhan-chung" data-bs-dismiss="modal">Hủy bỏ</button>';
        ma += '      <button type="button" class="btn btn-primary fw-bold" id="nut-dong-y-xac-nhan-chung">Xác nhận</button>';
        ma += '    </div>';
        ma += '  </div>';
        ma += '</div>';
        hopThoai.innerHTML = ma;
        document.body.appendChild(hopThoai);
    }

    var elTieuDe = document.getElementById('tieu-de-xac-nhan-chung');
    var elNoiDung = document.getElementById('noi-dung-xac-nhan-chung');
    if (elTieuDe) elTieuDe.textContent = String(tieuDe || 'Xác nhận thao tác');
    if (elNoiDung) elNoiDung.textContent = String(noiDung || '');

    var nutCu = document.getElementById('nut-dong-y-xac-nhan-chung');
    var nutMoi = nutCu.cloneNode(true);
    nutCu.parentNode.replaceChild(nutMoi, nutCu);

    var nutHuyCu = document.getElementById('nut-huy-xac-nhan-chung');
    var nutHuyMoi = nutHuyCu.cloneNode(true);
    nutHuyCu.parentNode.replaceChild(nutHuyMoi, nutHuyCu);

    var daChonDongY = false;
    nutMoi.addEventListener('click', function() {
        daChonDongY = true;
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(hopThoai).hide();
        }
        if (typeof hamDongY === 'function') {
            hamDongY();
        }
    });

    nutHuyMoi.addEventListener('click', function() {
        if (!daChonDongY && typeof hamHuy === 'function') {
            hamHuy();
        }
    });

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(hopThoai).show();
    } else if (typeof hamDongY === 'function') {
        hamDongY();
    }
}

function hienThiThongBao(noiDungThongBao, loaiThongBao) {
    var vungChua = document.getElementById('vung-chua-thong-bao-edu');
    if (!vungChua) {
        vungChua = document.createElement('div');
        vungChua.id = 'vung-chua-thong-bao-edu';
        vungChua.className = 'toast-container position-fixed top-0 end-0 p-3 khung-thong-bao-noi';
        document.body.appendChild(vungChua);
    }

    var mangLopMau = {
        success: 'text-bg-success',
        danger: 'text-bg-danger',
        warning: 'text-bg-warning',
        info: 'text-bg-primary'
    };
    var mangBieuTuong = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };
    var loaiHopLe = mangLopMau[loaiThongBao] ? loaiThongBao : 'info';

    var theThongBao = document.createElement('div');
    theThongBao.className = 'toast align-items-center border-0 shadow ' + mangLopMau[loaiHopLe];
    theThongBao.setAttribute('role', 'alert');
    theThongBao.setAttribute('aria-live', 'assertive');
    theThongBao.setAttribute('aria-atomic', 'true');

    var khayNoiDung = document.createElement('div');
    khayNoiDung.className = 'd-flex';

    var thanThongBao = document.createElement('div');
    thanThongBao.className = 'toast-body fw-semibold d-flex align-items-center gap-2';

    var bieuTuong = document.createElement('i');
    bieuTuong.className = 'bi ' + mangBieuTuong[loaiHopLe];
    thanThongBao.appendChild(bieuTuong);

    var doanChu = document.createElement('div');
    doanChu.textContent = String(noiDungThongBao || '');
    thanThongBao.appendChild(doanChu);

    var nutDong = document.createElement('button');
    nutDong.type = 'button';
    nutDong.className = 'btn-close me-2 m-auto' + (loaiHopLe === 'warning' ? '' : ' btn-close-white');
    nutDong.setAttribute('data-bs-dismiss', 'toast');
    nutDong.setAttribute('aria-label', 'Đóng');

    khayNoiDung.appendChild(thanThongBao);
    khayNoiDung.appendChild(nutDong);
    theThongBao.appendChild(khayNoiDung);
    vungChua.appendChild(theThongBao);

    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        var doiTuongToast = new bootstrap.Toast(theThongBao, { delay: 3500 });
        doiTuongToast.show();
        theThongBao.addEventListener('hidden.bs.toast', function() {
            if (theThongBao.parentNode) {
                theThongBao.parentNode.removeChild(theThongBao);
            }
        });
    } else {
        theThongBao.classList.add('show');
        setTimeout(function() {
            if (theThongBao.parentNode) {
                theThongBao.parentNode.removeChild(theThongBao);
            }
        }, 3500);
    }
}

function luuThongBaoChoChuyenTrang(noiDungThongBao, loaiThongBao) {
    luuDuLieuJSON('EDU_PENDING_TOAST', {
        noiDung: String(noiDungThongBao || ''),
        loai: loaiThongBao || 'info'
    });
}

function kiemTraVaHienThiThongBaoCho() {
    var thongBaoCho = docDuLieuJSON('EDU_PENDING_TOAST', null);
    if (thongBaoCho && thongBaoCho.noiDung) {
        xoaDuLieuKho('EDU_PENDING_TOAST');
        hienThiThongBao(thongBaoCho.noiDung, thongBaoCho.loai || 'info');
    }
}

function ganSuKienAnHienMatKhau() {
    var cacNutMatKhau = document.querySelectorAll('.nut-hien-mat-khau');
    for (var i = 0; i < cacNutMatKhau.length; i++) {
        if (cacNutMatKhau[i].getAttribute('data-da-gan-mat-khau') === '1') {
            continue;
        }
        cacNutMatKhau[i].setAttribute('data-da-gan-mat-khau', '1');
        cacNutMatKhau[i].addEventListener('click', function() {
            var maONhap = this.getAttribute('data-o-nhap-muc-tieu');
            var oNhap = document.getElementById(maONhap);
            var bieuTuong = this.querySelector('i');
            if (!oNhap || !bieuTuong) {
                return;
            }
            if (oNhap.type === 'password') {
                oNhap.type = 'text';
                bieuTuong.className = 'bi bi-eye-slash';
                this.setAttribute('aria-pressed', 'true');
                this.setAttribute('aria-label', 'Ẩn mật khẩu');
                this.setAttribute('title', 'Ẩn mật khẩu');
            } else {
                oNhap.type = 'password';
                bieuTuong.className = 'bi bi-eye';
                this.setAttribute('aria-pressed', 'false');
                this.setAttribute('aria-label', 'Hiện mật khẩu');
                this.setAttribute('title', 'Hiện mật khẩu');
            }
        });
    }
}


function ganDuPhongAnhLoiToanTrang() {
    window.addEventListener('error', function(e) {
        var phanTu = e && e.target;
        if (phanTu && phanTu.tagName === 'IMG' && phanTu.getAttribute('data-da-du-phong-anh') !== '1') {
            phanTu.setAttribute('data-da-du-phong-anh', '1');
            phanTu.src = laTrangTrongThuMucHtml() ? '../assets/images/logo-chinh.svg' : 'src/assets/images/logo-chinh.svg';
        }
    }, true);
}

function ganSuKienDongBoNhieuTab() {
    window.addEventListener('edu-data-updated', function(ev) {
        var k = (ev && ev.detail && ev.detail.key) ? ev.detail.key : '';
        if (k && typeof capNhatGiaoDienKhiDongBoTab === 'function') {
            capNhatGiaoDienKhiDongBoTab(k);
        }
    });
    window.addEventListener('storage', function(e) {
        if (!e || !e.key) {
            return;
        }
        if (e.key === 'EDU_CART_ITEMS' || e.key === 'EDU_PURCHASES') {
            capNhatHuyHieuGioHang();
        }
        if (e.key === 'EDU_FAVORITES') {
            capNhatHuyHieuYeuThich();
            var hopYeuThich = document.getElementById('hop-thoai-yeu-thich-chung');
            if (hopYeuThich && hopYeuThich.classList.contains('show')) {
                hienThiNoiDungHopThoaiYeuThich();
            }
        }
        if (e.key === 'EDU_CURRENT_USER' || e.key === 'EDU_CURRENT_ADMIN' || e.key === 'EDU_ACTIVE_SESSIONS' || e.key === 'EDU_USERS' || e.key === 'EDU_COURSES' || e.key === 'EDU_PURCHASES' || e.key === 'EDU_ANALYTICS_LOGS' || e.key === 'EDU_REVIEWS' || e.key === 'EDU_CONTACTS' || e.key === 'EDU_CATEGORIES' || e.key === 'EDU_COUPONS' || e.key === 'EDU_FAVORITES' || e.key === 'EDU_RECENT_VIEWED' || e.key === 'EDU_FEATURED_CONFIG' || e.key === 'EDU_VIEW_LOGS' || e.key === 'EDU_CART_LOGS') {
            kiemTraQuyenTruyCapQuanTriNgay();
            if (typeof capNhatGiaoDienKhiDongBoTab === 'function') {
                capNhatGiaoDienKhiDongBoTab(e.key);
            }
        }
    });
}

/**
 * Dang nhap / Dang ky bang Google dung chung cho login.html va register.html
 * Ho tro Google Identity Services (Popup chon tai khoan Google that khi da cau hinh GOOGLE_CLIENT_ID)
 * va tu dong chuyen sang hop thoai chon tai khoan Google giao dien toi khi chay demo offline.
 */
function layGoogleClientIdHieuLuc() {
    var tuMaNguon = (typeof GOOGLE_CLIENT_ID === 'string') ? GOOGLE_CLIENT_ID.trim() : '';
    if (tuMaNguon !== '') return tuMaNguon;
    return (typeof layGoogleClientIdLuu === 'function') ? layGoogleClientIdLuu() : '';
}

function khoiChayPopupGoogleThat(clientId) {
    var dangChayHttp = Boolean(window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:'));
    if (!dangChayHttp) {
        hienThiThongBao('Google chặn đăng nhập thật trên file://. Hãy mở dự án bằng VS Code Live Server (http://127.0.0.1:5500)!', 'warning');
        return false;
    }
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        hienThiThongBao('Chưa tải được thư viện Google Identity Services (kiểm tra kết nối Internet).', 'warning');
        return false;
    }
    try {
        var boXinToken = window.google.accounts.oauth2.initTokenClient({
            client_id: String(clientId).trim(),
            scope: 'openid email profile',
            prompt: 'select_account',
            callback: function(phanHoi) {
                if (!phanHoi || !phanHoi.access_token) {
                    hienThiThongBao('Bạn đã hủy đăng nhập Google hoặc chưa cấp quyền.', 'warning');
                    return;
                }
                layThongTinTaiKhoanGoogleTuToken(phanHoi.access_token);
            }
        });
        boXinToken.requestAccessToken();
        return true;
    } catch (errGis) {
        hienThiThongBao('Client ID chưa hợp lệ hoặc chưa thêm http://127.0.0.1:5500 vào Authorized JavaScript origins.', 'danger');
        return false;
    }
}

function ganSuKienDangNhapGoogleChung() {
    var nutGoogle = document.getElementById('nut-dang-nhap-google');
    if (!nutGoogle || nutGoogle.getAttribute('data-da-gan-google') === '1') {
        return;
    }
    nutGoogle.setAttribute('data-da-gan-google', '1');

    nutGoogle.addEventListener('click', function() {
        var clientId = layGoogleClientIdHieuLuc();
        if (clientId !== '' && khoiChayPopupGoogleThat(clientId)) {
            return;
        }
        moHopThoaiChonTaiKhoanGoogle();
    });
}

function layThongTinTaiKhoanGoogleTuToken(accessToken) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.googleapis.com/oauth2/v3/userinfo', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var hoSo = JSON.parse(xhr.responseText);
                    if (hoSo && hoSo.email) {
                        thucHienDangNhapGoogle(hoSo.name || hoSo.email.split('@')[0], hoSo.email, hoSo.picture || '');
                    } else {
                        hienThiThongBao('Không đọc được địa chỉ email từ tài khoản Google.', 'danger');
                    }
                } catch (eParse) {
                    hienThiThongBao('Lỗi phân tích thông tin tài khoản Google.', 'danger');
                }
            } else {
                hienThiThongBao('Không thể kết nối máy chủ Google để lấy thông tin tài khoản.', 'danger');
            }
        };
        xhr.send();
    } catch (eReq) {
        hienThiThongBao('Không thể gửi yêu cầu xác thực Google.', 'danger');
    }
}

function moHopThoaiChonTaiKhoanGoogle() {
    var hopThoai = document.getElementById('hop-thoai-dang-nhap-google');
    if (!hopThoai) {
        hopThoai = document.createElement('div');
        hopThoai.id = 'hop-thoai-dang-nhap-google';
        hopThoai.className = 'modal fade';
        hopThoai.setAttribute('tabindex', '-1');
        hopThoai.setAttribute('aria-hidden', 'true');

        var dangChayFile = Boolean(window.location && window.location.protocol === 'file:');
        var canhBaoFile = dangChayFile
            ? '<div class="alert alert-warning small py-2 mb-3"><i class="bi bi-exclamation-triangle-fill me-1"></i>Bạn đang mở bằng <strong>file://</strong> nên Google chặn cửa sổ đăng nhập thật. Hãy mở bằng <strong>VS Code Live Server</strong> (http://127.0.0.1:5500).</div>'
            : '';

        var ma = '';
        ma += '<div class="modal-dialog modal-dialog-centered">';
        ma += '  <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden hop-thoai-google-toi">';
        ma += '    <div class="modal-header border-secondary px-4 py-3">';
        ma += '      <div class="d-flex align-items-center gap-2 text-white fw-semibold small">';
        ma += '        <i class="bi bi-google text-warning"></i> Đăng nhập bằng Google';
        ma += '      </div>';
        ma += '      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>';
        ma += '    </div>';
        ma += '    <div class="modal-body p-4 text-white">';
        ma += canhBaoFile;
        ma += '      <div class="mb-2">';
        ma += '        <h6 class="fw-bold mb-1">Chọn tài khoản</h6>';
        ma += '        <div class="small text-secondary">Tiếp tục tới <strong class="text-info">EduCourses</strong></div>';
        ma += '      </div>';
        ma += '      <div id="danh-sach-tai-khoan-google" class="list-group list-group-flush mb-2"></div>';
        ma += '      <button type="button" id="nut-hien-form-google-moi" class="btn btn-outline-light btn-sm w-100 text-start py-2 px-3 d-flex align-items-center gap-3 border-secondary">';
        ma += '        <i class="bi bi-person-circle fs-5 text-secondary"></i>';
        ma += '        <strong>Sử dụng một tài khoản khác</strong>';
        ma += '      </button>';
        ma += '      <form id="bieu-mau-tai-khoan-google-moi" class="border border-secondary rounded-3 p-3 mt-3 d-none">';
        ma += '        <div class="mb-2">';
        ma += '          <label for="google-ho-ten-moi" class="form-label small text-light mb-1">Họ tên hiển thị *</label>';
        ma += '          <input type="text" id="google-ho-ten-moi" class="form-control form-control-sm" placeholder="VD: Nguyễn Văn A" required>';
        ma += '        </div>';
        ma += '        <div class="mb-2">';
        ma += '          <label for="google-email-moi" class="form-label small text-light mb-1">Địa chỉ Gmail *</label>';
        ma += '          <input type="email" id="google-email-moi" class="form-control form-control-sm" placeholder="tenban@gmail.com" required>';
        ma += '        </div>';
        ma += '        <button type="submit" class="btn btn-primary btn-sm w-100 fw-bold mt-1">Tiếp tục với tài khoản này</button>';
        ma += '      </form>';
        ma += '    </div>';
        ma += '  </div>';
        ma += '</div>';
        hopThoai.innerHTML = ma;
        document.body.appendChild(hopThoai);

        var nutHienFormMoi = document.getElementById('nut-hien-form-google-moi');
        var formMoi = document.getElementById('bieu-mau-tai-khoan-google-moi');
        if (nutHienFormMoi && formMoi) {
            nutHienFormMoi.addEventListener('click', function() {
                formMoi.classList.toggle('d-none');
            });
        }
        if (formMoi) {
            formMoi.addEventListener('submit', function(e) {
                e.preventDefault();
                var hoTen = document.getElementById('google-ho-ten-moi').value.trim();
                var email = document.getElementById('google-email-moi').value.trim().toLowerCase();
                if (hoTen === '' || !kiemTraEmailHopLe(email)) {
                    hienThiThongBao('Vui lòng nhập đầy đủ họ tên và email Google hợp lệ!', 'danger');
                    return;
                }
                if (email === EMAIL_QUAN_TRI_MAC_DINH) {
                    hienThiThongBao('Email này không hợp lệ để đăng nhập tại đây. Vui lòng dùng email cá nhân khác!', 'danger');
                    return;
                }
                thucHienDangNhapGoogle(hoTen, email, '');
            });
        }
    }

    hienThiDanhSachGoogle();
    var formCu = document.getElementById('bieu-mau-tai-khoan-google-moi');
    if (formCu) formCu.classList.add('d-none');
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(hopThoai).show();
    }
}

function hienThiDanhSachGoogle() {
    var khung = document.getElementById('danh-sach-tai-khoan-google');
    if (!khung) return;
    var ds = layDanhSachTaiKhoanGoogle();
    var html = '';
    for (var i = 0; i < ds.length; i++) {
        var tk = ds[i];
        if (!tk || typeof tk !== 'object' || !tk.email) {
            continue;
        }
        var chuDau = (tk.fullName && tk.fullName.length > 0) ? tk.fullName.trim().charAt(0).toUpperCase() : 'G';
        html += '<button type="button" class="list-group-item list-group-item-action bg-transparent text-white border-secondary d-flex align-items-center gap-3 py-3 px-2 nut-chon-tai-khoan-google" data-ten="' + maHoaHTML(tk.fullName) + '" data-email="' + maHoaHTML(tk.email) + '">';
        html += '  <div class="anh-dai-dien-google-nho">' + maHoaHTML(chuDau) + '</div>';
        html += '  <div class="text-start overflow-hidden">';
        html += '    <div class="fw-bold text-white small text-truncate">' + maHoaHTML(tk.fullName) + '</div>';
        html += '    <div class="text-secondary small text-truncate">' + maHoaHTML(tk.email) + '</div>';
        html += '  </div>';
        html += '</button>';
    }
    khung.innerHTML = html;
    var cacNut = khung.querySelectorAll('.nut-chon-tai-khoan-google');
    for (var j = 0; j < cacNut.length; j++) {
        cacNut[j].addEventListener('click', function() {
            thucHienDangNhapGoogle(this.getAttribute('data-ten'), this.getAttribute('data-email'), '');
        });
    }
}

function thucHienDangNhapGoogle(hoTen, email, anhDaiDien) {
    var emailChuan = String(email || '').trim().toLowerCase();
    damBaoTaiKhoanQuanTri();
    var ketQuaDoc = docDuLieuJSONCoTrangThai('EDU_USERS', true);
    var danhSach = ketQuaDoc.duLieu.slice();
    var taiKhoan = null;

    for (var i = 0; i < danhSach.length; i++) {
        if (danhSach[i] && typeof danhSach[i].email === 'string' && danhSach[i].email.toLowerCase() === emailChuan) {
            taiKhoan = danhSach[i];
            break;
        }
    }

    if (taiKhoan && taiKhoan.role === 'admin') {
        hienThiThongBao('Tài khoản này không hợp lệ để đăng nhập tại đây!', 'danger');
        return;
    }
    if (taiKhoan && taiKhoan.status === 'locked') {
        hienThiThongBao('Tài khoản này đang bị tạm khóa. Không thể đăng nhập.', 'danger');
        return;
    }

    var laTaiKhoanMoi = false;
    if (!taiKhoan) {
        laTaiKhoanMoi = true;
        taiKhoan = {
            id: taoMaDuyNhat('USR_', danhSach, 'id'),
            fullName: hoTen || emailChuan.split('@')[0],
            email: emailChuan,
            phone: '0372765126',
            address: 'Trà Vinh, Việt Nam',
            avatar: anhDaiDien || '',
            authProvider: 'google',
            password: taoMaCaptcha(10),
            role: 'user',
            status: 'active',
            createdAt: new Date().toLocaleDateString('vi-VN')
        };
        danhSach.push(taiKhoan);
        luuDuLieuJSON('EDU_USERS', danhSach);
    }

    luuTaiKhoanGoogle({ fullName: taiKhoan.fullName, email: taiKhoan.email });
    var phien = {
        id: taiKhoan.id,
        fullName: taiKhoan.fullName,
        email: taiKhoan.email,
        phone: taiKhoan.phone || '0372765126',
        address: taiKhoan.address || 'Trà Vinh, Việt Nam',
        avatar: taiKhoan.avatar || anhDaiDien || '',
        role: 'user',
        createdAt: taiKhoan.createdAt || '',
        rememberSession: true
    };
    themHoacCapNhatPhienNguoiDung(phien);
    var soLoc = locBoKhoaHocDaSoHuuKhoiGio();
    var ghiChu = soLoc > 0 ? (' (Đã lọc ' + soLoc + ' khóa học đã sở hữu).') : '';
    var thongDiep = laTaiKhoanMoi
        ? ('Đã tạo tài khoản và đăng nhập Google thành công! Chào mừng ' + phien.fullName + '.')
        : ('Đăng nhập Google thành công! Chào mừng ' + phien.fullName + ' quay lại.' + ghiChu);
    luuThongBaoChoChuyenTrang(thongDiep, 'success');
    var duongDanQuayLai = layVaXoaDuongDanQuayLai();
    window.location.href = duongDanQuayLai ? duongDanQuayLai : layDuongDanTrang('index.html');
}
