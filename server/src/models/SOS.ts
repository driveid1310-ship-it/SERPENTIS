import { Schema, model, type InferSchemaType } from 'mongoose';

export const SOS_STATUSES = [
  'active',
  'resolved',
] as const;

export const SOS_TYPES = [
  'accident',
  'medical',
  'fire',
  'crime',
  'flood',
  'gas-leak',
  'other',
] as const;

const sosSchema = new Schema(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    emergencyType: {
      type: String,
      enum: {
        values: SOS_TYPES,
        message: 'Invalid emergency type.',
      },
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    status: {
      type: String,
      enum: {
        values: SOS_STATUSES,
        message: 'Invalid SOS status.',
      },
      default: 'active',
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

sosSchema.index({
  location: '2dsphere',
});

export type SOSStatus = (typeof SOS_STATUSES)[number];
export type SOSType = (typeof SOS_TYPES)[number];

export type ISOS = InferSchemaType<typeof sosSchema>;

const SOS = model<ISOS>('SOS', sosSchema);

export default SOS;