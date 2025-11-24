import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../contexts/StoreContext';
import './AddressInfo.css';

const AddressInfo = () => {
  const { url, token } = useContext(StoreContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for the form (add/edit)
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  // Data from API
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [cityCode, setCityCode] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);
  const [wardCode, setWardCode] = useState(null);

  useEffect(() => {
    fetchAddresses();
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.log(err));
  }, [token, url]);

  // Load districts when city changes
  useEffect(() => {
    if (!cityCode) return;
    fetch(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts))
      .catch((err) => console.log(err));
  }, [cityCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!districtCode) return;
    fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards))
      .catch((err) => console.log(err));
  }, [districtCode]);

  const fetchAddresses = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${url}/api/address/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setAddresses(response.data.addresses);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách địa chỉ.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentAddress({ label: '', street: '', ward: '', district: '', city: '' });
    setCityCode(null);
    setDistrictCode(null);
    setWardCode(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setIsEditing(true);
    setCurrentAddress(address);
    const city = cities.find(c => c.name === address.city);
    if (city) {
      setCityCode(city.code);
      // Need to fetch districts before finding the district code
      fetch(`https://provinces.open-api.vn/api/p/${city.code}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts);
          const district = data.districts.find(d => d.name === address.district);
          if (district) {
            setDistrictCode(district.code);
            // Need to fetch wards before finding the ward code
            fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
              .then(res => res.json())
              .then(data => {
                setWards(data.wards);
                const ward = data.wards.find(w => w.name === address.ward);
                if (ward) {
                  setWardCode(ward.code);
                }
              });
          }
        });
    }
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        const response = await axios.delete(`${url}/api/address/delete/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          fetchAddresses(); // Refresh the list
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Lỗi khi xóa địa chỉ.');
        console.error(err);
      }
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const cityName = cities.find(c => c.code === cityCode)?.name;
    const districtName = districts.find(d => d.code === districtCode)?.name;
    const wardName = wards.find(w => w.code === wardCode)?.name;

    const addressData = {
        label: currentAddress.label,
        street: currentAddress.street,
        ward: wardName,
        district: districtName,
        city: cityName
    };

    try {
        let response;
        if (isEditing) {
            response = await axios.put(`${url}/api/address/update/${currentAddress.id}`, addressData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            response = await axios.post(`${url}/api/address/add`, addressData, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        if (response.data.success) {
            setShowForm(false);
            fetchAddresses();
        } else {
            setError(response.data.message);
        }
    } catch (err) {
        setError(isEditing ? 'Lỗi khi cập nhật địa chỉ.' : 'Lỗi khi thêm địa chỉ mới.');
        console.error(err);
    }
};


  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="address-info-container">
      <h2>Sổ địa chỉ</h2>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleAddNew} className="add-new-btn">Thêm địa chỉ mới</button>
      
      <div className="address-list">
        {addresses.map(address => (
          <div key={address.id} className="address-card">
            <div className="address-details">
                <p><strong>{address.label}</strong></p>
                <p>{address.street}, {address.ward}, {address.district}, {address.city}</p>
            </div>
            <div className="address-actions">
              <button onClick={() => handleEdit(address)}>Sửa</button>
              <button onClick={() => handleDelete(address.id)} className="delete-btn">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
            <form onSubmit={handleFormSubmit}>
              <input type="text" placeholder="Tên địa chỉ (VD: Nhà, Công ty)" value={currentAddress.label} onChange={e => setCurrentAddress({...currentAddress, label: e.target.value})} required />
              <select value={cityCode || ''} onChange={e => {setCityCode(Number(e.target.value)); setDistrictCode(null); setWardCode(null);}} required>
                <option value="">Chọn Tỉnh/Thành</option>
                {cities.map(city => <option key={city.code} value={city.code}>{city.name}</option>)}
              </select>
              <select value={districtCode || ''} onChange={e => {setDistrictCode(Number(e.target.value)); setWardCode(null);}} required>
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(district => <option key={district.code} value={district.code}>{district.name}</option>)}
              </select>
              <select value={wardCode || ''} onChange={e => setWardCode(Number(e.target.value))} required>
                <option value="">Chọn Phường/Xã</option>
                {wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
              </select>
              <input type="text" placeholder="Số nhà, tên đường" value={currentAddress.street} onChange={e => setCurrentAddress({...currentAddress, street: e.target.value})} required />
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInfo;
