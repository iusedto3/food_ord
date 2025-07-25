import React, { useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'

const LoginPopup = ({setShowLogin}) => {

    const [currState, setCurrState] = useState("Đăng Nhập")
return (
    <div className='login-popup'>
        <form className="login-popup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)}src={assets.cross_icon} alt="" />
            </div>
            <div className="login-popup-inputs">
                {currState==="Đăng Nhập"?<></>:<input type="text" placeholder='Họ và Tên' required />}
                
                <input type="email" placeholder='Tài khoản email ' required />
                <input type="password" placeholder='Mật khẩu' required />

            </div>
            <button>{currState==="Đăng Ký"?"Create account":"Login"}</button>
            <div className="login-popup-condition">
                <input type="checkbox" required />
                <p>Tôi đồng ý với <span>Điều khoản dịch vụ</span> và <span>Chính sách bảo mật</span></p>
            </div>
            {currState==="Đăng Nhập"?
            <p>Tạo tài khoản mới? <span onClick={()=>setCurrState("Đăng Ký")}>Nhấn vào</span></p>
            :
            <p>Đã có tài khoản? <span onClick={()=>setCurrState("Đăng Nhập")}>Đăng nhập</span></p>}
        </form>
    </div>
)   
}

export default LoginPopup
