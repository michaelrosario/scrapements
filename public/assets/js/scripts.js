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
            .find(".options")
            .removeClass("disabled")
            .find(".time")
            .attr("data-time",moment().format());
            let count = parseInt($(".saved-count").text());
            count++;
            console.log('count',count);
            $(".saved-count").text(count);
            refreshTime();
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
          refreshTime();
          if(count == 0){
            $(".nav-saved").addClass("disabled");
          } else {
            $(".nav-saved").removeClass("disabled");
          }
        }
      });

      return false;
    });

    var commentID = ""; // keep track of current article

    $(document).on("click",".comment-article", function(){
      var target = $(this).attr("data-target");
      var article = $("#"+target);
      var index = article.attr("data-index");
      var id = data[index]._id;
      commentID = id;
      
      $("#current-title").text(data[index].title);
      console.log("data id",data[index]._id);

      $("#comments").html("loading...");

      $.ajax({
        url: "/comment/"+id,
        method: "GET",
        success: function(response){
          console.log("comment",response);
          if(response.comments){
            showComments(response.comments);
          } else {
            $("#comments").html("no comments...");
          }
        }
      });
      showOverlay(data[index]);
      return false;
    });

    function showOverlay(obj) {
        $(".overlay").addClass("show").hide();
        $(".overlay").fadeIn();
        console.log('object',obj);
    }

    $(".modal-burger").on("click", function(e){
        $(".overlay").fadeOut();
        setTimeout(function(){
          $(".overlay").removeClass("show");
        }, 1000);
        return false;
    });

    $(document).on("click",".trashComment",function(){
      console.log($(this).attr("data-id"));
      var currentComment = $(this).parent();
      var currentCommentId = $(this).attr("data-id");
      $.ajax({
        url: '/comment/delete/'+currentCommentId+"/"+commentID,
        method: "POST",
        success: function(response){
          showComments(response.comments);
        }
      });
      return false;
    });

    $("#submit-comment").on("submit",function(){
      
      var nameInput = $("form #name").val() || "";
      var commentInput = $("form #body").val() || ""; 

      if(nameInput.length <= 2){
        $("form #name").addClass("error");
        setTimeout(function(){
          $("form #name").removeClass("error");
        },2000);
      }

      if(commentInput.length <= 2){
        $("form #body").addClass("error");
        setTimeout(function(){
          $("form #body").removeClass("error");
        },2000);
      }

      if(nameInput.length > 2  && commentInput.length > 2){

        nameInput = escapeHtml(nameInput.trim());
        commentInput = escapeHtml(commentInput.trim());

        const data = { 
          name: nameInput,
          body: commentInput,
          article: commentID
        };

        console.log("data",data);
        $.ajax({
          url: '/comment/'+commentID,
          data: data,
          method: "POST",
          success: function(response){
            showComments(response.comments);
          }
        });
      } 
      return false;
    });

    function escapeHtml(text) {
      'use strict';
      return text.replace(/[\"&<>]/g, function (a) {
          return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
      });
    }

    function showComments(arrayObj){
      
      $("#comments,#comment-count").html(""); // empty counters
      $("form #name,form #body").val("");     // empty form fields
      let currentCountElement =  $("a[data-id="+commentID+"] .comment-count");
      currentCountElement.html("");
      if(arrayObj.length){
        $("#comment-count").html(arrayObj.length);
        currentCountElement.html("("+arrayObj.length+")");
        arrayObj.forEach(element => {
          $("#comments").prepend(`
              <div class="comment-entry"><a href="#" class="trashComment" 
                data-id="${element.comment._id}"
                title="remove this comment">
                <i class="fas fa-trash"></i>
              </a>
              <strong>Name:</strong> ${element.comment.name}<br>
              <strong>Comment:</strong> ${element.comment.body}<br>
              <small><i class="fas fa-clock"></i> <span class="time" data-time="${element.comment.timeStamp}">${moment(element.comment.timeStamp).fromNow()}</span></small>
            <br><hr>
            </div>
          `);
        });
      } else {
        $("#comments").html("No comments yet... add one now!");
      }
    }

    refreshTime();
    function refreshTime() {
      $(".time").each(function(){
        var time = $(this).attr("data-time");
        $(this).html(moment(time).fromNow());
      });
      console.log("updating times...");
    }

    setInterval(refreshTime,60000);

});
