// ========================================
// GLOBALS
// ========================================
let stations = [];
let selectedSeats = [];
let remoteId = null;

// pagination
let currentPage = 1;
const itemsPerPage = 5;
const travelDate = window.travelDate || null;

// ========================================
// INIT
// ========================================
$(document).ready(function () {

    initSelect2();
    initSliders();
    initStations();
    initFilters();
    bindEvents();

    renderPagination();
    showPage(1);
});

// ========================================
// DATE PICKERS
// ========================================


function addFooterButtons(_, __, instance) {

    const footer = document.createElement("div");
    footer.className = "fp-footer";

    footer.append(
        createButton("Today", () => instance.setDate(new Date(), true)),
        clearButton("Clear", () => instance.clear())
    );

    instance.calendarContainer.appendChild(footer);
}

function createButton(text, click) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "fp-btn";
    btn.addEventListener("click", click);
    return btn;
}

function clearButton(text, click) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "fp-btn fp-clear";
    btn.addEventListener("click", click);
    return btn;
}

function getNextValidDay() {
    let date = new Date();
    while (![2, 6].includes(date.getDay())) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

// ========================================
// SELECT2
// ========================================
function initSelect2() {
    $('.searchable').select2({ width: '100%' });
}

// ========================================
// STATIONS
// ========================================
function initStations() {

    loadStations("/Site/InternationalStations", function () {

        let toId = document.getElementById('busTo').dataset.toId;
        let exists = $("#busTo option[value='" + toId + "']").length > 0;

        if (exists) {
            initGoingDateWithDays();
        } else {
            loadStations("/Site/Stations");
            initGoingDateDefault();
        }
    });
}

function loadStations(url, callback) {

    $.get(url, function (data) {

        stations = data;
        $("#busFrom").empty();

        $.each(data, function (_, row) {
            $("#busFrom").append(`<option value="${row.id}">${row.city_name}</option>`);
        });

        let fromId = document.getElementById('busFrom').dataset.fromId;
        $("#busFrom").val(fromId).trigger("change");

        if (callback) callback();
    });
}

function onFromChange() {

    $("#busTo").empty();

    $.each(stations, function (_, row) {

        if (row.id == $("#busFrom").val()) {

            $.each(row.listOfTos, function (_, row2) {
                $("#busTo").append(`<option value="${row2.id}">${row2.city_name}</option>`);
            });
        }
    });

    let toId = document.getElementById('busTo').dataset.toId;

    if ($("#busTo option[value='" + toId + "']").length > 0) {
        $("#busTo").val(toId);
    }
}

// ========================================
// GOING DATE
// ========================================
function initGoingDateWithDays() {

    flatpickr("#busDepart", {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: travelDate,
        enable: [d => d.getDay() === 2 || d.getDay() === 6]
    });
}

function initGoingDateDefault() {
    flatpickr("#busDepart", {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: travelDate,
        onReady: addFooterButtons
    });
}

// ========================================
// SEARCH
// ========================================
function searchTrip() {

    let from = $("#busFrom").val();
    let to = $("#busTo").val();
    let travelDate = $("#busDepart").val();

    $(".error-msg").remove();

    let valid = true;

    if (!from) valid = showError("#busFrom");
    if (!to) valid = showError("#busTo");
    if (!travelDate) valid = showError("#busDepart");

    if (!valid) return;

    travelDate = moment(travelDate, "YYYY-MM-DD").format("YYYY-MM-DD");

    window.location.href = `/BookingSearch/${from}/${to}/${travelDate}`;
}

function showError(selector) {
    $(selector).after(`<span class="error-msg" style="color:red;font-size:12px;">${$(selector).data("error")}</span>`);
    return false;
}


// ========================================
// SLIDERS
// ========================================
function initSliders() {

    $("#slider-range-departure").slider({
        range: true,
        min: 0,
        max: 1439,
        values: [0, 1439],
        slide: function (e, ui) {
            $('.slider-time-departure').each(function (i) {
                let h = ("00" + Math.floor(ui.values[i] / 60)).slice(-2);
                let m = ("00" + (ui.values[i] % 60)).slice(-2);
                $(this).html(`${h}:${m}`);
            });
        }
    });

    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 10000,
        values: [0, 10000],
        slide: function (e, ui) {
            $("#minPrice").val(ui.values[0]);
            $("#maxPrice").val(ui.values[1]);
            $("#amount").val(`${ui.values[0]} - ${ui.values[1]}`);
            applyFilters();
        }
    });

    $("#amount").val("0 - 10000");
}

