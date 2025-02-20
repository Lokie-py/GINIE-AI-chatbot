const API_KEY = "your_openai_api_key";  // Replace with your actual OpenAI API key

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    
    document.getElementById("user-input").value = "";  // Clear input box

    // Fetch response from OpenAI
    let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{role: "user", content: userInput}]
        })
    });

    let data = await response.json();
    let botMessage = data.choices[0].message.content;

    chatBox.innerHTML += `<p><strong>ChatGPT:</strong> ${botMessage}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to latest message
}
