import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

declare var google: any;
@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {

  private map: any;
  infoWindow: any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  umnPos: any = {
    lat: -6.256081,
    lng: 106.618755
  };
  private lat: number;
  private lng: number;
  private userMarker: any;
  private locationValue: string = "";
  private idUser: string;
  private user: any;
  private users: any;
  private userFriends: any[] = [];
  private Friends: any[] = [];
  private Locations: any[] = [];

  constructor(
    private toastCtrl: ToastController,
    private authSrv: AuthService,
    private userSrv: UserService
  ) { }

  ngOnInit() {
    this.authSrv.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUsers();
      }
    }, err => {
      console.log(err);
    })
  }

  ionViewDidEnter(){
    this.showMap(this.umnPos);
    if(this.userFriends.length > 0){
      this.markUserLocation();
    }
  }

  getUser(){
    this.user = this.findUser(this.idUser);
    if(this.user.friends){
      this.Friends = this.user.friends;
      this.getUserFriends();
    }
  }

  getUsers(){
    this.userSrv.getAll().snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))  
      )
    ).subscribe(data => {
      this.userFriends = [];
      this.users = data;
      this.getUser();
    });
  }

  findUser(userKey: string){
    return{...this.users.find(user => {
      return user.key === userKey;
    })};
  }

  getUserFriends(){
    for(let idx = 0; idx < this.Friends.length; idx++){
      this.userFriends.push(this.findUser(this.Friends[idx]));
    }
    this.markUserLocation();
  }
  
  markUserLocation(){
    for(let idx = 0; idx < this.userFriends.length; idx++){
      if(this.userFriends[idx].locations){
        var eachFriendLocation = this.userFriends[idx].locations[this.userFriends[idx].locations.length-1];
        const location = new google.maps.LatLng(eachFriendLocation.lat, eachFriendLocation.lng);
        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          clickable: true
        });
        marker.info = new google.maps.InfoWindow({
          content: this.userFriends[idx].fullname
        });
        google.maps.event.addListener(marker, 'click', function() {
          marker.info.open(map, marker);
        });
      }
    }
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 4000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  showCurrentLoc(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position: Position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(pos);
        this.infoWindow.setPosition(pos);
        this.infoWindow.setContent('Your Current Location');
        this.infoWindow.open(this.map);
        this.map.setCenter(pos);
      });
    }
  }

  showMap(pos: any){
    console.log('test', pos);
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 12,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    this.map.addListener('click', (mapsMouseEvent) => {
      if(this.userMarker){
        this.userMarker.setMap(null);
      }
      
      this.lat = mapsMouseEvent.latLng.toJSON().lat;
      this.lng = mapsMouseEvent.latLng.toJSON().lng;

      this.userMarker = new google.maps.Marker({
        position: mapsMouseEvent.latLng,
        map: this.map
      });
    })
  }

  checkIn(){
    var newLocation: any = {
      lat: this.lat,
      lng: this.lng,
      nama: this.locationValue,
    }
    this.Locations.push(newLocation);
    this.user.locations = this.Locations;

    this.userSrv.update(this.idUser, this.user);
    this.locationValue = "";
    this.hideModal();
    this.presentToast("Update Current Location.", "success");
  }

  openModal(){
    if(this.userMarker != null){
      document.getElementById('transparentLayer').classList.remove('ion-hide');
      document.getElementById('modalLayer').classList.remove('ion-hide');
      document.getElementById('fabCurLoc').classList.add('ion-hide');
      document.getElementById('fabOpenModal').classList.add('ion-hide');
    }
    else{
      this.presentToast("Choose Your Location.", "warning");
    }
  }

  hideModal(){
    document.getElementById('transparentLayer').classList.add('ion-hide');
    document.getElementById('modalLayer').classList.add('ion-hide');
    document.getElementById('fabCurLoc').classList.remove('ion-hide');
    document.getElementById('fabOpenModal').classList.remove('ion-hide');
  }
}

