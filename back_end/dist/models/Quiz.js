"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
            type: String,
            required: true,
            trim: true
        }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    },
    timer: {
        type: Number,
        required: true,
        min: 5, // Minimum 5 seconds
        max: 300, // Maximum 5 minutes
        default: 30 // Default 30 seconds
    }
}, {
    _id: false
});
const QuizSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    creatorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'Login' // Reference to the Login model
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    questions: {
        type: [QuestionSchema],
        required: true,
        validate: [
            {
                validator: function (questions) {
                    return questions && questions.length > 0;
                },
                message: 'Quiz must have at least one question'
            }
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'quizzes',
    versionKey: false
});
// Create indexes
QuizSchema.index({ id: 1 }, { unique: true });
QuizSchema.index({ creatorId: 1 }); // Index for faster lookup by creator
QuizSchema.index({ createdAt: -1 });
// Add error handling middleware
QuizSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Quiz with this ID already exists'));
    }
    else {
        next(error);
    }
});
const Quiz = mongoose_1.default.model('Quiz', QuizSchema);
exports.default = Quiz;
