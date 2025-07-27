# Real-Time Collaborative Task Manager

This is a fully functional, real-time task management application built with React and Firebase. It allows multiple users to share and manage a single to-do list, with all changes instantly reflected on everyone's screen.

This project demonstrates the use of modern web technologies to solve a common real-world problem: collaborative task tracking.

## Core Features

- **Real-Time Database:** Utilizes Google Firestore to ensure that any change (add, complete, delete) is instantly synchronized across all connected clients.
- **Dynamic UI:** Built with React for a responsive and interactive user experience.
- **Collaborative by Design:** Users share a public task list, identified by a unique session ID, making it perfect for temporary teams or group sessions.
- **Clean, Modern Interface:** Styled with Tailwind CSS for a professional and mobile-first design.
- **Simple & Anonymous Access:** Users are automatically signed in anonymously, removing the need for complex registration flows for this public-use tool.

## Technologies Used

- **Frontend:** React (with Hooks)
- **Backend & Database:** Google Firebase (Firestore for database, Auth for anonymous sign-in)
- **Styling:** Tailwind CSS
- **Build Tool:** Vite (recommended for local development)

## Local Development Setup

To run this project on your local machine, you will need Node.js and npm (or yarn) installed.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    ```
2.  **Navigate to Directory:**
    ```bash
    cd YOUR_REPO_NAME
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Set up Firebase:**
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * Create a new **Web App** within your Firebase project.
    * Copy the `firebaseConfig` object that Firebase provides you.
    * You will need to provide this configuration for the application to connect to your database.
5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can view the application in your browser at the provided local address (usually `http://localhost:5173`).

## Project Structure

- `index.html`: The main HTML file that loads the React application.
- `src/`: The main folder containing all React components.
  - `App.jsx`: The root component containing all application logic.
  - `main.jsx`: The entry point that renders the `App` component into the DOM.

*(Note: This README assumes a standard Vite React project setup for local development.)*
