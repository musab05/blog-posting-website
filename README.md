# Blog Posting Website

This is a full-stack blog posting website with separate frontend and backend applications.

## Installation and Setup

Follow these steps to set up and run the project:

### 1. Navigate to the Project Directory
Open a terminal and navigate to the project folder:

```sh
cd path/to/Blog-Posting-Website
```

### 2. Install Dependencies
Run the following command in both the `blog-frontend` and `blog-backend` directories:

```sh
cd blog-frontend
npm install
cd ..
cd blog-backend
npm install
cd ..
```

### 3. Start the Frontend
Navigate to the `blog-frontend` directory and start the development server:

```sh
cd blog-frontend
npm run dev
```

### 4. Start the Backend
Open a new terminal window, navigate to the `blog-backend` directory, and start the backend server:

```sh
cd blog-backend
npm start
```

## Project Structure
```
Blog Posting Website/
│── blog-frontend/   # Frontend React application
│── blog-backend/    # Backend Node.js/Express application
│── README.md        # Project documentation
```

## Notes
- Ensure you have **Node.js** installed before running the project.
- The frontend will typically run on `http://localhost:5173/`.
- The backend will run on `http://localhost:3000/`.
