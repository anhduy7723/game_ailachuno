class Game {
  constructor() {
    this.stageLength = 1;
    this.answeredQuestion = [];
    this.gameLength = $(".stages button").length;
    this.pLen = this.gameLength;
    this.amount = $(".stages button").eq(this.pLen - 1).html();
    this.enableAskAudienceLifeline = true;
    this.enableCallFriendLifeline = true;
    this.enableFiftyFiftyLifeline = true;
    this.currentQuestionIndex = 0;
    this.play = true;
    this.selected = "";
    this.answer = "";
    this.isCountdownPlaying = false;
    this.countdown = 45;
    this.countdownInterval = null;
    this.currentQuestionSet = "stage1"; // Mặc định là bộ câu hỏi 1
  }

  stopCountdownAudio() {
    const audio = document.getElementById("countdown-audio");
    audio.pause();
    audio.currentTime = 0;
    this.isCountdownPlaying = false;
  }

  getRandomNumber() {
    let random = Math.floor(Math.random() * 7);
    try {
      while (this.answeredQuestion.toString().match(random)) {
        random = Math.floor(Math.random() * 7);
      }
      this.answeredQuestion.push(random);
      return random;
    } catch (e) {}
  }

  changeQuestionStageData(data) {
    let div;
    $(".options").empty();
    $(".question").html(data["question"]);
    data["options"].map((option, i) => {
      div = `<div class="${option.slice(0, 1)} opt" key="${i}">${option}</div>`;
      $(".options").append(div);
    });

    $(".opt").click((e) => {
      this.selected = e.target.textContent.slice(0, 1);
      $(".modal").fadeIn(300);
      $(".warning").fadeIn(300);
    });

    this.answer = data["ans"];
  }

  startCountdown() {
    clearInterval(this.countdownInterval);
    $(".countdown").text(this.countdown);

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown >= 0) {
        $(".countdown").text(this.countdown);

        if (this.countdown === 45 && !this.isCountdownPlaying) {
          const audio = document.getElementById("countdown-audio");
          audio.play();
          this.isCountdownPlaying = true;
        }
      } else {
        clearInterval(this.countdownInterval);
        $(".modal").fadeOut();
        this.isCountdownPlaying = false;
        this.displayTimeUpMessage();
      }
    }, 1000);
  }

  displayTimeUpMessage() {
    $(".modal").fadeIn(500);
    $(".warning").fadeIn(500).text("Time's Up");

    setTimeout(() => {
      $(".warning").fadeOut(500, () => {
        $(".modal").fadeOut(500);
        this.resetGame();
      });
    }, 1000);
    this.stopCountdownAudio();
  }

  selectQuestion() {
    this.countdown = 45;
    const countdownAudio = document.getElementById("countdown-audio");
    clearInterval(this.countdownInterval);

    if (!countdownAudio.paused) {
      countdownAudio.pause();
      countdownAudio.currentTime = 0;
    }
    $(".ready-btn").off("click"); // Tắt sự kiện click trước khi gán lại
    $(".ready-btn").click(() => {
      $("#start_or_noStart").hide();
      $("#game").show();
      countdownAudio.play();
      this.startCountdown();
    });

    countdownAudio.play();

    // Lấy giá trị đã chọn từ dropdown
    const selectedSet = $("#question-set").val();

    this.changeQuestionStageData(stages[selectedSet].data[this.currentQuestionIndex]);

    // Thay đổi chỉ số câu hỏi hiện tại về 0 nếu nó vượt quá số câu hỏi
    if (this.currentQuestionIndex >= stages[selectedSet].data.length) {
      this.currentQuestionIndex = 0;
    }

    $(".ready-btn").click(() => {
      $("#start_or_noStart").hide();
      $("#game").show();
      countdownAudio.play();
      this.startCountdown();
    });
  }

  start() {
    $(".welcome").fadeOut(500, () => {
      $("#game").fadeIn(500, () => {
        this.selectQuestion(); // Call selectQuestion here to display the first question.
      });
    });
  }

  displaySuccessMessage() {
    $(".right-wrapper").fadeIn(800);
    $("#right").html(`You are right!!!`);

    setTimeout(() => {
      $("#right").html(`Congratulations!!! You won ${this.amount}`);
    }, 500);

    setTimeout(() => {
      $("#right").html("Preparing for the next question");
    }, 1800);

    setTimeout(() => {
      $(".right-wrapper").fadeOut(800, () => {
        $("#right").html("");
      });
    }, 3800);

    setTimeout(() => {
      $(".modal").fadeOut();
    }, 4500);
  }

  handleReadyButtonClick() {
    // Loại bỏ sự kiện click sau khi đã sử dụng nó một lần
    $(".ready-btn").off('click');

    $(".ready-btn").click(() => {
      $(".start_or_no").fadeOut(500, () => {
        this.selectQuestion();
        this.startCountdown(); // Bắt đầu countdown khi bắt đầu câu hỏi mới.
      });
    });
  }

  rightAnswer() {
    const audio = document.getElementById("correct-audio");
    audio.play();

    if (this.stageLength < 15) {
      this.stageLength++;
      this.answeredQuestion =
        this.stageLength % 6 == 0 || this.stageLength % 11 == 0
          ? []
          : this.answeredQuestion;
      this.amount = $(".stages button").eq(this.pLen - 1).html();

      this.displaySuccessMessage();

      this.pLen--;
      $(".current").removeClass("current");
      $(".stages button").eq(this.pLen).addClass("current");
      $(".score").html("Score: " + this.amount);
      this.gameLength++;

      setTimeout(() => {
        if (this.stageLength < 15) {
          $("#start_or_noStart").fadeIn();
          this.selectQuestion();
        } else {
          this.displayWinnerMessage();
        }
      }, 4500);
    } else {
      this.displayWinnerMessage();
    }
  }

  displayWinnerMessage() {
    $(".right-wrapper").fadeIn(800);
    setTimeout(() => {
      $("#right").html("You are the winner!!!");
    }, 500);
    setTimeout(() => {
      $("#right").html("Congratulations!!! You are a millionaire now.");
    }, 1800);
    setTimeout(() => {
      $(".right-wrapper").fadeOut(800, () => {
        $("#right").html("");
        this.resetGame();
      });
    }, 2300);
  }

  wrongAnswer() {
    const audio = document.getElementById("wrong-audio");
    audio.play();
    $(".wrong-wrapper").fadeIn(800);

    setTimeout(() => {
      $("#wrong").html(
        `Sorry, you have chosen the wrong answer!!!<br>The correct answer is: ${this.answer}<br>You are leaving with ${this.amount}`
      );
    }, 100);

    setTimeout(() => {
      $(".wrong-wrapper").fadeOut(() => {
        $("#wrong").html("");
        $(".modal").fadeOut(800);
      });
    }, 2500);

    setTimeout(() => {
      this.displayGameStatusMessage(`Better luck next time! You are leaving with ${this.amount}`);
    }, 3500);

    setTimeout(() => {
      this.resetGame();
    }, 4500);

    this.stopCountdownAudio();
  }

  fiftyFiftyLifeline() {
    var options = ["D", "A", "C", "B"];
    var removedOptions = [];
    $(".fifty")
      .attr({ src: "images/fifty2.png" })
      .css("cursor", "default");
    $(".fifty:hover").css("background-color", "rgb(17, 17, 138)");
    this.enableFiftyFiftyLifeline = false;

    for (var i = 0; i < options.length; i++) {
      if (options[i] != this.answer) {
        if (removedOptions.length < 2) {
          removedOptions.push(options[i]);
          for (var i = 0; i < removedOptions.length; i++) {
            $(`div.${removedOptions[i]}`).html(`${removedOptions[i]}:`);
          }
        }
      }
    }
  }

  askAudienceLifeline() {
    $(".aud")
      .attr({ src: "images/aud2.png" })
      .css("cursor", "default");
    $(".aud:hover").css("background-color", "rgb(17, 17, 138)");
    $(".modal").fadeIn();
    $(".chat-wrapper").fadeIn(500);

    setTimeout(() => {
      this.displayGameStatusMessage("Asking the audience...");
    }, 100);

    setTimeout(() => {
      this.displayGameStatusMessage("Audience is thinking...");
    }, 1200);

    setTimeout(() => {
      $(".chat-wrapper").fadeOut();
      this.displayGameStatusMessage("");
      $(".audience-wrapper").fadeIn();
      this.enableAskAudienceLifeline = false;
    }, 2700);

    var options = ["D", "A", "C", "B"];
    var audiencePercentage = ["15", "32", "48", "54", "60"];

    for (var i = 0; i < options.length; i++) {
      if (options[i] != this.answer) {
        $(`.bar-${options[i]}`).css("width", `${audiencePercentage[i]}%`);
      } else {
        var highestPercentage =
          Number(audiencePercentage[4]) +
          Math.floor(Math.random() * (23 - 10)) +
          10;
        $(`.bar-${this.answer}`).css("width", `${highestPercentage}%`);
      }
    }

    $(".closeBtn").click(() => {
      $(".audience-wrapper").fadeOut();
      $(".modal").fadeOut();
    });
  }

  displayGameStatusMessage(message, timeout) {
    if (!timeout) {
      $("#chat").html(message);
      return;
    }
    setTimeout(() => {
      $("#chat").html(message);
    }, timeout);
  }

  resetGame() {
    $(".modal").fadeOut();
    $("#game").hide();
    this.countdown = 45;
    const countdownAudio = document.getElementById("countdown-audio");
    clearInterval(this.countdownInterval);

    if (!countdownAudio.paused) {
      countdownAudio.pause();
      countdownAudio.currentTime = 0;
    }

    $(".ready-btn").click(() => {
      $("#start_or_noStart").hide();
      $("#game").show();
      countdownAudio.play();
      this.startCountdown();
    });

    $(".fifty")
      .attr({ src: "images/fifty.png", onClick: "game.fiftyFiftyLifeline()" })
      .css("cursor", "pointer");
    $(".aud")
      .attr({ src: "images/aud.png", onClick: "game.askAudienceLifeline()" })
      .css("cursor", "pointer");
  }
}

