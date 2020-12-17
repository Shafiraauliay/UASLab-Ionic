import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private fireAuth: AngularFireAuth,
    public router: Router
  ) { }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  login(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      if(this.fireAuth.currentUser){
        this.fireAuth.signOut().then(() => {
          this.router.navigate(['/login']);
          }).catch((error) => {
            reject();
          });
      }
    });
  }

  userDetails() {
    return this.fireAuth.user;
  }
}

