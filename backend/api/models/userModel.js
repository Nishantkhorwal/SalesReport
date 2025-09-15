import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
  type: String,
  enum: ['admin', 'manager',  'user'],
  default: 'user',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesReportUser',
    default: null,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesReportUser',
    default: null // only users (not admin/manager) will have this
  }


}, { timestamps: true });

const SalesReportUser = mongoose.model('SalesReportUser', userSchema);
export default SalesReportUser;
