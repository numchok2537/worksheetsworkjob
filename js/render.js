function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderQuestions(questions, options) {
  var showAnswers = options && options.showAnswers;
  var answerKey = (options && options.answerKey) || [];

  return questions
    .map(function (q, i) {
      var number = i + 1;
      var prompt = escapeHtml(q.prompt);
      var body = "";

      if (showAnswers) {
        var answer = answerKey[i] ? escapeHtml(answerKey[i]) : "(ไม่มีเฉลยสำหรับข้อนี้)";
        body = '<div class="answer-text">' + answer + "</div>";
      } else if (q.type === "list") {
        body =
          '<div class="answer-space"></div><div class="answer-space"></div><div class="answer-space"></div>';
      } else if (q.type === "applied") {
        body =
          '<div class="answer-space"></div><div class="answer-space"></div><div class="answer-space"></div><div class="answer-space"></div>';
      } else {
        body = '<div class="answer-space"></div><div class="answer-space"></div>';
      }

      return (
        '<div class="question"><div class="q-prompt">' +
        number +
        ". " +
        prompt +
        "</div>" +
        body +
        "</div>"
      );
    })
    .join("");
}

function renderSheetHeader(data, docTypeSuffix) {
  return (
    '<div class="sheet-header">' +
    '<img class="sheet-logo" src="assets/images/college-logo.png" alt="ตราวิทยาลัยเทคนิคนครสวรรค์" />' +
    '<div class="sheet-header-text">' +
    '<div class="college">วิทยาลัยเทคนิคนครสวรรค์</div>' +
    '<div class="doc-type">แผนกวิชาช่างเทคนิคคอมพิวเตอร์' +
    docTypeSuffix +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="sheet-title">' +
    '<div class="subject-line">' +
    escapeHtml(data.subjectCode) +
    " " +
    escapeHtml(data.subjectName) +
    "</div>" +
    '<div class="week-line">สัปดาห์ที่ ' +
    data.week +
    " — " +
    escapeHtml(data.title) +
    "</div>" +
    "</div>"
  );
}

function renderStudentInfo() {
  return (
    '<div class="student-info">' +
    "<div>ชื่อ-สกุล<span class=\"fill-line\">&nbsp;</span></div>" +
    "<div>เลขที่<span class=\"fill-line\">&nbsp;</span></div>" +
    "<div>ระดับชั้น<span class=\"fill-line\">&nbsp;</span></div>" +
    "<div>วันที่<span class=\"fill-line\">&nbsp;</span></div>" +
    "</div>"
  );
}

function renderObjectives(objectives) {
  var objectivesHtml = (objectives || [])
    .map(function (o) {
      return "<li>" + escapeHtml(o) + "</li>";
    })
    .join("");
  return (
    '<div class="section"><h2>จุดประสงค์การเรียนรู้</h2><ol class="objectives">' +
    objectivesHtml +
    "</ol></div>"
  );
}

function renderWorksheet(data, options) {
  options = options || {};
  var showAnswers = !!options.showAnswers;

  if (data.examWeek) {
    return (
      '<div class="sheet">' +
      renderSheetHeader(data, " — สอบปลายภาค") +
      renderStudentInfo() +
      '<div class="section"><div class="content-box">' +
      escapeHtml(data.content || "สัปดาห์นี้เป็นสัปดาห์สอบปลายภาค ไม่มีใบงานเนื้อหาใหม่") +
      "</div></div>" +
      "</div>"
    );
  }

  var contentHtml = data.content ? escapeHtml(data.content) : "";

  var questionsHtml = renderQuestions(data.questions || [], {
    showAnswers: showAnswers,
    answerKey: data.answerKey,
  });

  return (
    '<div class="sheet' +
    (showAnswers ? " answer-key" : "") +
    '">' +
    (showAnswers
      ? '<div class="teacher-banner">สำหรับครูเท่านั้น — หน้านี้แสดงเฉลย ห้ามแจกให้นักเรียน</div>'
      : "") +
    renderSheetHeader(data, showAnswers ? " — เฉลยใบงาน" : " — ใบงาน") +
    renderStudentInfo() +
    renderObjectives(data.objectives) +
    (contentHtml
      ? '<div class="section"><h2>เนื้อหาโดยสรุป</h2><div class="content-box">' +
        contentHtml +
        "</div></div>"
      : "") +
    (data.questions && data.questions.length
      ? '<div class="section"><h2>' +
        (showAnswers ? "เฉลยแบบฝึกหัด" : "แบบฝึกหัด") +
        "</h2>" +
        questionsHtml +
        "</div>"
      : "") +
    "</div>"
  );
}

function renderLogWorksheet(data) {
  var guidanceHtml = data.guidance ? escapeHtml(data.guidance) : "";

  var logRows = "";
  for (var i = 0; i < 4; i++) {
    logRows +=
      "<tr>" +
      '<td class="log-cell-date"></td>' +
      '<td class="log-cell-activity"></td>' +
      '<td class="log-cell-learned"></td>' +
      "</tr>";
  }

  var reflectionHtml = (data.reflectionPrompts || [])
    .map(function (prompt, i) {
      return (
        '<div class="question"><div class="q-prompt">' +
        (i + 1) +
        ". " +
        escapeHtml(prompt) +
        '</div><div class="answer-space"></div><div class="answer-space"></div></div>'
      );
    })
    .join("");

  return (
    '<div class="sheet">' +
    renderSheetHeader(data, " — แบบบันทึกกิจกรรมในสถานประกอบการ") +
    renderStudentInfo() +
    renderObjectives(data.objectives) +
    (guidanceHtml
      ? '<div class="section"><h2>คำชี้แจง</h2><div class="content-box">' +
        guidanceHtml +
        "</div></div>"
      : "") +
    '<div class="section"><h2>แบบบันทึกกิจกรรมประจำสัปดาห์</h2>' +
    '<table class="log-table">' +
    "<thead><tr><th>วันที่</th><th>รายละเอียดกิจกรรมที่ปฏิบัติ</th><th>สิ่งที่ได้เรียนรู้</th></tr></thead>" +
    "<tbody>" +
    logRows +
    "</tbody>" +
    "</table>" +
    "</div>" +
    (reflectionHtml
      ? '<div class="section"><h2>คำถามสะท้อนคิด</h2>' + reflectionHtml + "</div>"
      : "") +
    '<div class="signature-row">' +
    '<div>ลงชื่อนักเรียน<span class="fill-line">&nbsp;</span></div>' +
    '<div>ลงชื่อพี่เลี้ยง/ผู้ควบคุมงาน<span class="fill-line">&nbsp;</span></div>' +
    "</div>" +
    "</div>"
  );
}
