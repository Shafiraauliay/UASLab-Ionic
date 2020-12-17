import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from "rxjs/operators";
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private idUser: string;
  private isDesktop: boolean;
  private user: any;
  private Locations: any[] = [];
  private downloadURL: any;
  private imageFile: any;
  private base64Image: any;
  private boolCamera: boolean = null;
  private photo: SafeResourceUrl;
  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;

  constructor(
    private authSrv: AuthService,
    private userSrv: UserService,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private platform: Platform,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')){
      this.isDesktop = true;
    }

    this.getId();
  }

  getId(){
    this.authSrv.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUser();
      }
    }, err => {
      console.log(err);
    })
  }

  getUser(){
    this.db.object('/user/' + this.idUser).valueChanges().subscribe(data => {
      this.user = data;
      if(this.user.foto){
        this.photo = this.user.foto;
      }
      if(this.user.locations){
        this.Locations = this.user.locations;
        this.Locations.reverse();
      }
    })
  }

  async getPicture(type: string){
    if(!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 500,
      height: 500,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && ("data:image/png;base64," + image.base64String));
    this.boolCamera = true;
    this.base64Image = image.base64String;

    this.uploadImage();
  }

  onFileChoose(event){
    const file = event.target.files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if(!file.type.match(pattern)){
      console.log('Format File Tidak Support.');
      this.imageFile = null;
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
    }
    reader.readAsDataURL(file);
    this.boolCamera = false;
    this.imageFile = file;

    this.uploadImage();
  }

  async presentActionSheet(){
    const actionSheet = await this.actionSheetCtrl.create({
      animated: true,
      mode: 'ios',
      buttons: [
      {
        text: 'Camera',
        icon: 'camera',
        handler: () => {
          this.getPicture('camera');
        }
      },
      {
        text: 'Gallery',
        icon: 'images',
        handler: () => {
          this.getPicture('gallery');
        }
      }]
    });

    await actionSheet.present();
  }

  async presentAlert(idxItem){
    const alert = await this.alertCtrl.create({
      header: 'Are You Sure?',
      message: 'Are You Sure Want to Delete This Locations History?',
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.delete(idxItem)
        }
      ]
    });
    await alert.present();
  }


  async presentLoading(){
    const loading = await this.loadingCtrl.create({
        message: "Update Profile Picture",
        duration: 3000
    });
    await loading.present();

    const {role, data} = await loading.onDidDismiss();
    console.log("Loading Dismissed.");
  }

  uploadImage(){
    this.presentLoading().then(() =>{
      var n = Date.now();
      const filePath = `Profil/${n}`;
      const fileRef = this.storage.ref(filePath);
      var task;
      if(this.boolCamera){
        task = fileRef.putString(this.base64Image, 'base64',
        { 
          contentType: 'image/png' });
      }

      else{
        task = this.storage.upload(`Profil/${n}`, this.imageFile);
      }

      task.snapshotChanges()
          .pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(url => {
                if (url) 
                {
                  this.downloadURL = url;
                  this.user.foto = this.downloadURL;
                  this.userSrv.update(this.idUser, this.user);
                }
              });
            })
          ).subscribe();
    });
  }

  imageLoaded(){
    setTimeout(function() {
      var profileWidth = document.getElementById('profilePicture').offsetWidth;
      document.getElementById('profilePicture').style.height = profileWidth + "px";
    }, 10)
  }

  Logout(){
    this.authSrv.logout()
      .then(res => {
          console.log(res);
          this.router.navigateByUrl('/login');
        }).catch(error => {
          console.log(error);
      });
  }

  delete(idxItem){
    if (idxItem > -1) {
      this.Locations.splice(idxItem, 1);
      this.user.locations = this.Locations;
      this.userSrv.update(this.idUser, this.user);
    }
  }

  onPress(idxItem) {
    this.presentAlert(idxItem);
  }
}
