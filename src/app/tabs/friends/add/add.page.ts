import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { isEmpty, map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})


export class AddPage implements OnInit {
  private user: any;
  private users: any;
  private userFriends: any[] = [];
  private searched: any;
  private searchValue: string;
  private idUser: string;
  private boolUserFound: boolean = false;
  private boolUserIsFriend: boolean = false;

  constructor(
    private authSrv: AuthService,
    private userSrv: UserService,
    private toastCtrl: ToastController,
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

  getUser(){
    this.user = this.users.find(user => {
      return user.key === this.idUser;
    });
    if(this.user.friends){
      this.userFriends = this.user.friends;
    }
  }

  getUsers(){
    this.userSrv.getAll().snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))  
      )
    ).subscribe(data => {
      this.users = data;
      this.getUser();
    });
  }

  getSearched(searchedEmail: string){
    return{...this.users.find(user => {
      return (user.email.toLowerCase() === searchedEmail.toLowerCase()) && (user.key != this.idUser);
    })};
  }

  checkUserFriends(){
    var idxFriend = this.userFriends.indexOf(this.searched.key);
    if(idxFriend == -1){
      this.boolUserIsFriend = false;
    }
    else{
      this.boolUserIsFriend = true;
    }
  }

  searchUser(){
    if(this.searchValue != ''){
      this.searched = this.getSearched(this.searchValue);
      if(JSON.stringify(this.searched) === '{}'){
        this.boolUserFound = false;
        this.presentToast("User Search Failed", "warning");
      }

      else{
        this.boolUserFound = true;
        if(this.user.friends){
          this.checkUserFriends();
        }
      }
    }
  }

  add(){
      this.userFriends.push(this.searched.key);
      this.user.friends = this.userFriends;
      this.userSrv.update(this.idUser, this.user);
      this.boolUserIsFriend = true;
      this.presentToast("Success New Add Friend!", "success");
  }

  imageLoaded(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var idValue = idAttr.nodeValue;
    var profileWidth = document.getElementById(idValue).offsetWidth;
    document.getElementById(idValue).style.height = profileWidth + "px";
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
