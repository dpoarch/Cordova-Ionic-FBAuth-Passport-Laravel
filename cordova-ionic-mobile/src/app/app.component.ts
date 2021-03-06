import { Component, ViewChild } from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import {User} from "../models/user";
import {SessionService} from "../services/session.service";
import {CodesHelper} from "../helpers/codes.helper";
import {SessionHelper} from "../helpers/session.helper";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{title: string, component: any}>;

  loggedUser: User;

  constructor(public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              protected _sessionService: SessionService) {
    this.initializeApp();

    this._sessionService.loginEmitted$.subscribe(
      user => {
          this.loggedUser = user;
      }
    );

    this.pages = [
      { title: 'Home', component: HomePage },
    ];

    let initializedUser: User = this._sessionService.getLoggedUser();
    let token: string = SessionHelper.getLocalStorageField('token');

    if(!initializedUser || !token){
        let isUserLogged: boolean = this._sessionService.getSessionData();
        if(isUserLogged){
            _sessionService.initializeSession().subscribe(
                res => {
                    let json = res.json();
                    let code = json.code;
                    let data = json.data;
                    if(code == CodesHelper.OK_CODE) {
                        this._sessionService.setSession(data.user);
                        this.loggedUser = this._sessionService.getLoggedUser();
                        this.rootPage = HomePage;
                    }else{
                        this.rootPage = LoginPage;
                    }
                },
                error => {
                    let errorMessage = <any>error;

                    if(errorMessage !== null){
                        this.rootPage = LoginPage;
                    }
                });
        }else{
            this.rootPage = LoginPage;
        }
    }else{
        this.loggedUser = initializedUser;
        this.rootPage = HomePage;
    }
  }

  logout():void {
      this._sessionService.logout();
      this.rootPage = LoginPage;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

}
