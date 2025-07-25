import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({category, setCategory}) => {

return (
    <div className='explore-menu' id='explore-menu'>
        <h1>THỰC ĐƠN</h1>
        <p className='explore-menu-text'>"Cảnh báo: ghé thăm website này có thể khiến bạn đói không kiểm soát!" <br></br>"Ăn xong nhớ quay lại – khẩu phần tình yêu còn rất nhiều!"</p>
        <div className="explore-menu-list">
            {menu_list.map((item,index) => {
                return (
                    <div onClick={() =>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                        <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                    </div>
                )
            }

            )}
        </div>
        <hr/>
    </div>
)
}

export default ExploreMenu
