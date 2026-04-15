const form = document.getElementById("uploadForm");
const output = document.getElementById("output");

function toggleMode() {
  const type = document.getElementById("uploadType").value;
  const folderDiv = document.getElementById("folderDiv");
  const fileInput = document.getElementById("fileInput");

  if (type === "multiple") {
    folderDiv.style.display = "block";
    fileInput.multiple = true;
  } else {
    folderDiv.style.display = "none";
    fileInput.multiple = false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  output.innerHTML = "";

  data.urls.forEach(path => {
    const fullUrl = window.location.origin + path;
    
    const container = document.createElement("div");
    container.classList.add("image-container");

    const img = document.createElement("img");
    img.src = fullUrl;
    img.classList.add("image-preview");

    const link = document.createElement("a");
    link.href = fullUrl;
    link.textContent = fullUrl;
    link.target = "_blank";
    link.classList.add("image-link");

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy Link";
    copyBtn.classList.add("copy-button");
    copyBtn.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(fullUrl);
      alert("Link copied!");
    };

    container.appendChild(img);
    container.appendChild(link);
    container.appendChild(copyBtn);
    output.appendChild(container);
  });
});