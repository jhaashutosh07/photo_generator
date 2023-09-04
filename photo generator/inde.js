const oaiKey = "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";
const input = document.querySelector("#generate-input");
const button = document.querySelector("#generate-btn");
const results = document.querySelector(".results");

const state = {
  generating: false,
};

let lastRequestTime = 0;
const minRequestInterval = 1000; // Minimum time between requests in milliseconds

const fetchImages = async (prompt = "") => {
  if (!prompt) return;

  const currentTime = Date.now();
  const timeSinceLastRequest = currentTime - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    // Delay the request to avoid rate-limiting
    await new Promise((resolve) => setTimeout(resolve, minRequestInterval - timeSinceLastRequest));
  }

  lastRequestTime = Date.now(); // Update the last request time

  const reqUrl = `https://api.openai.com/v1/images/generations`;

  try {
    const response = await fetch(reqUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${oaiKey}`,
      },
      body: JSON.stringify({
        prompt,
        n: 6,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    const requiredData = data.data;

    if (!Array.isArray(requiredData)) return;

    const urls = requiredData.map((item) => item.url);

    results.innerHTML = "";
    urls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;

      results.appendChild(img);
    });
  } catch (err) {
    results.innerHTML = `<p class="loading">${
      err?.message || "Failed to fetch image"
    }</p>`;
    console.log("Error fetching image", err);
    return false;
  }
};

const handleButtonClick = async () => {
  const value = input.value;
  if (!value.trim() || state.generating) return;

  state.generating = true;
  button.innerHTML = "Generating...";
  results.innerHTML = `<p class="loading">Loading...</p>`;
  await fetchImages(value.trim());
  state.generating = false;
  button.innerHTML = "Generate";
};

button.addEventListener("click", handleButtonClick);