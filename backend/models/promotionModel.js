import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema({
    code: { type: String, unique: true, sparse: true },
    type: { type: String, enum: ['percentage', 'fixed', 'coupon'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String }
})

const promotionModel = mongoose.models.promotion || mongoose.model('promotion', promotionSchema);
export default promotionModel
