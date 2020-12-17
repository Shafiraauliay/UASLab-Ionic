import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private dbPath = '/user';
  userRef: AngularFireList<UserService> = null;

  constructor(private db: AngularFireDatabase) { 
    this.userRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<UserService> {
    return this.userRef;
  }

  create(key: string, value: any): any {
    return this.userRef.set(key, value);
  }

  update(key: string, value: any): Promise<void> {
    return this.userRef.update(key, value);
  }
}
