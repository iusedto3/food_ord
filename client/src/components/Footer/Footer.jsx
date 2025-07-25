import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo} alt="" />
                <p>"© 2025 Tomato. Tất cả quyền được bảo lưu. Cảm ơn bạn đã tin tưởng và thưởng thức cùng chúng tôi!"</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Trang chủ</li>
                    <li>Lịch sử phát triển</li>
                    <li>Giao hàng</li>
                    <li>Chính sách bảo mật</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>Liên hệ</h2>
                <ul>
                    <li>ĐT: 043 222 3000 </li>
                    <li> Email:support.hn@ggg.com.vn</li>
                    
                </ul>
            </div>
        </div>
        <hr/>
            <p className="footer-copyright">© 2011 Golden Gate ., JSC. All rights reserved</p>

    </div>
)
}

export default Footer
