$(document).ready(function () {
    // Country dropdown
    $('#countryCode').select2({
        dropdownParent: $('#dropDownParent'),
        templateResult: formatFlag,
        templateSelection: formatFlag
    });
    $('#countryCode').val('+20').trigger('change');

    // Input filter for phone
    $("#phone").on("input", function () {
        this.value = this.value.replace(/\D/g, '');
    });

    // Register button click
    $("#Save").on("click", function () {
        if (!$("#agree-term").is(":checked")) {
            saveF("Please agree to terms");
            return;
        }
        if ($("#phone").val().trim() === "") {
            saveF("Enter phone number correctly");
            return;
        }
        if (!validateEmail($("#email").val())) {
            saveF("Enter email correctly");
            return;
        }
        submitForm();
    });
});

function formatFlag(state) {
    if (!state.id) return state.text;
    var flagUrl = $(state.element).data('flag');
    return $('<span><img src="' + flagUrl + '" style="width: 20px; height: 20px; margin-right: 5px;" />' + state.text + '</span>');
}

function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function submitForm() {
    var formData = new FormData(document.getElementById('registerForm'));
    $("#Save").prop("disabled", true);

    $.ajax({
        type: 'POST',
        url: "/Account/Register",
        data: formData,
        contentType: false,
        processData: false,
        success: function (res) {
            if (res.isValid) {
                saveSL("/Thanks");
            } else {
                saveF(res.message);
                $("#Save").prop("disabled", false);
            }
        },
        error: function (err) {
            saveF(err);
            $("#Save").prop("disabled", false);
        }
    });
}
    