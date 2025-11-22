import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EditFoodModal.css";

const API_URL = "http://localhost:4000/api/food";

const EditFoodModal = ({ foodId, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState(null);

  // Local states cho form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [sizes, setSizes] = useState([]);
  const [options, setOptions] = useState([]);

  // CRUST
  const [crustEnabled, setCrustEnabled] = useState(false);
  const [crustList, setCrustList] = useState([]);

  // ---------------------------------------------------
  // Load food data
  // ---------------------------------------------------
  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(`${API_URL}/list`);
        const found = res.data.data.find((f) => f._id === foodId);

        if (found) {
          setFood(found);

          setName(found.name);
          setPrice(found.price);
          setCategory(found.category);
          setDescription(found.description);

          setSizes(found.sizes || []);
          setOptions(found.options || []);

          // crust
          setCrustEnabled(found?.crust?.enabled || false);
          setCrustList(found?.crust?.list || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Load food error:", err);
      }
    };

    fetchFood();
  }, [foodId]);

  if (!food || loading) return null;

  // ---------------------------------------------------
  // CRUD cho sizes
  // ---------------------------------------------------
  const addSize = () => {
    setSizes([...sizes, { label: "", price: 0 }]);
  };
  const updateSize = (i, field, value) => {
    const newSizes = [...sizes];
    newSizes[i][field] = value;
    setSizes(newSizes);
  };
  const removeSize = (i) => {
    setSizes(sizes.filter((_, idx) => idx !== i));
  };

  // ---------------------------------------------------
  // CRUD cho toppings (options)
  // ---------------------------------------------------
  const addOption = () => {
    setOptions([...options, { label: "", price: 0 }]);
  };
  const updateOption = (i, field, value) => {
    const newOpts = [...options];
    newOpts[i][field] = value;
    setOptions(newOpts);
  };
  const removeOption = (i) => {
    setOptions(options.filter((_, idx) => idx !== i));
  };

  // ---------------------------------------------------
  // CRUD cho crust
  // ---------------------------------------------------
  const addCrust = () => {
    setCrustList([...crustList, { label: "", price: 0 }]);
  };
  const updateCrust = (i, field, value) => {
    const newCrust = [...crustList];
    newCrust[i][field] = value;
    setCrustList(newCrust);
  };
  const removeCrust = (i) => {
    setCrustList(crustList.filter((_, idx) => idx !== i));
  };

  // ---------------------------------------------------
  // Submit update
  // ---------------------------------------------------
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);

      formData.append("sizes", JSON.stringify(sizes));
      formData.append("options", JSON.stringify(options));

      // crust
      formData.append("crustEnabled", crustEnabled);
      formData.append("crustList", JSON.stringify(crustList));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put(`${API_URL}/update/${foodId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated(); // để ProductList reload
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Cập nhật thất bại!");
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Edit Food</h2>

        {/* NAME */}
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        {/* PRICE */}
        <label>Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* CATEGORY */}
        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE */}
        <label>Image</label>
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

        {/* SIZES ------------------------------------------------ */}
        <div className="block">
          <h3>Sizes</h3>
          {sizes.map((s, i) => (
            <div key={i} className="row">
              <input
                placeholder="Label"
                value={s.label}
                onChange={(e) => updateSize(i, "label", e.target.value)}
              />
              <input
                placeholder="Price"
                type="number"
                value={s.price}
                onChange={(e) => updateSize(i, "price", e.target.value)}
              />
              <button onClick={() => removeSize(i)}>X</button>
            </div>
          ))}
          <button onClick={addSize}>+ Add Size</button>
        </div>

        {/* OPTIONS / TOPPINGS ----------------------------------- */}
        <div className="block">
          <h3>Toppings / Options</h3>
          {options.map((o, i) => (
            <div key={i} className="row">
              <input
                placeholder="Label"
                value={o.label}
                onChange={(e) => updateOption(i, "label", e.target.value)}
              />
              <input
                placeholder="Price"
                type="number"
                value={o.price}
                onChange={(e) => updateOption(i, "price", e.target.value)}
              />
              <button onClick={() => removeOption(i)}>X</button>
            </div>
          ))}
          <button onClick={addOption}>+ Add Option</button>
        </div>

        {/* CRUST ------------------------------------------------ */}
        <div className="block">
          <h3>
            Crust
            <input
              type="checkbox"
              checked={crustEnabled}
              onChange={(e) => setCrustEnabled(e.target.checked)}
              style={{ marginLeft: 10 }}
            />
          </h3>

          {crustEnabled && (
            <>
              {crustList.map((c, i) => (
                <div className="row" key={i}>
                  <input
                    placeholder="Crust label"
                    value={c.label}
                    onChange={(e) => updateCrust(i, "label", e.target.value)}
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    value={c.price}
                    onChange={(e) => updateCrust(i, "price", e.target.value)}
                  />
                  <button onClick={() => removeCrust(i)}>X</button>
                </div>
              ))}
              <button onClick={addCrust}>+ Add Crust</button>
            </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-row">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFoodModal;
