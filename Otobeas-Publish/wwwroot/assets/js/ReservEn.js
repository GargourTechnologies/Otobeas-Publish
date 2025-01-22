$(function () {

	var hash = window.location.hash;
	if (hash != "") {
		$(hash).addClass('opened');
	}

	// 	buses

	$('#buses').on('click', '.expand .button', function () {
		$(this).closest('.item').addClass('opened');
		return false;
	});
	$('#buses').on('click', '.collapse', function () {
		$(this).closest('.item').removeClass('opened');
		return false;
	});

	$('#buses, #classes').on('click', '.gallery .open', function () {
		$(this).closest('.gallery').addClass('opened');
		return false;
	});

	$('#buses, #classes').on('click', '.gallery .close', function () {
		$(this).closest('.gallery').removeClass('opened');
		return false;
	});

	$('#buses, #classes').on('click', '.gallery .prev', function () {
		ul = $(this).closest('.gallery').find('ul');
		if (ul.find('.active').prev().length) {
			ul.find('.active').prev().addClass('active').siblings().removeClass('active');
		}
		else {
			ul.find('li:last-child').addClass('active').siblings().removeClass('active');
		}
		return false;
	});

	$('#buses, #classes').on('click', '.gallery .next', function () {
		ul = $(this).closest('.gallery').find('ul');
		if (ul.find('.active').next().length) {
			ul.find('.active').next().addClass('active').siblings().removeClass('active');
		}
		else {
			ul.find('li:first-child').addClass('active').siblings().removeClass('active');
		}
		return false;
	});
















	//   Seats
	var tickets = [];
	var totalAmount = 0;
	$('.seatCounter').val(localStorage['bookingArray']);
	$('.seat:not(.seat-booked)').click(function () {

		if ($('.seat-your').length == maxSeats && !$(this).hasClass("seat-your") && !$(this).hasClass("seat-empty") && !$(this).hasClass("seat-driver")) {
			// alert('Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø­Ø¬Ø² Ø§ÙƒØªØ± Ù…Ù† 8 ØªØ°Ø§ÙƒØ± ÙÙŠ ÙƒÙ„ Ø¹Ù…Ù„ÙŠØ© Ø­Ø¬Ø²');
			saveF('It is not possible to reserve more than 8 tickets per booking')
			//$('.modal2 , .reg-overlay').fadeIn(200);
			//$("html, body").addClass("hid-body");
			return false;
		}

		var bookingArray = {};
		var boardingPoint = $(this).attr("data-boarding");
		var travelDate = $(this).attr("data-traveldate");
		var seatNumber = $(this).attr("data-number");
		var travelTo = $(this).attr("data-travelto");
		// var seatPrice = $('#resultes'+boardingPoint).attr("data-price");
		var seatPrice = $(this).attr("data-ticketPrice");
		var tripClass = $('#resultes' + boardingPoint).attr("data-class");
		var datatripId = $('#resultes' + boardingPoint).attr("data-tripid");
		var organizationId = $(this).attr("data-organization");

		if ($(this).attr("data-book") == "0" && !$(this).hasClass("seat-your")) {
			$(this).attr('data-removePrice', seatPrice);
		}

		// Keep trips of the same organization
		$(".list-item").css('display', 'none');
		$("[data-organization='" + organizationId + "']").css('display', 'block');

		bookingArray["travelDate"] = travelDate;
		bookingArray["boardingPoint"] = boardingPoint;
		bookingArray["seatNumber"] = seatNumber;
		bookingArray["travelTo"] = travelTo;
		if ($(this).hasClass("seat-your") && !$(this).hasClass("seat-booked")) {
			tickets = $.grep(tickets, function (data, index) {
				return data.seatNumber != bookingArray["seatNumber"]
			});
			totalAmount = parseInt(totalAmount) - parseInt($(this).attr('data-removePrice'));
		}

		if ($(this).attr("data-book") == "0" && !$(this).hasClass("seat-your")) {
			tickets.push(bookingArray);
			totalAmount = parseInt(totalAmount) + parseInt(seatPrice);
		}

		var totalTickets = tickets.length;

		if (totalTickets >= 1) {
			$('.submitBTN').css('display', 'block');
			$('.submitBTNTog').css('display', 'none');
		} else {
			$('.submitBTN').css('display', 'none');
			$('.submitBTNTog').css('display', 'block');
		}

		localStorage['bookingArray'] = JSON.stringify(tickets);

		$('.quantText').html(totalTickets);
		$('.totalPrice').html(totalAmount);
		$('.totalPricevalue').val(totalAmount);

		$('.totalPriceSummary').html(totalAmount);

		$('.seatCounter').val(localStorage['bookingArray']);

		elem = $(this);
		if (elem.closest('.seats').hasClass('seats-disabled')) {
			return false;
		}

		if (elem.hasClass('seat-your')) {
			elem.removeClass('seat-your');
			elem.find('span').text('available');
		}
		else {
			if (!elem.hasClass('seat-booked') && !elem.hasClass('seat-empty') && !elem.hasClass('seat-driver')) {
				elem.addClass('seat-your');
				if ($('.TripBoardingTo').find(":selected").text()) {
					if ($(this).parent().parent().parent().find(".TripBoardingTo :selected").text() != "") {
						elem.find('span').text($(this).parent().parent().parent().find(".TripBoardingTo :selected").text());
					} else {
						elem.find('span').text($(this).parent().parent().parent().find(".TripBoardingToReturn :selected").text());
					}
				} else {
					elem.find('span').text('my place');
				}
			}
		}
		return false;

	});
	$(".cancelBooking").on('click', function () {
		tickets = [];
		totalTickets = tickets.length;
		totalAmount = 0;
		$('.submitBTN').css('display', 'none');
		$('.submitBTNTog').css('display', 'block');
		localStorage['bookingArray'] = JSON.stringify(tickets);
		$('.quantText').html(totalTickets);
		$('.totalPrice').html(0);
		$('.totalPricevalue').val(0);
		$('.totalPriceSummary').html(0);
		$('.seatCounter').val(0);
		$(".seat").removeClass('seat-your');
		$(".seat").find('span').text('available');
		return false;
	});
});