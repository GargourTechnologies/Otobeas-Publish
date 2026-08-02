// ==========================
// PAGE LOAD
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    const page = (window.appConfig?.page || "").toLowerCase();

    let defaultUrl = "/PersonalAccount/_Profile";
    let defaultActive = "personalInformation";

    switch (page) {
        case "history":
            defaultUrl = "/PersonalAccount/_History";
            defaultActive = "ticketsHistory";
            break;
        case "change-trip":
            defaultUrl = "/PersonalAccount/_ChangeTripDate";
            defaultActive = "changeTripDate";
            break;
        case "wallet":
            defaultUrl = "/PersonalAccount/_SmartCards";
            defaultActive = "wallet";
            break;
    }

    const preloader = document.getElementById("preloader");

    $(".load-btn").removeClass("active");
    $(`.load-btn[data-active="${defaultActive}"]`).addClass("active");

    if (defaultUrl) {
        preloader.style.display = "flex";

        fetch(defaultUrl)
            .then(r => r.text())
            .then(html => {
                document.getElementById("partialContainer").innerHTML = html;

                if (defaultUrl.includes("_History")) {
                    initPendingTickets();
                }
            })
            .catch(() => {
                document.getElementById("partialContainer").innerHTML =
                    `<div class="alert alert-danger">${appConfig.messages.errorDefault}</div>`;
            })
            .finally(() => {
                preloader.style.display = "none";
            });
    }

    document.querySelectorAll(".load-btn").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const url = this.dataset.url;
            preloader.style.display = "flex";

            fetch(url)
                .then(r => r.text())
                .then(html => {
                    document.getElementById("partialContainer").innerHTML = html;

                    if (url.includes("_History")) {
                        initPendingTickets();
                    }

                    $(".load-btn").removeClass("active");
                    $(this).addClass("active");
                })
                .catch(() => {
                    document.getElementById("partialContainer").innerHTML =
                        `<div class="alert alert-danger">${appConfig.messages.errorPartial}</div>`;
                })
                .finally(() => {
                    preloader.style.display = "none";
                });
        });
    });
});

// ==========================
// PROFILE UPDATE
// ==========================
function UpdateProfile(e) {
    e.preventDefault();

    document.getElementById("updateBtn")?.setAttribute("disabled", true);

    $.post("/PersonalAccount/UpdateProfile", $("#personalInformation").serialize(), function (res) {

        if (res.isValid) {
            toastr.success(appConfig.messages.dataSaved);
        } else {
            toastr.error(res.message);
        }

        document.getElementById("updateBtn")?.removeAttribute("disabled");
    });

    return false;
}

// ==========================
// CANCEL BOOKING
// ==========================
function CancelBooking(merchantRef, btn) {

    let cancelButton = $(btn);

    cancelButton.addClass('disabled').css({
        'pointer-events': 'none',
        'color': '#ccc'
    });

    $.ajax({
        type: 'GET',
        url: "/PersonalAccount/CancelBooking",
        data: { merchantReference: merchantRef },

        success: function (res) {
            if (res.isValid) {

                fetch("/PersonalAccount/_History")
                    .then(r => r.text())
                    .then(html => {
                        document.getElementById("partialContainer").innerHTML = html;
                    })
                    .catch(() => {
                        document.getElementById("partialContainer").innerHTML =
                            `<div class="alert alert-danger">${appConfig.messages.errorLoading}</div>`;
                    });

                toastr.success(appConfig.messages.bookingCanceled);

            } else {
                toastr.error(res.message || appConfig.messages.failedCancel);
                enableButton(cancelButton);
            }
        },

        error: function (err) {
            console.error(err);
            toastr.error('Error: ' + err.statusText);
            enableButton(cancelButton);
        }
    });

    return false;
}

// ==========================
// CANCEL TICKET
// ==========================
function CancelBookedTicket(tickedNo, btn) {

    let cancelButton = $(btn);

    cancelButton.addClass('disabled').css({
        'pointer-events': 'none',
        'color': '#ccc'
    });

    $.ajax({
        type: 'GET',
        url: "/PersonalAccount/CancelBookedTickets",
        data: { ticketId: tickedNo },

        success: function (res) {
            if (res.isValid) {

                fetch("/PersonalAccount/_History")
                    .then(r => r.text())
                    .then(html => {
                        document.getElementById("partialContainer").innerHTML = html;

                        // Switch to the "Booked Tickets" tab after reload
                        const secondTab = document.getElementById("second-tab");
                        if (secondTab) {
                            new bootstrap.Tab(secondTab).show();
                        }
                    })
                    .catch(() => {
                        document.getElementById("partialContainer").innerHTML =
                            `<div class="alert alert-danger">${appConfig.messages.errorLoading}</div>`;
                    });

                toastr.success(appConfig.messages.ticketCanceled);

            } else {
                toastr.error(res.message || appConfig.messages.failedCancel);
                enableButton(cancelButton);
            }
        },

        error: function (err) {
            console.error(err);
            toastr.error('Error: ' + err.statusText);
            enableButton(cancelButton);
        }
    });

    return false;
}

// ==========================
// ENABLE BUTTON
// ==========================
function enableButton(button) {
    button.removeClass('disabled').css({
        'pointer-events': 'auto',
        'color': ''
    });
}

// ==========================
// DATE INIT
// ==========================
$('.arrivalDate').attr('min', new Date().toISOString().split('T')[0]);
$('.arrivalDate').attr('value', new Date().toISOString().split('T')[0]);

