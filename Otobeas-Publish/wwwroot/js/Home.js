$(document).ready(function () {

    $("#home").addClass("active");

    $('.searchable').select2({
        width: '100%'
    });

    // =========================
    // Date Helpers
    // =========================
    function getNextValidDay() {
        let date = new Date();

        while (date.getDay() !== 2 && date.getDay() !== 6) {
            date.setDate(date.getDate() + 1);
        }

        return date;
    }

    // =========================
    // Flatpickr Init
    // =========================
    flatpickr("#countryDepart", {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: getNextValidDay(),
        enable: [
            function (date) {
                return (date.getDay() === 2 || date.getDay() === 6);
            }
        ]
    });

    flatpickr("#busDepart,#limousineDepart", {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: "today",
        onReady: function (selectedDates, dateStr, instance) {
            const footer = document.createElement("div");
            footer.className = "fp-footer";

            const todayBtn = document.createElement("button");
            todayBtn.textContent = "Today";
            todayBtn.className = "fp-btn fp-today";
            todayBtn.addEventListener("click", function () {
                instance.setDate(new Date(), true);
            });

            const clearBtn = document.createElement("button");
            clearBtn.textContent = "Clear";
            clearBtn.className = "fp-btn fp-clear";
            clearBtn.addEventListener("click", function () {
                instance.clear();
            });

            footer.appendChild(todayBtn);
            footer.appendChild(clearBtn);

            instance.calendarContainer.appendChild(footer);
        }
    });

    // =========================
    // Load Stations
    // =========================
    let stations = [];
    let limousineStations = [];

    function populateSelect($select, list) {
        $select.empty();
        $.each(list, function (_, row) {
            $select.append(`<option value="${row.id}">${row.city_name}</option>`);
        });
        $select.trigger("change");
    }

    $.get("/Site/Stations", function (data) {
        stations = data;
        populateSelect($("#busFrom"), data);
    });

    $.get("/Site/InternationalStations", function (data) {
        stations = data;
        populateSelect($("#countryFrom"), data);
    });

    $.get("/Site/LimousineStations", function (data) {
        limousineStations = data;
        populateSelect($("#limousineFrom"), data);
    });

    // =========================
    // Change Handlers
    // =========================
    function populateTo(fromId, sourceList, $target, defaultId = null) {
        $target.empty();

        const selected = sourceList.find(x => x.id == fromId);
        if (!selected) return;

        $.each(selected.listOfTos, function (_, row) {
            $target.append(`<option value="${row.id}">${row.city_name}</option>`);
        });

        if (defaultId) {
            $target.val(defaultId);
        }
    }

    $("#busFrom").on("change", function () {
        populateTo($(this).val(), stations, $("#busTo"), '3');
    });

    $("#countryFrom").on("change", function () {
        populateTo($(this).val(), stations, $("#countryTo"));
    });

    $("#limousineFrom").on("change", function () {
        populateTo($(this).val(), limousineStations, $("#limousineTo"), '3');
    });

    // =========================
    // Validation
    // =========================
    function validateFields(fields) {
        console.log(fields)
        $(".error-msg").remove();
        let valid = true;

        fields.forEach(field => {
            if (!field.el.val()) {
                field.el.after(`<span class="error-msg text-danger">${field.el.data("error")}</span>`);
                valid = false;
            }
        });

        return valid;
    }

    // =========================
    // Search Functions
    // =========================
    window.searchTrip = function () {
        let from = $("#busFrom");
        let to = $("#busTo");
        let date = $("#busDepart");

        if (!validateFields([
            { el: from },
            { el: to },
            { el: date }
        ])) return;

        let travelDate = moment(date.val(), "YYYY-MM-DD").format("YYYY-MM-DD");

        window.location.href = `/BookingSearch/${from.val()}/${to.val()}/${travelDate}`;
    };

    window.searchInternationalTrip = function () {
        let from = $("#countryFrom");
        let to = $("#countryTo");
        let date = $("#countryDepart");

        if (!validateFields([
            { el: from },
            { el: to },
            { el: date }
        ])) return;

        let travelDate = moment(date.val(), "YYYY-MM-DD").format("YYYY-MM-DD");

        window.location.href = `/BookingSearch/${from.val()}/${to.val()}/${travelDate}`;
    };

    window.searchLimousineTrip = function () {

        let from = $("#limousineFrom");
        let to = $("#limousineTo");
        let date = $("#limousineDepart");

        if (!validateFields([
            { el: from },
            { el: to },
            { el: date }
        ])) return;

        let travelDate = moment(date.val(), "YYYY-MM-DD").format("YYYY-MM-DD");

        window.location.href = `/BookingLimousineSearch/${from.val()}/${to.val()}/${travelDate}`;
    };

});
function closeTripAlert() {
    const alert = document.getElementById("trip-alert");

    alert.classList.add("hide");

    setTimeout(() => {
        alert.remove();
    }, 300);
}

var routes;
$.get("/Site/MapLines", {
},
    function (data) {
        routes = data;
        const map = L.map('map').setView([29.0, 30.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);



        // 1. Group routes by destination
        const groupedRoutes = {};
        const today = new Date().toISOString().split("T")[0];

        routes.forEach(route => {
            const destKey = route.to.name;
            if (!groupedRoutes[destKey]) {
                groupedRoutes[destKey] = {
                    coords: route.to,
                    routes: []
                };
            }
            groupedRoutes[destKey].routes.push(route);
        });

        let currentRoutes = [];

        // 2. Add one marker per destination
        Object.values(groupedRoutes).forEach(group => {
            const { coords, routes } = group;

            const marker = L.marker([coords.latitude, coords.longitude]).addTo(map);
            marker.bindPopup(`${coords.name} (${routes.length} route${routes.length > 1 ? 's' : ''})`);

            marker.on('click', () => {
                // Remove existing route lines
                currentRoutes.forEach(r => map.removeLayer(r));
                currentRoutes = [];

                // Draw all routes to this destination
                routes.forEach(route => {
                    const fromLatLng = [route.from.latitude, route.from.longitude];
                    const toLatLng = [route.to.latitude, route.to.longitude];

                    const polyline = L.polyline([fromLatLng, toLatLng], {
                        color: 'blue',
                        weight: 4,
                        opacity: 0.8
                    }).addTo(map);

                    // Route link
                    const slug = `${route.from.id}/${route.to.id}/${today}`;

                    polyline.on('click', () => {
                        window.location.href = `/BookingSearch/${slug}`;
                    });

                    polyline.on('mouseover', function () {
                        this.setStyle({ color: 'red' });
                        map.getContainer().style.cursor = 'pointer';
                    });

                    polyline.on('mouseout', function () {
                        this.setStyle({ color: 'blue' });
                        map.getContainer().style.cursor = '';
                    });

                    currentRoutes.push(polyline);
                });

                // Fit to last drawn route (or first one if needed)
                if (currentRoutes.length > 0) {
                    map.fitBounds(currentRoutes[0].getBounds());
                }
            });
        });
    });