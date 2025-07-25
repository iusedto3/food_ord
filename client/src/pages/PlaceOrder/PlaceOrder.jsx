import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import './PlaceOrder.css'

const PlaceOrder = () => {

  const {getTotalCartAmount} = useContext(StoreContext);

  return (
    <form className='place-order'>
      <div className="place-order-left">
        <p className="title">Thông Tin Giao Hàng</p>
        <div className="multi-fields">
          <input type="text" placeholder='Họ' />
          <input type="text" placeholder='Tên'/>
        </div>
        <input type="text" placeholder='Địa Chỉ Email' />
        <input type="text" placeholder='Đường'/>
        <div className="multi-fields">
          <input type="text" placeholder='Thành Phố' />
          <input type="text" placeholder='Quận'/>
        </div>
        <div className="multi-fields">
          <input type="text" placeholder='Mã Bưu Điện' />
          <input type="text" placeholder='Quốc Gia'/>
        </div>
        <input type="text" placeholder='Số Điện Thoại' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
                <h2>Giỏ Hàng</h2>
                <div>
                        <div className="cart-total-details">
                        <p>Tạm Tính</p>
                        <p>${getTotalCartAmount()}</p>
                    </div>
                    <div className="cart-total-details">
                        <p>Phí Vận Chuyển</p>
                        <p>${getTotalCartAmount()===0?0:2}</p>
                    </div>
                    <div className="cart-total-details">
                        <b>Tổng Cộng</b>
                        <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
                    </div>
                </div>
                <button>THANH TOÁN</button>
            </div>
        

      </div>

    </form>
  )
}

export default PlaceOrder
