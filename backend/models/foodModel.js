    import mongoose from "mongoose";

    const foodSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
    sizes: [String],
    options: [
        {
        label: String,
        price: Number
        }
    ]
    });

    const FoodModel = mongoose.models.food || mongoose.model('food', foodSchema);
    export default FoodModel;