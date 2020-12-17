import { Component, OnInit } from '@angular/core';
import { AlertController} from '@ionic/angular';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  private idUser: string;
  private user: any;
  private users: any;
  private userFriends: any[] = [];
  private userFriendsFilter: any;
  private Friends: any[] = [];
  private loading: any;
  private searchValue: string;


  constructor(
    private authSrv: AuthService,
    private userSrv: UserService,
    private alertCtrl: AlertController

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
    this.userFriendsFilter = this.userFriends;
  }

  delete(idxItem){
    if (idxItem > -1) {
        this.Friends.splice(idxItem, 1);
        this.user.friends = this.Friends;
        this.userSrv.update(this.idUser, this.user);
        this.loading.dismiss();
    }
  }

  filterFriendList(){
    this.userFriendsFilter = this.userFriends.filter(user => {
      return user.firstname.lastname.toLowerCase().includes(this.searchValue.toLowerCase());
    })
  }

  searchUser(){
    if(this.userFriendsFilter){
      if(this.searchValue == ''){
        this.userFriendsFilter = this.userFriends;
      }
      else{
        this.filterFriendList();
      }
    }
  }

  onPress(idxItem, userFirstname, userLastname){
    this.presentAlert(idxItem, userFirstname, userLastname);
  }

  imageLoaded(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var idValue = idAttr.nodeValue;
    var profileWidth = document.getElementById(idValue).offsetWidth;
    document.getElementById(idValue).style.height = profileWidth + "px";
  }

  async presentAlert(idxItem, userFirstname, userLastname){
    const alert = await this.alertCtrl.create({
      header: 'Are You Sure?',
      message: 'Do You Want to Remove' + userFirstname + userLastname + ' from Friends List?',
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
}
