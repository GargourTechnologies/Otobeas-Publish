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

var stations
$(document).ready(function () {
    $("#SearchDiv").css("display", "none");

    $.get("/Site/LimousineStations", {
    },
        function (data) {
            stations = data;
            $("#from").empty();
            $.each(data, function (index, row) {
                $("#from").append("<option value='" + row.id + "'>" + row.city_name + "</option>")
                $("#from").trigger("change");

            });
            $("#from").val(document.getElementById('from').dataset.fromId);
        });
});

$("#from").change(function () {
    $("#to").empty();
    $.each(stations, function (index, row) {
        if (row.id == $("#from").val()) {
            $.each(row.listOfTos, function (index2, row2) {
                $("#to").append("<option value='" + row2.id + "'>" + row2.city_name + "</option>")
            });
        }
    })
    $("#to").val(document.getElementById('to').dataset.toId);
})

$('#goingDate').attr('min', new Date().toISOString().split('T')[0]);
$('#returnDate').attr('min', new Date().toISOString().split('T')[0]);

function SearchTrip() {
    window.location.href = '/BookingLimousineSearch?from=' + $("#from").val() + '&to=' + $("#to").val() + '&travelDate=' + $("#goingDate").val()
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
        // Make searchDiv fixed
        placeholder.style.height = `${target.offsetHeight}px`;
        target.parentNode.insertBefore(placeholder, target);
        target.classList.add('sticky-fixed');
        isSticky = true;

        // Show scroll-top button under sticky searchDiv
        scrollBtnContainer.style.display = 'block';
        scrollBtnContainer.style.top = `${target.offsetHeight}px`;
    }
    else if (isSticky && window.scrollY < placeholder.offsetTop) {
        // Remove fixed style
        target.classList.remove('sticky-fixed');
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        isSticky = false;

        // Hide scroll-top button
        scrollBtnContainer.style.display = 'none';
    }
}

window.addEventListener('scroll', handleScroll);

// Scroll to top on button click
scrollBtn.addEventListener('click', () => {
    ToggleSearchBtn();
    document.getElementById('CloseBtnContainer').style.display = 'none'
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