import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DragDropCartService {
  private isDropZoneVisible = new BehaviorSubject<boolean>(false);
  isDropZoneVisible$ = this.isDropZoneVisible.asObservable();

  showDropZone() {
    this.isDropZoneVisible.next(true);
  }

  hideDropZone() {
    this.isDropZoneVisible.next(false);
  }
}
