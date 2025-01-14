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
const AnswerSchema = new mongoose_1.Schema({
    questionId: {
        type: String,
        required: true,
        trim: true
    },
    selectedOption: {
        type: Number,
        required: true,
        min: 0
    },
    responseTime: {
        type: Number,
        required: true,
        min: 0
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    _id: false
});
const QuizResponseSchema = new mongoose_1.Schema({
    playerId: {
        type: String,
        required: true,
        trim: true,
        ref: 'Player'
    },
    quizId: {
        type: String,
        required: true,
        trim: true,
        ref: 'Quiz'
    },
    answers: {
        type: [AnswerSchema],
        required: true,
        validate: [
            {
                validator: function (answers) {
                    return answers && answers.length > 0;
                },
                message: 'Quiz response must have at least one answer'
            }
        ]
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    averageResponseTime: {
        type: Number,
        required: true,
        min: 0
    },
    fastestResponse: {
        type: Number,
        required: true,
        min: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'quiz_responses',
    versionKey: false
});
// Create indexes
QuizResponseSchema.index({ playerId: 1, quizId: 1 });
QuizResponseSchema.index({ submittedAt: -1 });
QuizResponseSchema.index({ score: -1 });
QuizResponseSchema.index({ averageResponseTime: 1 }); // Index for sorting by response time
QuizResponseSchema.index({ fastestResponse: 1 }); // Index for sorting by fastest response
// Pre-save middleware to calculate average and fastest response times
QuizResponseSchema.pre('save', function (next) {
    if (!this.answers || this.answers.length === 0) {
        return next(new Error('Quiz response must have at least one answer'));
    }
    // Calculate average response time
    const totalTime = this.answers.reduce((sum, answer) => sum + answer.responseTime, 0);
    this.averageResponseTime = totalTime / this.answers.length;
    // Find fastest response time
    this.fastestResponse = Math.min(...this.answers.map(answer => answer.responseTime));
    next();
});
// Add error handling middleware
QuizResponseSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Player has already submitted answers for this quiz'));
    }
    else {
        next(error);
    }
});
const QuizResponse = mongoose_1.default.model('QuizResponse', QuizResponseSchema);
exports.default = QuizResponse;
