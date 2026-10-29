import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic account information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    // College information
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    studyYear: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // Public profile information
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    // Skills the user can teach
    teachSkills: [
      {
        topic: {
          type: String,
          required: true,
          trim: true,
        },

        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
          required: true,
        },

        description: {
          type: String,
          trim: true,
          maxlength: 300,
          default: "",
        },
      },
    ],

    // Languages the user can communicate in
    languages: {
      type: [String],
      default: [],
    },

    // Availability: minutes measured from midnight
    availability: [
      {
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6,
          required: true,
        },

        startMinute: {
          type: Number,
          min: 0,
          max: 1439,
          required: true,
        },

        endMinute: {
          type: Number,
          min: 1,
          max: 1440,
          required: true,
        },
      },
    ],

    preferredModes: {
      type: [
        {
          type: String,
          enum: ["online", "offline"],
        },
      ],
      default: [],
    },

    // System-managed teaching ratings
    teachingRatingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    teachingRatingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Cached credit balance
    creditsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Account permissions and status
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    accountStatus: {
      type: String,
      enum: ["pending", "active", "restricted", "suspended"],
      default: "pending",
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
