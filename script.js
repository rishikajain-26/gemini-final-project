const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

let userMessage = "";

// Chat history array
const chatHistory = [];

// API placeholders (not used right now)
// const apikey = "your_api_key_here";
// const API_URL = "your_api_url_here";


// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};


// ✅ GENERATE RESPONSE FUNCTION
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    // ✅ NO API CASE — KEEP UI WORKING
    if (typeof API_URL === "undefined") {
        setTimeout(() => {
            textElement.textContent = "Just a sec...";
            botMsgDiv.classList.remove("loading");
        }, 600);
        return;
    }

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "No response";

        textElement.textContent = responseText;
        botMsgDiv.classList.remove("loading");

        // Add model response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });

    } catch (error) {
        textElement.textContent = "Error generating response";
        botMsgDiv.classList.remove("loading");
        console.error(error);
    }
};


// ✅ HANDLE FORM SUBMIT
const handleFormSubmit = (e) => {
    e.preventDefault();

    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = "";

    // User message
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    // Bot message
    setTimeout(() => {
        const botMsgHTML = `
            <img src="gemini-chatbot-logo.svg" class="avatar">
            <p class="message-text">Just a sec...</p>
        `;
        const botMsgDiv = createMsgElement(
            botMsgHTML,
            "bot-message",
            "loading"
        );
        chatsContainer.appendChild(botMsgDiv);

        generateResponse(botMsgDiv);
    }, 600);
};


// Event listener
promptForm.addEventListener("submit", handleFormSubmit);
