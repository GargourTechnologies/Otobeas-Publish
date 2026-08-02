// ===== Helpers =====
function getValue(selector, isText = false) {
    return isText
        ? $(selector).text().trim()
        : $(selector).val()?.trim();
}

function setText(selector, value) {
    $(selector).text(value);
}

function setVal(selector, value) {
    $(selector).val(value);
}

function resetPromo() {
    setText('#discount', 0);
    setVal('#maxRate', 0);
    setVal('#discount_scope', '');
    setVal('#promo', '');
}

// ===== Promo Code =====
function ActivatePromoCode() {
    try {
        const promoCode = getValue('#PromoCode');

        if (!promoCode) {
            toastr.error(`${window.labels.pleaseEnterPromoCode}`);
            return;
        }

        $.ajax({
            type: 'GET',
            url: "/Trip/CheckPromoCode",
            data: {
                promoCode: promoCode,
                tripId: getValue("#tripId", true),
                companyId: getValue("#companyId")
            },
            success: function (res) {
                if (res.isValid) {
                    toastr.success(`${window.labels.promoCodeActivated}`);

                    setText('#discount', res.value);
                    setVal('#maxRate', res.maxRate || 0);
                    setVal('#discount_scope', res.discount_scope || '');
                    setVal('#promo', promoCode);
                } else {
                    toastr.error(`${window.labels.promoCodeNotAvailable}`);
                    resetPromo();
                }

                applyDiscount(tickets);
            },
            error: function () {
                toastr.error(`${window.labels.error}`);
            }
        });

    } catch (ex) {
        console.error(ex);
        toastr.error(`${window.labels.error}`);
    }
}

function checkPromo() {
    const promoCode = getValue('#PromoCode');

    if (!promoCode) {
        resetPromo();
        applyDiscount(tickets);
    }
}

// ===== Discount =====
function applyDiscount(tickets = []) {
    try {
        let totalPrice = parseFloat(getValue('#totalBeforeDiscount', true)) || 0;
        let fees = parseFloat(getValue('#feesId', true)) || 0;
        let totalWithFees = totalPrice + fees;
        let discount = parseFloat(getValue('#discount', true)) || 0;
        let maxRate = parseFloat(getValue('#maxRate')) || 0;
        let scope = getValue('#discount_scope');

        let finalTotal = totalWithFees;
        let discountAmount = 0;

        if (scope === 'Ticket') {
            let totalAfterDiscount = 0;

            tickets.forEach(item => {
                let seatPrice = Number(item.seatPrice) || 0;
                let seatDiscount = seatPrice * (discount / 100);
                totalAfterDiscount += (seatPrice - seatDiscount);
            });

            totalAfterDiscount += fees;          // ← add fees back (not discounted)
            totalAfterDiscount -= maxRate;

            finalTotal = Math.max(0, Math.round(totalAfterDiscount));
            discountAmount = totalWithFees - finalTotal;  // ← compare against totalWithFees
        } else {
            discountAmount = discount > 0
                ? totalPrice * (discount / 100)  // discount applies to tickets only
                : maxRate;

            finalTotal = Math.max(0, Math.round(totalWithFees - discountAmount));
        }

        setText('#totalAmount', finalTotal);
        setText('#discount', Math.round(discountAmount));

    } catch (ex) {
        console.error(ex);
        toastr.error(`${window.labels.error}`);
    }
}
// ===== Payment =====
function ProceedPayment() {
    try {

        let btn = $('#proceedPaymentBtn');
        let originalText = btn.text();

        btn.prop("disabled", true).text(window.labels.pleaseWait + " ...");

        if (typeof hasTerms !== "undefined" && hasTerms === 1) {
            if (!$('#agree-term').is(':checked')) {
                toastr.error(window.labels.pleaseAgreeToTermsAndConditions);

                var modal = new bootstrap.Modal(document.getElementById('fare-rules'));
                modal.show();
                btn.prop("disabled", false).text(originalText);
                return;
            }
        }

        let email = getValue('#travelerEmail');
        let phone = getValue('#mobileNumber');
        let name = getValue('#travelerName');

        if (!email || !phone || !name) {
            toastr.error(window.labels.enterTravelerDetails);
            btn.prop("disabled", false).text(originalText);
            return;
        }

        let selectedPayment = $('input[name="PaymentMethod"]:checked');

        if (selectedPayment.length === 0) {
            toastr.error(window.labels.choosePaymentMethod);
            btn.prop("disabled", false).text(originalText);
            return;
        }

        let paymentMethod = selectedPayment.attr('id');
        let cardNumber = selectedPayment.data('number') || null;

        

        $.ajax({
            type: 'POST',
            url: '/Trip/Book',
            data: {
                paymentMethods: paymentMethod,
                travelerPhone: phone,
                travelerEmail: email,
                travelerName: name,
                tickets: JSON.stringify(tickets),
                promoCode: getValue('#promo'),
                round_trip: 0,
                cardNumber: cardNumber
            },
            success: function (res) {
                if (res.isValid) {
                    showToastRedirect(
                        "success",
                        window.labels.bookedSuccessfully,
                        res.url
                    );
                } else {
                    btn.prop("disabled", false).text(originalText);
                    toastr.error(res.message || 'Error');
                }
            },
            error: function () {
                btn.prop("disabled", false).text(originalText);
                toastr.error(window.labels.serverConnectionError);
            }
        });

    } catch (ex) {
        btn.prop("disabled", false).text(originalText);
        console.error(ex);
        toastr.error('Error');
    }
}

const checkbox = document.getElementById('agree-term');
const modal = document.getElementById('fare-rules');

checkbox.addEventListener('change', function () {
    if (this.checked) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
    }
});