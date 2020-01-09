// When the saved button is clicked an article is saved 
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
// 
$(document).on("click", ".delete-from-saved", function (event) {
    event.preventDefault();
    var articleId = $(this).attr("data-id");
    $.ajax({
        url: "/saved/delete/" + articleId,
        type: "POST",
        success: function (response) {
            window.location.href = "/saved";
        },
        error: function (error) {
            console.log("error" + JSON.stringify(error));
        }
    });
});
// So when you click anywhere the class "button_delete" is added, it sends a "get" request to execute the /delete route.
// Then it sends you back to the homepage.
$(document).on("click", ".button_delete", function () {
    $.ajax({
        type: 'GET',
        url: '/delete',
        success: function () {
            window.location.href = "/";
        },
        error: function (error) {
            console.log(error);
        }
    });
});
// So when you click anywhere the class "button_scraper" is added, it sends a "get" request to execute the /scrape route.
// Then it sends you back to the homepage.
$(document).on("click", ".button_scraper", function () {
    $.ajax({
        type: 'GET',
        url: '/scrape',
        success: function () {
            window.location.href = "/";
        },
        error: function (error) {
            console.log(error);
        }
    });
});
//
$(document).on('click', '.add-note', function(){
    event.preventDefault();
    // var title = $(this).attr("data-title");
    var title = $(this).data("title");
    console.log(title);
    var id = $(this).attr("data-id");
    $("#articleTitle" + id).text(title); 
});
// When the saveNote button is clicked
$("body").on("click", ".save-note", function(event) {
    event.preventDefault();
    // Grab the id associated with the article from the Save Note button and put it in thisId
    var thisId = $(this).attr("data-id");
    console.log("thisId: " + thisId);

    // AJAX POST call to the submit route on the server
    // This will take the data from the form and send it to the server
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/save-note/" + thisId,
        data: {
            ntitle: $(`#noteTitleInput${thisId}`).val(),
            nbody: $(`#noteBodyInput${thisId}`).val(),
        }
    })
        // If that API call succeeds, add the title and a delete button for the note to the page 
        .then(function(dbArticle) {
            location.reload();
            // window.location.href = "/articles/saved/";

        });
});
// When user clicks the delete button for a note
$("body").on("click", ".note-delete", function(event) {
    event.preventDefault();
    // var thisId = $(this).attr("data-id");
    var thisId = $(event.target).attr("id");
    console.log("Delete on click event - thisID: " + thisId);
    
    // Make an AJAX GET request to delete the specific note
    $.ajax({
        // type: "GET",
        type: "POST",
        url: "/note/delete/" + thisId,
        // url: "/delete/" + thisId,
    }).then(
        function(data) {
            console.log("data" + data);
            location.reload();
        }
    );
});