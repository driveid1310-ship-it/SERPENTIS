import { Schema, model, Document, Types } from 'mongoose';

export type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'water-leakage'
  | 'streetlight'
  | 'traffic'
  | 'pollution'
  | 'stray-animals'
  | 'food-safety'
  | 'air-pollution'
  | 'water-contamination'
  | 'noise-pollution'
  | 'tree-cutting'
  | 'waterlogging'
  | 'drainage-blockage'
  | 'industrial-pollution'
  | 'open-burning'
  | 'environmental-other'
  | 'other';

export interface IEnvironmentalReportDetails {
  suspectedSource?: string | undefined;
  noiseDecibelsEstimate?: number | undefined;
  waterPhEstimate?: number | undefined;
  waterTurbidityNote?: string | undefined;
  affectedRadiusMeters?: number | undefined;
  isCitizenEstimate?: boolean | undefined;
}

export interface IReportLocationMeta {
  city?: string | undefined;
  district?: string | undefined;
  state?: string | undefined;
  locality?: string | undefined;
}

export type FoodSafetyConcernType =
  | 'hygiene'
  | 'adulteration'
  | 'expired'
  | 'foreign-object'
  | 'food-poisoning'
  | 'misbranding'
  | 'other';

export type OfficialFilingStatus =
  | 'not_filed'
  | 'filed_by_citizen';

export interface IFoodSafetyOfficialFiling {
  status: OfficialFilingStatus;
  docketNumber?: string | undefined;
  filingDate?: Date | undefined;
  channelName?: string | undefined;
}

export interface IFoodSafetyDetails {
  establishmentName?: string | undefined;
  foodItem?: string | undefined;
  incidentDate?: Date | undefined;
  concernType?: FoodSafetyConcernType | undefined;
  officialFiling?: IFoodSafetyOfficialFiling | undefined;
}

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
  personallyObserved: Types.ObjectId[];

  priority: ReportPriority;

  isDuplicate: boolean;

  // Moderator Verification
  verified: boolean;
  verifiedBy: Types.ObjectId | null;
  moderatorRemark: string;

  // Food Safety Extension
  foodSafetyDetails?: IFoodSafetyDetails | undefined;

  // Environmental Intelligence Extension
  environmentalDetails?: IEnvironmentalReportDetails | undefined;
  locationMeta?: IReportLocationMeta | undefined;

  createdAt: Date;
  updatedAt: Date;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  'pothole',
  'garbage',
  'water-leakage',
  'streetlight',
  'traffic',
  'pollution',
  'stray-animals',
  'food-safety',
  'air-pollution',
  'water-contamination',
  'noise-pollution',
  'tree-cutting',
  'waterlogging',
  'drainage-blockage',
  'industrial-pollution',
  'open-burning',
  'environmental-other',
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

    personallyObserved: {
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

    // Food Safety Action System Details
    foodSafetyDetails: {
      establishmentName: {
        type: String,
        trim: true,
        maxlength: [150, 'Establishment name must not exceed 150 characters.'],
      },
      foodItem: {
        type: String,
        trim: true,
        maxlength: [150, 'Food item name must not exceed 150 characters.'],
      },
      incidentDate: {
        type: Date,
      },
      concernType: {
        type: String,
        enum: {
          values: [
            'hygiene',
            'adulteration',
            'expired',
            'foreign-object',
            'food-poisoning',
            'misbranding',
            'other',
          ],
          message: 'Invalid food safety concern type.',
        },
      },
      officialFiling: {
        status: {
          type: String,
          enum: ['not_filed', 'filed_by_citizen'],
          default: 'not_filed',
        },
        docketNumber: {
          type: String,
          trim: true,
          maxlength: [50, 'Docket number must not exceed 50 characters.'],
        },
        filingDate: {
          type: Date,
        },
        channelName: {
          type: String,
          trim: true,
          maxlength: [100, 'Channel name must not exceed 100 characters.'],
        },
      },
    },

    // Environmental Report Details (citizen observations, clearly marked as citizen estimates)
    environmentalDetails: {
      suspectedSource: {
        type: String,
        trim: true,
        maxlength: [200, 'Suspected source must not exceed 200 characters.'],
      },
      noiseDecibelsEstimate: {
        type: Number,
        min: 0,
        max: 200,
      },
      waterPhEstimate: {
        type: Number,
        min: 0,
        max: 14,
      },
      waterTurbidityNote: {
        type: String,
        trim: true,
        maxlength: [200, 'Water turbidity note must not exceed 200 characters.'],
      },
      affectedRadiusMeters: {
        type: Number,
        min: 1,
        max: 50000,
      },
      isCitizenEstimate: {
        type: Boolean,
        default: true,
      },
    },

    locationMeta: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      locality: { type: String, trim: true },
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
reportSchema.index({ 'foodSafetyDetails.establishmentName': 1 });
reportSchema.index({ 'locationMeta.city': 1, category: 1 });

const Report = model<IReport>('Report', reportSchema);

export default Report;