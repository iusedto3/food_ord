import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Promotion.css'

const Promotion = ({ url }) => {
  const apiUrl = `${url}/api/promotion`

  const initialFormState = {
    type: 'percentage',
    value: '',
    code: '',
    description: '',
    minOrderAmount: '',
    startDate: '',
    endDate: ''
  }

  const [promos, setPromos] = useState([])
  const [form, setForm] = useState(initialFormState)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  // 📥 Lấy danh sách khuyến mãi từ server
  const fetchPromos = async () => {
    try {
      setLoading(true)
      const res = await axios.get(apiUrl)
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.promotions || res.data.data || []
      setPromos(data)
    } catch (err) {
      console.error('Error fetching promos:', err)
      toast.error('Không thể tải danh sách khuyến mãi!')
      setPromos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  // 🔄 Reset form
  const resetForm = () => {
    setForm(initialFormState)
    setEditingId(null)
  }

  // 💾 Thêm hoặc cập nhật khuyến mãi
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.type === 'coupon' && !form.code.trim())
      return toast.error('Vui lòng nhập mã khuyến mãi!')
    if (new Date(form.startDate) > new Date(form.endDate))
      return toast.error('Ngày bắt đầu phải trước ngày kết thúc!')

    try {
      setLoading(true)
      if (editingId) {
        await axios.put(`${apiUrl}/${editingId}`, form)
        toast.success('Đã cập nhật khuyến mãi!')
      } else {
        await axios.post(apiUrl, form)
        toast.success('Đã thêm khuyến mãi mới!')
      }
      resetForm()
      fetchPromos()
    } catch (err) {
      console.error('Error saving promo:', err)
      toast.error(err.response?.data?.message || 'Lỗi khi lưu khuyến mãi!')
    } finally {
      setLoading(false)
    }
  }

  // ✏️ Sửa khuyến mãi
  const handleEdit = (promo) => {
    setForm({
      type: promo.type,
      value: promo.value,
      code: promo.code || '',
      description: promo.description || '',
      minOrderAmount: promo.minOrderAmount || '',
      startDate: promo.startDate?.split('T')[0] || '',
      endDate: promo.endDate?.split('T')[0] || ''
    })
    setEditingId(promo._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 🗑️ Xóa khuyến mãi
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return
    try {
      setLoading(true)
      await axios.delete(`${apiUrl}/${id}`)
      toast.success('Đã xóa khuyến mãi!')
      fetchPromos()
    } catch {
      toast.error('Không thể xóa khuyến mãi!')
    } finally {
      setLoading(false)
    }
  }

  // 🔛 Bật/tắt khuyến mãi
  const toggleActive = async (id, current) => {
    try {
      setLoading(true)
      await axios.put(`${apiUrl}/${id}`, { isActive: !current })
      toast.info(`Đã ${!current ? 'bật' : 'tắt'} khuyến mãi`)
      fetchPromos()
    } catch {
      toast.error('Lỗi khi thay đổi trạng thái!')
    } finally {
      setLoading(false)
    }
  }

  // 💬 Format dữ liệu hiển thị
  const formatValue = (promo) =>
    promo.type === 'percentage'
      ? `${promo.value}%`
      : `${Number(promo.value).toLocaleString('vi-VN')}₫`

  const getTypeLabel = (type) =>
    ({
      percentage: 'Giảm phần trăm',
      fixed: 'Giảm cố định',
      coupon: 'Mã giảm giá'
    }[type] || type)

  // 🧱 Giao diện chia 2 cột
  return (
    <div className="promotion-container">
      {/* --- Cột trái: Form quản lý --- */}
      <div className="promotion-left">
        <h2 className="promotion-title">Quản lý khuyến mãi</h2>

        <form className="promotion-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loại khuyến mãi</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              disabled={loading}
            >
              <option value="percentage">Giảm phần trăm</option>
              <option value="fixed">Giảm cố định</option>
              <option value="coupon">Mã giảm giá</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá trị {form.type === 'percentage' ? '(%)' : '(₫)'}</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === 'percentage' ? 'VD: 10' : 'VD: 50000'}
              required
              min="0"
              disabled={loading}
            />
          </div>

          {form.type === 'coupon' && (
            <div className="form-group">
              <label>Mã khuyến mãi</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="VD: SALE2024"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Giá trị đơn hàng tối thiểu (₫)</label>
            <input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm({ ...form, minOrderAmount: e.target.value })
              }
              placeholder="VD: 100000 (để trống nếu không yêu cầu)"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mô tả chi tiết chương trình"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? 'Đang xử lý...'
                : editingId
                ? 'Cập nhật'
                : 'Thêm mới'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- Cột phải: Danh sách khuyến mãi --- */}
      <div className="promotion-right">
        <div className="promo-list">
          <h3>Danh sách khuyến mãi ({promos.length})</h3>
          {loading && <p className="loading">Đang tải...</p>}
          {!loading && promos.length === 0 && (
            <p className="empty">Chưa có khuyến mãi nào.</p>
          )}
          {!loading &&
            promos.map((p) => (
              <div
                key={p._id}
                className={`promo-card ${p.isActive ? '' : 'inactive'}`}
              >
                <div className="promo-header">
                  <h4>{p.description || 'Không có mô tả'}</h4>
                  <span
                    className={p.isActive ? 'badge-active' : 'badge-inactive'}
                  >
                    {p.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                <div className="promo-details">
                  <p>
                    <strong>Loại:</strong> {getTypeLabel(p.type)}
                  </p>
                  <p>
                    <strong>Giá trị:</strong> {formatValue(p)}
                  </p>
                  {p.code && (
                    <p>
                      <strong>Mã:</strong> {p.code}
                    </p>
                  )}
                  {p.minOrderAmount > 0 && (
                    <p>
                      <strong>Đơn tối thiểu:</strong>{' '}
                      {Number(p.minOrderAmount).toLocaleString('vi-VN')}₫
                    </p>
                  )}
                  <p>
                    <strong>Thời gian:</strong>{' '}
                    {new Date(p.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(p.endDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="promo-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(p)}
                    disabled={loading}
                  >
                    Sửa
                  </button>
                  <button
                    className={p.isActive ? 'btn-warning' : 'btn-success'}
                    onClick={() => toggleActive(p._id, p.isActive)}
                    disabled={loading}
                  >
                    {p.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(p._id)}
                    disabled={loading}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Promotion
