import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="p-4 animate-[fadeIn_0.3s_ease-out]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-black text-gray-900 uppercase tracking-widest">Bài viết</h2>
        <button class="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
          <i class="fa-solid fa-plus mr-1"></i> Thêm
        </button>
      </div>
      <div class="mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Tìm tiêu đề bài viết..." 
               class="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-black transition-colors">
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-300"></i>
      </div>

      <div *ngIf="!loading" class="space-y-3">
        <div *ngFor="let post of filteredPosts" class="bg-white border border-gray-100 rounded-2xl p-4">
          <div class="flex gap-3">
            <div *ngIf="post.thumbnail" class="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <img [src]="post.thumbnail" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
              <div class="text-sm font-black text-gray-900 line-clamp-2 leading-tight mb-1">{{ post.title }}</div>
              <div class="text-[10px] text-gray-400">{{ post.createdAt | date:'dd/MM/yyyy' }}</div>
              <div class="flex items-center gap-2 mt-2">
                <span class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase"
                      [ngClass]="post.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'">
                  {{ post.is_published ? 'Đã đăng' : 'Nháp' }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
              <button class="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
                <i class="fa-solid fa-pen text-[10px]"></i>
              </button>
              <button (click)="deletePost(post._id)" class="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                <i class="fa-solid fa-trash text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="filteredPosts.length === 0" class="bg-white p-8 rounded-2xl text-center text-gray-400 text-sm border border-gray-100">
          Chưa có bài viết nào.
        </div>
      </div>
    </div>
  `
})
export class AdminPostsComponent implements OnInit {
  private http = inject(HttpClient);
  posts: any[] = [];
  search = '';
  loading = true;

  get filteredPosts() {
    if (!this.search) return this.posts;
    return this.posts.filter(p => p.title?.toLowerCase().includes(this.search.toLowerCase()));
  }

  ngOnInit() {
    this.http.get('/api/posts/admin').subscribe({
      next: (res: any) => {
        this.posts = res.data || res.posts || res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  deletePost(id: string) {
    if (!confirm('Xóa bài viết này?')) return;
    this.posts = this.posts.filter(p => p._id !== id);
    this.http.delete(`/api/posts/${id}`).subscribe();
  }
}
