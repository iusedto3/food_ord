import React, { useRef, useEffect } from 'react'
import './ConfirmCart.css'

const ConfirmCart = ({ cartItems, total, onConfirm, onCancel, show }) => {
    const dialogRef = useRef(null)

    useEffect(() => {
        if (show && dialogRef.current) {
            dialogRef.current.focus()
        }
    }, [show])

    if (!show) return null

    return (
        <div className="confirm-cart-overlay">
            <div
                className="confirm-cart-dialog"
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-cart-title"
            >
                <h2 id="confirm-cart-title">Xác nhận hoá đơn</h2>
                <div className="confirm-cart-items">
                    {cartItems && cartItems.length > 0 ? (
                        <ul>
                            {cartItems.map((item, idx) => (
                                <li key={item.id || idx}>
                                    <span>{item.name}</span>
                                    <span>x{item.quantity}</span>
                                    <span>{item.price.toLocaleString()}₫</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Không có sản phẩm trong giỏ.</p>
                    )}
                </div>
                <div className="confirm-cart-total">
                    <strong>Tổng cộng:</strong> <span>{total.toLocaleString()}₫</span>
                </div>
                <div className="confirm-cart-actions">
                    <button className="confirm-btn" onClick={onConfirm}>Xác nhận</button>
                    <button className="cancel-btn" onClick={onCancel}>Huỷ</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmCart