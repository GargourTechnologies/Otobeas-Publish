function saveF(message) {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-danger animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-danger'><i class='fa fa-bell me-2'></i><div class='me-auto fw-semibold pr-2 pl-2'>" + message + "</div><button type='button' class='btn-close  bg-danger' data-bs-dismiss='toast' aria-label='Close' onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
    setTimeout(function () { $(".toast").remove() }, 3000);
}
function saveSL(link) {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-success animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-success'><i class='bx bx-bell me-2'></i><div class='me-auto fw-semibold'> <i class='fa fa-check-circle pr-2 pl-2' aria-hidden='true'></i> Data Saved Successfully </div><button type='button' class='btn-close  bg-success' data-bs-dismiss='toast' aria-label='Close'  onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
    setTimeout(function () { $(".toast").remove(); window.location.href = link }, 1000);
}
function bookSL(link) {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-success animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-success'><i class='bx bx-bell me-2'></i><div class='me-auto fw-semibold'> <i class='fa fa-check-circle pr-2 pl-2' aria-hidden='true'></i>Trip Booked Successfully</div><button type='button' class='btn-close  bg-success' data-bs-dismiss='toast' aria-label='Close'  onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
    setTimeout(function () { $(".toast").remove(); window.location.href = link }, 1000);
}
function signInSL(link) {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-success animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-success'><i class='bx bx-bell me-2'></i><div class='me-auto fw-semibold'> <i class='fa fa-check-circle pr-2 pl-2' aria-hidden='true'></i>Logged in successfully</div><button type='button' class='btn-close  bg-success' data-bs-dismiss='toast' aria-label='Close'  onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
    setTimeout(function () { $(".toast").remove(); window.location.href = link }, 1000);
}
function saveS() {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-success animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-success' style=''><i class='bx bx-bell me-2'></i><div class='me-auto fw-semibold'><i class='fa fa-check-circle pr-2 pl-2' aria-hidden='true'></i> Data Saved Successfully </div><button type='button' class='btn-close bg-success' data-bs-dismiss='toast' aria-label='Close'  onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
      setTimeout(function () { $(".toast").remove() }, 3000);
}
function favoriteS() {
    $("body").append("<div class='bs-toast toast toast-ex animate__animated my-2 fade bg-success animate__tada show' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='2000'><div class='toast-header bg-success' style=''><i class='bx bx-bell me-2'></i><div class='me-auto fw-semibold'><i class='fa fa-check-circle pr-2 pl-2' aria-hidden='true'></i>  Added to favorites Successfully</div><button type='button' class='btn-close bg-success' data-bs-dismiss='toast' aria-label='Close'  onclick='RemoveToast()'><i class='fa fa-times me-2'></i></button></div></div>");
      setTimeout(function () { $(".toast").remove() }, 3000);
}