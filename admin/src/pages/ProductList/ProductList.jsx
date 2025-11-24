import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import EditFoodModal from "../../components/EditFoodModal/EditFoodModal";
// 👇 Import icon để làm đẹp giao diện
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";
import "./ProductList.css";

const API = "http://localhost:4000/api/food";
const ITEMS_PER_PAGE = 10;

export default function ProductList() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  // Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortPrice, setSortPrice] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // UI states
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);

  // 1. Debounce Search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchFoods();
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, category, sortPrice]);

  // 2. Load Categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // 3. Fetch Foods khi đổi trang
  useEffect(() => {
    fetchFoods();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      if (res.data?.success) setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (searchTerm) params.search = searchTerm;
      if (category && category !== "all") params.category = category;
      if (sortPrice)
        params.sort = sortPrice === "asc" ? "price_asc" : "price_desc";

      const res = await axios.get(`${API}/list`, { params });
      if (res.data?.success) {
        const data = res.data.data || [];
        const meta = res.data.meta || { total: data.length };
        setFoods(data);
        setTotal(meta.total || 0);
      } else {
        setFoods([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setFoods([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setSelectAll(false);
      setSelectedIds([]);
    }
  }, [page, searchTerm, category, sortPrice]);

  // --- HANDLERS ---
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(foods.map((f) => f._id));
      setSelectAll(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá món này?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchFoods();
    } catch (err) {
      alert("Xoá thất bại");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert("Chưa chọn món nào.");
    if (!window.confirm(`Xoá ${selectedIds.length} món đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => axios.delete(`${API}/${id}`)));
      setSelectedIds([]);
      setSelectAll(false);
      fetchFoods();
    } catch (err) {
      alert("Lỗi khi xoá");
    }
  };

  const openEdit = (id) => {
    setEditingFoodId(id);
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditingFoodId(null);
    fetchFoods();
  };

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="product-list-container">
      {/* HEADER */}
      <div className="header-row">
        <h2>Sản phẩm</h2>

        <div className="controls">
          <div className="search-box">
            <FiSearch className="icon" />
            <input
              className="search-input"
              placeholder="Tìm tên món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Danh mục: Tất cả</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value)}
          >
            <option value="">Sắp xếp giá</option>
            <option value="asc">Thấp đến Cao</option>
            <option value="desc">Cao đến Thấp</option>
          </select>

          {selectedIds.length > 0 && (
            <button className="btn btn-bulk" onClick={handleBulkDelete}>
              Xoá ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Hình ảnh</th>
              <th>Tên món</th>
              <th>Giá bán</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : foods.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  Không tìm thấy sản phẩm nào.
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
                    />
                  </td>
                  <td style={{ fontWeight: "600" }}>{p.name}</td>
                  <td>{Number(p.price).toLocaleString()}đ</td>
                  <td>
                    <span className="badge-category">{p.category}</span>
                  </td>
                  <td>
                    {p.available ? (
                      <span className="badge-status available">Còn bán</span>
                    ) : (
                      <span className="badge-status unavailable">Hết hàng</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => openEdit(p._id)}
                        title="Sửa"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(p._id)}
                        title="Xoá"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 👇 PAGINATION (ĐỒNG BỘ VỚI ADMIN ORDER LIST) */}
      {total > ITEMS_PER_PAGE && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((s) => Math.max(1, s - 1))}
          >
            <FiChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`page-number ${page === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
          >
            <FiChevronRight />
          </button>
        </div>
      )}

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
