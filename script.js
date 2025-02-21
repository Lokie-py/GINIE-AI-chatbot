const API_KEY = "AIzaSyDFmqn--DA5lrOa1hVDWQFnaWJ8uxk5aFU"; // Replace with your actual Gemini API key

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

    document.getElementById("user-input").value = ""; // Clear input box

    try {
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userInput }] }]
            })
        });

        let data = await response.json();

        // Check if response is valid
        if (data.candidates && data.candidates.length > 0) {
            let botMessage = data.candidates[0].content.parts[0].text;

            // ✅ Remove '*' (asterisks used for bullet points)
            botMessage = botMessage.replace(/\*/g, '');

            // ✅ Convert Markdown-style headings (e.g., "## Title") to HTML <h2>
            botMessage = botMessage.replace(/## (.*)/g, '<h2>$1</h2>'); // Convert "## Heading" to <h2>
            botMessage = botMessage.replace(/# (.*)/g, '<h1>$1</h1>');  // Convert "# Main Heading" to <h1>

            // ✅ Convert double newlines ("\n\n") into paragraph breaks "<p>"
            botMessage = botMessage.replace(/\n\n/g, '</p><p>');

            // ✅ Convert single newlines ("\n") into line breaks "<br>"
            botMessage = botMessage.replace(/\n/g, '<br>');

            // ✅ Wrap final response in a paragraph <p> if not already wrapped
            if (!botMessage.startsWith('<h1>') && !botMessage.startsWith('<h2>')) {
                botMessage = `<p>${botMessage}</p>`;
            }

            chatBox.innerHTML += `<div class="bot-message">${botMessage}</div>`;
        } else {
            chatBox.innerHTML += `<p><strong>Error:</strong> No response from Gemini.</p>`;
        }

        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message

    } catch (error) {
        chatBox.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
    }
}
