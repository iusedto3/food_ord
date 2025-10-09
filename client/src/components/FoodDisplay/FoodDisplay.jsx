import React, { useContext, useState, useRef, useEffect } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../contexts/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({category}) => {
    const {food_list} = useContext(StoreContext)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedFood, setSelectedFood] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const popupRef = useRef(null)
    const url = useContext(StoreContext).url

    // Focus popup when open
    useEffect(() => {
        if (showPopup && popupRef.current) {
            popupRef.current.focus()
        }
    }, [showPopup])

    const handleFoodClick = (food) => {
        setSelectedFood(food)
        setQuantity(1)
        setShowPopup(true)
    }

    const handleClosePopup = () => {
        setShowPopup(false)
        setSelectedFood(null)
    }

    const handleAddToCart = (e) => {
        e.stopPropagation()
        // TODO: Add to cart logic here
        alert(`Đã thêm ${quantity} và ${selectedFood.name} vào giỏ hàng!`)
        handleClosePopup()
    }

    const handleDecrease = (e) => {
        e.stopPropagation()
        setQuantity(q => Math.max(1, q - 1))
    }
    const handleIncrease = (e) => {
        e.stopPropagation()
        setQuantity(q => q + 1)
    }

    return (
        <div className='food-display' id='food-display'>
            <h2>Thực Đơn</h2>
            <div className="food-display-list">
                {food_list.map((item,index) => {
                    if(category==="All" || category===item.category){
                        return (
                            <div key={index}  style={{cursor: 'pointer'}}>
                                <FoodItem id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}/>
                            </div>
                        )
                    }
                    return null
                })}
            </div>

            {showPopup && selectedFood && (
                <div className="food-popup-overlay" onClick={handleClosePopup}>
                    <div
                        className="food-popup-content food-popup-content--split"
                        onClick={e => e.stopPropagation()}
                        tabIndex={-1}
                        ref={popupRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="food-popup-title"
                    >
                        <button className="food-popup-close" onClick={handleClosePopup} aria-label="Đóng">&times;</button>
                        <div className="food-popup-img-wrap">
                            <img className="food-popup-img" src={selectedFood.image} alt={selectedFood.name} />
                        </div>
                        <div className="food-popup-info">
                            <div className="food-popup-row">
                                <div>
                                    <div className="food-popup-title" id="food-popup-title">{selectedFood.name}</div>
                                    <div className="food-popup-price food-popup-price--big">
                                        {selectedFood.price.toLocaleString()} <span className="food-popup-currency">VND</span>
                                    </div>
                                </div>
                                <div className="food-popup-quantity">
                                    <button onClick={handleDecrease} className="food-popup-qty-btn" aria-label="Giảm">-</button>
                                    <span className="food-popup-qty-value">{quantity}</span>
                                    <button onClick={handleIncrease} className="food-popup-qty-btn" aria-label="Tăng">+</button>
                                </div>
                            </div>
                            <div className="food-popup-desc">{selectedFood.description}</div>
                            <button className="food-popup-order-btn" onClick={handleAddToCart}>
                                <span className="food-popup-order-btn-icon">+</span> ĐẶT MÓN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FoodDisplay
// onClick={() => handleFoodClick(item)}