(function () {
    var retryWrap = document.getElementById('errRetryWrap');
    if (!retryWrap) return; // no OriginalPath was available server-side — nothing to wire up

    var shouldRetry = retryWrap.dataset.retry === 'true';
    var returnUrl = retryWrap.dataset.returnUrl || '/';

    function goToReturnUrl() {
        window.location.href = returnUrl;
    }

    if (shouldRetry) {
        retryWrap.hidden = false;
        var seconds = 10;
        var secEl = document.getElementById('errRetrySeconds');
        secEl.textContent = seconds;

        var timer = setInterval(function () {
            seconds -= 1;
            if (seconds <= 0) {
                clearInterval(timer);
                goToReturnUrl();
                return;
            }
            secEl.textContent = seconds;
        }, 1000);

        document.getElementById('errRetryNow').addEventListener('click', function () {
            clearInterval(timer);
            goToReturnUrl();
        });
    }
})();