(function initGame() {
  const game = new Game();

  function playWelcomeMusic() {
    const welcomeAudio = document.getElementById("welcome-music");
    welcomeAudio.loop = true;
    welcomeAudio.play();
  }

  function stopWelcomeMusic() {
    const welcomeAudio = document.getElementById("welcome-music");
    welcomeAudio.pause();
    welcomeAudio.currentTime = 0;
  }

  $(".ready-btn").click(() => {
    $("#start_or_noStart").hide();
    $("#game").show();
    game.stopCountdownAudio();
    game.startCountdown();
  });

  $(".no").click(() => {
    $(".modal").fadeOut();
  });

  $(".yes").click(() => {
    $(".warning").fadeOut(500, () => {
      game.selected == game.answer ? game.rightAnswer() : game.wrongAnswer();
      game.startCountdown();
    });
  });

  $(".about-btn").click(() => {
    $(".about").fadeIn(1000);
  });

  $(".fifty").click(() => {
    if (game.enableFiftyFiftyLifeline) game.fiftyFiftyLifeline();
  });

  $(".call").click(() => {
    if (game.enableCallFriendLifeline) game.callFriendLifeline();
  });

  $(".aud").click(() => {
    if (game.enableAskAudienceLifeline) game.askAudienceLifeline();
  });

  $(".start-btn").click(() => {
    stopWelcomeMusic();
    game.stopCountdownAudio();
    game.start();
  });

  playWelcomeMusic();
  game.handleReadyButtonClick();
})();
