# Martian Chat

Martian Chat is an offline mobile application featuring a FastAPI-based Python backend and a React Native frontend. It enables users to create and chat with custom AI characters powered by Ollama’s `llama3.2:latest` model, offering a unique conversational experience.

---

## Motivation

Martian Chat was built to explore the seamless integration of AI-powered character interactions in offline mobile apps. It allows users to design unique characters with specific traits and chat with them in an engaging and dynamic way. The project demonstrates the potential of personalized AI for entertainment, education, and productivity.

---

## Build Status

**Current Build:** Stable  
- Backend: Functional FastAPI routes for user authentication, character creation, and AI interaction.  
- Frontend: Interactive React Native app built with Expo, capable of dynamic updates and smooth user experience.  
- AI Integration: Fully functional communication with Ollama's `llama3.2:latest` model.

---

## Code Style

The code adheres to the following styles:
- **Python (PEP 8)**: Standard code formatting for Python backend.
- **React Native**: Clean, modular, and component-based structure with consistent styling conventions.

---

## Tech/Framework Used

### **Backend**:
- **FastAPI**: For creating robust API endpoints.
- **Uvicorn**: High-performance ASGI server.
- **JWT (PyJWT)**: For authentication and authorization.
- **Requests**: For integrating with Ollama’s API.
- **JSON**: For managing chat data storage.

### **Frontend**:
- **React Native**: For building the mobile app.
- **Expo**: For rapid prototyping and deployment.
- **Axios**: For handling API calls.
- **AsyncStorage**: For local storage of user tokens.

### **AI Integration**:
- **Ollama**: Using `llama3.2:latest` model to generate intelligent, context-aware character responses.

---

## Features

- **User Management**: Secure signup, login, and JWT-based authentication.
- **Character Creation**: Create and define AI characters with customizable traits.
- **AI Conversations**: Chat with AI characters in real-time with personalized context.
- **Persistent Chat History**: Save and retrieve conversations locally.
- **Typing Animation**: Visual feedback while AI generates responses.
- **Backup**: Export all your chats and save them.
- **Import Chats**: Import chats and continue using them.

---

## Installation

### Prerequisites:
- Python 3.8+
- Node.js 16+
- npm or Yarn
- Expo CLI
- Ollama installed locally and `llama3.2:latest` model downloaded

### Steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/username/martian-chat.git
   cd martian-chat
   ```

2. Set up the Python backend:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Install Ollama and the required model:
   ```bash
   curl -fsSL https://ollama.com/download | sh
   ollama pull llama3.2:latest
   ```

4. Set up the React Native frontend:
   ```bash
   cd ../frontend
   npm install
   ```

5. Start the backend server:
   ```bash
   cd ../backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

6. Start the Expo server:
   ```bash
   cd ../frontend
   npm start
   ```

7. Scan the QR code with the Expo Go app to launch the app on your mobile device.

---

## API References

### **Base URL**: `http://localhost:8000`

#### **Users**
- **GET /users**: Get a list of all users.
- **POST /signup**: Register a new user.
  - Request Body: `{ "username": "string", "password": "string" }`
- **POST /login**: Log in and retrieve a JWT.
  - Request Body: `{ "username": "string", "password": "string" }`

#### **Character Management**
- **POST /createCharacter**: Create or update a character.
  - Request Body:
    ```json
    {
      "name": "string",
      "background": "string",
      "physicalDescription": "string",
      "mannerisms": "string",
      "knownconnections": "string",
      "other": "string"
    }
    ```

#### **Chat**
- **POST /chats**: Retrieve all chat histories for the authenticated user.
- **GET /getChat**: Retrieve chat history for a specific character.
  - Query Parameter: `character_name`
- **POST /sendMessage**: Send a message to a character and receive the AI's response.
  - Request Body:
    ```json
    {
      "character_name": "string",
      "message": "string"
    }
    ```

---

## How to Use

1. **Create a User**:
   - Sign up and log in to the app using the authentication endpoints.

2. **Define a Character**:
   - Use the `/createCharacter` API or the React Native app interface to create unique AI characters.

3. **Start a Conversation**:
   - Select a character and begin chatting. Messages will be stored locally.

4. **Enjoy AI Conversations**:
   - Engage in dynamic, context-aware discussions with the AI characters.

---

## Contribute to the Repository

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and test thoroughly.
4. Commit and push your changes:
   ```bash
   git commit -m "Add feature description"
   git push origin feature-name
   ```
5. Submit a pull request with a detailed description.