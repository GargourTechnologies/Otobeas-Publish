$("#resetPasswordForm").submit(function (e) {
    e.preventDefault();

    $.post("/Account/ForgetPassword", $(this).serialize(), function (res) {
        if (res.isValid) {
            showToastRedirect("success", window.resetPasswordMessages.success, "/Home")
        } else {
            toastr.error(res.message);
        }
    });
});