import { Schema, model, Document, Types } from 'mongoose';

export type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'water-leakage'
  | 'streetlight'
  | 'traffic'
  | 'pollution'
  | 'stray-animals'
  | 'other';

export type ReportStatus =
  | 'pending'
  | 'in-progress'
  | 'resolved'
  | 'rejected';

export type ReportPriority = 'low' | 'medium' | 'high';

export interface IReport extends Document {
  _id: Types.ObjectId;

  title: string;
  description: string;

  category: ReportCategory;
  status: ReportStatus;

  images: string[];

  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  reportedBy: Types.ObjectId;

  isAnonymous: boolean;

  upvotes: Types.ObjectId[];

  priority: ReportPriority;

  isDuplicate: boolean;

  // Moderator Verification
  verified: boolean;
  verifiedBy: Types.ObjectId | null;
  moderatorRemark: string;

  createdAt: Date;
  updatedAt: Date;
}

const REPORT_CATEGORIES: ReportCategory[] = [
  'pothole',
  'garbage',
  'water-leakage',
  'streetlight',
  'traffic',
  'pollution',
  'stray-animals',
  'other',
];

const REPORT_STATUSES: ReportStatus[] = [
  'pending',
  'in-progress',
  'resolved',
  'rejected',
];

const REPORT_PRIORITIES: ReportPriority[] = [
  'low',
  'medium',
  'high',
];

const reportSchema = new Schema<IReport>(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long.'],
      maxlength: [150, 'Title must not exceed 150 characters.'],
    },

    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [2000, 'Description must not exceed 2000 characters.'],
    },

    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: {
        values: REPORT_CATEGORIES,
        message: 'Invalid category provided.',
      },
    },

    status: {
      type: String,
      enum: {
        values: REPORT_STATUSES,
        message: 'Invalid status provided.',
      },
      default: 'pending',
    },

    images: {
      type: [String],
      default: [],
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required.'],
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    upvotes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    priority: {
      type: String,
      enum: {
        values: REPORT_PRIORITIES,
        message: 'Invalid priority provided.',
      },
      default: 'low',
    },

    isDuplicate: {
      type: Boolean,
      default: false,
    },

    // Moderator Verification
    verified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    moderatorRemark: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({
  location: '2dsphere',
});

reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ reportedBy: 1 });

const Report = model<IReport>('Report', reportSchema);

export default Report;