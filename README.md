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

## Setup

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
