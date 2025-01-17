import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ILogin extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, {
  timestamps: true,
  // Define indexes at schema level only, not in individual fields
  indexes: [
    { email: 1 },
    { username: 1 }
  ]
});

// Hash password before saving
LoginSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    console.log('Hashing password for user:', {
      email: this.email,
      username: this.username,
      timestamp: new Date().toISOString()
    });

    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
    this.password = await bcrypt.hash(this.password, salt);

    console.log('Password hashed successfully');
    next();
  } catch (error: any) {
    console.error('Error hashing password:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
});

// Method to compare password for login
LoginSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('Comparing password for user:', {
      email: this.email,
      username: this.username,
      timestamp: new Date().toISOString()
    });

    if (!candidatePassword) {
      console.error('No candidate password provided');
      return false;
    }

    if (!this.password) {
      console.error('No stored password hash found');
      return false;
    }

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    console.log('Password comparison result:', {
      isMatch,
      username: this.username,
      timestamp: new Date().toISOString()
    });

    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

const Login = mongoose.model<ILogin>('Login', LoginSchema);

// Ensure indexes are created
Login.on('index', (error) => {
  if (error) {
    console.error('Error creating indexes:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('Indexes created successfully');
  }
});

export default Login;
