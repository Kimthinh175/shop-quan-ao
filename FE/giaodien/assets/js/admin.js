// Admin Dashboard Interactions
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Dashboard Initialized');

    // Simple interaction for buttons
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            alert('Tính năng thêm sản phẩm sẽ được phát triển ở bước tiếp theo trong Controller!');
        });
    }

    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const productName = row.querySelector('.product-info div:first-child').innerText;
            alert('Sửa sản phẩm: ' + productName);
        });
    });

    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const productName = row.querySelector('.product-info div:first-child').innerText;
            if (confirm('Bạn có chắc chắn muốn xoá ' + productName + '?')) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            }
        });
    });
});
