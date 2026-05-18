const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- BASIC CREDENTIALS ---
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, 
        trim: true
    },
    user_password: { 
        type: String, 
        required: true 
    },

    // --- LABOR VALUATION & FINANCIAL METRICS (EXPENSEPAL CORE) ---
    monthly_salary: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    work_hours_per_month: { 
        type: Number, 
        default: 160, // Standard monthly hours (40hrs/week)
        min: 1 
    },
    monthly_budget_limit: { 
        type: Number, 
        default: 0 
    },

    // --- PROFESSIONAL & PERSONAL DETAILS ---
    occupation: { 
        type: String, 
        default: "Professional" 
    },
    institution: { 
        type: String, 
        default: "Not Specified" 
    },
    location: { 
        type: String, 
        default: "Not Specified" 
    },
    bio: { 
        type: String, 
        default: "Your profile reflects your discipline." 
    },

    // --- PROFILE CUSTOMIZATION ---
    profile_photo: { 
        type: String, 
        default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
    }, 
    badge_level: { 
        type: String, 
        default: "Novice" 
    },

    // --- ACCOUNT STATUS & PERMISSIONS ---
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'approved' // Ginawa nating 'approved' ang default pansamantala habang wala pang Admin Panel
    },

    // --- METADATA ---
    last_login: { 
        type: Date 
    }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Middleware para i-log ang huling login
UserSchema.methods.updateLastLogin = function() {
    this.last_login = Date.now();
    return this.save();
};

module.exports = mongoose.model('User', UserSchema);