const fbForm = document.getElementById("fbForm");
const feedbackList = document.getElementById("feedbackList");
const statusMsg = document.getElementById("statusMsg");

async function loadFeedback() {
  const res = await fetch("/api/feedback");
  const items = await res.json();
  feedbackList.innerHTML = items.length ? "" : "<p>No feedback submitted yet.</p>";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "fb-item";
    div.innerHTML = `
      <div class="fb-top">
        <span>${item.subject}</span>
        <span class="stars">${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</span>
      </div>
      <p>${item.comments || "No additional comments."}</p>
      <small>By ${item.studentName} • ${item.createdAt}</small>
    `;
    feedbackList.appendChild(div);
  });
}

fbForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    studentName: document.getElementById("studentName").value,
    subject: document.getElementById("subject").value,
    rating: Number(document.getElementById("rating").value),
    comments: document.getElementById("comments").value
  };

  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    statusMsg.textContent = "Feedback saved successfully!";
    fbForm.reset();
    loadFeedback();
  }
});

loadFeedback();