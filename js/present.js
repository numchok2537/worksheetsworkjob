(function () {
  var termSelect = document.getElementById("term-select");
  var subjectSelect = document.getElementById("subject-select");
  var weekSelect = document.getElementById("week-select");
  var fullscreenBtn = document.getElementById("fullscreen-btn");
  var placeholder = document.getElementById("present-placeholder");
  var viewport = document.getElementById("slide-viewport");
  var stage = document.getElementById("slide-stage");
  var counter = document.getElementById("slide-counter");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");

  var allSubjects = [];
  var subjects = [];
  var slides = [];
  var slideIndex = 0;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showPlaceholder(message) {
    placeholder.hidden = false;
    placeholder.textContent = message;
    viewport.hidden = true;
    fullscreenBtn.disabled = true;
    slides = [];
    slideIndex = 0;
  }

  function populateSubjects() {
    subjectSelect.innerHTML = '<option value="">-- เลือกวิชา --</option>';
    subjects = allSubjects.filter(function (s) {
      return s.terms && s.terms.indexOf(termSelect.value) !== -1;
    });
    subjects.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.code;
      opt.textContent = s.code + " " + s.name;
      subjectSelect.appendChild(opt);
    });
    subjectSelect.disabled = false;
    weekSelect.value = "";
    weekSelect.disabled = true;
    weekSelect.innerHTML = '<option value="">-- เลือกสัปดาห์ --</option>';
    showPlaceholder("เลือกวิชาและสัปดาห์เพื่อเริ่มนำเสนอ");
  }

  function loadSubjects() {
    fetch("data/subjects.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        allSubjects = data;
        populateSubjects();
      })
      .catch(function () {
        showPlaceholder("โหลดรายชื่อวิชาไม่สำเร็จ");
      });
  }

  function populateWeeks(subjectCode) {
    weekSelect.innerHTML = '<option value="">-- เลือกสัปดาห์ --</option>';
    var subject = subjects.filter(function (s) {
      return s.code === subjectCode;
    })[0];
    if (!subject) return;

    for (var w = 1; w <= subject.totalWeeks; w++) {
      var opt = document.createElement("option");
      opt.value = w;
      opt.textContent = "สัปดาห์ที่ " + w;
      weekSelect.appendChild(opt);
    }
    weekSelect.disabled = false;
  }

  function renderSlide() {
    var slide = slides[slideIndex];
    var bulletsHtml = (slide.bullets || [])
      .map(function (b) {
        return "<li>" + escapeHtml(b) + "</li>";
      })
      .join("");

    stage.innerHTML =
      '<div class="slide">' +
      '<h2 class="slide-heading">' +
      escapeHtml(slide.heading) +
      "</h2>" +
      (bulletsHtml ? '<ul class="slide-bullets">' + bulletsHtml + "</ul>" : "") +
      "</div>";

    counter.textContent = slideIndex + 1 + " / " + slides.length;
    prevBtn.disabled = slideIndex === 0;
    nextBtn.disabled = slideIndex === slides.length - 1;
  }

  function loadLesson(subjectCode, week) {
    var path = "data/lessons/" + subjectCode + "-week" + pad(Number(week)) + ".json";
    showPlaceholder("กำลังโหลดสไลด์...");
    placeholder.hidden = false;

    fetch(path)
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(function (data) {
        if (!data.slides || !data.slides.length) throw new Error("no slides");
        slides = [
          {
            heading: data.subjectCode + " " + data.subjectName,
            bullets: ["สัปดาห์ที่ " + data.week + " — " + data.title],
          },
        ].concat(data.slides);
        slideIndex = 0;
        placeholder.hidden = true;
        viewport.hidden = false;
        fullscreenBtn.disabled = false;
        renderSlide();
      })
      .catch(function () {
        showPlaceholder("สไลด์สอนสัปดาห์นี้ยังไม่พร้อมใช้งาน");
      });
  }

  termSelect.addEventListener("change", function () {
    populateSubjects();
  });

  subjectSelect.addEventListener("change", function () {
    weekSelect.value = "";
    weekSelect.disabled = true;
    showPlaceholder("เลือกสัปดาห์เพื่อเริ่มนำเสนอ");
    if (subjectSelect.value) {
      populateWeeks(subjectSelect.value);
    } else {
      weekSelect.innerHTML = '<option value="">-- เลือกสัปดาห์ --</option>';
    }
  });

  weekSelect.addEventListener("change", function () {
    if (subjectSelect.value && weekSelect.value) {
      loadLesson(subjectSelect.value, weekSelect.value);
    } else {
      showPlaceholder("เลือกสัปดาห์เพื่อเริ่มนำเสนอ");
    }
  });

  prevBtn.addEventListener("click", function () {
    if (slideIndex > 0) {
      slideIndex -= 1;
      renderSlide();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (slideIndex < slides.length - 1) {
      slideIndex += 1;
      renderSlide();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!slides.length) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      if (slideIndex < slides.length - 1) {
        slideIndex += 1;
        renderSlide();
      }
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      if (slideIndex > 0) {
        slideIndex -= 1;
        renderSlide();
      }
    }
  });

  fullscreenBtn.addEventListener("click", function () {
    if (viewport.requestFullscreen) {
      viewport.requestFullscreen();
    }
  });

  loadSubjects();
})();
