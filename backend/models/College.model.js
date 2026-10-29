
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        emailDomains: {
            type: [String],
            default: [],
            set: (domains) =>
                domains.map((domain) =>
                    domain.trim().toLowerCase()
                )
        }
    },
    {
        timestamps: true
    }
);

const College = mongoose.model("College", collegeSchema);

export default College;
