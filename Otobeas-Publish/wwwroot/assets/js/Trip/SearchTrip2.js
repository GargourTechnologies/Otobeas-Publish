function favorite(btn) {
    try {

        var boarding_id = $(btn).data("id");
        $("#favoriteBtn" + boarding_id).prop('disabled', true);

        var favorites = {
            boardingId: $("#boardingId" + boarding_id).val(),
            travelFrom: $("#travelFrom" + boarding_id).val(),
            travelTo: $("#travelTo" + boarding_id).val(),
            tripClass: $("#tripClass" + boarding_id).val(),
            travelTime: $("#travelTime" + boarding_id).val(),
            city_from: $("#city_from" + boarding_id).val(),
            city_to: $("#city_to" + boarding_id).val(),
            org: $("#org" + boarding_id).val()
        };

        $.ajax({
            type: 'POST',
            url: "/Trip/favorite",
            data: favorites,
            success: function (res) {
                if (res.isValid) {
                    $("#favoriteBtn" + boarding_id).off('click').unbind('click');
                    $("#heartIcon" + boarding_id).css("color", "red");
                    favoriteS();
                } else {
                    saveF(res.message);
                    $("#favoriteBtn" + boarding_id).prop('disabled', false);
                }
            },
            error: function (err) {
                $("#favoriteBtn" + boarding_id).prop('disabled', false);
                saveF(err);
            }
        });

        return false;
    } catch (ex) {
        saveF(ex);
    }
}

function ShowHide() {
    $('.filtering').each(function () {
        $(this).toggleClass("hideFilter");
    });
}
$('#from').select2({
    dropdownParent: $('#SearchDiv'),
    width: '100%'
});

$('#to').select2({
    dropdownParent: $('#SearchDiv'),
    width: '100%'
});

var stations;

function loadStations(url, callback) {
    $.get(url, function (data) {
        stations = data;
        $("#from").empty();
        $.each(data, function (index, row) {
            $("#from").append(
                "<option value='" + row.id + "'>" + row.city_name + "</option>"
            );
        });

        let fromId = document.getElementById('from').dataset.fromId;
        $("#from").val(fromId);

        $("#from").trigger("change");

        if (callback) callback();
    });
}
function getNextValidDay() {
    let date = new Date();

    while (date.getDay() !== 2 && date.getDay() !== 6) {
        date.setDate(date.getDate() + 1);
    }

    return date;
}

// ========================= INIT =========================
$(document).ready(function () {

    $("#SearchDiv").css("display", "none");

    loadStations("/Site/InternationalStations", function () {

        let toId = document.getElementById('to').dataset.toId;

        let exists = $("#to option[value='" + toId + "']").length > 0;

        if (exists) {
            flatpickr("#goingDate", {
                dateFormat: "Y-m-d",
                minDate: "today",
                defaultDate: getNextValidDay(),

                enable: [
                    function (date) {
                        return (date.getDay() === 2 || date.getDay() === 6);
                    }
                ]
            });
        }
        else {
            loadStations("/Site/Stations");

            flatpickr("#goingDate", {
                dateFormat: "Y-m-d",
                minDate: "today",

                onReady: function (selectedDates, dateStr, instance) {

                    // container
                    const footer = document.createElement("div");
                    footer.className = "fp-footer";

                    // Today button
                    const todayBtn = document.createElement("button");
                    todayBtn.textContent = "Today";
                    todayBtn.className = "fp-btn fp-today";

                    todayBtn.addEventListener("click", function () {
                        instance.setDate(new Date(), true);
                    });

                    // Clear button
                    const clearBtn = document.createElement("button");
                    clearBtn.textContent = "Clear";
                    clearBtn.className = "fp-btn fp-clear";

                    clearBtn.addEventListener("click", function () {
                        instance.clear();
                    });

                    // append buttons
                    footer.appendChild(todayBtn);
                    footer.appendChild(clearBtn);

                    instance.calendarContainer.appendChild(footer);
                }
            });

        }
    });
});

$("#from").change(function () {
    $("#to").empty();

    $.each(stations, function (index, row) {
        if (row.id == $("#from").val()) {
            $.each(row.listOfTos, function (index2, row2) {
                $("#to").append(
                    "<option value='" + row2.id + "'>" + row2.city_name + "</option>"
                );
            });
        }
    });

    let toId = document.getElementById('to').dataset.toId;

    if ($("#to option[value='" + toId + "']").length > 0) {
        $("#to").val(toId);
    }
});



function SearchTrip() {
    window.location.href =
        '/BookingSearch?from=' + $("#from").val() +
        '&to=' + $("#to").val() +
        '&travelDate=' + $("#goingDate").val() +
        '&travelBackDate=' + $("#returnDate").val();
}
var target = document.getElementById('SearchDiv');
var placeholder = document.createElement('div');
var scrollBtnContainer = document.getElementById('CloseBtnContainer');
var scrollBtn = document.getElementById('CloseSearchBtn');

let isSticky = false;

function IsSearchDivVisible() {
    return window.getComputedStyle(target).display !== "none";
}

function handleScroll() {
    var rect = target.getBoundingClientRect();

    if (!isSticky && rect.top <= 0 && IsSearchDivVisible()) {
        placeholder.style.height = `${target.offsetHeight}px`;
        target.parentNode.insertBefore(placeholder, target);
        target.classList.add('sticky-fixed');
        isSticky = true;

        scrollBtnContainer.style.display = 'block';
        scrollBtnContainer.style.top = `${target.offsetHeight}px`;
    }
    else if (isSticky && window.scrollY < placeholder.offsetTop) {
        target.classList.remove('sticky-fixed');

        if (placeholder.parentNode)
            placeholder.parentNode.removeChild(placeholder);

        isSticky = false;
        scrollBtnContainer.style.display = 'none';
    }
}

window.addEventListener('scroll', handleScroll);

scrollBtn.addEventListener('click', () => {
    ToggleSearchBtn();
    document.getElementById('CloseBtnContainer').style.display = 'none';
});

function ToggleSearchBtn() {
    var button = document.getElementById("toggleSearchBtn");
    $("#SearchDiv").slideToggle(function () {
        if ($("#SearchDiv").is(":visible")) {
            button.classList.add("btn-danger");
            button.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i> ' + button.dataset.closeText;
        } else {
            button.classList.remove("btn-danger");
            button.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i> ' + button.dataset.searchText;
        }
    });
}