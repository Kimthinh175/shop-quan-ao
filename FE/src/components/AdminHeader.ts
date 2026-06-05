export class AdminHeader {
  public static render(title: string = 'Tổng quan'): string {
    return `
      <header class="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold text-slate-800">${title}</h2>
        </div>
        <div class="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div class="text-right">
            <p class="text-sm font-bold text-slate-900">Thịnh Admin</p>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-black">Chủ sở hữu</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">T</div>
        </div>
      </header>
    `;
  }
}