// ==========================
// DISPLAY TRIPS
// ==========================
function Display(counter) {

    count = counter;

    $(".newArrival").addClass("d-none");
    $(".feesRow").addClass("d-none");
    $("#newArrival" + counter).removeClass("d-none");

    $("#newArrivalDate" + counter).text($("#arrivalDate" + counter).val());

    $('#modal' + counter).modal('hide');

    $.get("/PersonalAccount/AvailableTrips", {
        newDate: $("#arrivalDate" + counter).val(),
        ticketId: $("#ticketId" + counter).val(),
        bookedSeats: $("#bookedSeats" + counter).val()
    }, function (data) {

        trips = data;
        console.log(trips)
        $("#availableTrips" + counter).empty();
        $("#availableTrips" + counter).append("<option>Choose</option>");

        if (data.length > 0) {
            $("#feesRow" + counter).removeClass("d-none");
            $("#transferMessage" + counter).text("- " + data[0].transferMessage + " .");
            $("#transferFeesAmount" + counter).text(data[0].transferFeesAmount);
        }

        $.each(data, function (index, row) {
            $("#availableTrips" + counter).append(
                "<option name='" + row.id + "' value='" + row.points.id + "'>" +
                row.date.name + " гд " + row.points.name +
                "</option>"
            );
        });
    });
}

// ==========================
// CHANGE TRIP SEATS
// ==========================
$(document).on("change", ".availableTrips", function () {

    $(".availableSeats").empty();

    $.each(trips, function (index, row) {

        if (row.id == $("#availableTrips" + count).find("option:selected").attr("name")) {

            $.each(row.seats, function (i, seat) {
                $(".availableSeats").append("<option value='" + seat + "'>" + seat + "</option>");
            });
        }
    });

    $('.availableSeats').each(function () {

        $(this).val($(this).attr('data-seat'));

        var item = $(this);
        var selected = $(this).find('option:selected').val();

        $('.availableSeats').not(item).each(function () {
            $(this).find("option[value='" + selected + "']").hide();
        });
    });
});

// ==========================
// CHANGE TRIP
// ==========================
function change(index) {

    $(".book").prop("disabled", true);

    let newSeats = [];

    $(".availableSeats" + index).each(function () {
        newSeats.push($(this).val());
    });

    $.get("/PersonalAccount/changeTrip", {
        newDate: $("#arrivalDate" + index).val(),
        ticketId: $("#ticketId" + index).val(),
        bookedSeats: $("#bookedSeats" + index).val(),
        newSeats: newSeats.join(","),
        boardingPointId: $("#availableTrips" + index).val()
    }, function (res) {

        if (res.isValid) {

            fetch("/PersonalAccount/_ChangeTripDate")
                .then(r => r.text())
                .then(html => {
                    document.getElementById("partialContainer").innerHTML = html;
                })
                .catch(() => {
                    document.getElementById("partialContainer").innerHTML =
                        `<div class="alert alert-danger">${appConfig.messages.errorLoading}</div>`;
                });

            toastr.success(appConfig.messages.dataSaved);

        } else {
            toastr.error(res.message);
            $(".book").prop("disabled", false);
        }
    });
}

// ==========================
// INIT PENDING TICKETS
// ==========================
function initPendingTickets() {

    $(".availableTimeLimit").each(function () {

        const index = $(this).data("index");
        const createdAt = new Date($(this).val()).getTime();
        if (isNaN(createdAt)) return;

        const availableTime = $(".availableTime[data-index='" + index + "']");
        const pendingTime = $("#PendingTime" + index);
        const cancelBtn = $(".cancelBtn[data-index='" + index + "']");

        const row = availableTime.closest("tr");
        const prevRow = row.prev("tr");

        const paymentMethod =
            row.data("payment") ||
            $(`[data-payment-index='${index}']`).val();

        const autoCancelInterval = setInterval(function () {

            const remaining = createdAt + (2 * 60 * 60 * 1000) - Date.now();

            if (remaining <= 0) {
                clearInterval(autoCancelInterval);

                if (paymentMethod && paymentMethod.toLowerCase() === "limo installments") {
                    row.hide();
                    prevRow.hide();
                }

                return;
            }

            const h = Math.floor(remaining / 3600000);
            const m = Math.floor((remaining % 3600000) / 60000);
            const s = Math.floor((remaining % 60000) / 1000);

            availableTime.html(`- ${appConfig.messages.cancelledAutomatically} ${h} ${appConfig.messages.hour} ${m} ${appConfig.messages.minute} ${s} ${appConfig.messages.second}`);

        }, 1000);

        const pendingInterval = setInterval(function () {

            const remaining = createdAt + (5 * 60 * 1000) - Date.now();

            if (remaining <= 0) {
                clearInterval(pendingInterval);
                pendingTime.hide();

                cancelBtn.css({
                    "pointer-events": "auto",
                    "opacity": "1"
                });

                return;
            }

            const m = Math.floor((remaining % (1000 * 60 * 5)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);

            cancelBtn.css({
                "pointer-events": "none",
                "opacity": "0.5"
            });

            pendingTime.html(`( ${m} ${appConfig.messages.minute} ${s} ${appConfig.messages.second} )`);

        }, 1000);
    });
}

// ==========================
// CANCEL CHANGE BTN
// ==========================
$(document).on("click", ".cancelChangeBtn", function () {
    const index = $(this).data("cancel");
    $("#newArrival" + index).addClass("d-none");
});