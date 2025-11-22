import { useEffect, useState } from "react";
import axios from "axios";

const useFood = (url) => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setFoodList(res.data.data);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách món ăn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchFoodList();
    }
  }, [url]);

  // ✅ Bổ sung hàm làm mới
  const refreshFoodList = () => fetchFoodList();

  return { foodList, setFoodList, loading, refreshFoodList };
};

export default useFood;
