(function () {
  var termSelect = document.getElementById("term-select");
  var subjectSelect = document.getElementById("subject-select");
  var weekSelect = document.getElementById("week-select");
  var printBtn = document.getElementById("print-btn");
  var main = document.getElementById("worksheet-container");

  var allSubjects = [];
  var subjects = [];

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function showPlaceholder(message) {
    main.className = "placeholder";
    main.innerHTML = message;
    printBtn.disabled = true;
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
    showPlaceholder("เลือกวิชาและสัปดาห์เพื่อดูเฉลย");
  }

  function loadSubjects() {
    fetch("data/subjects.json", { cache: "no-store" })
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

  function loadWorksheet(subjectCode, week) {
    var subject = subjects.filter(function (s) {
      return s.code === subjectCode;
    })[0];
    var path = "data/worksheets/" + subjectCode + "-week" + pad(Number(week)) + ".json";
    showPlaceholder("กำลังโหลดใบงาน...");

    fetch(path, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(function (data) {
        main.className = "";
        if (subject && subject.type === "log") {
          main.innerHTML = renderLogWorksheet(data);
        } else {
          main.innerHTML = renderWorksheet(data, { showAnswers: true });
        }
        printBtn.disabled = false;
      })
      .catch(function () {
        showPlaceholder("ใบงานสัปดาห์นี้ยังไม่พร้อมใช้งาน");
      });
  }

  termSelect.addEventListener("change", function () {
    populateSubjects();
  });

  subjectSelect.addEventListener("change", function () {
    weekSelect.value = "";
    weekSelect.disabled = true;
    showPlaceholder("เลือกสัปดาห์เพื่อดูเฉลย");
    if (subjectSelect.value) {
      populateWeeks(subjectSelect.value);
    } else {
      weekSelect.innerHTML = '<option value="">-- เลือกสัปดาห์ --</option>';
    }
  });

  weekSelect.addEventListener("change", function () {
    if (subjectSelect.value && weekSelect.value) {
      loadWorksheet(subjectSelect.value, weekSelect.value);
    } else {
      showPlaceholder("เลือกสัปดาห์เพื่อดูเฉลย");
    }
  });

  printBtn.addEventListener("click", function () {
    window.print();
  });

  loadSubjects();
})();
