import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import EditFoodModal from "../../components/EditFoodModal/EditFoodModal";
import "./ProductList.css";

/**
 * ProductList.jsx
 * - Tiếng Việt
 * - Search, Filter (category), Sort price, Pagination, Bulk delete
 * - Đồng bộ categories từ backend
 *
 * Lưu ý: đổi API base nếu backend chạy port khác
 */

const API = "http://localhost:4000/api/food"; // <- đổi nếu cần
const ITEMS_PER_PAGE = 10;

export default function ProductList() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  // controls
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortPrice, setSortPrice] = useState(""); // 'asc' | 'desc' | ''
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // UI states
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset page when search changes
      fetchFoods();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [searchTerm, category, sortPrice]);

  // fetch categories once
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  // fetch when page changes
  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      if (res.data && res.data.success) {
        setCategories(res.data.data || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      setCategories([]);
    }
  };

  // Fetch foods from backend with query params (backend listFood should support)
  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      if (searchTerm) params.search = searchTerm;
      if (category && category !== "all") params.category = category;
      if (sortPrice)
        params.sort = sortPrice === "asc" ? "price_asc" : "price_desc";

      const res = await axios.get(`${API}/list`, { params });
      if (res.data && res.data.success) {
        // Depending on backend you may have res.data.data and res.data.meta
        const data = res.data.data || [];
        const meta = res.data.meta || {
          total: data.length,
          page,
          limit: ITEMS_PER_PAGE,
        };
        setFoods(data);
        setTotal(meta.total || data.length);
      } else {
        setFoods([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách món:", err);
      setFoods([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setSelectAll(false);
      setSelectedIds([]);
    }
  }, [page, searchTerm, category, sortPrice]);

  // Toggle single select
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  // Toggle select all visible
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const visibleIds = foods.map((f) => f._id);
      setSelectedIds(visibleIds);
      setSelectAll(true);
    }
  };

  // Delete one item (REST DELETE /api/food/:id)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá món này?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      alert("Xoá thành công");
      fetchFoods();
    } catch (err) {
      console.error("Lỗi xoá:", err);
      alert("Xoá thất bại");
    }
  };

  // Bulk delete: gọi DELETE lần lượt cho từng id (an toàn, không cần backend mới)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Chưa có món nào được chọn.");
      return;
    }
    if (
      !window.confirm(
        `Bạn chắc chắn muốn xoá ${selectedIds.length} món đã chọn?`
      )
    )
      return;

    try {
      // thực hiện xóa song song
      await Promise.all(selectedIds.map((id) => axios.delete(`${API}/${id}`)));
      alert("Xoá các món đã chọn thành công");
      setSelectedIds([]);
      setSelectAll(false);
      fetchFoods();
    } catch (err) {
      console.error("Lỗi bulk delete:", err);
      alert("Có lỗi khi xoá. Vui lòng thử lại.");
    }
  };

  // Open edit modal
  const openEdit = (id) => {
    setEditingFoodId(id);
    setShowEditModal(true);
  };

  // Close edit modal and refresh
  const closeEdit = () => {
    setShowEditModal(false);
    setEditingFoodId(null);
    fetchFoods();
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="product-list-container">
      <div className="header-row">
        <h2>Danh sách sản phẩm</h2>

        <div className="controls">
          <input
            className="search-input"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={sortPrice}
            onChange={(e) => {
              setSortPrice(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sắp xếp theo giá</option>
            <option value="asc">Giá: Thấp → Cao</option>
            <option value="desc">Giá: Cao → Thấp</option>
          </select>

          <button className="btn btn-bulk" onClick={handleBulkDelete}>
            Xoá các mục đã chọn
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Hình</th>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Đang tải...
                </td>
              </tr>
            ) : foods.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              foods.map((p) => (
                <tr key={p._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                    />
                  </td>

                  <td>
                    <img
                      src={`http://localhost:4000/images/${p.image}`}
                      alt={p.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  </td>

                  <td>{p.name}</td>

                  <td>{Number(p.price).toLocaleString()} đ</td>

                  <td>
                    <span className="badge-category">{p.category}</span>
                  </td>

                  <td>
                    {p.available ? (
                      <span className="badge-status available">Còn bán</span>
                    ) : (
                      <span className="badge-status unavailable">
                        Tạm ngưng
                      </span>
                    )}
                  </td>

                  <td>
                    {new Date(p.updatedAt || p.createdAt).toLocaleString()}
                  </td>

                  <td>
                    <button
                      className="btn btn-edit"
                      onClick={() => openEdit(p._id)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(p._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="btn"
          disabled={!canPrev}
          onClick={() => setPage((s) => s - 1)}
        >
          Trang trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          className="btn"
          disabled={!canNext}
          onClick={() => setPage((s) => s + 1)}
        >
          Trang sau
        </button>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <EditFoodModal
          foodId={editingFoodId}
          onClose={closeEdit}
          onUpdated={fetchFoods}
        />
      )}
    </div>
  );
}
