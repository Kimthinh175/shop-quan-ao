export abstract class BaseView {
    /**
     * Phương thức render trả về chuỗi HTML.
     * @param data Dữ liệu truyền vào view (tùy chọn)
     */
    public abstract render(data?: any): string;
}
