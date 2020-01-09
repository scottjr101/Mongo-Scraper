
$(document).on("click", ".save", function (event) {
    event.preventDefault();
    var articleId = $(this).attr("data-id");
    $.ajax({
        url: "/saved/" + articleId,
        type: "POST",
        success: function (response) {
            window.location.href = "/";
        },
        error: function (error) {
            console.log("error" + JSON.stringify(error));
        }
    });
});

$(document).on("click", ".button_delete", function () {
    location.reload(true);
    $.ajax({
        type: 'GET',
        url: '/delete',
        success: function () {
            console.log('Err!');
        }
    });
});

$(document).on("click", ".button_scraper", function () {
    
    $.ajax({
        type: 'GET',
        url: '/scrape',
        success: function () {
            location.reload(true);
            console.log('Err!');
        }
    });
});
