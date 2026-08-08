import Link from 'next/link';

export default function Page() {
  return (
    <>

        <header>
            <div className="header-title"><h1>Chi tiết hoá đơn</h1><p>Xem và in hoá đơn cho đơn hàng #ORD-9942.</p></div>
            <div className="action-btns">
                <button className="btn-secondary" ><i className="fa-solid fa-print"></i> In hoá đơn</button>
                <button className="btn-primary"><i className="fa-solid fa-download"></i> Tải PDF</button>
            </div>
        </header>

        <div className="invoice-wrapper">
            <div className="invoice-header">
                <div className="invoice-logo">
                    <i className="fa-solid fa-bolt-lightning"></i> CLOSET
                </div>
                <div className="invoice-info">
                    <h2>INVOICE</h2>
                    <p style={{ textAlign: 'right', color: 'var(--text-muted)' }}>#ORD-9942</p>
                </div>
            </div>

            <div className="invoice-details">
                <div className="from">
                    <h4>Từ</h4>
                    <p>CLOSET FASHION STORE</p>
                    <p style={{ fontWeight: '400', color: '#64748b' }}>123 Đường ABC, Quận 1<br />TP. Hồ Chí Minh, Việt Nam<br />Phone: +84 123 456 789</p>
                </div>
                <div className="to" style={{ textAlign: 'right' }}>
                    <h4>Đến</h4>
                    <p>NGUYỄN VĂN A</p>
                    <p style={{ fontWeight: '400', color: '#64748b' }}>456 Đường XYZ, Quận 7<br />TP. Hồ Chí Minh, Việt Nam<br />Email: nv.a@example.com</p>
                </div>
            </div>

            <div className="invoice-details">
                <div className="date">
                    <h4>Ngày đặt hàng</h4>
                    <p>12 Tháng 5, 2026</p>
                </div>
                <div className="payment" style={{ textAlign: 'right' }}>
                    <h4>Phương thức thanh toán</h4>
                    <p>Thẻ tín dụng (Visa **** 1234)</p>
                </div>
            </div>

            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style={{ textAlign: 'center' }}>Số lượng</th>
                        <th style={{ textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ textAlign: 'right' }}>Tổng cộng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Classic Midnight Suit</strong><br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Size: L, Color: Navy</span></td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>$299.00</td>
                        <td style={{ textAlign: 'right' }}>$299.00</td>
                    </tr>
                    <tr>
                        <td><strong>Merino Wool Sweater</strong><br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Size: M, Color: Grey</span></td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>$121.00</td>
                        <td style={{ textAlign: 'right' }}>$121.00</td>
                    </tr>
                </tbody>
            </table>

            <div className="invoice-total-section">
                <div className="total-box">
                    <div className="total-row">
                        <span>Tạm tính</span>
                        <span>$420.00</span>
                    </div>
                    <div className="total-row">
                        <span>Phí vận chuyển</span>
                        <span>$0.00</span>
                    </div>
                    <div className="total-row">
                        <span>Thuế (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>TỔNG CỘNG</span>
                        <span>$420.00</span>
                    </div>
                </div>
            </div>

            <div className="invoice-footer">
                <p>Cảm ơn bạn đã mua sắm tại Closet!</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Hoá đơn này được tạo tự động bởi hệ thống quản lý Closet.</p>
            </div>
        </div>
    
    </>
  );
}