// ========================================
// BOARDING BUTTONS
// ========================================
function bindBoardingButtons() {

    document.querySelectorAll(".boarding-btn").forEach(btn => {

        btn.addEventListener("click", function () {

            const departureTime = this.dataset.departureTime;
            const departurePoint = this.dataset.departurePoint;
            const boardingId = this.dataset.boardingId;

            const busItem = this.closest(".bus-item");
            const selectSeatBtn = busItem.querySelector(".select-seat-btn");

            selectSeatBtn.dataset.selectedBoardingId = boardingId;
            selectSeatBtn.dataset.departureTime = departureTime;
            selectSeatBtn.dataset.departurePoint = departurePoint;

            busItem.querySelectorAll(".boarding-btn").forEach(b => {
                b.classList.remove("btn-primary");
                b.classList.add("shadow-none");
            });

            this.classList.add("btn-primary");

            busItem.querySelector(".departureTime").innerText = departureTime;
            busItem.querySelector(".departurePoint").innerText = departurePoint;

            const arrivalTime = busItem.querySelector(".tripDuration").innerText;
            const duration = calculateDuration(departureTime, arrivalTime);

            busItem.querySelector(".duration").innerText = duration;
        });
    });
}

// ========================================
// DATE HELPERS
// ========================================
function parseArabicDate(dateStr) {

    dateStr = dateStr.replace(/[\u200E\u200F]/g, "");

    const [datePart, timePart, period] = dateStr.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    let [hour, minute, second] = timePart.split(":").map(Number);

    if (period === "م" && hour !== 12) hour += 12;
    if (period === "ص" && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute, second);
}

function calculateDuration(start, end) {

    const diff = parseArabicDate(end) - parseArabicDate(start);
    const mins = Math.floor(diff / 60000);

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${h.toString().padStart(2, "0")} ${window.labels.hours} ${m.toString().padStart(2, "0")} ${window.labels.minutes}`;
}

// ========================================
// SEATS
// ========================================
$(document).on("click", ".seatCharts-seat", function () {

    let maxSeats = parseInt($('#MaxSeats').val()) || 0;
    let seat = $(this);

    if (seat.hasClass('unavailable')) return;

    let seatId = String(seat.data('seatno'));
    let price = parseFloat(seat.data('price')) || 0;

    let cartItem = $('#cart-item-' + seatId);
    let isSelected = seat.hasClass('selected');

    if (!isSelected) {

        if (selectedSeats.length >= maxSeats) {
            toastr.error(`${window.labels.selectMaximumOf} ${maxSeats} ${window.labels.seats}`);
            return;
        }

        selectedSeats.push({ seatNo: seatId, price });

        seat.addClass('selected').removeClass('available');

        if (!cartItem.length) {
            $(`<li id="cart-item-${seatId}" data-seat-id="${seatId}">
                ${window.labels.seat} #${seatId}: <b>${price} ${window.labels.egp}</b>
                <a href="#" class="cancel-cart-item text-danger text-4"><i class="far fa-times-circle"></i></a>
            </li>`).appendTo('#selected-seats');
        }

    } else {

        selectedSeats = selectedSeats.filter(s => s.seatNo !== seatId);
        seat.removeClass('selected').addClass('available');
        cartItem.remove();
    }

    updateSummary();
});

function updateSummary() {
    $('#counter').text(selectedSeats.length);
    $('#total').text(recalculateTotal().toFixed(2));
}

function recalculateTotal() {
    let total = 0;
    $('.seatCharts-seat.selected').each(function () {
        total += parseFloat($(this).data('price'));
    });
    return total;
}

$(document).on('click', '.cancel-cart-item', function (e) {
    e.preventDefault();

    let li = $(this).closest('li');
    let id = li.attr('id').replace('cart-item-', '');

    $('.seatCharts-seat[data-seatno="' + id + '"]')
        .removeClass('selected')
        .addClass('available');

    selectedSeats = selectedSeats.filter(s => String(s.seatNo) !== String(id));

    li.remove();

    updateSummary();
});

// ========================================
// MODAL + CONFIRM (FIXED)
// ========================================
$(document).on("click", ".select-seat-btn", function () {

    const boardingId = this.dataset.selectedBoardingId;
    const departureTime = this.dataset.departureTime;
    const departurePoint = this.dataset.departurePoint;

    if (!boardingId || !departureTime || !departurePoint) {
        toastr.error("Please select boarding point first");
        return;
    }

    $("#seatModalBody").html(`
        <div class="text-center p-5">
            <span class="spinner-border"></span>
        </div>
    `);

    remoteId = this.dataset.remoteId;
    selectedSeats = [];

    $.get("/_SelectSeats", {
        boarding_id: boardingId,
        travelDate: $("#travelDate").val(),
        to: $("#to").val(),
        remoteId: remoteId,
        departureTime: departureTime,
        boardingPointName: departurePoint
    })
        .done(html => $("#seatModalBody").html(html))
        .fail(err => {
            console.error(err);
            $("#seatModalBody").html("<div class='text-danger'>Error loading seats</div>");
        });
});

$(document).on("click", "#confirmSeats", function (e) {
    e.preventDefault();

    let btn = $(this);
    let originalText = btn.text();

    btn.prop("disabled", true).text(window.labels.pleaseWait + " ...");

    if (!selectedSeats.length) {
        toastr.error("Please select at least one seat!");
        btn.prop("disabled", false).text(originalText);
        return;
    }

    $.get('/Trip/IsAuthenticated')
        .done(function (isAuth) {

            if (!isAuth) {
                $('#login-modal').modal('show');
                $('#select-busseats').modal('hide');

                // re-enable so user can click again after login
                $btn.prop("disabled", false).text(originalText);
                return;
            }

            let seats = selectedSeats.map(s => s.seatNo).join(',');
            let boardingId = $('#boardingId').val();
            let to = $('#to').val();
            let date = $('#travelDate').val();

            window.location.href = `/BookingConfirm/${boardingId}/${to}/${date}/${remoteId}/${seats}`;
        })
        .fail(function () {
            toastr.error("Something went wrong. Please try again.");
            $btn.prop("disabled", false).text(originalText);
        });
});
// ========================================
// FILTERS + PAGINATION (FIXED)
// ========================================
function initFilters() {

    $('.filter-org, .filter-point').on('change', applyFilters);
    $("#slider-range, #slider-range-departure").on("slidechange", applyFilters);
}

function applyFilters() {

    const priceRange = $("#slider-range").slider("values");
    const timeRange = $("#slider-range-departure").slider("values");

    const selectedPoints = $(".filter-point:checked").map((_, el) => el.value).get();
    const selectedOrgs = $(".filter-org:checked").map((_, el) => el.value).get();

    $(".bus-item").each(function () {

        const item = $(this);
        let visible = true;

        const price = parseFloat(item.data("price"));
        if (price < priceRange[0] || price > priceRange[1]) visible = false;

        const depDate = parseArabicDate(item.data("departure"));
        if (depDate) {
            const mins = depDate.getHours() * 60 + depDate.getMinutes();
            if (mins < timeRange[0] || mins > timeRange[1]) visible = false;
        }

        if (selectedPoints.length && !selectedPoints.includes(item.data("point"))) visible = false;
        if (selectedOrgs.length && !selectedOrgs.includes(item.data("org"))) visible = false;

        item.toggleClass("filtered-out", !visible);
    });

    currentPage = 1;
    renderPagination();
    showPage(currentPage);
}

function getFilteredItems() {
    return $(".bus-item").not(".filtered-out");
}

function renderPagination() {

    const items = getFilteredItems();
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const $p = $("#pagination").empty();

    if (totalPages <= 1) return;

    $p.append(`<li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
    </li>`);

    for (let i = 1; i <= totalPages; i++) {
        $p.append(`<li class="page-item ${i === currentPage ? "active" : ""}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`);
    }

    $p.append(`<li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
    </li>`);
}

function showPage(page) {

    const items = getFilteredItems();
    const totalPages = Math.ceil(items.length / itemsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;

    $(".bus-item").hide();

    items.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    ).show();

    renderPagination();
}

$(document).on("click", "#pagination a", function (e) {
    e.preventDefault();

    const page = parseInt($(this).data("page"));
    if (!isNaN(page)) {
        showPage(page);
    }
});

// ========================================
// EVENTS
// ========================================
function bindEvents() {
    $(document).on("change", "#busFrom", onFromChange);
    bindBoardingButtons();
    window.searchTrip = searchTrip;
}