import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  
  register_form: FormGroup;
  idUser: string;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authSrv : AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userSrv: UserService
  ) {}

  ngOnInit() {
    this.register_form = this.formBuilder.group({
      firstname: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      lastname: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      confirmPassword: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    }, {validator: this.matchingPasswords('password', 'confirmPassword')});
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  add(){
    this.register_form.value.password = null;
    this.register_form.value.confirmPassword = null;
    this.userSrv.create(this.idUser, this.register_form.value);
    this.router.navigateByUrl('login');
    this.presentToast("Register successful", "success");
  }

  Register(){
    if(this.register_form.valid){
        this.authSrv.registerUser(this.register_form.value)
        .then(res => {
          this.idUser = res.user.uid;
          this.add();
        }, err => {
          console.log(err);
          this.presentToast("Email Already Exist!", "warning");
        });
    }
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 5000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  goLoginPage() {
    this.router.navigateByUrl('/login');
  }
}

