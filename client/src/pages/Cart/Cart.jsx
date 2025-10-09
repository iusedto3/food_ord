import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../contexts/StoreContext'
import { food_list } from '../../assets/assets';
import { useNavigate } from 'react-router-dom'

const Cart = () => {

    const {cartItems, food_list, removeFromCart, getTotalCartAmount, url} = useContext(StoreContext);

    const navigate = useNavigate();

    return (
    <div className='cart'>
        <div className="cart-items">
            <div className="cart-items-title">
                <p>Món Ăn</p>
                <p>Tiêu Đề</p>
                <p>Giá</p>
                <p>Số Lượng</p>
                <p>Tổng Cộng</p>
                <p>Bỏ</p>
            </div>
        
        <br/>
        <hr/>
        
        {food_list.map((item, index) => {
            if(cartItems[item._id]>0)
            {
                return (
                    <div key={item._id}>
                        <div className='cart-items-title cart-items-item'>
                            <img src={url+"/images/"+item.image} alt="" />
                            <p>{item.name}</p>
                            <p>{item.price}VND</p>
                            <p>{cartItems[item._id]}</p>
                            <p>{item.price*cartItems[item._id]}VND</p>
                            <p onClick={()=>removeFromCart(item._id)} className='cross'>x</p>
                        </div>
                        <hr/>
                    </div>
                )
            }
            
        })}
        </div>
        <div className="cart-bottom">
            <div className="cart-total">
                <h2>Tổng Cộng</h2>
                <div>
                    <div className="cart-total-details">
                        <p>Tạm Tính</p>
                        <p>{getTotalCartAmount()} VND</p>
                    </div>
                    <div className="cart-total-details">
                        <p>Phí Vận Chuyển</p>
                        <p>{getTotalCartAmount()===0?0:2} VND</p>
                    </div>
                    <div className="cart-total-details">
                        <b>Tổng Cộng</b>
                        <b>{getTotalCartAmount()===0?0:getTotalCartAmount()+2} VND</b>
                    </div>
                </div>
                <button  onClick={()=>navigate('/order')}>Thanh Toán</button>
            </div>
            <div className="cart-promocode">
                <div>
                    <p>Sử dụng mã giảm giá, nhập vào</p>
                    <div className="cart-promocode-input">
                        <input type="text" placeholder='Nhập mã giảm giá' />
                        <button>ÁP DỤNG</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
}

export default Cart
