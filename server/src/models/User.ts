import mongoose, { type Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
export interface IUser extends Document {
     fullName: string;
    email: string;
    password: string;
    phone?: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;

    trustScore: number;
    reputationPoints: number;

    badges: string[];

    totalReports: number;
    resolvedReports: number;

    role: "citizen" | "moderator" | "admin";

    isVerified: boolean;

    comparePassword(candidatePassword: string): Promise<boolean>;
    }

    const UserSchema = new Schema<IUser>(
    {
        fullName: {
        type: String,
        required: true,
        trim: true,
        },

        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        },

        password: {
        type: String,
        required: true,
        minlength: 6,
        },

        phone: {
        type: String,
        default: "",
        },

        profilePicture: {
        type: String,
        default: "",
        },

        trustScore: {
        type: Number,
        default: 0,
        },

        reputationPoints: {
        type: Number,
        default: 0,
        },

        badges: {
        type: [String],
        default: [],
        },

        totalReports: {
        type: Number,
        default: 0,
        },

        resolvedReports: {
        type: Number,
        default: 0,
        },

        role: {
        type: String,
        enum: ["citizen", "moderator", "admin"],
        default: "citizen",
        },

        isVerified: {
        type: Boolean,
        default: false,
        },
    },
    {
        timestamps: true,
    }
    );

    UserSchema.pre("save", async function (this: IUser) {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    });

    UserSchema.methods.comparePassword = async function (
    candidatePassword: string
    ) {
    return bcrypt.compare(candidatePassword, this.password);
    };

    export default mongoose.model<IUser>("User", UserSchema);
