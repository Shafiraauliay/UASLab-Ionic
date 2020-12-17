import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  private idUser: string;
  private user: any;
  private Locations: any[] = [];
  private boolGetData: boolean = false;

  constructor(
    private authSrv: AuthService,
    private userSrv: UserService,
    private toastCtrl: ToastController,
    private db: AngularFireDatabase,
    private router: Router
  ) { }

  ngOnInit() {
    this.authSrv.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUser();
      }
      else{
        this.router.navigateByUrl('/login');
      }
    }, err => {
      console.log(err);
    })
  }

  getUser(){
    this.db.object('/user/' + this.idUser).valueChanges().subscribe(data => {
      this.user = data;
      if(this.user.locations){
        this.Locations = this.user.locations;
      }
      if(this.boolGetData == false){
        this.boolGetData = true;
        this.CheckIn();
      }
    });
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve, ms)).then(()=>{});
  }

  CheckIn(){
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position: Position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          var lat = pos.lat;
          var lng = pos.lng;

          var newLocation: any = {
            lat: lat,
            lng: lng,
            nama: "Your Location Now",
          }
          this.Locations.push(newLocation);
          this.user.locations = this.Locations;
  
          this.userSrv.update(this.idUser, this.user);
          this.delay(600000).then(any => {
            this.CheckIn();
          });
        });
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
}

