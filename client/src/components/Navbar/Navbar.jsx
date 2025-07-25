import React, {useState, useContext} from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'


const Navbar = ({setShowLogin}) => {

    const [menu, setMenu] = useState("menu");

    const {getTotalCartAmount} = useContext(StoreContext);

    

    return (
    <div className='navbar'>
        <Link to='/'><img src={assets.logo} alt="logo" className='logo'/></Link>
        <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu ==="home"?"active":""}>Trang Chủ</Link>
        <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu ==="menu"?"active":""}>Thực Đơn</a>
        <a href="#app-download" onClick={() => setMenu("mobile-app")} className={menu ==="mobile-app"?"active":""}>Ứng dụng điện thoại</a>
        <a href="#footer" onClick={() => setMenu("contact-us")} className={menu ==="contact-us"?"active":""}>Liên hệ với chúng tôi</a>
        </ul>
        <div className='navbar-right'>
            <img src={assets.search_icon} alt=""/>
            <div className="navbar-search-icon">
                <Link to='/cart'><img src={assets.basket_icon} alt=""/></Link>
                <div className={getTotalCartAmount()===0?"":"dot"}></div>
            </div>  
            <button onClick={()=>setShowLogin(true)}>Đăng Nhập</button>
        </div>
    </div>
)
}

export default Navbar
