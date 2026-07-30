function getValue(selector, isText = false) {
    return isText
        ? $(selector).text().trim()
        : $(selector).val()?.trim();
}
function ProceedPayment() {
    try {


        let phone = getValue('#mobileNumber');
        let comment = getValue('#Comments');

        if (!phone) {
            toastr.error(window.labels.enterTravelerDetails);
            return;
        }

        let selectedPayment = $('input[name="PaymentMethod"]:checked');

        if (selectedPayment.length === 0) {
            toastr.error(window.labels.choosePaymentMethod);
            return;
        }

        let paymentMethod = selectedPayment.attr('id');

        $('#proceedPaymentBtn').prop('disabled', true);
        var order = {};
        order["trip_id"] = $("#tripId").val();
        order["travelDate"] = $("#travelDate").val();
        order["remote_id"] = $("#remoteId").val();
        order["comments"] = comment;
        console.log(order)

        $.ajax({
            type: 'POST',
            url: '/LimousineTrip/Book',
            data: {
                paymentMethods: paymentMethod,
                travelerPhone: phone,
                order: JSON.stringify(order)
            },
            success: function (res) {
                if (res.isValid) {
                    showToastRedirect(
                        "success",
                        window.labels.bookedSuccessfully,
                        res.url
                    );
                } else {
                    $('#proceedPaymentBtn').prop('disabled', false);
                    toastr.error(res.message || 'Error');
                }
            },
            error: function () {
                $('#proceedPaymentBtn').prop('disabled', false);
                toastr.error(window.labels.serverConnectionError);
            }
        });

    } catch (ex) {
        $('#proceedPaymentBtn').prop('disabled', false);
        console.error(ex);
        toastr.error('Error');
    }
}
