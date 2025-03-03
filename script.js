const chatInput = document.querySelector('.chat-input input');
const sendChatBtn = document.querySelector('#send-btn');
const chatbox = document.querySelector('.chatbox');

let userMessage;
let faqResponses = {};
let fallbackResponses = [];

// Load the FAQ data from the external JSON file
const loadFAQs = async () => {
    try {
        const faqResponse = await fetch('faqs.json');
        const faqData = await faqResponse.json();
        faqResponses = faqData; // Store the FAQs in the faqResponses object
    } catch (error) {
        console.error("Error loading FAQs:", error);
    }
};

// Load the fallback responses from the external JSON file
const loadFallbacks = async () => {
    try {
        const fallbackResponse = await fetch('fallback.json');
        const fallbackData = await fallbackResponse.json();
        fallbackResponses = fallbackData.fallback_responses; // Store fallback responses
    } catch (error) {
        console.error("Error loading fallback responses:", error);
    }
};

// Function to find the best matching FAQ response
const findBestMatch = (userMessage) => {
    userMessage = userMessage.toLowerCase().trim();
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const question in faqResponses) {
        let similarity = getSimilarity(userMessage, question);
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = question;
        }
    }

    // If the similarity is high enough, return the matched FAQ response
    if (highestSimilarity >= 0.6) {
        return faqResponses[bestMatch];
    }

    // If no good match is found, return a random fallback response
    return getRandomFallbackResponse();
}

// Function to calculate similarity between two strings (Jaccard Similarity)
const getSimilarity = (str1, str2) => {
    const set1 = new Set(str1.split(" "));
    const set2 = new Set(str2.split(" "));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// Function to get a random fallback response
const getRandomFallbackResponse = () => {
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
}

// Function to create chat messages
const createChatLi = (message, className) => {
    const chatLi = document.createElement('li');
    chatLi.classList.add('chat', className);
    let chatContent = className === 'outgoing' 
        ? `<p>${message}</p>` 
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
}

// Generate the bot's response based on best match
const generateResponse = (thinkingMessage) => {
    const botMessage = findBestMatch(userMessage);
    setTimeout(() => {
        // Replace the "Thinking..." message with the actual response
        thinkingMessage.innerHTML = `<span class="material-symbols-outlined">smart_toy</span><p>${botMessage}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to the latest message
    }, 1000);
}

// Handle sending a chat message
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Append the outgoing message
    chatbox.appendChild(createChatLi(userMessage, 'outgoing'));

    // Add the "Thinking..." message
    const thinkingMessage = createChatLi('Thinking...', 'incoming');
    chatbox.appendChild(thinkingMessage);

    setTimeout(() => {
        generateResponse(thinkingMessage); // Pass the "Thinking..." message to be replaced
        chatInput.value = ''; 
    }, 600);
}

// Handle the Enter button to send a message
const handleEnterKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey) { // Check if Enter is pressed (without Shift)
        event.preventDefault(); // Prevent newline (enter key in input)
        handleChat(); // Call handleChat to process and send the message
    }
}

// Load the FAQ and fallback data before initializing the chat
const initializeChat = async () => {
    await loadFAQs();
    await loadFallbacks();
}

// Add event listeners
sendChatBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keydown', handleEnterKey); // Use Enter to send message

// Initialize the chat
initializeChat();

// Open/close the chatbot when the toggler is clicked
const toggler = document.querySelector('.chatbot-toggler');
const chatbot = document.querySelector('.chatbot');
const closeButton = document.querySelector('.close-btn');

// Toggle the chatbot visibility
toggler.addEventListener('click', () => {
    chatbot.classList.toggle('open');
    toggler.style.opacity = chatbot.classList.contains('open') ? '0' : '1'; // Hide toggler when chatbot is open
});

// Close the chatbot when the close button is clicked
closeButton.addEventListener('click', () => {
    chatbot.classList.remove('open');
    toggler.style.opacity = '1'; // Make the toggler visible again
});

