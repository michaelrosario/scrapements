$(function() {
  // hamburger menu
  $(document).on("click", ".hamburger", function(e) {
    e.preventDefault();
    var currentNav = $(this);
    if (currentNav.hasClass("open")) {
      if ($(this).hasClass("off-canvas")) {
        $("#sitewrapper").removeClass("open"); // for off-canvas
      }
      currentNav
        .removeClass("open")
        .parent()
        .find("ul")
        .removeClass("open");
    } else {
      if ($(this).hasClass("off-canvas")) {
        $("#sitewrapper").addClass("open"); // for off-canvas
      }
      currentNav
        .addClass("open")
        .parent()
        .find("ul")
        .addClass("open");
    }
  });

  // when the mouse leaves, hide the nav
  $("nav").on("mouseleave", function() {
    $("#sitewrapper,nav,.hamburger, nav ul").removeClass("open");
  });

  $(".jumper").on("click", function() {
    var target = $(this).attr("data-target");
    $("html, body").animate(
      {
        scrollTop: $("#" + target).offset().top
      },
      1000
    );
    return false;
  });

    $(".carousel").css("opacity","0").on('init', function(slick) {
      console.log('fired!');
      $(".carousel").animate({"opacity":"1"},1000);
    }).slick({
        lazyLoad: "ondemand",
        dots: true,
        slidesToShow: 1,
        centerMode: false
    });

    $(document).on("click",".save-article", function(){
      let target = $(this).attr("data-target");
      let article = $("#"+target);
      let index = article.attr("data-index");
      let button = $(this);
      let savedText = button.text();
      button.text("Saving...")
     
      console.log("data",data[index]);

      delete data[index]._id;

      $.ajax({
        url: "/save",
        method: "POST",
        data: data[index],
        success: function(response){
          console.log('response',response);
          let id = response._id;
          button.addClass("disabled").text(savedText);
          data[index]._id = id;
          article
            .attr("data-id",id)
            .addClass("article-saved")
            .find(".options").removeClass("disabled");
            let count = parseInt($(".saved-count").text());
            count++;
            console.log('count',count);
            $(".saved-count").text(count);
            if(count == 0){
              $(".nav-saved").addClass("disabled");
            } else {
              $(".nav-saved").removeClass("disabled");
            }
        }
      })
      
      return false;

    });

    $(document).on("click",".remove-article", function(){
      
      var target = $(this).attr("data-target");
      var article = $("#"+target);
      var index = article.attr("data-index");
      
      console.log("data",data[index]);

      $.ajax({
        url: "/delete",
        method: "POST",
        data: data[index],
        success: function(response){
          console.log('response',response);
          article.removeClass("article-saved")
            .find(".options")
            .addClass("disabled");
          
          article
            .find(".save-article")
            .removeClass("disabled");

          let count = parseInt($(".saved-count").text());
          count--;
          console.log('count',count);
          $(".saved-count").text(count);
          if(count == 0){
            $(".nav-saved").addClass("disabled");
          } else {
            $(".nav-saved").removeClass("disabled");
          }
        }
      });

      return false;
    });

    $(document).on("click",".comment-article", function(){
      var target = $(this).attr("data-target");
      var article = $("#"+target);
      var index = article.attr("data-index");
      
      console.log("data id",data[index]._id);

      showOverlay(data[index]);

      return false;
    });

    function showOverlay(obj) {
        $(".overlay").addClass("show").hide();
        $(".overlay").fadeIn();
        console.log('object',obj);
    }

    $(".modal-burger").on("click",function(){
        $(".overlay").fadeOut();
        setTimeOut(function(){
          $(".overlay").removeClass("show");
        }, 1000);
    });
        
});
