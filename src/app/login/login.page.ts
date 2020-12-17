import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  login_form: FormGroup;
  showPassword = false;
  passwordToggleIcon = 'eye-off';

  constructor(
    private toastCtrl: ToastController,
    private authSrv : AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.login_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  Login(){
    if(this.login_form.valid){
      this.authSrv.login(this.login_form.value).then(
        (res) => {
          this.login_form.reset();
          this.router.navigateByUrl('/home/tabs/maps');
        },
        (err) => {
          this.presentToast("Email or password Wrong!", "warning");
        }
      );
    }
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  togglePass(): void {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon === 'eye-off') {
      this.passwordToggleIcon = 'eye';
    } else {
      this.passwordToggleIcon = 'eye-off';
    }
  }

  goToRegisterPage() {
    this.router.navigateByUrl('/register');
  }
}

