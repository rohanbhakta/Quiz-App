# Quiz App

A full-stack quiz application built with React and Node.js that allows users to create and participate in interactive quizzes.

## Features

- Create quizzes with multiple-choice questions
- Join quizzes using a unique quiz ID
- Real-time quiz participation
- Instant score calculation
- Leaderboard with participant rankings

## Tech Stack

### Frontend
- React
- Material-UI
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- TypeScript
- Mongoose

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/rohanbhakta/Quiz-App.git
cd Quiz-App
```

2. Install dependencies:
```bash
# Install backend dependencies
cd back_end
npm install

# Install frontend dependencies
cd ../front_end
npm install
```

3. Create a `.env` file in the backend directory with your MongoDB connection string:
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

4. Start the servers:
```bash
# Start backend server (from back_end directory)
npm run dev

# Start frontend server (from front_end directory)
npm start
```

5. Access the application at `http://localhost:3000`

## Deployment

### Backend Deployment (Vercel)
1. Push your code to GitHub
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Set the following environment variables in Vercel:
   - `PORT`
   - `MONGODB_URI`
   - `NODE_ENV=production`
5. Deploy and note down your backend URL

### Frontend Deployment (Vercel)
1. Create a new project in Vercel
2. Connect your GitHub repository
3. Set the build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Set the environment variable:
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://your-backend-url/api)
5. Deploy

Note: Make sure to update the `REACT_APP_API_URL` in your frontend deployment to point to your deployed backend URL.

## Usage

1. Create a Quiz:
   - Click on "Create Quiz"
   - Enter quiz title and questions
   - Share the generated quiz ID with participants

2. Join a Quiz:
   - Enter the quiz ID
   - Enter your name
   - Answer the questions
   - View your results

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
