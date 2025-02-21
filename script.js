const API_KEY = "AIzaSyDFmqn--DA5lrOa1hVDWQFnaWJ8uxk5aFU"; // Replace with your actual Gemini API key

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatBox = document.getElementById("chatBox");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const chatTitle = document.getElementById("chatTitle");
    const timestamp = document.getElementById("timestamp");
    const newChatButton = document.getElementById("newChat");
    const fileInput = document.createElement("input");
    const suggestionButtons = document.querySelectorAll(".chip");
    const clearHistoryButton = document.getElementById("clearHistory");
    const toggleThemeButton = document.getElementById("toggleTheme");
    const copyChatButton = document.getElementById("copyChat");
    const exportChatButton = document.getElementById("exportChat");
    const attachFileButton = document.getElementById("attachFile");

    // Configure file input for upload
    fileInput.type = "file";
    fileInput.accept = ".txt,.json,.csv";

    // Enable/Disable send button based on input
    userInput.addEventListener("input", () => {
        sendButton.disabled = userInput.value.trim() === "";
    });

    // Handle Shift+Enter for multi-line input
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Send message when clicking the send button
    sendButton.addEventListener("click", sendMessage);

    // ✅ Make suggestion chips functional
    suggestionButtons.forEach(button => {
        button.addEventListener("click", () => {
            userInput.value = button.innerText; // Set the suggestion as input text
            sendMessage(); // Send the message immediately
        });
    });

    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (!messageText) return;

        addMessage("user", messageText);
        userInput.value = "";
        sendButton.disabled = true;
        showLoading(true);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: messageText }] }]
                    })
                }
            );

            const data = await response.json();
            showLoading(false);

            if (data.candidates && data.candidates.length > 0) {
                let botMessage = data.candidates[0].content.parts[0].text;

                botMessage = formatBotMessage(botMessage);
                addMessage("bot", botMessage);
            } else {
                addMessage("bot", "Oops! No response from AI.");
            }
        } catch (error) {
            showLoading(false);
            addMessage("bot", `Error: ${error.message}`);
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addMessage(sender, text) {
        if (welcomeScreen) welcomeScreen.style.display = "none";

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.innerHTML = text;

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (sender === "bot") {
            updateChatTitle();
        }
    }

    function updateChatTitle() {
        const now = new Date();
        chatTitle.innerText = "GINIE Conversation";
        timestamp.innerText = now.toLocaleString();
    }

    function showLoading(show) {
        loadingOverlay.classList.toggle("hidden", !show);
    }

    function formatBotMessage(message) {
        return message
            .replace(/\*/g, '') // Remove asterisks
            .replace(/## (.*)/g, '<h2>$1</h2>') // Convert "## Heading" to <h2>
            .replace(/# (.*)/g, '<h1>$1</h1>') // Convert "# Main Heading" to <h1>
            .replace(/\n\n/g, '</p><p>') // Convert double newlines to paragraphs
            .replace(/\n/g, '<br>'); // Convert newlines to line breaks
    }

    // 🌙 Dark Mode Toggle
    toggleThemeButton.addEventListener("click", () => {
        document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    });

    // 🆕 **New Chat Button Functionality**
    newChatButton.addEventListener("click", () => {
        chatBox.innerHTML = "";
        welcomeScreen.style.display = "flex";
        chatTitle.innerText = "New Conversation";
        timestamp.innerText = "";
    });

    // 🗑️ Clear Chat History
    clearHistoryButton.addEventListener("click", () => {
        chatBox.innerHTML = "";
        welcomeScreen.style.display = "flex";
        chatTitle.innerText = "New Conversation";
        timestamp.innerText = "";
    });

    // 📂 **Upload File Functionality**
    attachFileButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            addMessage("user", `📂 Uploaded File: <strong>${file.name}</strong>`);
            addMessage("bot", `<pre>${content}</pre>`);
        };

        if (file.name.endsWith(".txt") || file.name.endsWith(".json") || file.name.endsWith(".csv")) {
            reader.readAsText(file);
        } else {
            addMessage("bot", "⚠️ Unsupported file format. Please upload .txt, .json, or .csv.");
        }
    });

    // 📋 Copy Chat
    copyChatButton.addEventListener("click", () => {
        const messages = [...chatBox.querySelectorAll(".message")].map(msg => msg.textContent).join("\n");
        navigator.clipboard.writeText(messages).then(() => showToast("Chat copied to clipboard!"));
    });

    // 📤 Export Chat
    exportChatButton.addEventListener("click", () => {
        const messages = [...chatBox.querySelectorAll(".message")].map(msg => msg.textContent).join("\n");
        const blob = new Blob([messages], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "chat-history.txt";
        a.click();
    });

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.innerText = message;
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
    }
});
