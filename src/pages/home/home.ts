import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, NavParams, Content, Loading } from 'ionic-angular';

import { AlertController, LoadingController } from 'ionic-angular';
import { SettingsPage } from './../settings/settings';
import { LocationsPage } from './../locations/locations';
import { InstagramService } from './../../providers/instagram.service';
import { PrivacyPage } from './../privacy/privacy';
import { UserProfilePage } from './../user-profile/user-profile';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Content) content: Content;

  distance: number;
  medias;
  locationName: string;
  isGrade = false;
  imgWidth; 
  credentials;

  constructor(
    public alertCtrl: AlertController,
    public instaService: InstagramService,
    public popoverCtrl: PopoverController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public geo: Geolocation,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public translate: TranslateService
  ) {
    this.medias = [];
    this.credentials = {};
  } 

  ionViewWillEnter() {
    this.storage.get('instagram')
      .then((instagram) => {
        if (instagram) {
          this.credentials = instagram;
        } else {
          this.credentials = this.navParams.get('response');
        }
      });
    
    this.distance = this.instaService.distance;
    this.imgWidth = (this.content.contentWidth/3);
    let loading: Loading = this.showLoading();
    this.loadLocationAndMedias(loading);
  }

  loadLocationAndMedias(loading) {

    this.geo.getCurrentPosition()
      .then((resp) => {
        this.instaService.setLocation(resp.coords.latitude, resp.coords.longitude);
      })
      .then(() => {
       
        this.instaService.getByLocation(this.credentials)
          .subscribe((res) => {
            this.medias = res.data;
          }, (error) => {
            this.showAlert('ERROR: ' + error);
          });
        
        this.instaService.getLocationName()
          .subscribe((address) => {
            this.locationName = address.results[1].formatted_address;
          });
        
        if (loading.dismiss) {
          loading.dismiss();
        } else {
          loading.complete();
        }

      })
      .catch((error) => {
        loading.dismiss();
        this.showAlert('erro ao conferir geolocalização: ' + error);
      });
  }

  toggleView() {
    this.isGrade = !this.isGrade;
  }

  showSettings() {
    this.navCtrl.push(SettingsPage, {
      distance: this.distance
    });
  }

  listLocations() {
    this.navCtrl.push(LocationsPage, {
      medias: this.medias
    });
  }

  showAlert(message) {
    let alert = this.alertCtrl.create({
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  showLoading(): Loading {
    let message;
    this.translate.get('text_loading').subscribe((res: string) => {
        message = res;
    });

    let loader = this.loadingCtrl.create({
      content: message
    });
    loader.present();

    return loader;
  }

  doRefresh(refresher) {
    this.loadLocationAndMedias(refresher);
  }

}
