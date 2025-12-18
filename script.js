const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

let userMessage = "";
// Chat history array to store conversation
const chatHistory = [];

// const apikey="your_apikey_here";
// const API_URL=  add api url


// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatHistory
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text
                ?.replace(/\\([^]+)\\*/g, "$1")
                ?.trim() || "No response";

        textElement.textContent = responseText;
        botMsgDiv.classList.remove("loading");

        // ADD MODEL RESPONSE TO CHAT HISTORY
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


// Handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value="";

    // Generate user message HTML and add in the chats container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
    const botMsgHTML = `<img src="gemini-chatbot-logo.svg" class="avatar"><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);

    // Call API function here
    generateResponse(botMsgDiv);

}, 600);

    
};

promptForm.addEventListener("submit", handleFormSubmit);