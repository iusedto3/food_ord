import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import React, { useState } from 'react'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
// import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
const [category, setCategory] = useState('All')
const [foodList, setFoodList] = useState([]) 

return (
    <div>
    <Header />
    <ExploreMenu 
        category={category} 
        setCategory={setCategory} 
        setFoodList={setFoodList} 
    />
      <FoodDisplay category={category} foodList={foodList}/> {/* ✅ truyền dữ liệu xuống */}
      {/* <AppDownload/> */}
    </div>
)
}

export default Home
