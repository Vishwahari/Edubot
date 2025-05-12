document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element Selectors ---
    const sendButtons = document.querySelectorAll('button[id$="-send-button"]');
    const userInputFields = document.querySelectorAll('input[id$="-user-input"]');
    const chatLogs = document.querySelectorAll('div[id$="-chat-history"]');
    const languageSelects = document.querySelectorAll('select[id$="-language-select"]');
    const studentTypeRadios = document.querySelectorAll('input[name="studentType"]'); // Select student type radio buttons
    const introTextElement = document.getElementById('intro-text'); // Select intro text element
    const taglineElement = document.getElementById('tagline'); // Select tagline element

    // --- Event Listeners for Send Buttons ---
    sendButtons.forEach(button => {
        button.addEventListener('click', function() {
            const chatArea = this.id.replace('-send-button', ''); // Extract chat area prefix
            sendMessage(chatArea);
        });
    });

    // --- Event Listeners for Input Fields (Enter Key for Send) ---
    userInputFields.forEach(inputField => {
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission on Enter
                const chatArea = this.id.replace('-user-input', ''); // Extract chat area prefix
                sendMessage(chatArea);
            }
        });
    });

    // --- Event Listeners for Student Type Radio Buttons ---
    studentTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateHomePageContent(this.value); // Update tagline and intro text

            // --- REDIRECT LOGIC ON RADIO BUTTON CHANGE ---
            const selectedStream = this.value; // Get value of the changed radio button

            if (selectedStream === 'polytechnic') {
                window.location.href = "{{ url_for('polytechnic_page') }}"; // Redirect to Polytechnic page
            } else {
                // If 'engineering' is selected (or re-selected), stay on index page
                console.log("Engineering selected - staying on index page."); // Optional log
            }
            // --- END REDIRECT LOGIC ---
        });
    });

    // --- Function to Update Home Page Content based on Student Type ---
    function updateHomePageContent(studentType) {
        if (studentType === 'polytechnic') {
            taglineElement.textContent = "Your Personalized Educational Assistant for Polytechnic Students";
            introTextElement.textContent = "Welcome, Polytechnic Student! Edubot is tailored to support your diploma studies. Explore resources and assistance designed for Polytechnic education.";
        } else if (studentType === 'engineering') {
            taglineElement.textContent = "Your Personalized Educational Assistant for Engineering Students";
            introTextElement.textContent = "Welcome, Engineering Student! Edubot is here to guide you through your engineering degree. Discover resources and support to excel in your engineering studies.";
        } else {
            taglineElement.textContent = "Your Personalized Educational Assistant for Polytechnic and Engineering Students";
            introTextElement.textContent = "Welcome to Edubot! We are here to support your educational journey with resources and assistance in key areas."; // Default text
        }
    }

    // --- sendMessage Function (for Chatbot Interaction) ---
    function sendMessage(chatArea) {
        console.log("sendMessage function called for chatArea:", chatArea); // Debugging log

        const userInputElement = document.getElementById(chatArea + '-user-input');
        const chatHistoryElement = document.getElementById(chatArea + '-chat-history');
        const languageSelectElement = document.getElementById(chatArea + '-language-select');
        const userMessage = userInputElement.value.trim(); // Get and trim user input

        if (!userMessage) {
            return; // Do not send empty messages
        }

        const language = languageSelectElement ? languageSelectElement.value : 'en'; // Get selected language or default to 'en'
        console.log("Language selected:", language); // Debugging log

        // --- Display User Message ---
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('user-message');
        userMessageDiv.innerHTML = `<p>${userMessage}</p>`;
        chatHistoryElement.appendChild(userMessageDiv);
        userInputElement.value = ''; // Clear input field
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight; // Scroll to bottom

        // --- Determine Service Context ---
        let service = chatArea; // Default service context
        if (chatArea === 'home') {
            service = 'home'; // Explicitly set service to 'home' if chatArea is 'home'
        }
        console.log("Service context detected:", service); // Debugging log


        // --- Send Message to Backend (Fetch API) ---
        fetch(`/chat/${service}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage, language: language })
        })
        .then(response => {
            if (!response.ok) { // Handle HTTP errors
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // --- Handle Bot Response ---
            const botMessageDiv = document.createElement('div');
            botMessageDiv.classList.add('bot-message');

            if (data.response) {
                botMessageDiv.innerHTML = data.response; // Corrected line: No extra <p> tag
            } else if (data.error) {
                botMessageDiv.classList.add('error'); // Add error class for styling
                botMessageDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            } else {
                botMessageDiv.classList.add('error');
                botMessageDiv.innerHTML = `<p>Error: No response received from chatbot.</p>`; // Generic error
                console.error("No response or error data received from chatbot."); // Log unexpected response
            }
            chatHistoryElement.appendChild(botMessageDiv);
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight; // Scroll to bottom
        })
        .catch(error => {
            // --- Handle Fetch Errors (Network, etc.) ---
            console.error('Error sending message:', error);
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('bot-message', 'error'); // Apply both bot-message and error styles
            errorDiv.innerHTML = `<p>Error communicating with chatbot. Please check your connection.</p>`;
            chatHistoryElement.appendChild(errorDiv);
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight; // Scroll to bottom
        });
    }

    // --- Initialize Home Page Content based on default selection ---
    updateHomePageContent(document.querySelector('input[name="studentType"]:checked').value);


    // --- setLanguage Function (Currently for logging only) ---
    function setLanguage(chatArea, language) {
        // Language is handled when sending message. This function is kept for potential future use.
        console.log(`Language for ${chatArea} set to: ${language}`);
    }
});